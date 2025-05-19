import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StatCard from '../../../components/admin/StatCard';
import { Row, Col, Card, Select, Typography, Spin, Table, Flex, Space, Tooltip, Button, Image } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';

// Extend dayjs plugins
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

// --- Redux Imports (Assuming importSlice exists) ---
import { fetchAllImportDetails, selectImportDetails } from '../../../redux/import/importDetailSlice';
import { fetchAllImports, selectImports } from '../../../redux/import/importSlice';
// Placeholder for importSlice - replace with actual imports if available
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  DatabaseOutlined,
  ImportOutlined,
  RiseOutlined,
  FallOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import { fetchAllProducts, selectProducts } from '../../../redux/product/productSlice';
import { fetchAllOrders, selectAllOrders } from '../../../redux/order/orderSlice';
import { fetchAllOrderItems, selectAllOrderItems } from '../../../redux/order/orderItemSlice';
import { exportToExcel, formatDataForExcel } from '../../../utils/exportExcel';

const { Option } = Select;

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
};

function InventoryDashboard() {
  const dispatch = useDispatch();
  const [importFilter, setImportFilter] = useState('month'); // 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);
  // --- Selectors ---
  const imports = useSelector(selectImports);
  const importDetails = useSelector(selectImportDetails);
  const products = useSelector(selectProducts);
  const orders = useSelector(selectAllOrders);
  const orderItems = useSelector(selectAllOrderItems);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Dispatch actions to fetch all necessary data
        await Promise.all([
          dispatch(fetchAllImports({ isAll: true })), // Assumed action
          dispatch(fetchAllImportDetails({ isAll: true })),
          dispatch(fetchAllOrders({ isAll: true })),
          dispatch(fetchAllOrderItems({ isAll: true })),
          dispatch(fetchAllProducts({ isAll: true }))
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // --- Calculations (Memoized) ---

  // 1. Import Statistics (Filtered)
  const filteredImportStats = useMemo(() => {
    const now = dayjs();
    let startDate, endDate;
    let previousStartDate, previousEndDate;

    if (importFilter === 'week') {
      startDate = now.startOf('isoWeek');
      endDate = now.endOf('isoWeek');
      previousStartDate = now.subtract(1, 'week').startOf('isoWeek');
      previousEndDate = now.subtract(1, 'week').endOf('isoWeek');
    } else if (importFilter === 'month') {
      startDate = now.startOf('month');
      endDate = now.endOf('month');
      previousStartDate = now.subtract(1, 'month').startOf('month');
      previousEndDate = now.subtract(1, 'month').endOf('month');
    } else if (importFilter === 'year') {
      startDate = now.startOf('year');
      endDate = now.endOf('year');
      previousStartDate = now.subtract(1, 'year').startOf('year');
      previousEndDate = now.subtract(1, 'year').endOf('year');
    } else {
      startDate = dayjs(0);
      endDate = now.endOf('day');
      previousStartDate = dayjs(0);
      previousEndDate = dayjs(0);
    }

    const relevantImports = imports.filter(imp =>
      dayjs(imp.import_date).isValid() && dayjs(imp.import_date).isBetween(startDate, endDate, null, '[]') // '[]' includes start and end
    );

    const previousRelevantImports = imports.filter(imp =>
      dayjs(imp.import_date).isValid() && dayjs(imp.import_date).isBetween(previousStartDate, previousEndDate, null, '[]')
    );

    const relevantImportIds = relevantImports.map(imp => imp.import_id);
    const previousRelevantImportIds = previousRelevantImports.map(imp => imp.import_id);

    const relevantImportDetails = importDetails.filter(detail =>
      relevantImportIds.includes(detail.import_id)
    );

    const previousRelevantImportDetails = importDetails.filter(detail =>
      previousRelevantImportIds.includes(detail.import_id)
    );
    const totalCost = relevantImports.reduce((sum, imp) => sum + (Number(imp.total_amount) || 0), 0);
    const previousTotalCost = previousRelevantImports.reduce((sum, imp) => sum + (Number(imp.total_amount) || 0), 0);
    const totalQuantity = relevantImportDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0);
    const previousTotalQuantity = previousRelevantImportDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0);

    let percentageChange = 0;
    if (previousTotalCost !== 0) {
      percentageChange = Math.abs(((totalCost - previousTotalCost) / previousTotalCost) * 100);
    }
    let totalChange = 0;
    if(previousTotalQuantity !== 0) {
      totalChange = (totalQuantity - previousTotalQuantity);
    }

    let percentageTotalCostComponent = null;
    let percentageTotalQuantityComponent = null;
    if (totalCost < previousTotalCost) {
      percentageTotalCostComponent = (
        <span style={{ color: 'red' }}>
          <FallOutlined style={{ marginRight: 4 }} />
          {percentageChange.toFixed(0)}% So với {importFilter === 'week'? 'tuần': importFilter === 'month'? 'tháng': 'năm'} trước
        </span>
      );
    } else {
      percentageTotalCostComponent = (
        <span style={{ color: 'green' }}>
          <RiseOutlined style={{ marginRight: 4 }} />
          {percentageChange.toFixed(0)}% So với {importFilter === 'week'? 'tuần': importFilter === 'month'? 'tháng': 'năm'} trước
        </span>
      );
    }
    if (totalQuantity < previousTotalQuantity) {
      percentageTotalQuantityComponent = (
        <span style={{ color: 'red' }}>
          <FallOutlined style={{ marginRight: 4 }} />
          {totalChange} sản phẩm so với {importFilter === 'week'? 'tuần': importFilter === 'month'? 'tháng': 'năm'} trước
        </span>
      );
    } else {
      percentageTotalQuantityComponent = (
        <span style={{ color: 'green' }}>
          <RiseOutlined style={{ marginRight: 4 }} />
          {totalChange} sản phẩm so với {importFilter === 'week'? 'tuần': importFilter === 'month'? 'tháng': 'năm'} trước
        </span>
      );
    }
    return { totalCost, totalQuantity, percentageTotalCostComponent, percentageTotalQuantityComponent };
  }, [imports, importDetails, importFilter]);

  // 2. Total Stock Quantity
  const totalStockQuantity = useMemo(() => {
    return products.reduce((sum, prod) => sum + (prod.stock_quantity || 0), 0);
  }, [products]);

  // 3. Total Stock Value
  const totalStockValue = useMemo(() => {
    const productMap = products.reduce((map, prod) => {
      map[prod.product_id] = prod;
      return map;
    }, {});

    return products.reduce((sum, prod) => {
      const product = productMap[prod.product_id];
      const price = Number(product?.selling_price) ?? 0;
      return sum + (prod.stock_quantity || 0) * price;
    }, 0);
  }, [products]);

  // 4. Products Awaiting Shipment (Quantity)
  const pendingShipmentQuantity = useMemo(() => {
    const processingOrderIds = orders
      .filter(order => ['confirmed'].includes(order.status))
      .map(order => order.order_id);

    return orderItems
      .filter(item => processingOrderIds.includes(item.order_id))
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [orders, orderItems]);

  const ordersNeedingShipment = useMemo(() => {
    const processingOrderIds = orders
      .filter(order => ['confirmed'].includes(order.status))
      .map(order => order.order_id);

    return orderItems
      .filter(item => processingOrderIds.includes(item.order_id))
      .map((item, index) => {
        const order = orders.find(o => o.order_id === item.order_id);
        return {
          order_id: item.order_id,
          order_code: index+1,
          status: 'Đã xác nhận',
          quantity: item.quantity,
          total_price: order?.total_price
        };
      });
  }, [orders, orderItems]);

  const stockedProducts = useMemo(() => {
    // Get all products with stock info
    return products.filter(product => product.stock_quantity > 0)
      .map((product, index) => ({
        product_id: product.product_id,
        product_code: index + 1,
        product_name: product.product_name,
        thumbnail: product.thumbnail,
        price: formatCurrency(product.price),
        selling_price: formatCurrency(product.selling_price),
        reserved_quantity: product.reserved_quantity,
        sold: orderItems
          .filter(item => 
            item.product_id === product.product_id &&
            orders.find(o => o.order_id === item.order_id)?.status === 'delivered'
          )
          .reduce((total, item) => total + (item.quantity || 0), 0),
        stock_quantity: product.stock_quantity,
      }))
  }, [products, orders, orderItems]);

  const handleExportStockedProducts = () => {
    try {
      const columns = [
        { title: 'STT', dataIndex: 'product_code' },
        { title: 'Hình ảnh', dataIndex: 'thumbnail'},
        { title: 'Tên sản phẩm', dataIndex: 'product_name' },
        { title: 'Giá', dataIndex: 'price'},
        { title: 'Giá khuyến mãi', dataIndex: 'selling_price'},
        { title: 'Đã bán', dataIndex: 'sold'},
        { title: 'Đặt trước', dataIndex: 'reserved_quantity'},
        { title: 'Còn lại', dataIndex: 'stock_quantity'}
      ];
      const formattedData = formatDataForExcel(stockedProducts, columns);
      exportToExcel(formattedData, 'danh-sach-san-pham-ton-kho');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
  };

  const handleExportOrdersNeedingShipment = () => {
    try {
      const columns = [
        { title: 'STT', dataIndex: 'order_code'},
        { title: 'Mã đơn', dataIndex: 'order_id'},
        { title: 'Trạng thái', dataIndex: 'status'},
        { title: 'Số lượng', dataIndex: 'quantity'},
        { title: 'Tổng đơn hàng', dataIndex: 'total_price'}
      ];
      const formattedData = formatDataForExcel(ordersNeedingShipment, columns);
      exportToExcel(formattedData, 'danh-sach-don-hang-can-xuat');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
  };

  const orderColumns = [
    { title: 'STT', dataIndex: 'order_code', key: 'order_code', width: 80, align: 'center', render: (text) => '#' + text, sorter: (a, b) => a.order_code - b.order_code},
    { title: 'Mã đơn', dataIndex: 'order_id', key: 'order_id', align: 'center'},
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center'},
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center'},
    { title: 'Tổng đơn hàng', dataIndex: 'total_price', key: 'total_price', align: 'center',  render: (value) => formatCurrency(value) },
  ];

  const productColumns = [
    { title: 'STT', dataIndex: 'product_code', key: 'product_code', width: 80, align: 'center', render: (text) => '#' + text, sorter: (a, b) => a.product_code - b.product_code},
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
          <Space direction="vertical" size={4}>
            <Typography.Title level={5} style={{margin:0}} ellipsis={{ rows: 2 }}>{record.product_name}</Typography.Title>
            <Space direction="vertical" size={0}>
              <span style={{ textDecoration: 'line-through', color: 'rgba(0,0,0,0.4)' }}>
                {record.price}
              </span>
              <span>{record.selling_price}</span>
            </Space>
          </Space>
        </Space>
      )
    },
    { title: 'Đã bán', dataIndex: 'sold', key: 'sold', align: 'center', width: 120 },
    { title: 'Đặt trước', dataIndex:'reserved_quantity', key:'reserved_quantity', align: 'center', width: 120 },
    { title: 'Còn lại', dataIndex: 'stock_quantity', key: 'stock_quantity', align: 'center', width: 120 }
  ];

  return (
    <>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Import Stats Card */}
          <Col span={24}>
            {/* Select chung cho cả nhóm */}
            <Flex  justify='flex-end' style={{marginBottom: 8 }} gap={10} align='center'>
              <Typography.Text level={5} strong style={{margin:0}}>Lọc theo: </Typography.Text>
              <Select value={importFilter} onChange={setImportFilter} style={{ width: 120 }}>
                <Option value="week">Tuần</Option>
                <Option value="month">Tháng</Option>
                <Option value="year">Năm</Option>
              </Select>
            </Flex>

            {/* Hai StatCard trên cùng một dòng */}
            <Row gutter={[16,16]}>
              <Col xs={24} sm={24} md={12}>
                <StatCard
                  title={<Tooltip title={`Trong ${importFilter === 'week'? 'tuần': importFilter === 'month'? 'tháng': 'năm'} này`}>Tổng tiền nhập kho </Tooltip>}
                  value={formatCurrency(filteredImportStats.totalCost)}
                  icon={<DollarOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  backgroundColor='#f0faff'
                  percentageComponent={filteredImportStats.percentageTotalCostComponent}
                />
              </Col>
              <Col xs={24} sm={24} md={12}>
                <StatCard
                  title={<Tooltip title={`Trong ${importFilter === 'week'? 'tuần': importFilter === 'month'? 'tháng': 'năm'} này`}>Tổng sản phẩm nhập kho</Tooltip>}
                  value={filteredImportStats.totalQuantity}
                  icon={<ImportOutlined style={{ fontSize: 24, color: '#52c41a'}} />}
                  backgroundColor='#f6ffed'
                  percentageComponent={filteredImportStats.percentageTotalQuantityComponent}
                />
              </Col>
            </Row>
          </Col>
          {/* Total Stock Quantity Card */}
          <Col xs={24} sm={24} md={8}>
            <StatCard
              title={<Tooltip title="Tính đến hiện tại">Tổng sản phẩm tồn kho</Tooltip>}
              value={totalStockQuantity}
              icon={<DatabaseOutlined style={{ fontSize: 24, color: '#faad14 '}}/>}
              backgroundColor='#fffbe6'
            />
          </Col>

          {/* Total Stock Value Card */}
          <Col xs={24} sm={24} md={8}>
            <StatCard
              title={<Tooltip title="Tính đến hiện tại">Tổng giá trị tồn kho</Tooltip>}
              value={formatCurrency(totalStockValue)}
              icon={<DollarOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
              backgroundColor='#fff2f0'
            />
          </Col>

          {/* Pending Shipment Card */}
          <Col xs={24} sm={24} md={8}>
            <StatCard
              title={<Tooltip title="Tính đến hiện tại">Sản phẩm chờ xuất kho</Tooltip>}
              value={pendingShipmentQuantity}
              icon={<ShoppingOutlined style={{ fontSize: 24, color: '#13c2c2' }} />}
              backgroundColor='#e6fffb'
            />
          </Col>
        </Row>
      </Spin>
      <Card 
        title={<Tooltip title="Tính đến hiện tại">Đơn hàng cần xuất kho</Tooltip>} 
        style={{ marginTop: 24 }}
        extra={
          <Button 
            color='cyan'
            variant='solid'
            icon={<FileExcelOutlined />}
            onClick={handleExportOrdersNeedingShipment}
          >
            Xuất Excel
          </Button>
        }
      >
        <Table 
          bordered
          scroll={{ x: 1000 }}
          style={{ width: "100%" }}
          columns={orderColumns} 
          dataSource={ordersNeedingShipment} 
          rowKey="order_id"
          pagination={{
            position: ["bottomCenter"],
            showSizeChanger: false,
            pageSize: 5,
            showTotal: () => `Tổng: ${ordersNeedingShipment.length} đơn hàng`
          }}
        />
      </Card>
      <Card 
        title={<Tooltip title="Tính đến hiện tại">Sản phẩm tồn kho</Tooltip>} 
        style={{ marginTop: 24 }} 
        extra={
        <Button 
          color='cyan'
          variant='solid'
          icon={<FileExcelOutlined />}
          onClick={handleExportStockedProducts}
        >
          Xuất Excel
        </Button>
        }
      >
        <Table 
          bordered
          scroll={{ x: 1000 }}
          style={{ width: "100%" }}
          columns={productColumns}  
          dataSource={stockedProducts} 
          rowKey="product_id" 
          pagination={{
            position: ["bottomCenter"],
            showSizeChanger: false,
            pageSize: 5,
            showTotal: () => `Tổng: ${stockedProducts.length} sản phẩm`
          }}
        />
      </Card>
    </>
  );
}

export default InventoryDashboard;
