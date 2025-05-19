import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

const { Text } = Typography;

const StatCard = ({ title, value, icon, backgroundColor, percentageComponent }) => {
  return (
    <Card
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: backgroundColor
      }}
    >
      <Row align="middle">
        <Col span={18}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {title}
          </Text>
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
            {value}
          </Typography.Title>
            {percentageComponent}
        </Col>
        <Col span={6} style={{ textAlign: 'right' }}>
          {icon}
        </Col>
      </Row>
    </Card>
  );
};

export default StatCard;