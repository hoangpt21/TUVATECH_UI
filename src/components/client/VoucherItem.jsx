import React from 'react';
import { Card, Typography, Tag, Button, Space, Flex, message } from 'antd';
import { 
  ClockCircleOutlined, 
  ScissorOutlined,
  SaveOutlined,
  RocketOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

const styles = {
  voucherCard: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #f0f0f0',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    background: 'linear-gradient(135deg, #fff6f6 0%, #ffffff 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
 
  },
  leftSection: {
    borderRight: '1px dashed #d9d9d9',
    paddingRight: '16px',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    width: '16px',
    height: '16px',
    background: '#f0f0f0',
    borderRadius: '50%',
    right: '-8px',
  },
  topCircle: {
    top: '-7px',
  },
  bottomCircle: {
    bottom: '-7px',
  },
  discount: {
    color: '#f5222d',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  }
};

function VoucherItem({ coupon, onSave, isSaved = false, usedCountOfUser = 0}) {
  const navigate = useNavigate();
  const formatDiscount = () => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.discount_value);
  };

  return (
    <Card 
      style={styles.voucherCard} 
      size='small'  
      styles={{ body:{height: '100%'}}}
    >
      <Flex gap={16} style={{height: '100%'}}>
        <Flex vertical justify="center" style={styles.leftSection}>
          <div style={{ ...styles.circle, ...styles.topCircle }} />
          <div style={{ ...styles.circle, ...styles.bottomCircle }} />
          <Title level={3} style={styles.discount}>
            {formatDiscount()}
          </Title>
          <Text type="secondary">
            {coupon.discount_type === 'percentage' ? 'giảm' : 'Giảm'}
          </Text>
        </Flex>

        <Flex vertical flex={1} justify="space-between">
          <Space direction="vertical" size={4} wrap>
            <Space wrap>
              <Text strong>{coupon.description}</Text>
              { isSaved && dayjs (coupon.end_date).isBefore(dayjs())?
                <Tag color='red'>Hết hạn</Tag>: 
                isSaved && usedCountOfUser === coupon.max_usage_per_user?
                <Tag color='red'>Đã hết lượt</Tag>:
                <Tag color='green'>Có thể dùng {isSaved && `(còn ${usedCountOfUser}/${coupon.max_usage_per_user} lượt)`}</Tag>}
            </Space>
            <Text type="secondary">
              Đơn tối thiểu {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.min_order_value)}
            </Text>
            {coupon?.discount_type === "percentage" &&
            <Text type="secondary">
              Giảm tối đa -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.max_discount_value)}
            </Text>}
            <Space wrap>
              <Text copyable code>{coupon.coupon_code}</Text>
              <ScissorOutlined style={{ color: '#1890ff' }} />
            </Space>
          </Space>

          <Space wrap>
            <Text type="secondary">
              <ClockCircleOutlined /> HSD: {dayjs(coupon.end_date).format('DD/MM/YYYY')}
            </Text>
              {(() => {
                if(isSaved) {
                  if(dayjs (coupon.end_date).isBefore(dayjs()) || usedCountOfUser === coupon.max_usage_per_user) return null;
                  else return (
                    <Button 
                        type="primary" 
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.coupon_code)
                            .then(() => {
                              navigate('/cart');
                            })
                            .catch(err => {
                              message.error('Failed to copy code:', err);
                              navigate('/cart');
                            });
                        }}
                        icon={<RocketOutlined />}
                      >
                      Áp dụng ngay
                    </Button>);
                } else return (
                  <Button 
                    type="primary" 
                    onClick={() => onSave(coupon.coupon_id)}
                    icon={<SaveOutlined />}
                  >
                    Lưu
                  </Button>
                )
              })()}
          </Space>
        </Flex>
      </Flex>
    </Card>
  );
}

export default VoucherItem;