import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Input, Select, DatePicker, Button, Space, message, Spin } from 'antd';
import { FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import OrderTable from '../../components/admin/OrderTable'; // Import refactored table
import OrderDetail from '../../components/admin/OrderDetail'; // Import refactored detail modal
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import {
  fetchAllOrders,
  selectAllOrders,
  updateOrderStatus,
} from '../../redux/order/orderSlice';
import {
  fetchAllOrderItems,
  selectAllOrderItems
} from '../../redux/order/orderItemSlice';

dayjs.extend(isBetween); // Extend dayjs for date range filtering

const { Option } = Select;
const { RangePicker } = DatePicker;

// Define status options for filter dropdown
const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

function Orders() {
  const dispatch = useDispatch();
  const allOrders = useSelector(selectAllOrders);
  const allOrderItems = useSelector(selectAllOrderItems);
  
  // --- State ---
  const [loading, setLoading] = useState(false); // Loading state for the main table
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // Holds the full order object for the modal

  // Filters State
  const [statusFilter, setStatusFilter] = useState(null); // Selected status filter
  const [dateRangeFilter, setDateRangeFilter] = useState(null); // [startDate, endDate]
  const [searchFilter, setSearchFilter] = useState(''); // Search term


  // --- Effects ---
  // Fetch all orders on component mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      dispatch(fetchAllOrders({ isAll: true })),
      dispatch(fetchAllOrderItems({ isAll: true }))
    ])
      .finally(() => setLoading(false));
  }, [dispatch]);

  // --- Filtering Logic ---
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(allOrders)) return [];

    return allOrders.filter((order, index) => {
      // Status Filter
      if (statusFilter && order.status !== statusFilter) {
        return false;
      }

      // Date Range Filter
      if (dateRangeFilter && dateRangeFilter[0] && dateRangeFilter[1]) {
        const orderDate = dayjs(order.order_date);
        // Use isBetween for date range check (inclusive)
        if (!orderDate.isBetween(dateRangeFilter[0].startOf('day'), dateRangeFilter[1].endOf('day'), null, '[]')) {
          return false;
        }
      }

      // Search Filter (case-insensitive search across relevant fields)
      if (searchFilter) {
        const orderStatuses = {
          pending:  'Chờ xác nhận',
          confirmed:  'Đã xác nhận',
          shipping: 'Đang giao',
          delivered:  'Đã giao',
          cancelled:  'Đã hủy',
        };
        const searchTerm = searchFilter.toLowerCase();
        const searchableFields = [
          '#'+ (index + 1),
          order.recipient_full_name,
          order.coupon_code_used,
          order.order_date? dayjs(order.order_date).format('YYYY-MM-DD').toString() : '-',
          orderStatuses[order.status],
          order.total_price? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price) : '-',
          order.payment_method,
          order.shipping_method_name
        ];
        if (!searchableFields.some(field => field && field.toLowerCase().includes(searchTerm))) {
          return false;
        }
      }

      return true; // Include order if it passes all filters
    });
  }, [allOrders, statusFilter, dateRangeFilter, searchFilter]);

  // --- Event Handlers ---
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailVisible(true);
  };

  const handleCloseDetails = () => {
    setIsDetailVisible(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
      const res = await dispatch(updateOrderStatus({ orderId, status: newStatus }));
      if(!res.error) message.success('Cập nhật trạng thái đơn hàng thành công!');
      handleCloseDetails(); // Close modal after successful update
  };

  const handleExportExcel = () => {
    try {
      const excelColumns = [
        { title: 'STT', dataIndex: 'order_code', key: 'order_code' },
        { title: 'Ngày đặt', dataIndex: 'order_date', key: 'order_date', render: (d) => dayjs(d).format('YYYY-MM-DD HH:mm:ss') },
        { title: 'Khách hàng', dataIndex: 'recipient_full_name', key: 'recipient_full_name' },
        { title: 'SĐT', dataIndex: 'recipient_phone_number', key: 'recipient_phone_number' },
        { title: 'Mã voucher', dataIndex: 'coupon_code_used', key: 'coupon_code_used' },
        { title: 'Thanh toán', dataIndex: 'payment_method', key: 'payment_method' },
        { title: 'Trạng thái', dataIndex: 'payment_status', key: 'payment_status' },
        { title: 'Tổng tiền (VND)', dataIndex: 'total_price', key: 'total_price' },
        { title: 'Trạng thái đơn hàng', dataIndex: 'status', key: 'status' },
      ];
      const dataForExcel = filteredOrders;
      const formattedData = formatDataForExcel(dataForExcel, excelColumns);
      const filename = `danh_sach_don_hang_${dayjs().format('YYYYMMDD')}`;
      exportToExcel(formattedData, filename);

    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
      console.error("Export error:", error);
    }
  };

  return (
    <Card
      title="Quản lý đơn hàng"
      style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      extra={
        <Button
          color='cyan'
          variant='solid'
          icon={<FileExcelOutlined />}
          onClick={handleExportExcel}
        >
          Xuất Excel
        </Button>
      }
    >
      {/* Filter Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            allowClear
            suffix={<SearchOutlined />}
            placeholder="Tìm kiếm (Mã ĐH, Tên, SĐT...)"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            allowClear
            style={{ width: '100%' }}
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={statusOptions}
          />
        </Col>
        <Col xs={24} sm={24} md={8} lg={12}>
          <RangePicker
            style={{ width: '100%' }}
            value={dateRangeFilter}
            onChange={(dates) => setDateRangeFilter(dates)}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </Col>
      </Row>

      {/* Order Table */}
      <OrderTable
        orders={filteredOrders.map((order, index) => ({ ...order, order_code: '#'+ (index + 1) }))}
        loading={loading}
        onView={handleViewDetails}
        searchText={searchFilter}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetail
         visible={isDetailVisible}
         order={selectedOrder}
         orderItems={allOrderItems.filter(item => item.order_id === selectedOrder?.order_id)}
         onClose={handleCloseDetails}
         onUpdateStatus={handleUpdateStatus}
        />
      )}
    </Card>
  );
}

export default Orders;
