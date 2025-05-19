import { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, message, Space, Card, Select, Input, Row, Col } from 'antd';
import { PlusOutlined, FileExcelOutlined, SearchOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { selectCategories } from '../../redux/category/categorySlice';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import CategoryTable from '../../components/admin/CategoryTable';
import CategoryForm from '../../components/admin/CategoryForm';
import { 
  fetchAllCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
} from '../../redux/category/categorySlice';
import dayjs from 'dayjs';

const Categories = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const originalCategories = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(fetchAllCategories({ isAll: true }));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    originalCategories.current = categories.map((category, index) => ({
      category_id: category.category_id,
      category_code: '#' + (index+1),
      category_name: category.category_name,
      description: category.description,
      category_type: category.category_type === 'product' ? 'Sản phẩm' : 'Tin tức',
      created_at: category.created_at ? dayjs(category.created_at).format('YYYY-MM-DD') : '-',
      is_active: category.is_active
    }));
    setFilteredCategories(originalCategories.current);
  }, [categories]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.category_id);
    form.setFieldsValue(categories.find(category => category.category_id === record.category_id));
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const res = await dispatch(deleteCategory(id));
    if(!res.error) message.success('Xóa danh mục thành công');
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    if (editingId) {
      const res = await dispatch(updateCategory({ id: editingId, categoryData: { ...values, updated_at: dayjs().format('YYYY-MM-DD')} }));
      if(!res.error) message.success('Cập nhật danh mục thành công');
    } else {
      const res = await dispatch(addCategory(values));
      if(!res.error) message.success('Thêm danh mục thành công');
    }
    setModalVisible(false);
    setLoading(false);
  };

  const handleExport = () => {
    try {
      const columns = [
        { title: 'STT', dataIndex: 'category_code' },
        { title: 'Tên danh mục', dataIndex: 'category_name' },
        { title: 'Loại danh mục', dataIndex: 'category_type' },
        { title: 'Mô tả', dataIndex: 'description' },
        { title: 'Ngày tạo', dataIndex: 'created_at' },
        { title: 'Kích hoạt', dataIndex: 'is_active' }
      ];
      const formattedData = formatDataForExcel(filteredCategories, columns);
      exportToExcel(formattedData, 'danh-sach-danh-muc');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
  };

  const handleChangeType = (value) => {
    let newCategories = originalCategories.current;
    if(value) newCategories = newCategories.filter(category => category.category_type === value);
    if(searchValue) newCategories = newCategories.filter((o) => Object.keys(o).some((k) => (k !== 'category_id' && k !== 'is_active' && k !== 'action') && o[k] && String(o[k])
      .toLowerCase()
      .includes(searchValue.toLowerCase())));;
    setSelectedType(value);
    setFilteredCategories(newCategories);
  };

  const handleSearch = (e) => {
    let newCategories = originalCategories.current;
    if(selectedType) newCategories = newCategories.filter(category => category.category_type === selectedType);
    if(e.target.value) newCategories = newCategories.filter((o) => Object.keys(o).some((k) => (k !== 'category_id' && k !== 'is_active' && k !== 'action') && o[k] && String(o[k])
      .toLowerCase()
      .includes(e.target.value.toLowerCase())));;
    setSearchValue(e.target.value);
    setFilteredCategories(newCategories);
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
      title="Quản lý danh mục" 
      extra={extra}
      loading={loading}
    >
      <Row gutter={[16,16]}  align="middle" style={{ marginBottom: '16px' }}>
        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24}>
          <Select
            style={{ width: '100%' }}
            allowClear
            placeholder="Chọn loại danh mục"
            onChange={handleChangeType}
            options={[
              { value: 'Sản phẩm', label: 'Sản phẩm' },
              { value: 'Tin tức', label: 'Tin tức' }
            ]}
          />
        </Col>
        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24}>
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
          <CategoryTable
            searchText={searchValue}
            categories={filteredCategories}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Col>
      </Row>

      <Modal
        title={editingId ? "Sửa danh mục" : "Thêm danh mục"}
        open={modalVisible}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{icon: <SaveOutlined />}}
        cancelButtonProps={{icon: <CloseOutlined />}}
        onOk={form.submit}
        onCancel={() => setModalVisible(false)}
        styles={{body: {overflow: "auto", maxHeight: 500}}}
        centered
        confirmLoading={loading}
        maskClosable={false}
      >
        <CategoryForm 
          form={form}
          onFinish={handleSubmit}
        />
      </Modal>
    </Card>
  );
};

export default Categories;