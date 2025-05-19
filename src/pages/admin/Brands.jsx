import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Form, message, Space, Card, Input, Row, Col } from 'antd';
import { PlusOutlined, FileExcelOutlined, SearchOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { fetchAllBrands, addBrand, updateBrand, deleteBrand, selectBrands } from '../../redux/brand/brandSlice';
import { uploadFileAPI } from '../../apis';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import BrandTable from '../../components/admin/BrandTable';
import BrandForm from '../../components/admin/BrandForm';

const Brands = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const brands = useSelector(selectBrands);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(fetchAllBrands({ isAll: true }));
      setLoading(false);
    })();
  }, []);
  
  useEffect(() => {
    setFilteredBrands(brands.map((brand, index) => ({
      ...brand,
      brand_code: '#'+(index+1),
    })));
  }, [brands]);

  const handleAdd = () => {
    setEditingBrand(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBrand(record);
    form.setFieldsValue({
      brand_name: record.brand_name,
      description: record.description,
      logo: record.logo_url ? [{
        uid: '-1',
        name: 'logo.png',
        status: 'done',
        url: record.logo_url,
      }] : []
    });
    setModalVisible(true);
  };

  const handleDelete = async (brandId) => {
    setLoading(true);
    const res = await dispatch(deleteBrand(brandId));
    if (!res.error) {
      message.success('Xóa thương hiệu thành công');
    }
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    let logoUrl = null;
    if (values.logo?.[0]?.originFileObj) {
      const uploadResult = await uploadFileAPI(values.logo[0].originFileObj, 'banners');
      logoUrl = uploadResult;
    }
    const brandData = {
      brand_name: values.brand_name,
      description: values.description,
      logo_url: logoUrl,
    };
    if (editingBrand) {
      const res = await dispatch(updateBrand({ 
        id: editingBrand.brand_id, 
        brandData: logoUrl ? brandData : { ...brandData, logo_url: editingBrand.logo_url }
      }));
      if (!res.error) {
        message.success('Cập nhật thương hiệu thành công');
        setModalVisible(false);
        form.resetFields();
      }
    } else {
      const res = await dispatch(addBrand(brandData));
      if (!res.error) {
        message.success('Thêm thương hiệu thành công');
        setModalVisible(false);
        form.resetFields();
      }
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    const filtered = brands.filter((brand) => 
      Object.keys(brand).some(key =>
        (key === "brand_name" || key === "created_at" || key === "brand_code") && brand[key] && 
        typeof brand[key] === 'string' && 
        brand[key].toLowerCase().includes(value.toLowerCase())
      )
    );
    setSearchValue(value);
    setFilteredBrands(filtered);
  };

  const handleExport = () => {
    try {
      const columns = [
        { title: 'STT', dataIndex: 'brand_code' },
        { title: 'Logo URL', dataIndex: 'logo_url' },
        { title: 'Tên thương hiệu', dataIndex: 'brand_name' },
        { title: 'Ngày tạo', dataIndex: 'created_at' },
        { title: 'Trạng thái', dataIndex: 'is_active' }
      ];
      const formattedData = formatDataForExcel(brands, columns);
      exportToExcel(formattedData, 'danh-sach-thuong-hieu');
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
      title="Quản lý thương hiệu" 
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
          <BrandTable
            brands={filteredBrands}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchText={searchValue}
          />
        </Col>
      </Row>

      <Modal
        title={editingBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        open={modalVisible}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{icon: <SaveOutlined />}}
        cancelButtonProps={{icon: <CloseOutlined />}}
        onOk={form.submit}
        onCancel={() => {
          setModalVisible(false);
          setEditingBrand(null);
          form.resetFields();
        }}
        width={{
          xs: '90%',
          sm: '80%',
          md: '80%',
          lg: '80%',
          xl: '80%',
          xxl: '80%',
        }}
        centered
        styles={{body: {overflow: "hidden", height: 500}}}
        confirmLoading={loading}
        maskClosable={false}
      >
        <BrandForm
          form={form}
          onFinish={handleSubmit}
        />
      </Modal>
    </Card>
  );
};

export default Brands;