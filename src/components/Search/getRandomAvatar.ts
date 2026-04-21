export default function getRandomAvatar (id: string): string {
  // 根据 id 生成确定性的头像序号，保证同一个线索头像不变
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const num = (hash % 9) + 1; // 1-9
  return `https://chs.newrank.cn/bridge/wechat/initHeader/initHeader${num}.png`;
};
