import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Space, Typography, Image, Button, Row, Col, Tag, List, Descriptions } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { getOrderById } from '../../redux/order/orderSlice';
import { getOrderItemsByOrderId } from '../../redux/order/orderItemSlice';

const { Title, Text } = Typography;

function PaymentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!orderId) navigate('/');
        const orderRes = await dispatch(getOrderById({ orderId }));
        if (!orderRes.error) {
          setOrder(orderRes.payload);
          const itemsRes = await dispatch(getOrderItemsByOrderId({ orderId, isAll: true }));
          if (!itemsRes.error) {
            setOrderItems(itemsRes.payload);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, orderId]);

  if (!order) return null;

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: '0 16px' }}>
      <Card loading={loading}>
        <Space direction="vertical" size={24} style={{ width: '100%'}}>
          {status === 'success' ? (
            <Space direction="vertical" size={24} style={ {textAlign: 'center'}}>
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
              <Title level={3} style={{ color: '#52c41a', margin: 0 }}>Cảm ơn bạn đã mua hàng tại TuvaTech</Title>
              <Text>Đơn hàng của bạn đã được xác nhận thành công. Chúng tôi sẽ gửi email xác nhận đơn hàng và thông tin vận chuyển trong thời gian sớm nhất. TuvaTech cam kết mang đến những sản phẩm laptop chất lượng nhất cho khách hàng.</Text>
            </Space>
          ) : (
            <Space direction="vertical" size={24} style={ {textAlign: 'center'}}>
              <CloseCircleOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
              <Title level={3} style={{ color: '#ff4d4f', margin: 0 }}>Thanh toán không thành công</Title>
              <Text>Rất tiếc đã xảy ra lỗi trong quá trình thanh toán. Vui lòng kiểm tra lại thông tin thanh toán hoặc liên hệ với TuvaTech để được hỗ trợ.</Text>
            </Space>
          )}

          <Card style={{ textAlign: 'left' }} size='small' title={<Title level={5} style={{margin: 0}}>Thông tin đơn hàng</Title>}>
            <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}  size="small">
              <Descriptions.Item label={<Text type="secondary">Mã đơn hàng</Text>}>
                <Text strong>{order.order_id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary">Phương thức thanh toán</Text>}>
                <Text strong>{order.payment_method}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary">Số điện thoại</Text>}>
                <Text strong>{order.recipient_phone_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary">Địa chỉ</Text>}>
                <Text strong>{order.recipient_full_address}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <List
            bordered
            dataSource={orderItems}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Image
                      src={item.thumbnail}
                      alt={item.product_name}
                      preview={false}
                      width={80}
                      height={80}
                      style={{ objectFit: 'contain' }}
                    />
                  }
                  title={<Text strong>{item.product_name}</Text>}
                  description={
                    <Space>
                      <Text>Số lượng: {item.quantity}</Text>
                      <Text type="secondary">|</Text>
                      <Text>Thành tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal_price)}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
          <div style={ {textAlign: 'center'}}>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/')}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default PaymentConfirmation;