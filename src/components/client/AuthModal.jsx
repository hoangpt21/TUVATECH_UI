import React from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import { UserOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  const handleRegister = () => {
    navigate('/register');
    onClose();
  };

  return (
    <Modal
      title="Đăng nhập / Đăng ký"
      open={isOpen}
      onCancel={onClose}
      style={{top: -100}}
      width={{
        xs: '80%',
        sm: '70%',
        md: '50%',
        lg: '30%',
        xl: '30%',
        xxl: '30%',
      }}
      footer={null}
      centered
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Text>Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục</Text>
        <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            icon={<UserOutlined />}
            onClick={handleLogin}
          >
            Đăng nhập
          </Button>
          <Button 
            type="default" 
            icon={<UserAddOutlined />}
            onClick={handleRegister}
          >
            Đăng ký
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};

export default AuthModal; 