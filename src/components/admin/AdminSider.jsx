import { Layout, Menu, Button, Space, Image } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShopOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  StarOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BoxPlotOutlined,
  InboxOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';

const { Sider } = Layout;

const styles = {
  toggleButton: {
    position: 'fixed',
    top: 18,
    left: 16,
    zIndex: 1000,
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  sider: {
    position: 'fixed',
    height: '100vh',
    top: 0,
    bottom: 0,
    zIndex: 999,
    transition: 'all 0.2s',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none'
  },
  logo: {
    height: 40, 
    margin: 16,
    background: 'rgba(255,255,255)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  }
};

const AdminSider = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Bảng Điều Khiển'
    },
    {
      key: 'grp',
      label: 'Quản lý',
      type: 'group',
      children: [
        {
          key: 'categories',
          icon: <AppstoreOutlined />,
          label: 'Danh mục'
        },
        {
          key: 'brands',
          icon: <ShopOutlined />,
          label: 'Thương hiệu'
        },
        {
          key: 'products',
          icon: <BoxPlotOutlined />,
          label: 'Sản phẩm'
        },
        {
          key: 'coupons',
          icon: <TagsOutlined />,
          label: 'Voucher'
        },
        {
          key: 'news',
          icon: <FileTextOutlined />,
          label: 'Tin tức'
        },
        {
          key: 'banners',
          icon: <PictureOutlined />,
          label: 'Quảng cáo'
        },
        {
          key: 'orders',
          icon: <ShoppingCartOutlined />,
          label: 'Đơn hàng'
        },
        {
          key: 'imports',
          icon: <InboxOutlined />,
          label: 'Hàng nhập kho',
        },
        {
          key: 'reviews',
          icon: <StarOutlined />,
          label: 'Đánh giá'
        },
        {
          key: 'users',
          icon: <UserOutlined />,
          label: 'Khách hàng'
        },
      ],
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(`/admin/${key}`);
    if (isMobile) {
      onCollapse(true);
    }
  };

  return (
    <>
      {collapsed && 
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapse(!collapsed)}
        style={{
          ...styles.toggleButton,
          display: isMobile ? 'block' : 'none'
        }}
      />}
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={onCollapse}
        theme="dark"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            onCollapse(true);
          }
        }}
        width={isMobile ? (collapsed ? 0 : 230) : 230}
        style={{
          ...styles.sider,
          left: isMobile ? (collapsed ? -230 : 0) : 0,
          boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.15)' : 'none',
          paddingBottom: '48px'  
        }}
      >
        <Space className="logo" style={styles.logo}>
          {collapsed ? 'TQT' : 'Trang quản trị'}
        </Space>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[2] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            height: 'calc(100% - 64px)',  
            overflowY: 'auto',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        />
      </Sider>
    </>
  );
};

export default AdminSider; 