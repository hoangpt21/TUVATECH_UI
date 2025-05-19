import { Layout, Avatar, Dropdown, Image, Space, Modal } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, UserSwitchOutlined, LogoutOutlined } from '@ant-design/icons';
import logo from '../../assets/images/logo_horizontal.png';
import { logoutAccountAPI } from '../../redux/user/accountSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentAccount } from '../../redux/user/accountSlice'
import { useState } from 'react';
const { Header } = Layout;

const styles = {
  header: {
    background: '#fff',
    padding: '0 16px', 
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 998,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
  },
  userDropdown: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  }
};

const AdminHeader = ({ collapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentAccount = useSelector(selectCurrentAccount);
  const [loading, setLoading] = useState(false)


  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserSwitchOutlined />,
      label: 'Thông tin cá nhân'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout', 
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
    }
  ];

  const handleUserMenuClick = ({ key }) => {
    if (key === 'profile') {
      navigate('/admin/info/account');
    } else if (key === 'logout') {
      // Xử lý đăng xuất
       Modal.confirm({
        title: 'Đăng xuất',
        content: 'Bạn có chắc muốn đăng xuất khỏi tài khoản này?',
        okButtonProps: {loading: loading},
        okText: 'Đăng xuất',
        cancelText: 'Hủy',
        async onOk() { 
          setLoading(true)
          const res = await dispatch(logoutAccountAPI());
          setLoading(false)
          if(!res.error) navigate("/login");
        },
        maskClosable: true
      })
    }
  };

  return (
    <Header style={{
      ...styles.header,
      justifyContent: 'space-between'
    }}>
      <Link to="/">
        <Image src={logo} alt="TuvaTech Logo" preview={false} width={150} style={{marginLeft: collapsed? 40 : 0}}/>
      </Link>
      <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
        <Space style={styles.userDropdown}>
          <Avatar src={currentAccount?.avatar_url} style={{boxShadow: '0 2px 8px rgba(0,0,0,0.3)'}} icon={!currentAccount?.avatar_url && <UserOutlined />} />
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AdminHeader;