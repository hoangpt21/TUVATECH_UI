import { useState, useEffect, useRef } from 'react';
import { Button, Modal, message, Space, Form, Card, Row, Col, Input, Select } from 'antd';
import { PlusOutlined, FileExcelOutlined, SearchOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import NewsTable from '../../components/admin/NewsTable';
import NewsForm from '../../components/admin/NewsForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllNews, addNews, updateNews, deleteNews, selectNews } from '../../redux/news/newsSlice';
import { fetchCategoriesByType, selectCategories } from '../../redux/category/categorySlice';
import dayjs from 'dayjs';
import { uploadFileAPI } from '../../apis';

const styles = {
  card: {
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  searchInput: {
    width: '100%'
  }
};

const News = () => {
  const dispatch = useDispatch();
  const news = useSelector(selectNews);
  const categories = useSelector(selectCategories);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredNews, setFilteredNews] = useState([]);
  const originalNews = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchAllNews({ isAll: true })),
        dispatch(fetchCategoriesByType({categoryType: 'news', isAll: true}))
      ]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    originalNews.current = news.map((item, index) => ({
      news_id: item.news_id,
      news_code: '#'+((index+1)),
      title: item.title,
      category_name: categories.find(category => category.is_active && category.category_id === item.category_id)?.category_name || 'Danh mục không tồn tại',
      pseudonym: item.pseudonym,
      likes: item.likes,
      dislikes: item.dislikes,
      published_date: item.published_date ? dayjs(item.published_date).format('YYYY-MM-DD') : '-',
      status: item.status === 'published' ? 'Đã đăng' : 'Lưu trữ',
      created_at: item.created_at ? dayjs(item.created_at).format('YYYY-MM-DD') : '-'
    }));
    setFilteredNews(originalNews.current);
  }, [news, categories]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.news_id);
    const editNews = news.find(news => news.news_id === record.news_id);
    form.setFieldsValue({
      ...editNews,
      thumbnail: editNews?.thumbnail ? [{
        uid: '-1',
        name: 'logo.png',
        status: 'done',
        url: editNews?.thumbnail,
      }] : []
    });
    setModalVisible(true);
  };
  
  const handleDelete = async (id) => {  
    setLoading(true);
    const res = await dispatch(deleteNews(id));
    if (!res.error) {
      message.success('Xóa tin tức thành công');
    }
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    let logoUrl = null;
    if (values.thumbnail?.[0]?.originFileObj) {
      const uploadResult = await uploadFileAPI(values.thumbnail[0].originFileObj, 'news');
      logoUrl = uploadResult;
    }
    const newsData = {
      ...values,
      thumbnail: logoUrl,
    }
    if (editingId) {

      const res = await dispatch(updateNews({ 
        id: editingId, 
        newsData: logoUrl ? newsData : { ...newsData, thumbnail: news.find(news => news.news_id === editingId)?.thumbnail }
      }));
      if (!res.error) {
        message.success('Cập nhật tin tức thành công');
      }
    } else {
      const res = await dispatch(addNews(newsData));
      if (!res.error) {
        message.success('Thêm tin tức thành công');
      }
    }
    form.resetFields();
    setModalVisible(false);
    setLoading(false);
  };

  const handleExport = () => {
    try {
      const formattedData = formatDataForExcel(filteredNews, [
        { title: 'STT', dataIndex: 'news_code' },
        { title: 'Tiêu đề', dataIndex: 'title' },
        { title: 'Danh mục', dataIndex: 'category_name' },
        { title: 'Bút danh', dataIndex: 'pseudonym' },
        { title: 'Lượt thích', dataIndex: 'likes' },
        { title: 'Lượt không thích', dataIndex: 'dislikes' },
        { title: 'Ngày đăng', dataIndex: 'published_date' },
        { title: 'Trạng thái', dataIndex: 'status' },
        { title: 'Ngày tạo', dataIndex: 'created_at' }
      ]);
      exportToExcel(formattedData, 'danh-sach-tin-tuc');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    let filtered = originalNews.current;
    if (selectedCategory) {
      filtered = filtered.filter(news => selectedCategory === news.category_name);
    }
    if (value) {
      filtered = filtered.filter((news) => 
        Object.keys(news).some((key) => 
          (key !== 'is_active' && key !== 'action' && key !== 'news_id') && news[key] && String(news[key]).toLowerCase().includes(value.toLowerCase())
        )
      );
    }
    setSearchValue(value);
    setFilteredNews(filtered);
  };

  const handleCategoryChange = (value) => {
    let filtered = originalNews.current;
    if (value) {
      filtered = filtered.filter(news => news.category_name === value);
    }
    if (searchValue) {
      filtered = filtered.filter((news) => 
        Object.keys(news).some((key) => 
          (key !== 'is_active' && key !== 'action' && key !== 'news_id') && news[key] && String(news[key]).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
    setSelectedCategory(value);
    setFilteredNews(filtered);
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
      title="Quản lý tin tức" 
      extra={extra}
      loading={loading}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24}>
          <Select
            style={styles.searchInput}
            allowClear
            placeholder="Chọn danh mục"
            onChange={handleCategoryChange}
            options={categories.filter(category => category.is_active).map(category => ({
              value: category.category_name,
              label: category.category_name
            }))}
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
          <NewsTable
            news={filteredNews}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchText={searchValue}
          />
        </Col>
      </Row>

      <Modal
        title={editingId ? "Sửa tin tức" : "Thêm tin tức"}
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
          md: '80%',
          lg: '80%',
          xl: '80%',
          xxl: '80%',
        }}
        centered
        styles={{body: {overflow: "auto", maxHeight: 500}}}
        confirmLoading={loading}
        maskClosable={false}
      >
        <NewsForm
          form={form}
          onFinish={handleSubmit}
          categories={categories}
        />
      </Modal>
    </Card>
  );
};

export default News;