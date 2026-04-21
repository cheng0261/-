import { useEffect, useMemo, useState, useCallback } from 'react'
import { useContextValueHook } from '@/context/home-context'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { fetchLeads, removeLead, updateLeadNote } from '@/api/leadsApi'

import options from '@/mock/options.json'
import TableShow from '../TableShow'
import { Select, Button, Flex, Pagination } from 'antd'
import type { DataItem } from '@/types'
import type { FilterValues } from './handleData'

interface OptionItem {
  label: string
  field: keyof Pick<FilterValues, 'status' | 'channel' | 'owner'>
  options: string[]
}

const PAGE_SIZE = 40
const LEADS_CHANGED_EVENT = 'leads-changed'

export const Search = () => {
  const { filters, handleFilters, handleResetFilters, handleDataCount } = useContextValueHook()
  const debouncedKeyword = useDebouncedValue(filters.keyword, 350)
  const apiFilters: FilterValues = useMemo(
    () => ({
      status: filters.status,
      channel: filters.channel,
      owner: filters.owner,
      keyword: debouncedKeyword,
    }),
    [filters.status, filters.channel, filters.owner, debouncedKeyword],
  )

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<DataItem[]>([])
  const [total, setTotal] = useState(0)

  // 头部搜索框防抖后的关键字变化时回到第一页
  useEffect(() => {
    setPage(1)
  }, [debouncedKeyword])

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchLeads({ filters: apiFilters, page, pageSize: PAGE_SIZE })
      setItems(result.items)
      setTotal(result.total)
    } finally {
      setLoading(false)
    }
  }, [apiFilters, page])

  useEffect(() => {
    void loadLeads()
  }, [loadLeads])

  useEffect(() => {
    handleDataCount(total)
  }, [total, handleDataCount])

  const handleEdit = useCallback(
    async (id: string, content: string) => {
      await updateLeadNote(id, content)
      await loadLeads()
      window.dispatchEvent(new Event(LEADS_CHANGED_EVENT))
    },
    [loadLeads],
  )

  const handleDelete = useCallback(
    async (item: DataItem) => {
      await removeLead(item.id)
      await loadLeads()
      window.dispatchEvent(new Event(LEADS_CHANGED_EVENT))
    },
    [loadLeads],
  )

  const optionItems = useMemo(() => options as OptionItem[], [])

  const selectOptions = useMemo(() => {
    return optionItems.map((option) => ({
      ...option,
      selectOptions: option.options.map((value) => ({ value, label: value })),
    }))
  }, [optionItems])

  return (
    <div>
      <Flex justify="center" gap="large" wrap style={{ margin: '20px 0' }}>
        {selectOptions.map((option) => (
          <div key={option.field}>
            {option.label}：
            <Select
              defaultValue="全部"
              style={{ width: 120 }}
              onChange={(value) => {
                handleFilters(option.field, value)
                setPage(1)
              }}
              options={option.selectOptions}
              value={filters[option.field]}
            />
          </div>
        ))}
        <Button
          onClick={() => {
            handleResetFilters()
            setPage(1)
          }}
        >
          重置
        </Button>
      </Flex>
      <TableShow
        data={items}
        loading={loading}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={total}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(n) => `共 ${n} 条记录`}
        />
      </div>
    </div>
  )
}
