import React, { useCallback, useEffect, useState } from 'react';
import { Card, Typography, Button, Empty, Flex, List, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AddressForm from '../../../components/client/AddressForm';
import AddressItem from '../../../components/client/AddressItem';
import { useSelector, useDispatch } from 'react-redux';
import { selectAddresses, getAddressesAPI, createAddressAPI, updateAddressAPI, sortAddresses, deleteAddressAPI } from '../../../redux/address/addressSlice';
import { getProvincesAPI } from '../../../apis';

const { Title } = Typography;

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
};

function ClientAddress() {
  const dispatch = useDispatch();
  const currentAddresses = useSelector(selectAddresses);
  const [visible, setVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [provinces, setProvinces] = useState({});

  useEffect(() => {
    Promise.all([
      dispatch(getAddressesAPI({isAll: true})),
      getProvincesAPI()
    ])
    .then(([res, data]) => {
      if(!res.error) dispatch(sortAddresses());
      setProvinces(data);
    });
  }, []);

  const handleSubmit = async (values) => {
    if (editingAddress) {
      // Update address logic
      const res = await dispatch(updateAddressAPI({id: editingAddress.address_id, data: values}));
      if(!res.error) {
        dispatch(sortAddresses());
        message.success('Cập nhật địa chỉ thành công');
      }
    } else {
      // Add new address logic
      const res = await dispatch(createAddressAPI(values));
      if(!res.error) {
        dispatch(sortAddresses());
        message.success('Thêm địa chỉ mới thành công');
      }
    }
    setVisible(false);
    setEditingAddress(null);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setVisible(true);
  };

  const handleDelete = async (id) => {
    const res = await dispatch(deleteAddressAPI(id));
    if(!res.error) message.success('Xóa địa chỉ thành công');
  };

  const handleCancel = useCallback(() => {
    setEditingAddress(null);
    setVisible(false);
  },[]);

  return (
    <Flex vertical style={styles.container}>
      <Card
        title={<Title level={4} style={{ margin: 0, color: '#1a237e' }}>Sổ địa chỉ</Title>}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setVisible(true)}
          >
            Thêm địa chỉ
          </Button>
        }
      >
        {currentAddresses.length > 0 ? (
          <List
            pagination = {{
              pageSize: 4,
              align: "center"
            }}
            split={false}
            dataSource={currentAddresses}
            renderItem={(address) => (
              <List.Item>
                <AddressItem 
                  address={address} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Chưa có địa chỉ nào" />
        )}
      </Card>

      <AddressForm
        visible={visible}
        editingAddress={editingAddress}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        provinces={provinces}
      />
    </Flex>
  );
}

export default ClientAddress;
