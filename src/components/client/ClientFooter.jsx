import React, { useState } from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { PhoneOutlined, MailOutlined, FacebookOutlined, YoutubeOutlined, InstagramOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { selectCurrentAccount } from '../../redux/user/accountSlice';
import AuthModal from './AuthModal';
import { useSelector } from 'react-redux';

const { Footer } = Layout;
const { Title, Text, Link: LinkTyPo } = Typography;

const styles = {
  footer: {
    backgroundColor: '#001529',
    padding: '40px 50px 20px 50px',
    color: '#fff',
  },
  title: {
    color: '#fff',
    marginBottom: '20px',
    fontSize: '18px',
  },
  text: {
    color: '#ffffff99',
    margin: '8px 0',
  },
  socialIcon: {
    fontSize: '24px',
    margin: '0 10px',
    color: '#1890ff',
  },
  divider: {
    backgroundColor: '#ffffff33',
    margin: '20px 0',
  },
  copyright: {
    textAlign: 'center',
    color: '#ffffff99',
    marginTop: '20px',
  }
};

const ClientFooter = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const currentAccount = useSelector(selectCurrentAccount);
  return (
    <Footer style={styles.footer}>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={24} md={10} lg={10}>
          <Title level={4} style={styles.title}>
            Về TuvaTech
          </Title>
          <Space direction="vertical">
            <Text style={styles.text}>
              TuvaTech là hệ thống cửa hàng laptop chuyên nghiệp hàng đầu Việt Nam, chuyên cung cấp các dòng laptop chính hãng với chất lượng và giá cả tốt nhất.
            </Text>
            <Text style={styles.text}>
              Chúng tôi cam kết mang đến những sản phẩm laptop chất lượng cùng dịch vụ bảo hành, hậu mãi chuyên nghiệp cho khách hàng.
            </Text>
            <Text style={styles.text}>
              Với phương châm "Khách hàng là trọng tâm", chúng tôi không ngừng nỗ lực để mang đến trải nghiệm mua sắm tốt nhất và sự hài lòng tuyệt đối cho khách hàng.
            </Text>
            <LinkTyPo href="tel:1800.1060" style={styles.text}>
              <PhoneOutlined /> Hotline: 1800.1060
            </LinkTyPo>
            <LinkTyPo href="mailto:support@tuvatech.vn" style={styles.text}>
              <MailOutlined /> Email: support@tuvatech.vn
            </LinkTyPo>
          </Space>
        </Col>

        <Col xs={24} sm={24} md={5} lg={5}>
          <Title level={4} style={styles.title}>
            Trang khác
          </Title>
          <Space direction="vertical">
            <Link to="/news" style={styles.text}>Tin tức</Link>
            <Link to="/vouchers" style={styles.text}>Săn vouchers</Link>
            <Link 
              onClick={(e) => {
                if (!currentAccount) {
                  e.preventDefault();
                  setIsAuthModalOpen(true);
                }
              }} 
              to={currentAccount?.role === 'admin'? "/admin/info/orderhistory" : "/tmember/orderhistory"} 
              style={styles.text}
            >
              Tra cứu đơn hàng
            </Link>
            <Link to="/warranty-check" style={styles.text}>Tra cứu bảo hành</Link>
            <Link to="/support" style={styles.text}>Liên hệ hỗ trợ</Link>
          </Space>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8}>
          <Title level={4} style={styles.title}>
            Kết nối với TuvaTech
          </Title>
          <Space direction="vertical" size={16}>
            <Space>
              <LinkTyPo href="https://facebook.com/tuvatech" target="_blank">
                <FacebookOutlined style={styles.socialIcon} />
              </LinkTyPo>
              <LinkTyPo href="https://youtube.com/@tuvatech" target="_blank">
                <YoutubeOutlined style={styles.socialIcon} />
              </LinkTyPo>
              <LinkTyPo href="https://instagram.com/tuvatech.vn" target="_blank">
                <InstagramOutlined style={styles.socialIcon} />
              </LinkTyPo>
            </Space>
            <Text style={styles.text}>
              TuvaTech - Hệ thống cửa hàng công nghệ tiên phong. Hãy theo dõi chúng tôi trên mạng xã hội để cập nhật những thông tin mới nhất về sản phẩm và khuyến mãi!
            </Text>
            <Text style={styles.text}>
              <EnvironmentOutlined /> Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
            </Text>
            <Text style={styles.text}>
              <ClockCircleOutlined /> Giờ làm việc: 8:00 - 21:00 (Thứ 2 - Chủ nhật)
            </Text>
          </Space>
        </Col>
      </Row>

      <Divider style={styles.divider} />
      
      <Text style={styles.copyright}>
        © {new Date().getFullYear()} Copyright: TuvaTech. Tất cả quyền được bảo lưu.
      </Text>
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </Footer>
  );
};

export default ClientFooter;