import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Layout, Row, Col, Typography, Card, Carousel, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { fetchActiveNews, selectActiveNews } from '../../redux/news/newsSlice';
import { getActiveBrands, selectActiveBrands } from '../../redux/brand/brandSlice';
import { getActiveBanners, selectActiveBanners } from '../../redux/banner/bannerSlice';
import NewsItemSmall from '../../components/client/NewsItemSmall';
import ActiveProducts from '../../components/client/ActiveProducts';
import { bestSellersAPI, getRecommendationAPI } from '../../apis';
import ProductItem from '../../components/client/ProductItem';
import { selectCurrentAccount } from '../../redux/user/accountSlice';

const { Content } = Layout;
const { Title, Text } = Typography;

function Home() {
  const dispatch = useDispatch();
  const currentAccount = useSelector(selectCurrentAccount)
  const carouselRef = useRef();
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const banners = useSelector(selectActiveBanners);
  const brands = useSelector(selectActiveBrands);
  const news = useSelector(selectActiveNews);

  useEffect(() => {
    dispatch(getActiveBanners({isAll: true}));
    dispatch(getActiveBrands({isAll: true}));
    dispatch(fetchActiveNews({isAll: true}));
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    bestSellersAPI({offset: 0, limit: 4})
    .then(res => {
      if(res?.length) {
        setBestSellingProducts(res)
      }
    })
  },[])

  useEffect(() => {
    let userId = null;
    if(currentAccount) {
      userId = currentAccount.user_id
    }
    getRecommendationAPI(userId)
    .then(res => {
      if(res?.length) {
        setSuggestedProducts(res)
      }
    })
  },[])
  const sortedNews = useMemo(() => {
    if (!news) return [];
    return [...news].sort((a, b) =>
      new Date(b.published_date) - new Date(a.published_date)
    );
  }, [news]);

  const BRANDS_PER_SLIDE = 6;
  const activeBrands = brands?.filter(brand => brand.is_active) || [];
  const displayedBrands = activeBrands.slice(0, 12);
  const totalSlides = Math.ceil(displayedBrands.length / BRANDS_PER_SLIDE);

  const brandGroups = [];
  for (let i = 0; i < totalSlides; i++) {
    const startIdx = i * BRANDS_PER_SLIDE;
    let endIdx = startIdx + BRANDS_PER_SLIDE;
    brandGroups.push(displayedBrands.slice(startIdx, endIdx));
  }

  return (
    <Content>
      {/* Banner Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <div style={{ position: 'relative' }}>
            {/* Create separate ref for banner carousel */}
            <Carousel 
              ref={carouselRef}
              autoplay 
              autoplaySpeed={5000} 
              // slidesToShow={1}
              effect="fade"
              dots={true}
              arrows={true}
            >
              {banners.map((banner) => (
                <div key={banner.banner_id} style={{width: '100%'}}>
                  <img
                    src={banner.banner_url}
                    alt={banner.banner_name}
                    style={{
                      color: '#fff',
                      width: '100%',
                      textAlign: 'center',
                      objectFit: 'contain',
                      background: '#fff',
                      borderRadius: '12px',
                    }}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </Col>
      </Row>

      {/* Info Cards Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
            <Title level={5} style={{margin:0}}>Bảo hành chính hãng</Title>
            <Text style={{margin: 0}}>Đảm bảo 12 tháng bảo hành toàn diện</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
            <Title level={5} style={{margin:0}}>Miễn phí vận chuyển</Title>
            <Text style={{margin: 0}}>Giao hàng miễn phí trong bán kính 5km</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
            <Title level={5} style={{margin:0}}>Chính sách đổi trả</Title>
            <Text style={{margin: 0}}>1 đổi 1 trong 7 ngày nếu sản phẩm lỗi</Text>
          </Card>
        </Col>
      </Row>

      {/* Brands Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ textAlign: 'center', margin: '0 auto 10px'  }}>
          THƯƠNG HIỆU NỔI BẬT
        </Title>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', padding: '0 24px' }}>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => carouselRef.current.prev()}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              />
              <Carousel
                ref={carouselRef}
                dots={true}
                autoplay
                slidesToShow={6}
                responsive={[
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 4,
                    }
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 3,
                    }
                  },
                  {
                    breakpoint: 480,
                    settings: {
                      slidesToShow: 2,
                    }
                  }
                ]}
              >
                {displayedBrands.map((brand,index) => (
                  <Link 
                    to="/brand/detail"
                    state={{ brandId: brand.brand_id }}
                    key={`${brand.brand_id}-${index}`}
                  >
                    <Card
                      hoverable
                      style={{margin:'0 4px'}}
                      styles={{
                        body: { 
                          padding: '12px',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }
                      }}
                    >
                      <img 
                        src={brand.logo_url} 
                        alt={brand.brand_name}
                        style={{
                          maxHeight: '60px',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </Card>
                  </Link>
                ))}
              </Carousel>
              <Button
                type="text"
                icon={<RightOutlined />}
                onClick={() => carouselRef.current.next()}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              />
            </div>
        </div>
      </Card>

      {/* Best Selling Products Section */}
      { bestSellingProducts.length > 0 &&
        <Card style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ textAlign: 'center', margin: '0 auto 10px'  }}>
            LAPTOP BÁN CHẠY NHẤT
          </Title>
          <>
            <Row gutter={[16, 16]}>
              {bestSellingProducts.map((product, i) => (
                <Col xs={12} sm={8} md={6} key={i}>
                  <ProductItem product={product} />
                </Col>
              ))}
            </Row>
          </>
        </Card>
      }

      {/* Suggested Products Section */}
      { suggestedProducts.length > 0 &&
        <Card style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ textAlign: 'center', margin: '0 auto 16px'  }}>
            GỢI Ý LAPTOP NỔI BẬT
          </Title>
          <>
            <Row gutter={[16, 16]}>
              {suggestedProducts.map((product, i) => (
                <Col xs={12} sm={8} md={6} key={i}>
                  <ProductItem product={product} />
                </Col>
              ))}
            </Row>
          </>
        </Card>
      }
      {/* Products Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ textAlign: 'center', margin: '0 auto'  }}>
          TẤT CẢ LAPTOP
        </Title>
        <ActiveProducts />
      </Card>

      {/* News Section */}
      <Card>
        <Title level={3} style={{ margin: 0, flex: 1, textAlign: 'center' }}>
          TIN TỨC MỚI NHẤT
        </Title>
        <div style={{ textAlign: 'right', marginBottom: '24px' }}>
          <Link to="/news" style={{ textDecoration: 'underline' }}>
            Xem tất cả
          </Link>
        </div>
        <Row gutter={[16, 16]}>
          {sortedNews?.slice(0, 4).map((newsItem) => (
            <Col xs={24} sm={12} md={6} lg={4.8} key={newsItem.news_id}>
              <NewsItemSmall news={newsItem} />
            </Col>
          ))}
        </Row>
      </Card>
    </Content>
  );
}

export default Home;
