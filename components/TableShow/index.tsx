import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex, Space, Table, Tag } from 'antd'
import ViewModal from './ViewModal'
import EditModal from './EditModal'
import DeleteModal from './DeleteModal'
import type { DataItem } from '../../types'
import type { TableProps } from 'antd'

interface TableShowProps {
  data: DataItem[]
  loading?: boolean
  handleEdit: (id: string, content: string) => void
  handleDelete: (item: DataItem) => void
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case '新线索':
      return 'volcano'
    case '跟进中':
      return 'blue'
    case '已成交':
      return 'green'
    case '已关闭':
      return 'default'
    default:
      return 'skyblue'
  }
}

export default function TableShow({ data, loading = false, handleEdit, handleDelete }: TableShowProps) {
  const navigate = useNavigate()

  const columns = useMemo<TableProps<DataItem>['columns']>(() => [
    {
      title: '用户',
      key: 'user',
      align: 'center',
      onCell: (record: DataItem) => ({
        onClick: () => navigate(`/users/${encodeURIComponent(record.id)}`),
        style: { cursor: 'pointer' },
      }),
      render: (_: string, record: DataItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10%' }}>
          <img
            src={record.avatarUrl}
            alt="Avatar"
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: '公司',
      dataIndex: 'company',
      key: 'company',
      align: 'center',
      render: (text: string, record: DataItem) => (
        <a onClick={() => navigate(`/companies/${encodeURIComponent(record.company ?? '')}`)}>
          {text}
        </a>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => (
        <Flex gap="small" align="center" wrap>
          <Tag color={getStatusColor(status)} key={status}>
            {status}
          </Tag>
        </Flex>
      )
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center' as const,
    },
    {
      title: '渠道',
      dataIndex: 'channel',
      key: 'channel',
      align: 'center',
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      align: 'center',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      align: 'center',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 220,
      align: 'center',
      onCell: () => ({
        onClick: (e) => {
          e.stopPropagation()
        },
      }),
      render: (_: unknown, record: DataItem) => (
        <Space size={12} wrap onClick={(e) => e.stopPropagation()}>
          <ViewModal item={record} type="link">
            查看
          </ViewModal>
          <EditModal item={record} type="link" handleEdit={handleEdit}>
            编辑
          </EditModal>
          <DeleteModal item={record} type="link" handleDelete={handleDelete}>
            删除
          </DeleteModal>
        </Space>
      ),
    },
  ], [navigate, handleEdit, handleDelete])

  return (
    <Table<DataItem>
      loading={loading}
      scroll={{ x: 'max-content', y: 480 }}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={false}
      tableLayout="fixed"
    />
  )
}
