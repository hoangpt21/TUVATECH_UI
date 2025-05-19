import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Select, Button, message, Form, Avatar, Tabs, Card, Row, Col, Tag, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { updateUserRoleAPI, updateUserStatusAPI } from '../../redux/user/usersSlice';
import dayjs from 'dayjs';
import { CloseOutlined } from '@ant-design/icons';
const { Option } = Select;
const { TabPane } = Tabs;

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderBottom: '1px solid #f0f0f0'
  },
  avatar: {
    backgroundColor: '#1890ff'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontWeight: 500,
    fontSize: '16px',
    color: '#1a1a1a',
    margin: 0
  },
  userEmail: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  roleTag: {
    marginLeft: '8px',
    borderRadius: '4px',
    padding: '4px 8px'
  },
  tabContent: {
    padding: '24px'
  },
  card: {
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  description: {
    marginBottom: 0
  },
  footer: {
    borderTop: '1px solid #f0f0f0',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  },
  button: {
    borderRadius: '6px'
  }
};

const UserDetailModal = ({ visible, user, onClose, onUpdate }) => {
  const dispatch = useDispatch();
  // const [loading, setLoading] = useState(false);
  // const [currentRole, setCurrentRole] = useState(user?.role);

  if (!user) return null;

  // const handleRoleUpdate = async () => {
  //   setLoading(true);
  //   try {
  //     await dispatch(updateUserRoleAPI({ userId: user.user_id, role: currentRole })).unwrap();
  //     message.success('Cập nhật vai trò thành công!');
  //     onUpdate?.();
  //     onClose();
  //   } catch (error) {
  //     message.error(error.message || 'Lỗi khi cập nhật vai trò');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      await dispatch(updateUserStatusAPI({ userId: user.user_id, is_active: !user.is_active })).unwrap();
      message.success(`${user.is_active ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
      onUpdate?.();
      onClose();
    } catch (error) {
      message.error(error.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { key: '1', label: 'ID', children: user.user_id },
    { key: '2', label: 'Tên đăng nhập', children: user.user_name },
    { key: '3', label: 'Email', children: user.email },
    { key: '4', label: 'Họ tên', children: user.display_name },
    { key: '5', label: 'Số điện thoại', children: user.phone },
    { key: '6', label: 'Giới tính', children: user.gender || 'Không xác định' },
    { key: '7', label: 'Ngày sinh', children: user.birthday ? dayjs(user.birthday).format('DD/MM/YYYY') : 'Không xác định' },
    { key: '8', label: 'Ngày tạo', children: user.created_at ? dayjs(user.created_at).format('DD/MM/YYYY HH:mm') : 'N/A' },
  ];

  return (
    <Modal
      title={
        <div style={styles.header}>
          <Avatar 
            src={user.avatar_url} 
            size={40}
            style={{ ...styles.avatar, backgroundColor: user.avatar_url ? 'transparent' : styles.avatar.backgroundColor }}
          >
            {user.display_name?.charAt(0)}
          </Avatar>
          <div style={styles.userInfo}>
            <h3 style={styles.userName}>{user.display_name}</h3>
            <p style={styles.userEmail}>{user.email}</p>
          </div>
          <Tag 
            color={user.role === 'admin' ? 'volcano' : 'geekblue'} 
            style={styles.roleTag}
          >
            {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
          </Tag>
        </div>
      }
      open={visible}
      okButtonProps={{style: {display:'none'}}}
      cancelButtonProps={{icon: <CloseOutlined />}}
      onCancel={onClose}
      cancelText="Đóng"
      width={{
        xs: '90%',
        sm: '80%',
        md: '70%',
        lg: '60%',
        xl: '70%',
        xxl: '70%',
      }}
      
    >
      <Card style={styles.card}>
        <Descriptions 
          bordered 
          column={2} 
          items={items} 
          style={styles.description}
        />
      </Card>
    </Modal>
  );
};

export default UserDetailModal;