import React from 'react';
import { Table, Button, Space, Tag, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import dayjs from 'dayjs';

// Define status colors and text (can be shared or moved to a constants file)
const orderStatuses = {
  pending: { text: 'Chờ xác nhận', color: 'orange' },
  confirmed: { text: 'Đã xác nhận', color: 'processing' },
  shipping: { text: 'Đang giao', color: 'blue' },
  delivered: { text: 'Đã giao', color: 'success' },
  cancelled: { text: 'Đã hủy', color: 'error' },
};

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

const OrderTable = ({
  orders,
  loading,
  onView, // Function to handle viewing details
  searchText // The search term from Orders.jsx
}) => {
  const columns = [
    {
      title: 'STT',
      dataIndex: 'order_code',
      key: 'order_code',
      width: 75,
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
      sorter: (a, b) => a.order_code - b.order_code,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'order_date',
      key: 'order_date',
      width: 125,
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? dayjs(text).format('YYYY-MM-DD') : ''}
          />
        ) : (
          text? dayjs(text).format('YYYY-MM-DD') : '-'
        ),
      sorter: (a, b) => dayjs(a.order_date).unix() - dayjs(b.order_date).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'recipient_full_name', // Use recipient name from orderModel
      key: 'recipient_full_name',
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Mã giảm giá',
      dataIndex: 'coupon_code_used',
      key: 'coupon_code_used',
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text? text: '-'
        ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Vận chuyển',
      dataIndex: 'shipping_method_name',
      key: 'shipping_method_name',
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price', // Use total_price from orderModel
      key: 'total_price',
      width: 130,
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? formatCurrency(text) : ''}
          />
        ) : (
          formatCurrency(text)
        ),
      sorter: (a, b) => (a.total_price || 0) - (b.total_price || 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 125,
      align: 'center',
      render: (text) =>{
        return <Tag color={orderStatuses[text].color}> {searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={orderStatuses[text] ? orderStatuses[text].text.toString() : ''}
          />
        ) : (
          orderStatuses[text].text
        )}
        </Tag>
    }},
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onView(record)} // Call onView with the full order record
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders} // Use the orders prop
      loading={loading} // Use the loading prop
      rowKey="order_id"
      bordered
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: false,
        pageSize: 5,
        showTotal: (total, range) => `Tổng: ${total} đơn hàng`
      }}
      scroll={{ x: 1000 }} // Adjust scroll width as needed
    />
  );
};

export default OrderTable;