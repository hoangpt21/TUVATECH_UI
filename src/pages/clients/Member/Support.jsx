import React from 'react';
import { Card, Typography, Row, Col, Space } from 'antd';
import headphoneIcon from '../../../assets/images/headphones.png'
import cancelOrdersIcon from '../../../assets/images/bad-review.png'
import messagesIcon from '../../../assets/images/message.png'
import warantyIcon from '../../../assets/images/waranty.png'
const { Title, Text } = Typography;

const styles = {
    container: {
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    cardTitle: {
        margin: 0,
        fontWeight: 600,
        color: '#1a237e',
    },
    iconWrapper: {
        width: '48px',
        height: '48px',
        marginRight: '16px',
    },
    icon: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    content: {
        flex: 1,
    },
    title: {
        color: '#1a237e',
        margin: 0,
        fontSize: '16px',
        fontWeight: 500,
    },
    time: {
        color: '#666',
        fontSize: '14px',
        margin: '4px 0',
    },
    contact: {
        color: '#ff4d4f',
        fontSize: '16px',
        fontWeight: 'bold',
        margin: 0,
    },
};

function Support() {
  const supportItems = [
    {
      icon: headphoneIcon,
      title: 'Tư vấn mua hàng',
      time: '(8h00 - 22h00)',
      contact: '1800.1060',
      action: () => window.location.href = 'tel:18002097',
    },
    {
      icon: warantyIcon,
      title: 'Bảo hành',
      time: '(8h00 - 21h00)',
      contact: '1800.2060',
      action: () => window.location.href = 'tel:18002064',
    },
    {
      icon: cancelOrdersIcon,
      title: 'Yêu cầu hủy đơn hàng',
      time: '(8h00 - 21h30)',
      contact: '1800.3060',
      action: () => window.location.href = 'tel:18002063',
    },
    {
      icon: messagesIcon,
      title: 'Email',
      contact: 'support@tuvatech.vn',
      action: () => window.location.href = 'mailto:support@tuvatech.vn',
    },
  ];

  return (
    <Space direction="vertical" size="large" style={styles.container}>
      <Card 
        title={<Title level={4} style={styles.cardTitle}>Hỗ trợ khách hàng</Title>}
      >
        <Row gutter={[16, 16]}>
          {supportItems.map((item, index) => (
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} key={index}>
              <Card 
                hoverable
                onClick={item.action}
                size='small'
                styles={{ body: { padding: '16px'} }}
              >
                <Space direction="horizontal" align="center" style={{ width: '100%' }}>
                    <div style={styles.iconWrapper}>
                    <img src={item.icon} alt={item.title} style={styles.icon} />
                    </div>
                    <div style={styles.content}>
                    <Title level={5} style={styles.title}>{item.title}</Title>
                    {item.time && <Text style={styles.time}>{item.time}</Text>}
                    <Text style={styles.contact}>{item.contact}</Text>
                    </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </Space>
  );
}

export default Support;