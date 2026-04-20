/** 线索列表行数据（含前端生成的头像） */
export interface DataItem {
  id: string
  name: string
  company?: string
  phone?: string
  status: string
  channel: string
  owner: string
  updatedAt: string
  note: string
  avatarUrl?: string
}
