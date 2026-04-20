import { useState } from 'react';
import { Button, Modal } from 'antd';
import type { ButtonProps } from 'antd';
import type { DataItem } from '../../types'

interface ViewModalProps {
  item: DataItem
  type: ButtonProps['type']
  children: string
}
// 查看 弹窗组件
export default function ViewModal({ item, type, children }: ViewModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <div>
      <Button onClick={showModal} type={type}>
        {children}
      </Button>
      <Modal
        title="线索展示"
        closable={{ 'aria-label': 'Custom Close Button' }}
        onCancel={handleCancel}
        open={isModalOpen}
        footer={
          <Button onClick={handleCancel}>
            关闭
          </Button>
        }
      >
        <p>编号：{item.id}</p>
        <p>姓名：{item.name}</p>
        <p>公司：{item.company}</p>
        <p>手机：{item.phone}</p>
        <p>状态：{item.status}</p>
        <p>渠道：{item.channel}</p>
        <p>负责人：{item.owner}</p>
        <p>备注：{item.note}</p>
      </Modal>
    </div>
  )
}
