import { useState, useEffect, useRef } from 'react';
import { Button, Modal, message, Space, Form, Card, Row, Col, Input, Select } from 'antd';
import { PlusOutlined, FileExcelOutlined, SearchOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import CouponTable from '../../components/admin/CouponTable';
import CouponForm from '../../components/admin/CouponForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCoupons, addCoupon, updateCoupon, deleteCoupon, selectCoupons } from '../../redux/coupon/couponSlice';
import dayjs from 'dayjs';

const styles = {
  card: {
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  searchInput: {
    width: '100%'
  }
};

const Coupons = () => {
  const dispatch = useDispatch();
  const coupons = useSelector(selectCoupons);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const originalCoupons = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(fetchAllCoupons({ isAll: true }));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    originalCoupons.current = coupons.map((item, index) => {
      let status = 'active';
      if (!item.is_active) {
        status = 'pending';
      } else if (dayjs(item.end_date).isBefore(dayjs())) {
        status = 'expired';
      } else if(dayjs(item.start_date).isAfter(dayjs())) {
        status = 'scheduled';
      }

      const statusMap = {
        active: 'Đang hoạt động',
        expired: 'Hết hạn',
        pending: 'Chờ duyệt',
        scheduled: 'Đã lên lịch'
      };
      return {
        coupon_id: item.coupon_id,
        coupon_idcode: '#'+((index+1)),
        coupon_code: item.coupon_code,
        is_active: item.is_active,
        used_count: item?.used_count?.toLocaleString(),
        usage_limit: (item?.max_users * item?.max_usage_per_user)?.toLocaleString(),
        status: statusMap[status],
        min_order_value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.min_order_value),
        max_discount_value: item.max_discount_value ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.max_discount_value) : '-',
        discount_type: item.discount_type === 'percentage' ? 'Phần trăm' : 'Số tiền',
        discount_value: item.discount_type === 'percentage' ? `${item.discount_value}%` : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.discount_value),
        start_date: item.start_date ? dayjs(item.start_date).format('YYYY-MM-DD') : '-',
        end_date: item.end_date ? dayjs(item.end_date).format('YYYY-MM-DD') : '-',
        created_at: item.created_at ? dayjs(item.created_at).format('YYYY-MM-DD') : '-',
    }});
    setFilteredCoupons(originalCoupons.current);
  }, [coupons]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.coupon_id);
    form.setFieldsValue(coupons.map(item => ({
      ...item,
      start_date: dayjs(item.start_date),
      end_date: dayjs(item.end_date)
    })).find(coupon => coupon.coupon_id === record.coupon_id));
    setModalVisible(true);
  };

  const handleDelete = async (id) => {  
    setLoading(true);
    const res = await dispatch(deleteCoupon(id));
    if (!res.error) {
      message.success('Xóa mã giảm giá thành công');
    }
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    const couponData = {
      ...values,
      start_date: values.start_date.format('YYYY-MM-DD'),
      end_date: values.end_date.format('YYYY-MM-DD')
    };
    if (editingId) {
      const res = await dispatch(updateCoupon({ id: editingId, couponData }));
      if (!res.error) {
        message.success('Cập nhật mã giảm giá thành công');
      }
    } else {
      const res = await dispatch(addCoupon(couponData));
      if (!res.error) {
        message.success('Thêm mã giảm giá thành công');
      }
    }
    setModalVisible(false);
    setLoading(false);
  };

  const handleExport = () => {
    try {
      const formattedData = formatDataForExcel(filteredCoupons, [
        { title: 'STT', dataIndex: 'coupon_idcode' },
        { title: 'Mã giảm giá', dataIndex: 'coupon_code' },
        { title: 'Mô tả', dataIndex: 'description' },
        { title: 'Loại giảm giá', dataIndex: 'discount_type' },
        { title: 'Giá trị giảm', dataIndex: 'discount_value' },
        { title: 'Đơn hàng tối thiểu', dataIndex: 'min_order_value' },
        { title: 'Giảm giá tối đa', dataIndex: 'max_discount_value' },
        { title: 'Ngày bắt đầu', dataIndex: 'start_date' },
        { title: 'Ngày kết thúc', dataIndex: 'end_date' },
        { title: 'Giới hạn sử dụng', dataIndex: 'usage_limit' },
        { title: 'Đã sử dụng', dataIndex: 'used_count' },
        { title: 'Trạng thái', dataIndex: 'status' },
        { title: 'Kích hoạt', dataIndex: 'is_active' }
      ]);
      exportToExcel(formattedData, 'danh-sach-ma-giam-gia');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    let filtered = originalCoupons.current;
    if (selectedStatus) {
      filtered = filtered.filter(coupon => coupon.status === selectedStatus);
    }
    if (value) {
      filtered = filtered.filter((coupon) => 
        Object.keys(coupon).some((key) => 
          (key !== 'is_active' && key !== 'action' && key !== 'coupon_id') && coupon[key] && String(coupon[key]).toLowerCase().includes(value.toLowerCase())
        )
      );
    }
    setSearchValue(value);
    setFilteredCoupons(filtered);
  };

  const handleStatusChange = (value) => {
    let filtered = originalCoupons.current;
    if (value) {
      filtered = filtered.filter(coupon => coupon.status === value);
    }
    if (searchValue) {
      filtered = filtered.filter((coupon) => 
        Object.keys(coupon).some((key) => 
          (key !== 'is_active' && key !== 'action') && coupon[key] && String(coupon[key]).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
    setSelectedStatus(value);
    setFilteredCoupons(filtered);
  };

  const extra = (
    <Space>
      <Button 
        type="primary" 
        icon={<PlusOutlined />}
        onClick={handleAdd}
        disabled={loading}
      >
        Thêm mới
      </Button>
      <Button 
        color='cyan'
        variant='solid'
        icon={<FileExcelOutlined />}
        onClick={handleExport}
        disabled={loading}
      >
        Xuất Excel
      </Button>
    </Space>
  );

  return (
    <Card 
      style={styles.card}
      title="Quản lý mã giảm giá" 
      extra={extra}
      loading={loading}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24}>
          <Select
            style={styles.searchInput}
            allowClear
            placeholder="Chọn trạng thái"
            onChange={handleStatusChange}
            options={[
              { value: 'Đang hoạt động', label: 'Đang hoạt động' },
              { value: 'Hết hạn', label: 'Hết hạn' },
              { value: 'Chờ duyệt', label: 'Chờ duyệt' },
              { value: 'Đã lên lịch', label: 'Đã lên lịch' }
            ]}
          />
        </Col>
        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24}>
          <Input
            style={styles.searchInput}
            allowClear
            suffix={<SearchOutlined />}
            placeholder="Nhập từ khóa tìm kiếm"
            onChange={handleSearch}
            value={searchValue}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <CouponTable
            coupons={filteredCoupons}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchText={searchValue}
          />
        </Col>
      </Row>

      <Modal
        title={editingId ? "Sửa mã giảm giá" : "Thêm mã giảm giá"}
        open={modalVisible}
        onOk={form.submit}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{icon: <SaveOutlined />}}
        cancelButtonProps={{icon: <CloseOutlined />}}
        onCancel={() => {
          setModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        width={{
          xs: '90%',
          sm: '80%',
          md: '70%',
          lg: '60%',
          xl: '70%',
          xxl: '70%',
        }}
        centered
        styles={{body: {overflow: "hidden", height: 500}}}
        confirmLoading={loading}
        maskClosable={false}
      >
        <CouponForm
          form={form}
          onFinish={handleSubmit}
        />
      </Modal>
    </Card>
  );
};

export default Coupons;