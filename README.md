## 双 Token 刷新与并发请求处理
**题目**：你在简历中提到使用了“双 Token 策略（Access + Refresh Token）实现完整认证流程”。请具体说明：当 Access Token 过期时，前端如何利用 Refresh Token 静默刷新 Token？如果在刷新 Token 的同时，页面中还有其他多个接口请求正在等待，你如何避免这些请求因为 Token 过期而失败，或者避免多次调用刷新 Token 的接口？
**问题1**：Access Token 过期，如何利用 Refresh Token 静默刷新？

**回答**：在我的项目中，

应用启动时，AuthProvider（用于管理用户认证状态的上下文提供者。） 会先从 localStorage 读取 accessToken 和 refreshToken。如果 accessToken 存在，会主动（调用 meApi 去后端）验证这个 Token 是否有效。

如果 meApi 因为 Token 过期或无效失败，我们会（进入 catch 分支检查）是否有 refreshToken。如果有，就调用 refreshApi 获取新的 accessToken（和refreshToken）。然后用新 Token 再次调用 meApi 获取用户信息，完成登录恢复。

如果 refreshToken 也不存在或刷新失败，就清空状态，让用户回到登录页。

这样做的好处是：*不信任客户端存储的任何 Token*，每次都让后端验证身份，既安全又能在 refreshToken 有效时实现无感知恢复。

[*不信任客户端存储的任何 Token*]:
因为客户端存储是完全暴露给用户的，用户或恶意脚本都可以随意读写。如果前端只判断 localStorage 里有没有 Token 就认为用户已登录，攻击者可以通过 XSS 注入一段代码，往 localStorage 里写入一个假 Token，然后刷新页面，前端就会显示‘已登录’状态，虽然实际 API 请求都会失败，但界面状态已经错乱了。

更严重的是，如果这个假 Token 的格式恰好和后端期望的格式一致，后端没有做严格的签名校验，甚至可能造成越权访问。

所以正确的做法是：前端只负责存储和携带 Token，但从不‘信任’它。每次需要确定用户身份时，都必须把 Token 交给后端验证，后端说了算。这就是为什么我们在启动时要主动调用 meApi——让后端告诉我们这个 Token 到底还有没有效。

[*为什么用双token，一个不行吗*]：
为了在“安全性”和“用户体验”之间找到平衡。

如果只用一个token，比如
只用短期token（比如 15 分钟）
- 优点：非常安全，即使泄露也很快失效。
- 缺点：用户体验极差，需要每 15 分钟就让用户重新登录一次（或者非常复杂的前端存储密码自动登录）

只用长期 Token（比如 7 天）
- 优点：用户体验好，一次登录能管很久。
- 缺点：风险极高。Token 一旦被 XSS 攻击窃取，攻击者在 7 天内都可以冒充用户为所欲为。

[*你把 Refresh Token 也放 localStorage，那和只用一个长期 Token 有什么区别？*]:
这确实不是最安全的方式。但相比只用一个长期 Token，它仍然有优势:
- 攻击窗口缩小：Access Token 只有 15 分钟有效期。攻击者即使通过 XSS 窃取到了 Token，他只有 15 分钟的时间窗口来冒充用户。
- Refresh Token 轮换：每次刷新时，后端会颁发新的 Refresh Token，旧的立即失效。这可以降低持续泄露的风险。
如果未来安全要求更高，我会把 Refresh Token 迁移到 httpOnly Cookie 中，再配合 SameSite 和 CSRF Token 来防护

**问题2**：多接口并发请求时如何避免失败 / 避免多次刷新？

**回答**：当前项目是一个简化版 demo，还没有实现统一的请求拦截器队列机制。目前如果并发请求都带着过期的 accessToken，它们会各自失败。

但在生产环境中，我会用 Axios 响应拦截器来统一处理。具体做法是：

维护一个 isRefreshing 标志位和一个 pendingRequests 队列；

第一个请求收到 401 后，发起刷新 Token 的请求，同时把 isRefreshing 设为 true；

后续并发的请求检测到 isRefreshing 为 true，就把它们自己的请求配置放入队列等待；

刷新成功后，用新 Token 依次重试队列里的所有请求；

如果刷新失败，则清空队列并跳转登录页。

这样既能避免多次调用刷新接口，也能保证并发请求不丢失

## 登录状态持久化与自动恢复
**题目**：你提到“localStorage 存储 Token 实现会话持久化；应用启动时自动恢复登录状态”。请问：如果用户在 A 页面刷新浏览器（F5），或者关闭标签页后重新打开，前端如何判断用户是否仍然“已登录”？你会如何恢复用户的登录态，同时保证不会因为 localStorage 中残留的过期 Token 导致后续请求全部失败？
**回答**：我们的登录状态恢复逻辑也在 auth-context.tsx 中。

用户登录成功后，我们会把 session、accessToken、refreshToken 分别存入 localStorage。浏览器刷新或重新打开时，AuthProvider 的 useEffect 会读取这些存储的值。

如果 accessToken 不存在，直接标记为未登录。如果存在，就先调用 meApi 验证：

验证成功 → 恢复用户状态；

验证失败（过期）→ 尝试用 refreshToken 刷新；

刷新成功 → 再次获取用户信息并恢复；

刷新失败 → 清空状态，回到未登录。

这个设计保证了：页面 F5 后能无感知恢复登录；accessToken 过期但 refreshToken 有效时能自动续期；两个 Token 都过期时不会产生‘假登录’状态。
