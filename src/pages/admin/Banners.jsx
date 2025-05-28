import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Form, message, Space, Card, Input, Row, Col } from 'antd';
import { PlusOutlined, FileExcelOutlined, SearchOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { fetchAllBanners, addBanner, updateBanner, deleteBanner, selectBanners } from '../../redux/banner/bannerSlice';
import { uploadFileAPI } from '../../apis';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import BannerTable from '../../components/admin/BannerTable';
import BannerForm from '../../components/admin/BannerForm';

const Banners = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const banners = useSelector(selectBanners);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [filteredBanners, setFilteredBanners] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(fetchAllBanners({ isAll: true }));
      setLoading(false);
    })();
  }, []);
  
  useEffect(() => {
    setFilteredBanners(banners.map((banner,index) => ({
      ...banner,
      banner_code: '#'+(index +1),
    })));
  }, [banners]);

  const handleAdd = () => {
    setEditingBanner(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBanner(record);
    form.setFieldsValue({
      banner_name: record.banner_name,
      banner_url: record.banner_url ? [{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: record.banner_url,
      }] : []
    });
    setModalVisible(true);
  };

  const handleDelete = async (bannerId) => {
    setLoading(true);
    const res = await dispatch(deleteBanner(bannerId));
    if (!res.error) {
      message.success('Xóa banner thành công');
    }
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu banner
      const bannerData = {
        banner_name: values.banner_name,
        banner_url: values.banner_url?.[0]?.originFileObj ? 
          await uploadFileAPI(values.banner_url[0].originFileObj, 'banners') :
          editingBanner?.banner_url
      };

      // Thực hiện thêm/cập nhật banner
      const res = editingBanner ?
        await dispatch(updateBanner({
          id: editingBanner.banner_id,
          bannerData
        })) :
        await dispatch(addBanner(bannerData));

      if (!res.error) {
        message.success(`${editingBanner ? 'Cập nhật' : 'Thêm'} banner thành công`);
        setModalVisible(false);
        form.resetFields();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    const filtered = banners.filter((banner) => 
      Object.keys(banner).some(key =>
        (key === "banner_name" || key === "created_at" || key === "banner_code") && banner[key] && 
        typeof banner[key] === 'string' && 
        banner[key].toLowerCase().includes(value.toLowerCase())
      )
    );
    setSearchValue(value);
    setFilteredBanners(filtered);
  };

  const handleExport = () => {
    try {
      const columns = [
        { title: 'STT', dataIndex: 'banner_code' },
        { title: 'Ảnh URL', dataIndex: 'banner_url' },
        { title: 'Tên banner', dataIndex: 'banner_name' },
        { title: 'Ngày tạo', dataIndex: 'created_at' },
        { title: 'Trạng thái', dataIndex: 'is_active' }
      ];
      const formattedData = formatDataForExcel(banners, columns);
      exportToExcel(formattedData, 'danh-sach-bang-ron');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
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
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
      title="Quản lý banner" 
      extra={extra}
      loading={loading}
    >
      <Row gutter={[16,16]} align="middle" style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={24} md={12}>
          <Input
            allowClear
            suffix={<SearchOutlined />}
            value={searchValue}
            placeholder="Nhập từ khóa tìm kiếm"
            onChange={handleSearch}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <BannerTable
            banners={filteredBanners}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchText={searchValue}
          />
        </Col>
      </Row>

      <Modal
        title={editingBanner ? "Sửa banner" : "Thêm banner"}
        open={modalVisible}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{icon: <SaveOutlined />}}
        cancelButtonProps={{icon: <CloseOutlined />}}
        onOk={form.submit}
        onCancel={() => {
          setModalVisible(false);
          setEditingBanner(null);
          form.resetFields();
        }}
        centered
        confirmLoading={loading}
        maskClosable={false}
      >
        <BannerForm
          form={form}
          onFinish={handleSubmit}
        />
      </Modal>
    </Card>
  );
};

export default Banners;