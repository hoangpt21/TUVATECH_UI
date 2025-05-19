import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Row, Col, Button, Card, Layout } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { getBrandById, selectCurrentBrand, setCurrentBrand, selectActiveBrands } from '../../redux/brand/brandSlice';
import ActiveProducts from '../../components/client/ActiveProducts';
import DOMPurify from 'dompurify';
const { Content } = Layout;
const { Title } = Typography;

const BrandProducts = () => {
  const { state } = useLocation();
  const brandId = state?.brandId;
  const dispatch = useDispatch();
  const activeBrands = useSelector(selectActiveBrands);
  const brand = useSelector(selectCurrentBrand);
  const [loading, setLoading] = useState(false);
  const [isExpandedDescription, setIsExpandedDescription] = useState(false);
  useEffect(() => {
    const loadBrandData = async () => {
      setLoading(true);
      try {
        const existingBrand = activeBrands.find(b => b.brand_id === parseInt(brandId));
        if (existingBrand) {
          dispatch(setCurrentBrand(existingBrand));
        } else {
            await dispatch(getBrandById({
                id: brandId,
                select: '*'
            }));
        }
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    if (brandId) {
      loadBrandData();
    }
  }, [brandId, activeBrands, dispatch]);

  if (!brand) {
    return null;
  }

  return (
    <Content>
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Card loading={loading}>
              <Title level={2} style={{ margin: '0 auto 16px' , textAlign: 'center' }}>
              Thương hiệu {brand.brand_name}
              </Title>
              <ActiveProducts brandId={parseInt(brandId)} />
          </Card>
        </Col>

        <Col span={24}>
          <Card 
              loading={loading}
              title={<Title level={4} style={{margin:0}}>Bài viết thương hiệu</Title>} 
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
                      DOMPurify.sanitize(brand.description);
                      return <div dangerouslySetInnerHTML={{ __html: brand.description }} />
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
      </Row>
    </Content>
  );
};

export default BrandProducts;