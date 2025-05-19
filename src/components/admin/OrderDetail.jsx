import React, { useState, useEffect } from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  List,
  Select,
  message,
  Row,
  Col,
  Card,
  Image,
  Typography,
  Timeline,
  Flex,
  Form,
  Divider,
  Tooltip
} from 'antd';
import { 
  CloseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  SmileOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
  WalletOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const orderStatuses = {
  pending: { text: 'Chờ xác nhận', color: 'orange', iconColor: 'orange', icon: <ClockCircleOutlined/> },
  confirmed: { text: 'Xác nhận đơn', color: 'processing', iconColor: '#1890FF', icon: <CheckCircleOutlined /> },
  shipping: { text: 'Đang giao', color: 'blue', iconColor: 'blue', icon: <CarOutlined /> },
  delivered: { text: 'Đã giao', color: 'success', iconColor: '#00A000', icon: <SmileOutlined /> },
  cancelled: { text: 'Hủy đơn', color: 'error', iconColor: '#FF4D4F', icon: <CloseCircleOutlined /> },
};

const paymentStatuses = {
  pending: { text: 'Chưa thanh toán', color: 'orange' },
  paid: { text: 'Đã thanh toán', color: 'green' },
  failed: { text: 'Thanh toán thất bại', color: 'red' }
};

const shippingTypes = {
  'Giao hàng tiêu chuẩn': '3-5 ngày',
  'Giao hàng nhanh': '2-3 ngày',
  'Giao hàng trong ngày': 'Trong ngày'
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);

const styles = {
  modalBody: {
    overflowY: 'auto',
    height: 550,
    padding: '16px 8px',
  },
  card: {
    borderRadius: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  selectStatus: {
    minWidth: 150,
  },
  timeline: {
    maxWidth: 200,
    marginLeft: 16,
  }
};

const OrderDetail = ({
  visible,
  order,
  orderItems,
  onClose,
  onUpdateStatus
}) => {
  if (!order) return null;
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  useEffect(() => {
    setSelectedStatus(order.status);
  }, [order]);

  const renderTimeline = () => {
    const allStatuses = ['pending', 'confirmed', 'shipping', 'delivered'];
    const currentStatusIndex = allStatuses.indexOf(selectedStatus);

    return (
      <Timeline
        style={styles.timeline}
        items={allStatuses.map((status, index) => {
          const statusInfo = orderStatuses[status];
          const isCurrent = status === selectedStatus;
          const isPast = index < currentStatusIndex;
          const isFuture = index > currentStatusIndex;
          
          if (selectedStatus === 'cancelled') {
            return {
              dot: statusInfo.icon,
              color: 'gray',
              children: statusInfo.text,
            };
          }

          return {
            dot: statusInfo.icon,
            color: isCurrent ? statusInfo.iconColor : (isPast ? 'green' : 'gray'),
            children: (
              <Text style={{ opacity: isFuture ? 0.4 : 1, color: (isCurrent || isPast) && statusInfo.iconColor }}>
                {statusInfo.text}
              </Text>
            )
          };
        })}
      />
    );
  };

  const handleSaveStatus = () => {
    if (selectedStatus !== order.status) {
      if (onUpdateStatus) {
        onUpdateStatus(order.order_id, selectedStatus);
      } else {
        message.error('Chức năng cập nhật trạng thái chưa được cung cấp!');
      }
    } else {
      message.info('Bạn chưa thay đổi trạng thái đơn hàng!');
    }
  };
  
  const getAvailableStatuses = () => {
    const allStatuses = Object.keys(orderStatuses);
    const currentIndex = allStatuses.indexOf(order.status);
    
    return allStatuses.map(status => ({
      value: status,
      label: orderStatuses[status].text,
      disabled: allStatuses.indexOf(status) < currentIndex
    }));
  };

  return (
    <Modal
      title={' '}
      open={visible}
      width={{
        xs: '90%',
        sm: '80%',
        md: '80%',
        lg: '80%',
        xl: '80%',
        xxl: '80%',
      }}
      centered
      maskClosable={false}
      okText="Lưu"
      okButtonProps={{ icon: <SaveOutlined/> }}
      cancelText={'Hủy'}
      cancelButtonProps={{ icon: <CloseOutlined/> }}
      onOk={handleSaveStatus}
      onCancel={onClose}
      styles={{body: styles.modalBody}}
    >
      <div style={{padding: 6}}>
        {/* Header */}
        <Row gutter={[16,16]}>
          <Col xs={24} lg={18}>
            <Flex gap={30} vertical flex={1}>
              <Flex vertical gap={5}>
                <Flex wrap gap={5} align='center'>
                  <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                    Đơn hàng #{order.order_id}
                  </Title>
                  <Tag color={orderStatuses[order.status]?.color}>
                    {order.status === "confirmed"? "Đã xác nhận": order.status === "cancelled"? "Đã hủy": orderStatuses[order.status]?.text}
                  </Tag>
                </Flex>
                <Text type='secondary'>
                  Thời gian: {dayjs(order.order_date).format('DD/MM/YYYY HH:mm:ss')}
                </Text>
              </Flex>
              <div>
                <Title level={5} style={{ margin: 0}}>Sản phẩm</Title>
                <List
                  dataSource={orderItems}
                  pagination={{ pageSize: 4, align: 'center' }}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Image
                            src={item.thumbnail}
                            alt={item.product_name}
                            preview={{
                              mask: <div style={{ color: 'white' }}>Xem</div>
                            }}
                            style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 4 }}
                          />
                        }
                        title={item.product_name}
                        description={
                          <Flex justify='space-between' align='center' wrap gap={5}>
                            <Flex gap={3}>
                              <Text>{formatCurrency(Number(item.subtotal_price/item.quantity))}</Text>
                              <Text type='secondary'>x {item.quantity}</Text>
                            </Flex>
                            <Text strong style={{color: '#f5222d'}}>{formatCurrency(item.subtotal_price)}</Text>
                          </Flex>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </Flex>
          </Col>
          <Col xs={24} lg={6}>
            <Flex vertical gap={16} justify='flex-start'>
              <Form layout='vertical'>
                <Form.Item label="Cập nhật trạng thái">
                  <Select
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    style={{ minWidth: 180, fontWeight: 600 }}
                    options={getAvailableStatuses()}
                  />
                </Form.Item>
              </Form>
              {renderTimeline()}
            </Flex>
          </Col>
        </Row>

        {/* Thông tin đơn hàng, vận chuyển, thanh toán, khách hàng */}
        <Row gutter={[16,16]} style={{marginTop: 16}}>
          <Col xs={24} lg={8}>
            <Card title="Khách hàng" size='small' style={{height: '100%'}}>
              <Flex vertical gap={10}>
                <Flex align='center' gap={8} wrap>
                  <UserOutlined style={{ fontSize: 24, padding: 4, backgroundColor: '#e6f7ff', color: '#1890ff', borderRadius: '50%' }} />
                  <span style={{ fontWeight: 600 }}>{order.recipient_full_name}</span>
                </Flex>
                <Flex align='center' gap={8} wrap style={{fontSize: 15}}>
                  <MailOutlined 
                    style={{ marginRight: 8, color: '#52c41a' }}
                  />
                  <Text style={{fontSize: 15}}>{order.recipient_email || '-'}</Text>
                </Flex>
                <Flex align='center' gap={8} wrap style={{fontSize: 15}}>
                  <PhoneOutlined 
                    style={{ marginRight: 8, color: '#faad14' }}
                  />
                  <Text style={{fontSize: 15}}>{order.recipient_phone_number || '-'}</Text>
                </Flex>
                <Flex align='center' gap={8} wrap style={{fontSize: 15}}>
                  <EnvironmentOutlined 
                    style={{ marginRight: 8, color: '#f5222d' }}
                  />
                  <Text style={{fontSize: 15}}>{order.recipient_full_address || '-'}</Text>
                </Flex>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card size='small'  style={{height: '100%'}}>
              <Title level={5} style={{ margin: '10px 0' }}>Vận chuyển</Title>
              <Flex justify='space-between' align='center' wrap gap={5} style={{marginBottom: 8}}>
                <Flex align='center' gap={8}>
                  <CarOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                  <Flex vertical>
                    <Text>{order.shipping_method_name || 'Giao nhanh'}</Text>
                    <Text type='secondary'>{shippingTypes[order.shipping_method_name] || 'Giao hàng tiêu chuẩn'}</Text>
                  </Flex>
                </Flex>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </Flex>
              <Divider style={{margin: '16px 0'}}/>
              <Title level={5} style={{ margin: '10px 0' }}>Thanh toán</Title>
              <Flex align='center' gap={8} style={{margin: '8px 0'}} wrap>
                <WalletOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                <Text >{order.payment_method || 'Thanh toán online'}</Text>
                <Tag color={paymentStatuses[order.payment_status]?.color || 'default'}>
                  {paymentStatuses[order.payment_status]?.text || 'Không xác định'}
                </Tag>
              </Flex>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card size='small' title="Đơn hàng"  style={{height: '100%'}}>
              <Flex vertical gap={8}>
                <Flex justify='space-between' align='center' wrap gap={5}>
                  <span>Tổng</span>
                  <span>{formatCurrency(Number(order.total_price)+ Number(order?.discount_amount)- Number(order?.shipping_fee))}</span>
                </Flex>
                <Flex justify='space-between' align='center' wrap gap={5}>
                  <span>Giảm giá</span>
                  <span style={{color: 'red'}}>-{formatCurrency(order.discount_amount)}</span>
                </Flex>
                <Flex justify='space-between' align='center' wrap gap={5}>
                  <span>Vận chuyển</span>
                  <span>{formatCurrency(order.shipping_fee)}</span>
                </Flex>
              </Flex>
              <Divider style={{margin: '16px 0'}}/>
              <Flex justify='space-between' align='center' wrap gap={5} style={{marginBottom: 8}}>
                <span>Thanh toán</span>
                <Title style={{margin: 0, color: 'red'}} level={4}>{formatCurrency(order.total_price)}</Title>
              </Flex>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16,16]} style={{marginTop: 16}}>
          <Col xs={24}>
            <Card size='small' title="Ghi chú" style={{height: '100%'}}>
              <Text>{order.note || '-'}</Text>
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default OrderDetail;
