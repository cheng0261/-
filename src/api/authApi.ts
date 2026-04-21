export interface AuthUser {
  id: string
  username: string
  role: 'admin'
}

interface AuthSession {
  user: AuthUser
  /** access token: 访问令牌 */
  accessToken: string
  /** access token 过期时间 */
  accessExpiresAt: number
  /** refresh token: 刷新令牌 */
  refreshToken: string
  /** refresh token 过期时间 */
  refreshExpiresAt: number
}

interface LoginResponse {
  /** 用户 */
  user: AuthUser
  /** access token */
  accessToken: string
  /** refresh token */
  refreshToken: string
  /** expires in: 过期时间 */
  expiresIn: number
}

/** 模拟用户 */
const MOCK_USER = {
  id: 'u-admin',
  username: 'admin',
  role: 'admin' as const,
}
/** 模拟密码 */
const MOCK_PASSWORD = '123456'

/** 本地存储 session 的 key */
const SESSION_KEY = 'mock-auth-session'
/** 本地存储 access token 的 key */
const ACCESS_TOKEN_KEY = 'mock-auth-access-token'
/** 本地存储 refresh token 的 key */
const REFRESH_TOKEN_KEY = 'mock-auth-refresh-token'

/** access token 过期时间 */
const ACCESS_TTL_MS = 10 * 60 * 1000
/** refresh token 过期时间 */
const REFRESH_TTL_MS = 3 * 24 * 60 * 60 * 1000

/** 模拟网络延迟 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 生成随机 token */
function randomToken(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`
}

/** 读取本地 session */
function readSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

/** 本地写入 session */
function writeSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
}

/** 清除 session */
function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/** 构建 session */
function buildSession(user: AuthUser, refreshToken?: string, refreshExpiresAt?: number): AuthSession {
  return {
    user,
    accessToken: randomToken('access'),
    accessExpiresAt: Date.now() + ACCESS_TTL_MS,
    refreshToken: refreshToken ?? randomToken('refresh'),
    refreshExpiresAt: refreshExpiresAt ?? Date.now() + REFRESH_TTL_MS,
  }
}

/** 获取本地存储的令牌token */
export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  }
}

/** 登录 API ，模拟网络延迟，如果用户名或密码错误，则抛出错误，如果登录成功，则返回 session */
export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  await sleep(300)
  if (username !== MOCK_USER.username || password !== MOCK_PASSWORD) {
    throw new Error('用户名或密码错误')
  }

  const session = buildSession(MOCK_USER)
  writeSession(session)

  return {
    user: session.user,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: ACCESS_TTL_MS / 1000,
  }
}

/** 获取当前用户信息 API ，模拟网络延迟，如果 access token 无效，则抛出错误，如果 access token 已过期，则抛出错误，如果获取成功，则返回用户信息
 * @param accessToken - 访问令牌
 * @returns 用户信息
 */
export async function meApi(accessToken: string): Promise<AuthUser> {
  await sleep(180)
  const session = readSession()
  if (!session || session.accessToken !== accessToken) {
    throw new Error('未授权')
  }
  if (Date.now() > session.accessExpiresAt) {
    throw new Error('Token 已过期')
  }
  return session.user
}

/** 刷新 API ，模拟网络延迟，如果 refresh token 无效，则抛出错误，如果 refresh token 已过期，则清除本地 session 并抛出错误，如果刷新成功，则返回新的 session */
export async function refreshApi(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
  await sleep(220)
  const session = readSession()
  if (!session || session.refreshToken !== refreshToken) {
    throw new Error('Refresh token 无效')
  }
  if (Date.now() > session.refreshExpiresAt) {
    clearSession()
    throw new Error('Refresh token 已过期')
  }

  const next = buildSession(session.user, session.refreshToken, session.refreshExpiresAt)
  writeSession(next)
  return {
    accessToken: next.accessToken,
    expiresIn: ACCESS_TTL_MS / 1000,
  }
}

/** 退出 API ，模拟网络延迟，如果退出成功，则清除本地 session */
export async function logoutApi(): Promise<void> {
  await sleep(120)
  clearSession()
}
