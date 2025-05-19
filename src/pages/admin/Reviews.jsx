import { useState, useEffect } from 'react'; // Added useMemo
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, message,Card, Row, Col, Input, Select, Space } from 'antd';
import { FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import ReviewsTable from '../../components/admin/ReviewsTable';
import ReviewDetail from '../../components/admin/ReviewDetail';
import { getAllReviews, updateReview, selectReviews } from '../../redux/review/reviewSlice';
import { fetchProductById } from '../../redux/product/productSlice'; // Import product actions/selectors
import { listUserDetail } from '../../redux/user/usersSlice'; // Import user actions/selectors
import { fetchReviewImages, selectReviewImages } from '../../redux/image/imageSlice'; // Import user actions/selectors
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

const Reviews = () => {
  const dispatch = useDispatch();
  const reviews = useSelector(selectReviews);
  const reviewImages = useSelector(selectReviewImages);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null); // Will hold the enriched review
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [enrichedReviews, setEnrichedReviews] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dispatch(getAllReviews({isAll: true})),
      dispatch(fetchReviewImages({isAll: true, reviewId: true}))
    ])
    .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    const getEnrichedReviews = async () => {
      if (!reviews) return;
      let reviewsInfo = [];
      let index = 1;
      for (let review of reviews) {
        const res = await Promise.all([
          dispatch(fetchProductById({id: review?.product_id})),
          dispatch(listUserDetail(review?.user_id))
        ]);
        if (!res[0]?.error && !res[1]?.error) {
          let images = reviewImages.filter(img => img.review_id == review.review_id)
          reviewsInfo.push({
            ...review,
            review_code: '#'+index,
            reviewImages: images,
            product: res[0].payload,
            user: res[1].payload
          });
          index++;
        }
      }
      setEnrichedReviews(reviewsInfo);
    };
  
    getEnrichedReviews();
  }, [reviews, reviewImages, dispatch]);
  


  useEffect(() => {
    // Update filtered reviews whenever the enriched data or filters change
    let filtered = enrichedReviews?.map(review => ({
      ...review,
      product_name: review.product?.product_name,
      display_name: review.user?.display_name
    })) || [];

    if (selectedStatus) {
      filtered = filtered.filter(review => review.moderation_status === selectedStatus);
    }
    if (searchValue) {
      const lowerSearchValue = searchValue.toLowerCase();
      const statusMap = {
        pending: 'Chờ duyệt', // Changed color for better visibility
        approved: 'Đã duyệt', // Changed color
        rejected: 'Đã từ chối' // Changed color
      };
      filtered = filtered.filter((review) =>
        [review.product_name, review.display_name, statusMap[review.moderation_status], review.review_code, dayjs(review.created_at).format('YYYY-MM-DD HH:mm').toString()] // Add fields to search
          .some(value => value && String(value).toLowerCase().includes(lowerSearchValue))
      );
    }
    setFilteredReviews(filtered);
  }, [enrichedReviews, searchValue, selectedStatus]);

  const handleViewDetail = (review) => {
    setSelectedReview(enrichedReviews.find(enrichedReview => enrichedReview.review_id === review.review_id));
    setModalVisible(true);
  };

  const handleUpdateStatus = async (reviewId, status) => {
    console.log(status)
    console.log(reviewId)
    await dispatch(updateReview({ reviewId: reviewId, reviewData: { moderation_status: status } }));
    message.success('Cập nhật trạng thái đánh giá thành công');
    setModalVisible(false); // Close modal on success
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    // This logic is now handled within the useEffect hook listening to [reviews, searchValue, selectedStatus]
    setSearchValue(value);
  };

  const handleStatusChange = (value) => {
    // This logic is now handled within the useEffect hook listening to [reviews, searchValue, selectedStatus]
    setSelectedStatus(value);
  };

  const handleExport = () => {
    try {
      // Use filteredReviews for export if filters are applied, otherwise use all enriched reviews
      const dataToExport = filteredReviews.length > 0 ? filteredReviews : enrichedReviews;
      const formattedData = formatDataForExcel(dataToExport, [
        { title: 'STT', dataIndex: 'review_code' },
        { title: 'Sản phẩm', dataIndex: 'product_name' }, // Use enriched field
        { title: 'Khách hàng', dataIndex: 'display_name' }, // Use enriched field
        { title: 'Đánh giá', dataIndex: 'rating' },
        { title: 'Nhận xét', dataIndex: 'comment' },
        { title: 'Trạng thái', dataIndex: 'moderation_status' },
        { title: 'Ngày tạo', dataIndex: 'created_at' } // Format date if needed during export
      ]);
      exportToExcel(formattedData, 'danh-sach-danh-gia');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
  };


  const extra = (
    <Button
      color='cyan'
      variant='solid'
      icon={<FileExcelOutlined />}
      onClick={handleExport}
    >
      Xuất Excel
    </Button>
  );

  return (
    <Card 
      style={styles.card}
      title="Quản lý đánh giá" 
      extra={extra}
      // Use loading state from Redux if available, or keep local loading for initial fetch
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
              // Values should match moderation_status in the database
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'approved', label: 'Đã duyệt' },
              { value: 'rejected', label: 'Đã từ chối' }
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
          <ReviewsTable
            reviews={filteredReviews}
            loading={loading}
            onViewDetail={handleViewDetail}
            searchText={searchValue}
          />
        </Col>
      </Row>

      <Modal
        title="Chi tiết đánh giá"
        open={modalVisible}
        centered
        onCancel={() => setModalVisible(false)}
        footer={
            <Space size={16}>
              <Button
                type="primary"
                onClick={() => handleUpdateStatus(selectedReview.review_id, 'approved')}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Duyệt
              </Button>
              <Button
                danger
                type="primary"
                onClick={() => handleUpdateStatus(selectedReview.review_id, 'rejected')}
              >
                Từ chối
              </Button>
            </Space>
        }
        width={{
          xs: '90%',
          sm: '80%',
          md: '80%',
          lg: '80%',
          xl: '80%',
          xxl: '80%',
        }}
        maskClosable={false}
        styles={{body: {overflowY: "auto", height: 500, padding: 8}}}
      >
        <ReviewDetail review={selectedReview} />
      </Modal>
    </Card>
  );
};

export default Reviews;