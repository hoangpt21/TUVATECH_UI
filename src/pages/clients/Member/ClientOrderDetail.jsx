import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Space, Typography, Image, Button, Steps, Row, Col, Divider, Flex, Tag, List } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, MessageOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getOrderById } from '../../../redux/order/orderSlice';
import { getOrderItemsByOrderId } from '../../../redux/order/orderItemSlice';
import walletIcon from '../../../assets/images/wallet.png';
import clientIcon from '../../../assets/images/client.png';
import { addToCart } from '../../../redux/cart/cartSlice';

const { Text, Title } = Typography;
const orderStatuses = {
  pending: { text: 'Chờ xác nhận', color: 'orange' },
  confirmed: { text: 'Đã xác nhận', color: 'processing' },
  shipping: { text: 'Đang vận chuyển', color: 'blue' },
  delivered: { text: 'Đã giao', color: 'success' },
  cancelled: { text: 'Đã hủy', color: 'error' }
};

function ClientOrderDetail() {
  const { state } = useLocation();
  const orderId = state?.orderId;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if(!orderId) navigate(-1);
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

  const orderSteps = [
    { title: 'Đặt hàng', description: dayjs(order.order_date).format('HH:mm\nDD/MM/YYYY') },
    { title: 'Xác nhận', description: 'Có email đã xác nhận' },
    { title: 'Đang giao', description: 'Đang giao' },
    { title: 'Nhận hàng', description: 'Có email thành công' }
  ];

  const currentStep = order.status === 'pending' ? 0 
    : order.status === 'confirmed' ? 1
    : order.status === 'shipping' ? 2
    : order.status === 'delivered' ? 3
    : 0;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Space align="center" size={8}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          type="text"
        />
        <Title level={4} style={{ margin: 0 }}>Chi tiết đơn hàng</Title>
      </Space>

      <Row>
        <Col span={24}>
          <Card loading={loading}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Flex justify='space-between' align='center'>
                <Space direction='vertical' size={10}>
                  <span>Mã đơn hàng:  <Text strong>{order.order_id}</Text> </span>
                  <Text type="secondary">{dayjs(order.order_date).format('DD/MM/YYYY HH:mm')}</Text>
                </Space>
                <Tag color={orderStatuses[order?.status].color}>{orderStatuses[order?.status].text}</Tag>
              </Flex>
              <Divider style={{margin: '10px 0' }} />
              {/* Danh sách sản phẩm */}
              <List
                loading={loading}
                pagination = {{
                  pageSize: 5,
                  align: 'center',
                }}
                dataSource={orderItems}
                renderItem={(orderItem) => {
                  return (
                    <List.Item >
                        {/* Thông tin đơn hàng */}
                        <List.Item.Meta
                          avatar={
                              <img
                              src={orderItem.thumbnail}
                              alt={orderItem.product_name}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: 'contain',
                                borderRadius: 4,
                                flexShrink: 0
                              }}
                            />
                          }
                          style={{ flex: 1, marginLeft: 16 }}
                          title={<Link to="/product/detail" state={{productId: orderItem.product_id}} >{orderItem.product_name}</Link>}
                          description={
                          <Flex justify='space-between' align='center' wrap>
                            <span>Số lượng: <Text strong color='red'>{orderItem.quantity}</Text></span>
                            <Button
                              type="default"
                              danger
                              onClick={async () => {
                                const res = await dispatch(addToCart({ product_id: orderItem.product_id, operator: '+'}));
                                if(!res?.error) {
                                  message.success('Đã thêm sản phẩm vào giỏ hàng');
                                  navigate('/cart');
                                }
                              }}
                            >
                              Mua lại
                            </Button>
                          </Flex>}
                        />
                    </List.Item>
                  );
                }}
              />
              
             {order?.status !== "cancelled" && 
             <div style={{width: '100%'}}>
               <Steps
                  style={{width: '100%'}}
                  current={currentStep}
                  items={orderSteps}
                  responsive={true}
                  labelPlacement="vertical"
                />
             </div>}

              {/* Thông tin thanh toán */}
              <Card
                style={{
                  background: "#f7f9fa",
                  marginBottom: 16,
                  borderRadius: 12
                }}
                title={
                  <Space align="center">
                  <Image
                    src={walletIcon}
                    alt="pay"
                    width={32}
                    preview={false}
                  />
                  <Title level={4} style={{ margin: 0, color: "#d7263d" }}>
                    Thông tin thanh toán
                  </Title>
                </Space>
                }
                styles={{body:{ padding: 16} }}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                  <Row justify="space-between">
                    <Text>Tổng tiền sản phẩm:</Text>
                    <Text strong>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total_price) + (Number(order.discount_amount) || 0) - (Number(order.shipping_fee) || 0))}
                    </Text>
                  </Row>

                  <Row justify="space-between">
                    <Text>Giảm giá:</Text>
                    <Text strong>
                      {order.discount_amount ? '-' : ''}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.discount_amount || 0)}
                    </Text>
                  </Row>

                  <Row justify="space-between">
                    <Text>Phí vận chuyển:</Text>
                    <Text strong>
                      {order.shipping_fee ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shipping_fee) : 'Miễn phí'}
                    </Text>
                  </Row>

                  <Divider style={{margin: '10px 0' }} />

                  <Row justify="space-between">
                    <Text strong>Phải thanh toán:</Text>
                    <Text strong style={{ fontSize: 18, color: "#d7263d" }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total_price))}
                    </Text>
                  </Row>
                </Space>
              </Card>

              {/* Thông tin khách hàng */}
              <Card
                style={{
                  background: "#f7f9fa",
                  borderRadius: 12
                }}
                title={
                  <Space align="center">
                  <Image
                    src={clientIcon}
                    alt="user"
                    width={32}
                    preview={false}
                  />
                  <Title level={4} style={{ margin: 0, color: "#d7263d" }}>
                    Thông tin khách hàng
                  </Title>
                </Space>
                }
                styles={{body:{ padding: 16} }}
              >
                <Space direction="vertical" size={8}>
                  <Space align="center">
                    <Text type="secondary">
                      <UserOutlined style={{ fontSize: 18 }} />
                    </Text>
                    <Text strong>{order.recipient_full_name}</Text>
                  </Space>

                  <Space align="center">
                    <Text type="secondary">
                      <PhoneOutlined style={{ fontSize: 18 }} />
                    </Text>
                    <Text strong>{order.recipient_phone_number}</Text>
                  </Space>

                  <Space align="center">
                    <Text type="secondary">
                      <EnvironmentOutlined style={{ fontSize: 18 }} />
                    </Text>
                    <Text strong>{order.recipient_full_address}</Text>
                  </Space>
                  {order.note && (
                    <Space align="center">
                      <Text type="secondary">
                        <MessageOutlined style={{ fontSize: 18 }} />
                      </Text>
                      <Text strong>{order.note}</Text>
                    </Space>
                  )}
                </Space>
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default ClientOrderDetail;