import { useContextValueHook } from '@/context/home-context'
import styles from './Header.module.css'
// import React from 'react';
import { Input, Space } from 'antd';
const { Search } = Input;

/**
 * 头部组件 title + 搜索框
 */
export const Header = () => {
    const { filters, dataCount, handleFilters } = useContextValueHook()

    return (
        <div className={styles.header}>
            <div>
                <div className={styles.title}>线索列表</div>
                <div>共 {dataCount} 条</div>
            </div>

            <Space vertical>
                <Search
                    placeholder="搜索 姓名 / 公司 / 手机"
                    allowClear
                    enterButton="搜索"
                    size="middle"
                    // onSearch={e => setKeyword(e)}
                    value={filters.keyword}
                    onChange={e => handleFilters('keyword', e.target.value)}
                />
            </Space>
        </div>
    )
}
