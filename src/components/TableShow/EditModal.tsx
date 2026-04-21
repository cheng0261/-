import { useState } from 'react';
import { Button, Modal, Input } from 'antd';
import type { ButtonProps } from 'antd';
const { TextArea } = Input;
import type { DataItem } from '@/types';

// 编辑 弹窗组件
interface EditModalProps {
  item: DataItem
  type: ButtonProps['type']
  handleEdit: (id: string, content: string) => void
  children: string
}

export default function EditModal({ item, type, handleEdit, children }: EditModalProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [content, setContent] = useState<string>(item.note || '');
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleSave = () => {
    handleEdit(item.id, content);
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
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button onClick={handleCancel} key="cancel">
            取消
          </Button>,
          <Button onClick={handleSave} key="save" type="primary">
            保存
          </Button>
        ]}
      >
        <p>编号：{item.id}</p>
        <p>姓名：{item.name}</p>
        <p>备注：
          <TextArea rows={4} value={content} maxLength={200} style={{ color: 'black' }} onChange={e => setContent(e.target.value)} />
        </p>
      </Modal>
    </div>
  )
}
