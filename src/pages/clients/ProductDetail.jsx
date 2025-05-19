import React, { useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Row,Modal, Col, Typography, Button, Card, Space, Spin, Empty, message, Rate, Form, Avatar, List, Carousel, Progress, Tag, Table, Image, Divider, Flex } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LeftOutlined, 
  RightOutlined, MobileOutlined, GiftOutlined, 
  SafetyCertificateOutlined, DollarOutlined, DownOutlined, 
  ClockCircleOutlined, PlusCircleOutlined, PlusOutlined, CloseOutlined,
  PlusSquareOutlined} from '@ant-design/icons';
import { addToCart } from '../../redux/cart/cartSlice';
import { 
  fetchProductById, 
  selectProductDetail,
  fetchProductAttributesByProductId,
  selectProductAttributes,
  setProductDetail,
  selectActiveProducts
} from '../../redux/product';
import { fetchProductImages, fetchReviewImages,createImage, selectReviewImages, selectProductImages } from '../../redux/image/imageSlice';
import { getReviewsByProduct, createReview, selectReviews } from '../../redux/review/reviewSlice';
import { listUserDetail } from '../../redux/user/usersSlice';
import { selectCurrentAccount } from '../../redux/user/accountSlice';
import ReviewForm from '../../components/client/ReviewForm';
import AuthModal from '../../components/client/AuthModal';
import SuggestSearch from '../../components/client/SuggestSearch';
import { uploadFileAPI } from '../../apis';

const { Content } = Layout;
const { Title, Text } = Typography;

function ProductDetail() {
  const { state } = useLocation();
  const productId = state?.productId;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const acctiveProducts = useSelector(selectActiveProducts);
  const product = useSelector(selectProductDetail);
  const productImages = useSelector(selectProductImages);
  const reviewImages = useSelector(selectReviewImages);
  const productAttributes = useSelector(selectProductAttributes);
  const reviews = useSelector(selectReviews);
  const currentAccount = useSelector(selectCurrentAccount);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviewUsers, setReviewUsers] = useState([]);
  const carouselRef = useRef();
  const thumbnailCarousel = useRef();
  const [isExpandedDescription, setIsExpandedDescription] = useState(false);
  const [isExpandAttributes, setIsExpandAttributes] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCompareVisible, setIsCompareVisible] = useState(false);
  const [compareProducts, setCompareProducts] = useState([product]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [discountPercent, showOriginalPrice] = useMemo(() => {
    if (!product?.price || !product?.selling_price) {
      return [0, false];
    }
    return [Math.round(((product.price - product.selling_price) / product.price) * 100), product.price !== product.selling_price];
  }, [product?.selling_price, product?.price]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const existingProduct = acctiveProducts.find(b => b.product_id === parseInt(productId));
        const res =  await Promise.all([
          existingProduct? dispatch(setProductDetail(existingProduct)) : dispatch(fetchProductById({id: productId})),
          dispatch(fetchProductImages({productId, isAll: true})),
          dispatch(fetchProductAttributesByProductId({ productId, isAll: true})),
          dispatch(getReviewsByProduct({productId, isAll: true})),
        ]);
        if (res[3] && res[3]?.payload?.length > 0) {
          const resReviews = await Promise.all(
            res[3]?.payload.reduce((prevArr, review) => 
              prevArr.concat(
                dispatch(fetchReviewImages({reviewId: review.review_id, isAll: true})),
                dispatch(listUserDetail(review.user_id))
          ), []),
          );
          setReviewUsers(resReviews?.filter(res => !res?.error && res?.payload?.user_id).map(result => result?.payload));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    setCompareProducts([product]);
  }, [product]);
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <Empty
        description="Không tìm thấy sản phẩm"
        style={{ padding: '50px' }}
      />
    );
  }

  const handleAddProductToCompare = (prod) => {
    if (compareProducts.length >= 3) return;
    if (!compareProducts.some(p => p.product_id === prod.product_id)) {
      setCompareProducts(prev => [...prev, prod]);
    }
    setIsAddProductModalOpen(false);
  };

  const handleRemoveCompareProduct = (id) => {
    if (compareProducts.length === 1) {
      setIsCompareVisible(false);
      return
    }
    setCompareProducts(prev => prev.filter(p => p.product_id !== id));
  };

  const handleCompareNow = () => {
    navigate('/product/compare', {
      state: {
        productIds: compareProducts.map(p => p.product_id)
      }
    });
  };

  const handleAddToCart = async (isNavigate = false) => {
    if (!currentAccount) {
      setIsAuthModalOpen(true);
      return;
    }
    if (product.stock_quantity === product.reserved_quantity || product.stock_quantity === 0) {
      return;
    }
    const res = await dispatch(addToCart({ product_id: product.product_id, operator: '+'}));
    if(!res?.error) {
      message.success('Đã thêm sản phẩm vào giỏ hàng');
      if (isNavigate) {
        navigate('/cart')
      }
    }
  };

  const handleReviewClick = () => {
    if (!currentAccount) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsReviewModalVisible(true);
  };

  const handleReviewSubmit = async (values) => {
    setIsReviewModalVisible(false);
    const reviewData = {
      product_id: productId,
      user_id: currentAccount.user_id,
      rating: values.rating,
      comment: values.comment,
      created_at: new Date()
    };
    const res = await dispatch(createReview(reviewData));
    message.success('TuvaTech đã nhận được phản hồi của bạn!');
    if (values?.images?.length && !res?.error) {
      const imageUrls = await Promise.all(
        values.images.map(file => uploadFileAPI(file?.originFileObj, 'reviews'))
      );
      await Promise.all(
        imageUrls.map(url => 
          dispatch(createImage({
            review_id: res?.payload?.review_id,
            image_url: url
          }))
        )
      );
    }
  };

  return (
    <Content>
      <Row gutter={[16, 16]}>
        {/* Hàng 1: Ảnh và thông tin cơ bản */}
        <Col xs={24}>
          <Card size='small' styles={{body: {padding: 16}}}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={14}>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Button 
                    icon={<LeftOutlined />}
                    style={{
                      width: '32px',
                      height: '50px',
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                    onClick={() => carouselRef.current?.prev()}
                  />
                  <Button 
                    icon={<RightOutlined />}
                    style={{
                      width: '32px',
                      height: '50px',
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                    onClick={() => carouselRef.current?.next()}
                  />
                  <Carousel 
                    ref={carouselRef}
                  >
                    {productImages.map((image) => (
                      <div key={image.image_id} style={{width: '100%'}}>
                        <Image
                          src={image.image_url}
                          alt={product.product_name}
                          style={{
                            width: '100%',
                            objectFit: 'contain',
                            background: '#fff',
                            borderRadius: '8px'
                          }}
                          preview={{
                            mask: null
                          }}
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
                <div style={{ position: 'relative' }}>
                  <Button 
                    shape='circle'
                    icon={<LeftOutlined />}
                    style={{
                      position: 'absolute',
                      left: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                    onClick={() => thumbnailCarousel.current?.prev()}
                  />
                  <Button 
                    shape='circle'
                    icon={<RightOutlined />}
                    style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                    onClick={() => thumbnailCarousel.current?.next()}
                  />
                  <Carousel 
                    ref={thumbnailCarousel}
                    slidesToShow={6}
                    dots={false}
                  >
                    {productImages.map((image, index) => (
                      <Card
                      size='small'
                      hoverable
                      key={image.image_id}
                      styles={{
                        body: {
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }
                      }}
                      onClick={() => {
                        carouselRef.current?.goTo(index);
                      }}>
                          <img
                            src={image.image_url}
                            alt="Thumbnail"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                      </Card>
                    ))}
                  </Carousel>
                </div>
              </Col>
              <Col xs={24} md={10}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Title level={3} style={{ margin: 0 }}>{product.product_name}</Title>
                  <Space>
                    <Rate disabled allowHalf defaultValue={reviews.length > 0 ? 
                      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0
                    } />
                    <Text type="secondary">({reviews.length} đánh giá)</Text>
                    <Text>|</Text>
                    <Button 
                      type="link"
                      style={{padding: 0}}
                      icon={<PlusCircleOutlined />}
                      onClick={() => {
                        setIsCompareVisible(!isCompareVisible)
                        if (compareProducts.length === 1) setCompareProducts([product]);
                      }}
                    >
                      So sánh
                    </Button>
                  </Space>
                  <div>
                    <Text strong style={{ fontSize: '28px', color: '#ee4d2d' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.selling_price)}
                    </Text>
                    {showOriginalPrice && (
                      <Space style={{ marginLeft: 8 }}>
                        <Text delete style={{ fontSize: '16px', color: '#999' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </Text>
                        <Text type="danger">-{discountPercent}%</Text>
                      </Space>
                    )}
                  </div>
                  {product.stock_quantity === 0 && <Tag color="red">Hết hàng</Tag>}
                  {product.stock_quantity === product.reserved_quantity && product.stock_quantity > 0 && <Tag color="red">Tạm hết hàng</Tag>}
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card size="small" variant={false} style={{ background: '#f5f5f5' }}>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <Space align="center">
                            <MobileOutlined style={{ fontSize: '20px', color: '#666' }} />
                            <div>
                              <Text style={{margin: 0}}>Nguyên hộp, đầy đủ phụ kiện từ nhà sản xuất</Text>
                              <div>
                                <Text style={{margin: 0}}>Bảo hành pin và bộ sạc 12 tháng</Text>
                              </div>
                            </div>
                          </Space>
                          <Space align="center">
                            <GiftOutlined style={{ fontSize: '20px', color: '#666' }} />
                            <Text style={{margin: 0}}>Máy, sạc, sách hướng dẫn</Text>
                          </Space>
                          <Space align="center">
                            <SafetyCertificateOutlined style={{ fontSize: '20px', color: '#666' }} />
                            <Text style={{margin: 0}}>Bảo hành 12 tháng tại trung tâm bảo hành Chính hãng. 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất. </Text>
                          </Space>
                          <Space align="center">
                            <DollarOutlined style={{ fontSize: '20px', color: '#666' }} />
                            <Text style={{margin: 0}}>Giá sản phẩm đã bao gồm VAT</Text>
                          </Space>
                        </Space>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => handleAddToCart(true)}
                        disabled={product.stock_quantity === 0 || product.stock_quantity === product.reserved_quantity}
                        style={{ height: '48px' }}
                      >
                        Mua ngay
                      </Button>
                    </Col>
                    <Col span={12}>
                      <Button
                        icon={<ShoppingCartOutlined />}
                        size="large"
                        block
                        onClick={() => handleAddToCart()}
                        disabled={product.stock_quantity === 0 || product.stock_quantity === product.reserved_quantity }
                        style={{ height: '48px' }}
                      >
                        Thêm vào giỏ
                      </Button>
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Giao diện so sánh fixed dưới cùng màn hình */}
        {isCompareVisible && (
          <div style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            height:120,
            zIndex: 100,
            background: '#fff',
            boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
            maxWidth: 1200,
            margin: '0 auto',
          }}>
            <Flex align="center" justify="space-between" style={{height: '100%'}}>
              {compareProducts.map((prod) => (
                <div key={prod.product_id} style={{width: '25%', height: '100%', borderRight: '1px solid #ccc', textAlign: 'center', position: 'relative', padding: '0 4px'}}>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        size="small"
                        style={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }}
                        onClick={() => handleRemoveCompareProduct(prod.product_id)}
                      />
                    <Image
                      src={prod.thumbnail || product.thumbnail}
                      width={60}
                      height={60}
                      style={{ objectFit: 'contain', marginBottom: 8 }}
                      preview={false}
                    />
                    <Text
                      type='secondary'
                      style={{
                        display: '-webkit-box', 
                        maxHeight: '40px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        position: 'relative',
                      }}
                    >
                      {prod.product_name || product.product_name}
                    </Text>
                </div>
              ))}
              {/* Thêm sản phẩm */}
              {Array.from({ length: 3 - compareProducts.length }).map((_, index) => (
                <Flex 
                  key={index}
                  vertical 
                  justify='center' 
                  align='center' 
                  style={{
                    width: '25%', 
                    height: '100%', 
                    borderRight: '1px solid #ccc', 
                    textAlign: 'center', 
                    position: 'relative', 
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsAddProductModalOpen(true)}
                >
                  <PlusSquareOutlined style={{ fontSize: 32, color: '#aaa' }} />
                  <Text type='secondary'>Thêm sản phẩm</Text>
                </Flex>
              ))}
              <Flex vertical gap={5} justify='center' align='center' style={{width: '25%', height: '100%', borderRight: '1px solid #ccc', textAlign: 'center', position: 'relative', cursor: 'pointer'}}>
                <Text>Đã chọn {compareProducts.length} sản phẩm</Text>
                <Button
                  type="primary"
                  disabled={compareProducts.length < 2}
                  style={{padding: 6}}
                  onClick={handleCompareNow}
                >
                  So sánh ngay
                </Button>
              </Flex>
            </Flex>
          </div>
        )}

        {/* Modal tìm kiếm sản phẩm */}
        <Modal
          open={isAddProductModalOpen}
          onCancel={() => setIsAddProductModalOpen(false)}
          footer={null}
          title="Thêm sản phẩm vào so sánh"
          width={{
            xs: '90%',
            sm: '70%',
            md: '60%',
            lg: '60%',
            xl: '60%',
            xxl: '60%',
          }}
          style={{ top: 20 }}
          styles={{body: { height: 450}}}
        >
          <SuggestSearch
            limit={5}
            onAddProduct={handleAddProductToCompare}
            productIds={compareProducts.map(p => p.product_id)}
          />
        </Modal>
        {/* Hàng 2: Mô tả và thông số kỹ thuật */}
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={14} lg={16} xl={16} xxl={16}>
              <Card 
                title={<Title level={4} style={{margin:0}}>Bài viết đánh giá</Title>} 
                variant={false} 
                styles={{body: {padding: 16}}}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    maxHeight: isExpandedDescription ? 'none' : '200px',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    {(() => {
                      return <div dangerouslySetInnerHTML={{ __html:DOMPurify.sanitize(product.description) }} />
                    })()}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '80px',
                      background: 'linear-gradient(transparent, white)',
                      display: isExpandedDescription ? 'none' : 'block'
                    }} />
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <Button 
                      type="default" 
                      onClick={() => setIsExpandedDescription(!isExpandedDescription)}
                      style={{ 
                        boxShadow: '1px 1px 4px rgba(0,0,0,0.2)',
                        width: '80%',
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                        display: isExpandedDescription && 'none'
                      }}
                      icon={<DownOutlined />}
                      iconPosition='end'
                    >
                      Xem thêm
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={10} lg={8} xl={8} xxl={8}>
              <Card 
                title={<Title level={4} style={{margin:0}}>Thông số kỹ thuật</Title>} 
                variant={false} 
                styles={{body: {padding: 16}}}
              >
                <div style={{ position: 'relative'}}>
                  <div style={{ 
                    maxHeight: isExpandAttributes ? 'none' : '200px',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <Table
                      dataSource={productAttributes}
                      bordered
                      pagination={false}
                      showHeader={false}
                      rowKey="attribute_id"
                      columns={[
                        {
                          dataIndex: 'attribute_name',
                          key: 'attribute_name', 
                          width: '45%',
                          render: (text) => (
                            <Text strong>{text}</Text>
                          ),
                          onCell: (record, index) => ({
                            style: {
                              background: index % 2 === 0 ? '#f5f5f5' : '#ffffff',
                              padding: '8px'
                            }
                          })
                        },
                        {
                          dataIndex: 'attribute_value',
                          key: 'attribute_value',
                          render: (text) => (
                            <Text>{text}</Text>
                          ),
                          onCell: (record, index) => ({
                            style: {
                              background: index % 2 === 0 ? '#f5f5f5' : '#ffffff', 
                              padding: '8px'
                            }
                          })
                        }
                      ]}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '80px',
                      background: 'linear-gradient(transparent, white)',
                      display: isExpandAttributes ? 'none' : 'block'
                    }} />
                  </div>
                  <Button 
                    type="default" 
                    onClick={() => setIsExpandAttributes(!isExpandAttributes)}
                    style={{ 
                      width: '100%',
                      boxShadow: '1px 1px 4px rgba(0, 0, 0, 0.2)',
                      display: isExpandAttributes && 'none'
                    }}
                    iconPosition='end'
                    icon={<DownOutlined />}
                  >
                    Xem cấu hình chi tiết
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Hàng 3: Đánh giá sản phẩm */}
        <Col xs={24}>
          <Card variant={false} title={<Title level={4} style={{margin:0}}>Đánh giá & nhận xét {product?.product_name}</Title>} styles={{body: {padding: 16}}}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Space direction="vertical" size="large" align="center" style={{ width: '100%' }}>
                  <Text strong style={{ fontSize: '32px' }}>
                    {reviews.length > 0 ? (
                      `${(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}/5`
                    ) : '0/5'}
                  </Text>
                  <Rate disabled allowHalf defaultValue={reviews.length > 0 ? 
                    reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0
                  } />
                  <Text type="secondary">({reviews.length} đánh giá)</Text>
                </Space>
              </Col>
              <Col xs={24} md={16}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(review => Math.floor(review.rating) === star).length;
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <Row key={star} align="middle" style={{ marginBottom: 8 }}>
                      <Col span={4}>
                        <Text>{star} sao</Text>
                      </Col>
                      <Col span={16}>
                        <Progress percent={percent} showInfo={false} />
                      </Col>
                      <Col span={4} style={{ textAlign: 'right' }}>
                        <Text>{count} đánh giá</Text>
                      </Col>
                    </Row>
                  );
                })}
              </Col>
              <Col xs={24} style={{textAlign: 'center'}}>
                <Divider/>
                  <div style={{marginBottom: 16}}>
                    <Text style={{fontSize: 16}}>Bạn đánh giá thế nào về sản phẩm này?</Text>
                  </div>
                  <Button type="primary" onClick={handleReviewClick}>Đánh giá ngay</Button>
                <Divider/>
                <Modal
                  centered
                  title="Đánh giá & nhận xét"
                  open={isReviewModalVisible}
                  onCancel={() => {
                    form.resetFields();
                    setIsReviewModalVisible(false)
                  }}
                  footer={
                    <Button type="primary" onClick={form.submit} block>
                      Gửi đánh giá
                    </Button>
                  }
                >
                  <ReviewForm onFinish={handleReviewSubmit} productName={product.product_name} form={form} />
                </Modal>
              </Col>
              <Col xs={24}>
                {reviews.length && reviewUsers.length ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={[...reviews].reverse()}
                    pagination={{
                      pageSize: 4,
                      position: 'bottom',
                      align: 'center'
                    }}
                    renderItem={review => {
                      const user = reviewUsers.find(user => user.user_id === review.user_id);
                      return (<List.Item>
                        <List.Item.Meta
                          avatar={user?.avatar_url? <Avatar src={user.avatar_url} />: <Avatar icon={<UserOutlined />}/>}
                          title={
                            <Space>
                              <Text strong>{user.user_name}</Text>
                              <Space>
                                <ClockCircleOutlined style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}/>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {new Date(review.created_at).toLocaleString('vi-VN')}
                                </Text>
                              </Space>
                            </Space>
                          }
                          description={
                            <>
                              <Rate disabled defaultValue={review.rating} style={{fontSize: 14}}/>
                              <div style={{ marginTop: 8, color: 'black' }}>{review.comment}</div>
                              {reviewImages
                                .filter(img => img.review_id === review.review_id)
                                .map((img, imgIndex) => (
                                  <Image
                                    key={imgIndex}
                                    src={img.image_url}
                                    alt={`Review image ${imgIndex + 1}`}
                                    width={80}
                                    height={80}
                                    style={{
                                      objectFit: 'contain',
                                      marginTop: 8,
                                      marginRight: 8,
                                      borderRadius: 4
                                    }}
                                    preview={{
                                      mask: <div style={{ color: 'white' }}>Xem</div>
                                    }}
                                  />
                              ))}
                            </>
                          }
                        />
                      </List.Item>
                    )}}
                  />
                ) : (
                  <Empty description="Chưa có đánh giá nào" />
                )}
              </Col>
            </Row>
          </Card>
        </Col>
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </Row>
    </Content>
  );
}

export default ProductDetail;
