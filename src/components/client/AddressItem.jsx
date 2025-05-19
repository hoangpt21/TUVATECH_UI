import { memo } from 'react'
import { Button, Card, Flex, Popconfirm, Space, Tag, Typography } from 'antd'
import {
    EditOutlined, DeleteOutlined,
    EnvironmentOutlined, PhoneOutlined
} from '@ant-design/icons'

const { Text } = Typography;

const styles = {
    defaultTag: {
      backgroundColor: '#1a237e',
      color: '#fff',
    }
};
function AddressItem({ address, onEdit, onDelete }) {
  return (
    <Card 
        title={
            <Flex gap="middle" align="center" wrap>
                <Text strong style={{ margin:0 }}>{address.full_name}</Text>
                {address.is_default? <Tag style={styles.defaultTag}>Mặc định</Tag> : null}
            </Flex>
        }
        style={{width: '100%'}}
        size='small'
    >
      <Flex justify="space-between" align="center" wrap>
        <Space direction="vertical" size="small">
          
          <Space>
            <PhoneOutlined />
            <Text>{address.phone}</Text>
          </Space>

          <Space>
            <EnvironmentOutlined />
            <Text>{`${address.street}, ${address.ward}, ${address.district}, ${address.city}`}</Text>
          </Space>
        </Space>

        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => onEdit(address)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa địa chỉ này?"
            description="Bạn có chắc chắn muốn xóa địa chỉ này?"
            onConfirm={() => onDelete(address.address_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      </Flex>
    </Card>
  )
}

export default memo(AddressItem);
