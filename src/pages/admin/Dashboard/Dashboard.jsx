import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Select, Spin, Typography, Flex, Tooltip, DatePicker, Table, Button, Image, Space } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import StatCard from '../../../components/admin/StatCard';
import OrderStatusChart from '../../../components/admin/OrderStatusChart';
import RevenueChart from '../../../components/admin/RevenueChart';
import { Link } from 'react-router-dom'
import {
  fetchAllOrders, selectAllOrders
} from '../../../redux/order/orderSlice';
import {
  fetchAllOrderItems, selectAllOrderItems
} from '../../../redux/order/orderItemSlice';
import {
  fetchTotalProducts, selectTotalProducts
} from '../../../redux/product';
// --- Assuming User Slice exists ---
import { getTotalUsersAPI, selectTotalUsers } from '../../../redux/user/usersSlice'; // Adjust path if needed
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  FileExcelOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { exportToExcel, formatDataForExcel } from '../../../utils/exportExcel';
// Extend dayjs plugins
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month'); // 'day', 'week', 'month', 'year' for StatCards

  // State for chart-specific filtering
  const [chartFilterType, setChartFilterType] = useState('month'); // 'day', 'month', 'year'
  const [chartDateRange, setChartDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]); // Default to current month

  // --- Selectors ---
  const orders = useSelector(selectAllOrders);
  const orderItems = useSelector(selectAllOrderItems);
  const totalProducts = useSelector(selectTotalProducts);
  const totalUsers = useSelector(selectTotalUsers);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          dispatch(fetchAllOrders({ isAll: true })),
          dispatch(fetchAllOrderItems({ isAll: true })),
          dispatch(fetchTotalProducts()),
          dispatch(getTotalUsersAPI()),
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // --- Calculations (Memoized) ---

  const { currentPeriodData, previousPeriodData, periodLabel } = useMemo(() => {
    const now = dayjs();
    let startDate, endDate, previousStartDate, previousEndDate, periodLabel;

    switch (filter) {
      case 'day':
        startDate = now.startOf('day');
        endDate = now.endOf('day');
        previousStartDate = now.subtract(1, 'day').startOf('day');
        previousEndDate = now.subtract(1, 'day').endOf('day');
        periodLabel = 'ngày';
        break;
      case 'week':
        startDate = now.startOf('isoWeek');
        endDate = now.endOf('isoWeek');
        previousStartDate = now.subtract(1, 'week').startOf('isoWeek');
        previousEndDate = now.subtract(1, 'week').endOf('isoWeek');
        periodLabel = 'tuần';
        break;
      case 'year':
        startDate = now.startOf('year');
        endDate = now.endOf('year');
        previousStartDate = now.subtract(1, 'year').startOf('year');
        previousEndDate = now.subtract(1, 'year').endOf('year');
        periodLabel = 'năm';
        break;
      case 'month':
      default:
        startDate = now.startOf('month');
        endDate = now.endOf('month');
        previousStartDate = now.subtract(1, 'month').startOf('month');
        previousEndDate = now.subtract(1, 'month').endOf('month');
        periodLabel = 'tháng';
        break;
    }

    const filterListByDate = (listObj, typedate, start, end) =>
      listObj.filter(obj =>
        dayjs(obj[typedate]).isValid() && dayjs(obj[typedate]).isBetween(start, end, null, '[]')
      );

    // Filter delivered orders based on updated_at
    const currentDeliveredOrders = filterListByDate(orders, 'updated_at', startDate, endDate)
      .filter(o => o.status === 'delivered');
    const previousDeliveredOrders = filterListByDate(orders, 'updated_at', previousStartDate, previousEndDate)
      .filter(o => o.status === 'delivered');

    // Filter orders for revenue calculation based on payment date and paid status
    const filterOrdersByPaymentDate = (orders, start, end) => {
      return orders.filter(order => {
        return order.payment_status === 'paid' &&
               order.payment_date &&
               dayjs(order.payment_date).isValid() &&
               dayjs(order.payment_date).isBetween(start, end, null, '[]');
      });
    };

    const currentPeriodOrders = filterOrdersByPaymentDate(orders, startDate, endDate);
    const previousPeriodOrders = filterOrdersByPaymentDate(orders, previousStartDate, previousEndDate);

    const calculateTotalRevenue = (orderList) =>
      orderList.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);
    
    const currentData = {
      totalOrders: currentDeliveredOrders.length,
      totalRevenue: calculateTotalRevenue(currentPeriodOrders),
    };

    const previousData = {
      totalOrders: previousDeliveredOrders.length,
      totalRevenue: calculateTotalRevenue(previousPeriodOrders),
    };

    return { currentPeriodData: currentData, previousPeriodData: previousData, periodLabel: periodLabel };
  }, [orders, filter]);

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    return {
      totalOrders: currentPeriodData.totalOrders,
      totalProducts: totalProducts, // Not filtered by date
      totalUsers: totalUsers, // Not filtered by date
      totalRevenue: currentPeriodData.totalRevenue,
    };
  }, [totalProducts, totalUsers, currentPeriodData]);

  // --- Comparison Calculation ---
  const comparisonStats = useMemo(() => {
    let percentageRevenueChange = 0;
    if (previousPeriodData.totalRevenue !== 0) {
      percentageRevenueChange = Math.abs(((currentPeriodData.totalRevenue - previousPeriodData.totalRevenue) / previousPeriodData.totalRevenue) * 100);
    }
    let totalChange = 0;
    if(previousPeriodData.totalOrders !== 0) {
      totalChange = (currentPeriodData.totalOrders - previousPeriodData.totalOrders);
    }
    let percentageTotalRevenueComponent = null;
    let totalOrdersComponent = null;
    if (currentPeriodData.totalRevenue < previousPeriodData.totalRevenue) {
      percentageTotalRevenueComponent = (
        <span style={{ color: 'red' }}>
          <FallOutlined style={{ marginRight: 4 }} />
          {percentageRevenueChange.toFixed(0)}% So với {periodLabel} trước
        </span>
      );
    } else {
      percentageTotalRevenueComponent = (
        <span style={{ color: 'green' }}>
          <RiseOutlined style={{ marginRight: 4 }} />
          {percentageRevenueChange.toFixed(0)}% So với {periodLabel} trước
        </span>
      );
    }

    if (currentPeriodData.totalOrders < previousPeriodData.totalOrders) {
      totalOrdersComponent = (
        <span style={{ color: 'red' }}>
          <FallOutlined style={{ marginRight: 4 }} />
          {totalChange} Đơn hàng so với {periodLabel} trước
        </span>
      );
    } else {
      totalOrdersComponent = (
        <span style={{ color: 'green' }}>
          <RiseOutlined style={{ marginRight: 4 }} />
          {totalChange} Đơn hàng so với {periodLabel} trước
        </span>
      );
    }
    return { percentageTotalRevenueComponent, totalOrdersComponent };
  }, [currentPeriodData, previousPeriodData, periodLabel]); // Added periodLabel to dependency array

  // --- Chart Data Calculation (Based on chartDateRange) ---
  const chartFilteredOrders = useMemo(() => {
    if (!chartDateRange?.length === 2) return [];
    const [start, end] = chartDateRange;
    const getAdjustedEndDate = (date, type) => {
      switch(type) {
        case 'year': return date.endOf('year');
        case 'month': return date.endOf('month'); 
        default: return date.endOf('day');
      }
    };
    const adjustedEnd = getAdjustedEndDate(end, chartFilterType);
    const adjustedStart = start.startOf(chartFilterType === 'day' ? 'day' : chartFilterType);
    // Filter orders by updated_at date
    const ordersByUpdateDate = orders.filter(order => {
      const updateDate = dayjs(order.updated_at);
      return updateDate.isValid() && 
             updateDate.isBetween(adjustedStart, adjustedEnd, null, '[]');
    });
    // Filter orders by payment_date
    const ordersByPaymentDate = orders.filter(order => {
      if (!order.payment_date) return false;
      const paymentDate = dayjs(order.payment_date);
      return paymentDate.isValid() && 
             paymentDate.isBetween(adjustedStart, adjustedEnd, null, '[]');
    });
    return {
      ordersByUpdateDate,
      ordersByPaymentDate
    };
  }, [orders, chartDateRange, chartFilterType]);

  const chartOrderStatusData = useMemo(() => {
    const statusCounts = chartFilteredOrders.ordersByUpdateDate.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([type, value]) => ({ type, value }));
  }, [chartFilteredOrders]);

  const chartRevenueData = useMemo(() => {
    const paidOrders = chartFilteredOrders.ordersByPaymentDate.filter(o => o.payment_status === 'paid');
    const groupedRevenue = paidOrders.reduce((acc, order) => {
       const dateKey = dayjs(order.order_date).format('YYYY-MM-DD'); // Keep daily grouping for revenue chart for now
       acc[dateKey] = (acc[dateKey] || 0) + Number(order.total_price);
       return acc;
    }, {});
    return Object.entries(groupedRevenue).map(([date, value]) => ({ date, type: 'Doanh thu (VND)', value }));
  }, [chartFilteredOrders]);

  // --- Top Products Calculation ---
  const topSellingProducts = useMemo(() => {
    if (!orderItems.length) {
      return [];
    }
    const paidOrderItems = orderItems.filter(item =>
      chartFilteredOrders.ordersByPaymentDate
        .filter(order => order?.payment_status === 'paid')
        .some(order => order.order_id === item.order_id)
    );
    const topProducts = paidOrderItems.reduce((acc, item) => {
      const key = item.product_id;
      if (!acc[key]) {
        acc[key] = {
          quantity: 0,
          total_price: 0,
          thumbnail: item?.thumbnail,
          product_name: item?.product_name,
        };
      }
      acc[key].quantity += item?.quantity || 0;
      acc[key].total_price += Number(item?.subtotal_price || 0);
      return acc;
    }, {});
    const sortedProductKeys = Object.keys(topProducts).sort(
      (a, b) => topProducts[b].quantity - topProducts[a].quantity
    );
    return sortedProductKeys.map((key, index) => ({
      product_id: key,
      product_code: index + 1,
      product_name: topProducts[key].product_name,
      thumbnail: topProducts[key].thumbnail,
      sold: topProducts[key].quantity,
      total_price: topProducts[key].total_price,
    })).slice(0, 10);
  }, [orderItems, chartFilteredOrders]);
  
  const handleExportTopProducts = () => {
    const columns = [
      { title: 'STT', dataIndex: 'product_code' },
      { title: 'Tên sản phẩm', dataIndex: 'product_name' },
      { title: 'Thumbnail', dataIndex: 'thumbnail' },
      { title: 'Đã bán', dataIndex: 'sold' },
      { title: 'Doanh thu', dataIndex: 'total_price' },
    ];
    const formattedData = formatDataForExcel(topSellingProducts, columns);
    exportToExcel(formattedData, 'top-products');
  }

  const productColumns = [
    { title: 'STT', dataIndex: 'product_code', key: 'product_code', width: 80, align: 'center', render: (value) => '#'+value , sorter: (a, b) => a.product_code - b.product_code},
    { 
      title: 'Thông tin sản phẩm', 
      dataIndex: 'product_info', 
      key: 'product_info', 
      render: (_, record) => (
        <Space align="center" style={{width: '100%'}}>
          <Image 
            src={record.thumbnail} 
            width={80} 
            height={80} 
            style={{objectFit: 'contain'}}
            preview={{mask: <div style={{ color: 'white' }}>Xem</div>}}
          />
          <Typography.Title level={5} style={{margin:0}} ellipsis={{ rows: 2 }}>{record.product_name}</Typography.Title>
        </Space>
      )
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      key: 'sold',
      align: 'center',
    },
    {
      title: 'Doanh thu',
      dataIndex: 'total_price',
      key: 'total_price',
      align: 'center',
      render: (revenue) => formatCurrency(revenue), // Use helper function
    },
  ];

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          {/* Select chung cho cả nhóm */}
          <Flex style={{marginBottom: 8 }} gap={10} align='center'>
            <Typography.Text level={5} strong style={{margin:0}}>Lọc doanh số theo: </Typography.Text>
            <Select value={filter} onChange={setFilter} style={{ width: 120 }}>
              <Option value="day">Ngày</Option>
              <Option value="week">Tuần</Option>
              <Option value="month">Tháng</Option>
              <Option value="year">Năm</Option>
            </Select>
          </Flex>
          <Row gutter={[16,16]}>
            <Col xs={24} sm={24} md={24} lg={12}>
              <StatCard
                title={<Tooltip title={`Trong ${periodLabel} này`}>Tổng đơn hàng giao thành công</Tooltip>}
                value={stats.totalOrders}
                icon={ <ShoppingCartOutlined style={{ fontSize: 30, color: '#2ecc71' }} />}
                backgroundColor="#e6f4ea"
                percentageComponent={comparisonStats.totalOrdersComponent}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={12}>
              <StatCard
                title={<Tooltip title={`Trong ${periodLabel} này`}>Tổng doanh thu</Tooltip>}
                value={formatCurrency(stats.totalRevenue)}
                icon={<DollarOutlined style={{ fontSize: 30, color: '#f39c12' }} />}
                backgroundColor="#fff9e6"
                percentageComponent={comparisonStats.percentageTotalRevenueComponent}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <StatCard
            title={<Tooltip title="Tính đến hiện tại">Tổng sản phẩm</Tooltip>}
            value={stats.totalProducts}
            icon={
            <Link to='/admin/products'>
              <InboxOutlined style={{ fontSize: 30, color: '#3498db' }} />
            </Link>}
            backgroundColor="#e6f0ff"
          />
        </Col>
        <Col xs={24} sm={12} md={12}>
          <StatCard
            title={<Tooltip title="Tính đến hiện tại">Tổng người dùng</Tooltip>}
            value={stats.totalUsers}
            icon={
            <Link to='/admin/users'>
              <UserOutlined style={{ fontSize: 30, color: '#8e44ad' }} />
            </Link>}
            backgroundColor="#f3e6ff"
          />
        </Col>
      </Row>
      {/* --- Chart Specific Filters --- */}
      <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 8 }} align="middle">
        <Col>
          <Text strong>Lọc biểu đồ theo:</Text>
        </Col>
        <Col>
          <Select value={chartFilterType} onChange={setChartFilterType} style={{ width: 100 }}>
            <Option value="day">Ngày</Option>
            <Option value="month">Tháng</Option>
            <Option value="year">Năm</Option>
          </Select>
        </Col>
        <Col>
          <RangePicker
            picker={chartFilterType === 'day' ? 'date' : chartFilterType} // 'date', 'month', 'year'
            value={chartDateRange}
            onChange={setChartDateRange}
            allowClear={false} // Prevent clearing to null
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <OrderStatusChart data={chartOrderStatusData} />
        </Col>
        <Col xs={24} lg={12}>
          <RevenueChart data={chartRevenueData} />
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            style={{ 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            title="Top 10 sản phẩm bán chạy"
            extra={
              <Button 
                color='cyan'
                variant='solid'
                icon={<FileExcelOutlined />}
                onClick={handleExportTopProducts}
              >
                Xuất Excel
              </Button>
              }
          >
            <Table
              bordered
              scroll={{ x: 600 }}
              style={{ width: "100%" }}
              columns={productColumns}
              dataSource={topSellingProducts}
              rowKey="product_id" 
              pagination={{
                position: ["bottomCenter"],
                showSizeChanger: false,
                pageSize: 5,
                showTotal: () => `Tổng: ${topSellingProducts.length} sản phẩm`
              }}
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default Dashboard;