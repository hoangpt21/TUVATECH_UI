import { Descriptions,Button, Rate, Tag, Space, Image, Avatar, Row, Col, Typography, Card, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

const ReviewDetail = ({ review: reviewObj }) => {
  const review = reviewObj? reviewObj : null;

  if (!review) return null;

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'gold', text: 'Chờ duyệt' },
      approved: { color: 'green', text: 'Đã duyệt' },
      rejected: { color: 'red', text: 'Đã từ chối' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status || 'N/A' };
    return <Tag color={color}>{text}</Tag>;
  };

  const userData = review.user || {};
  const productData = review.product || {};
  const reviewImages = review.reviewImages || null;

  return (
      <Row gutter={[16,16]}>
        <Col xs={24} lg={8}>
          <Card title="Thông tin người dùng" size='small'>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Avatar size={80} src={userData.avatar_url} icon={<UserOutlined />} />
                <Text strong style={{ display: 'block', marginTop: 8 }}>
                  {userData.display_name || 'N/A'}
                </Text>
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', wordBreak: 'break-word' }}>Email: {userData.email || 'N/A'}</Text>
                <Text type="secondary" style={{ display: 'block' }}>Phone: {userData.phone || 'N/A'}</Text>
              </div>
            </Space>
          </Card>
          <Card title="Thông tin sản phẩm" size='small' style={{marginTop: 16}}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ wordBreak: 'break-word' }}>{productData.product_name || 'N/A'}</Text>
              <Text type="secondary">Giá gốc: {productData.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(productData.price) : 'N/A'}</Text>
              <Text type="secondary">Giá bán: {productData.selling_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(productData.selling_price) : 'N/A'}</Text>
              <Text type="secondary">Số lượng trong kho: {productData.stock_quantity || 'N/A'}</Text>
              <Space>
                <Text type="secondary">Đánh giá trung bình:</Text>
                <Rate disabled value={productData.avg_rating} style={{ fontSize: 12 }} />
                <Text type="secondary">({productData.avg_rating || 'N/A'})</Text>
              </Space>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Chi tiết đánh giá" size='small'>
            <Descriptions column={1} bordered style={{ width: '100%' }}>
              <Descriptions.Item label="Review ID" styles={{ label:{fontWeight: 'bold', width: '150px'} }}>
                {review.review_id}
              </Descriptions.Item>
              <Descriptions.Item label="Đánh giá" styles={{ label:{fontWeight: 'bold', width: '150px'} }}>
                <Rate disabled value={review.rating} style={{ fontSize: 16 }} />
              </Descriptions.Item>
              <Descriptions.Item label="Nhận xét" styles={{ label:{fontWeight: 'bold', width: '150px'} }}>
                <Paragraph style={{ margin: 0, wordBreak: 'break-word' }}>{review.comment || '(Không có nhận xét)'}</Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" styles={{ label:{fontWeight: 'bold', width: '150px'} }}>
                {getStatusTag(review.moderation_status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" styles={{ label:{fontWeight: 'bold', width: '150px'} }}>
                {dayjs(review.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Typography.Title level={5}>Hình ảnh đính kèm</Typography.Title>
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {reviewImages?.length ? reviewImages.map(reviewImage => (
                  <Image
                    width={140}
                    key={reviewImage.image_id}
                    height={140}
                    src={reviewImage.image_url}
                    alt={`Review Image ${reviewImage.image_id}`}
                    style={{ objectFit: 'contain', borderRadius: 8 }}
                    preview={{
                      mask: <div style={{ color: 'white' }}>Xem</div>
                    }}
                  />
                )) : (
                  <Text type="secondary">Không có hình ảnh đính kèm.</Text>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
  );
};

export default ReviewDetail;
