import { useEffect, useMemo, useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContextValueHook } from '@/context/home-context'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { fetchLeads, removeLead, updateLeadNote } from '@/api/leadsApi'

import options from '../../mock/options.json'
import TableShow from '../TableShow'
import { Select, Button, Flex, Pagination } from 'antd'
import type { DataItem } from '../../types'
import type { FilterValues } from './handleData'

interface OptionItem {
  label: string
  field: keyof Pick<FilterValues, 'status' | 'channel' | 'owner'>
  options: string[]
}

const PAGE_SIZE = 40

export const Search = () => {
  const { filters, handleFilters, handleResetFilters, handleDataCount } = useContextValueHook()
  const queryClient = useQueryClient()

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

  // 头部搜索框防抖后的关键字变化时回到第一页
  /* eslint-disable react-hooks/set-state-in-effect -- 与 debounce 同步，避免当前页超出筛选结果 */
  useEffect(() => {
    setPage(1)
  }, [debouncedKeyword])
  /* eslint-enable react-hooks/set-state-in-effect */

  const { data, isFetching } = useQuery({
    queryKey: ['leads', apiFilters, page, PAGE_SIZE] as const,
    queryFn: () => fetchLeads({ filters: apiFilters, page, pageSize: PAGE_SIZE }),
  })

  useEffect(() => {
    handleDataCount(data?.total ?? 0)
  }, [data?.total, handleDataCount])

  const editMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => updateLeadNote(id, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (item: DataItem) => removeLead(item.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['leads'] })
      void queryClient.invalidateQueries({ queryKey: ['leads-chart-data'] })
    },
  })

  const handleEdit = useCallback(
    (id: string, content: string) => {
      editMutation.mutate({ id, note: content })
    },
    [editMutation],
  )

  const handleDelete = useCallback(
    (item: DataItem) => {
      deleteMutation.mutate(item)
    },
    [deleteMutation],
  )

  const optionItems = useMemo(() => options as OptionItem[], [])

  const selectOptions = useMemo(() => {
    return optionItems.map((option) => ({
      ...option,
      selectOptions: option.options.map((value) => ({ value, label: value })),
    }))
  }, [optionItems])

  const paginatedData = data?.items ?? []
  const total = data?.total ?? 0

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
        data={paginatedData}
        loading={isFetching}
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
