import React, { useEffect, useMemo, useState } from 'react';
import { Card, List, Tag, Button, Space, DatePicker, Typography, Row, Col, Select, Avatar, Flex } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getOrdersByUser, selectUserOrders } from '../../../redux/order/orderSlice';
import { getOrderItemsByOrderId, selectOrderItemsByOrder } from '../../../redux/order/orderItemSlice';
import { selectCurrentAccount } from '../../../redux/user/accountSlice';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const orderStatuses = {
  pending: { text: 'Chờ xác nhận', color: 'orange' },
  confirmed: { text: 'Đã xác nhận', color: 'processing' },
  shipping: { text: 'Đang vận chuyển', color: 'blue' },
  delivered: { text: 'Đã giao', color: 'success' },
  cancelled: { text: 'Đã hủy', color: 'error' }
};

function OrderHistory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const userOrders = useSelector(selectUserOrders);
  const orderItemsByOrder = useSelector(selectOrderItemsByOrder);
  const currentAccount = useSelector(selectCurrentAccount);
  const [dateRangeFilter, setDateRangeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await dispatch(getOrdersByUser({ isAll: true }));
        if (!res.error && res.payload?.length > 0) {
          await Promise.all(
            res.payload.map(order => 
              dispatch(getOrderItemsByOrderId({ orderId: order.order_id, isAll: true }))
            )
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return userOrders.filter(order => {
      // Date Range Filter
      if (dateRangeFilter && dateRangeFilter[0] && dateRangeFilter[1]) {
        const orderDate = dayjs(order.order_date);
        if (!orderDate.isBetween(dateRangeFilter[0].startOf('day'), dateRangeFilter[1].endOf('day'), null, '[]')) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter) {
        if (order.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [userOrders, dateRangeFilter, statusFilter]);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card style={{boxShadow: '0 2px 8px rgba(0,0,0,0.08)',}} title={<Title level={4} style={{margin: 0, color: '#1a237e'}}>Đơn hàng đặt</Title>}>
        {/* Thông tin tài khoản */}
        <Space align="center" size={16} style={{marginBottom: 16}}>
          <Avatar 
            src={currentAccount?.avatar_url} 
            size={64}
            style={{ backgroundColor: '#FFA500' }}
          >
            {currentAccount?.display_name?.[0]?.toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Title level={4} style={{ margin: 0 }}>{currentAccount?.display_name}</Title>
            <Space>
              <Text type="secondary">
                {currentAccount?.phone 
                  ? showPhone 
                    ? currentAccount.phone
                    : currentAccount.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')
                  : ''}
              </Text>
              {currentAccount?.phone &&
              <Button 
                type="text" 
                icon={showPhone? <EyeInvisibleOutlined />: <EyeOutlined />}
                onClick={() => setShowPhone(!showPhone)}
                style={{ padding: '0 4px' }}
              />}
            </Space>
          </Space>
        </Space>
        <div style={{ 
          textAlign: 'center', 
          padding: '12px 0',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
          marginBottom: 16
        }}>
          <Title level={2} style={{margin: 0}} strong>{filteredOrders.length}</Title>
          <Text> đơn hàng</Text>
        </div>
        {/* Bộ lọc ngày */}
        <div style={{marginBottom: 16}}>
          <RangePicker
            onChange={setDateRangeFilter}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </div>

        {/* Tabs trạng thái */}
        <Card 
          size='small'
          style={{marginBottom: 16}}
        >
          <Space size={16} wrap>
            <Button 
              type={!statusFilter ? 'primary' : 'default'} 
              onClick={() => setStatusFilter(null)}
            >
              Tất cả
            </Button>
            {Object.entries(orderStatuses).map(([key, { text }]) => (
              <Button
                key={key}
                type={statusFilter === key ? 'primary' : 'default'}
                onClick={() => setStatusFilter(key)}
              >
                {text}
              </Button>
            ))}
          </Space>
        </Card>

        {/* Danh sách đơn hàng */}
        <List
          loading={loading}
          pagination = {{
            pageSize: 5,
            align: 'center',
          }}
          dataSource={filteredOrders}
          renderItem={(order) => {
            const orderItems = orderItemsByOrder[order.order_id] || [];
            const firstItem = orderItems[0];
            if (!firstItem) return null;
            return (
              <List.Item>
                  {/* Thông tin đơn hàng */}
                  <List.Item.Meta
                    avatar={
                      <img
                        src={firstItem.thumbnail}
                        alt={firstItem.product_name}
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
                    title={firstItem.product_name}
                    description={
                      <Space direction='vertical' size={3} style={{width: '100%'}}>
                        {orderItems.length > 1 && (
                          <Text type='secondary' style={{fontSize: 13 }}>
                            và {orderItems.length - 1} sản phẩm khác
                          </Text>
                        )}
                        <Flex justify='space-between' align='center' wrap gap={3}>
                          <Space direction='vertical' size={3}>
                            <Tag
                              color={orderStatuses[order.status]?.color}
                              style={{
                                fontSize: '12px'
                              }}
                            >
                              {orderStatuses[order.status]?.text}
                            </Tag>
                            <Text type='danger' strong>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
                            </Text> 
                            <Text type='secondary' style={{fontWeight: 400}}>
                            Ngày đặt: {dayjs(order.order_date).format('DD/MM/YYYY HH:mm')}
                            </Text>
                          </Space>
                          <Button
                            type="default"
                            danger
                            onClick={() => {
                              if (currentAccount?.role === 'admin') {
                                navigate(`/admin/info/orderhistory/detail`, { state: { orderId: order.order_id } });
                              } else {
                                navigate(`/tmember/orderhistory/detail`, { state: { orderId: order.order_id } });
                              }
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </Flex>
                      </Space>
                    }
                  />
              </List.Item>
            );
          }}
        />
      </Card>
    </Space>
  );
}

export default OrderHistory;
