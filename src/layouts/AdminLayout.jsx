import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminSider from '../components/admin/AdminSider';
import AdminHeader from '../components/admin/AdminHeader';

const { Content, Footer } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSider collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 230),
        transition: 'all 0.2s'
      }}>
        <AdminHeader collapsed={collapsed} />
        <Content style={{
          padding: 24,
          minHeight: 280,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: 'calc(100vh - 112px)' // Chiều cao của content được tính bằng chiều cao của viewport (100vh) trừ đi 112px, trong đó 112px là tổng chiều cao của header (64px) và margin trên dưới của content (24px * 2 = 48px). Điều này đảm bảo content luôn có chiều cao phù hợp và không bị tràn ra ngoài màn hình.
        }}>
          <div>
            <Outlet />
          </div>
          <Footer style={{ 
            textAlign: 'center', 
            marginTop: 'auto',
            padding: '16px 0 0',
            color: '#1890ff',
            fontWeight: 500,
          }}>
            TuvaTech ©2025 Created by Phan Thế Hoàng
          </Footer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
