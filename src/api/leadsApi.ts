import type { DataItem } from '../../types'
import type { FilterValues } from '../../components/Search/handleData'
import handleData from '../../components/Search/handleData'
import getRandomAvatar from '../../components/Search/getRandomAvatar'
import raw from '../../mock/data.json'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 内存数据源，模拟服务端持久化（刷新页面会重置） */
function buildInitialStore(): DataItem[] {
  const base = raw as Omit<DataItem, 'avatarUrl'>[]
  const out: DataItem[] = []
  const cycles = 22
  for (let c = 0; c < cycles; c++) {
    for (const row of base) {
      out.push({
        ...row,
        id: c === 0 ? row.id : `${row.id}-${c}`,
        phone:
          c === 0
            ? row.phone
            : (() => {
                const p = row.phone ?? '13800000000'
                const tail = p.length >= 11 ? p.charCodeAt(10) : 0
                return `${p.slice(0, 9)}${String((c * 17 + tail) % 1000).padStart(3, '0')}`
              })(),
      })
    }
  }
  return out.map((r) => ({ ...r, avatarUrl: getRandomAvatar(r.id) }))
}

let store: DataItem[] = buildInitialStore()

/** 与列表、图表共用同一份内存数据（删除/编辑后即时反映） */
export function getLeadsSnapshot(): DataItem[] {
  return store.map((r) => ({ ...r }))
}

export interface FetchLeadsParams {
  filters: FilterValues
  page: number
  pageSize: number
}

export interface FetchLeadsResult {
  items: DataItem[]
  total: number
}

/** 模拟网络：延迟 + 筛选 + 分页 */
export async function fetchLeads(params: FetchLeadsParams): Promise<FetchLeadsResult> {
  await delay(220 + Math.random() * 380)
  const filtered = handleData(params.filters, store)
  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const items = filtered.slice(start, start + params.pageSize)
  return { items, total }
}

export async function updateLeadNote(id: string, note: string): Promise<void> {
  await delay(120 + Math.random() * 120)
  const idx = store.findIndex((l) => l.id === id)
  if (idx >= 0) {
    store[idx] = { ...store[idx], note }
  }
}

export async function removeLead(id: string): Promise<void> {
  await delay(100 + Math.random() * 100)
  store = store.filter((l) => l.id !== id)
}
