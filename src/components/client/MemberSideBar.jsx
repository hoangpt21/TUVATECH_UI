import React, { useEffect, useState } from 'react'
import { Layout, Menu, Modal } from 'antd'
import { 
  UserOutlined, 
  HistoryOutlined, 
  CustomerServiceOutlined, 
  LogoutOutlined, 
  EnvironmentOutlined,
  TagsOutlined  // Thêm import này
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {logoutAccountAPI } from '../../redux/user/accountSlice'
import { selectCurrentAccount } from '../../redux/user/accountSlice';

const { Sider } = Layout;
const styles = {
  sider: {
    padding: '0px 8px',
  },
  menuItem: {
    margin: '4px 0',
    borderRadius: '8px',
    height: '48px',
    lineHeight: '48px',
  },
  menuIcon: {
    fontSize: '18px',
    marginRight: '12px',
  },
  divider: {
    margin: '8px 0',
    borderTop: '1px solid #f0f0f0',
  }
};
function MemberSideBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentAccount = useSelector(selectCurrentAccount);
  const [loading, setLoading] = useState(false);
  // Define base menu items
  const baseMenuItems = [
    {
      key: 'account',
      icon: <UserOutlined style={styles.menuIcon} />,
      label: 'Tài khoản của bạn',
      onClick: () => navigate('./account'),
      style: styles.menuItem,
    },
    {
      key: 'address',
      icon: <EnvironmentOutlined style={styles.menuIcon} />,
      label: 'Sổ địa chỉ nhận hàng',
      onClick: () => navigate('./address'),
      style: styles.menuItem,
    },
    {
      key: 'orderhistory',
      icon: <HistoryOutlined style={styles.menuIcon} />,
      label: 'Lịch sử mua hàng',
      onClick: () => navigate('./orderhistory'),
      style: styles.menuItem,
    },
    {
      key: 'vouchers',
      icon: <TagsOutlined style={styles.menuIcon} />, 
      label: 'Kho voucher',
      onClick: () => navigate('./vouchers'),
      style: styles.menuItem,
    }
  ];

  // Add support menu item only if user is not admin
  if (currentAccount?.role !== 'admin') {
    baseMenuItems.push({
      key: 'support',
      icon: <CustomerServiceOutlined style={styles.menuIcon} />,
      label: 'Hỗ trợ',
      onClick: () => navigate('./support'),
      style: styles.menuItem,
    });
  }

  // Add divider and logout items
  const menuItems = [
    ...baseMenuItems,
    {
      type: 'divider',
      style: styles.divider,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined style={styles.menuIcon} />,
      label: 'Thoát tài khoản',
      onClick: () => {
        Modal.confirm({
          title: 'Đăng xuất',
          content: 'Bạn có chắc muốn đăng xuất khỏi tài khoản này?',
          okButtonProps: {loading: loading},
          okText: 'Đăng xuất',
          cancelText: 'Hủy',
          async onOk() { 
            setLoading(true);
            await dispatch(logoutAccountAPI());
            setLoading(false);
            navigate("/login")
          },
          maskClosable: true
        })
      },
      danger: true,
      style: { ...styles.menuItem, marginTop: '16px'},
    },
  ];

  return (
    <Sider
      width={280}
      breakpoint="lg"
      collapsedWidth="60"
      theme="light"
      style={styles.sider}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={[window.location.pathname.split('/').pop()]}
        items={menuItems}
      />
    </Sider>
  );
}

export default MemberSideBar;
