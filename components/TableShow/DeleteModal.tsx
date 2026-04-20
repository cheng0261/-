// import React, { useState } from 'react';
import { Button, Popconfirm } from 'antd';
import type { ButtonProps } from 'antd';
import type { DataItem } from '../../types';

interface DeleteModalProps {
  item: DataItem
  type: ButtonProps['type']
  handleDelete: (item: DataItem) => void
  children: string
}

// 删除 弹窗组件
export default function DeleteModal({ item, type, handleDelete, children }: DeleteModalProps) {
  return (
    <Popconfirm
      title="确认删除"
      description="确定要删除吗？"
      okText="确定"
      cancelText="取消"
      onConfirm={() => handleDelete(item)}
      getPopupContainer={() => document.body}
    >
      {/* span 保证在 Table 固定列 + Popconfirm 下仍能稳定作为触发节点 */}
      <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
        <Button type={type} danger size="small">
          {children}
        </Button>
      </span>
    </Popconfirm>
  )
}
