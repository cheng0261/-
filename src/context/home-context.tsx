/* eslint-disable react-refresh/only-export-components -- React Context 与自定义 hooks 同文件 */
import { createContext, useCallback, useContext, useState } from 'react'

interface Filters {
  status: string
  channel: string
  owner: string
  keyword: string
}

const defaultFilters: Filters = {
  status: '全部',
  channel: '全部',
  owner: '全部',
  keyword: '',
}

const useCommonValueHook = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [dataCount, setDataCount] = useState<number>(0)

  const handleFilters = useCallback((fieldName: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const handleDataCount = useCallback((count: number) => {
    setDataCount(count)
  }, [])

  return {
    filters,
    dataCount,
    handleFilters,
    handleResetFilters,
    handleDataCount,
  }
}

const context = createContext({} as ReturnType<typeof useCommonValueHook>)

const useContextValueHook = () => useContext(context)
const CommonValueProvider = context.Provider

export { useContextValueHook, CommonValueProvider, useCommonValueHook }
