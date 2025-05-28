import React, { useEffect, useState } from 'react';
import { Button, Slider, Typography, Modal, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchActiveCategoriesByType, selectActiveCategories } from '../../redux/category/categorySlice';
import { getActiveBrands, selectActiveBrands } from '../../redux/brand/brandSlice';
import { SortDescendingOutlined, SortAscendingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ProductFilter = ({ visible, onClose, onFilterChange, useOnReset, useCountFilter }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [onReset, setOnReset] = useOnReset();
  const [countFilter, setCountFilter] = useCountFilter();
  const [isCheckCountFilter, setIsCheckCountFilter] = useState({sort:false, category:false, brand:false, price:false});
  const categories = useSelector(selectActiveCategories);
  const brands = useSelector(selectActiveBrands);

  useEffect(() => {
    if (!location.pathname.includes('/brand')) {
      dispatch(getActiveBrands({ isAll: true }));
    }
    dispatch(fetchActiveCategoriesByType({ isAll: true, categoryType: 'product' }));
  }, [dispatch, location]);

  useEffect(() => {
    if(onReset) {
        setSortBy('');
        setPriceRange(null);
        setSelectedCategory(null);
        setSelectedBrand(null);
        setCountFilter(0);
        setIsCheckCountFilter({sort:false, category:false, brand:false, price:false});
        setOnReset(false);
    }
  }, [onReset]);

  const handleSortBy = (value) => {
    if(!isCheckCountFilter.sort) {
        setCountFilter(prevCountFilter => prevCountFilter + 1);
        setIsCheckCountFilter({...isCheckCountFilter, sort:true});
    }
    setSortBy(value);
  };

  const handlePriceChange = (value) => {
    if(!isCheckCountFilter.price) {
        setCountFilter(prevCountFilter => prevCountFilter + 1);
        setIsCheckCountFilter({...isCheckCountFilter, price:true});
    }
    setPriceRange(value);
  };

  const handlePriceRange = (value) => {
    if(!isCheckCountFilter.price) {
        setCountFilter(prevCountFilter => prevCountFilter + 1);
        setIsCheckCountFilter({...isCheckCountFilter, price:true});
    }
    setPriceRange(value);
  }

  const handleCategoryClick = (categoryId) => {
    if(!isCheckCountFilter.category) {
        setCountFilter(prevCountFilter => prevCountFilter + 1);
        setIsCheckCountFilter({...isCheckCountFilter, category:true});
    }
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleBrandClick = (brandId) => {
    if(!isCheckCountFilter.brand) {
        setCountFilter(prevCountFilter => prevCountFilter + 1);
        setIsCheckCountFilter({...isCheckCountFilter, brand:true});
    }
    setSelectedBrand(brandId === selectedBrand ? null : brandId);
  };

  const handleFilter = async () => {
    try {
        setLoading(true);
        await onFilterChange({
        sortBy,
        priceRange: {
            min: priceRange && priceRange[0],
            max: priceRange && priceRange[1]
        },
        categoryId: selectedCategory,
        brandId: selectedBrand,
        });
    } finally{
        setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <div style={{textAlign: 'center'}} key="footer-container">
            <Button loading={loading} type="primary" onClick={handleFilter}>
            Xem sản phẩm
            </Button>
        </div>
      ]}
      width={{ xs: '95%', sm: '80%', md:'70%', lg: '70%', xl: '70%' }}
    >
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Text strong>Sắp xếp theo</Text>
          <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
            <Col>
              <Button
                type={sortBy === 'price_desc' ? 'primary' : 'default'}
                onClick={() => handleSortBy('price_desc')}
                icon={<SortDescendingOutlined />}
              >
                Giá giảm dần
              </Button>
            </Col>
            <Col>
              <Button
                type={sortBy === 'price_asc' ? 'primary' : 'default'}
                onClick={() => handleSortBy('price_asc')}
                icon={<SortAscendingOutlined />}
              >
                Giá tăng dần
              </Button>
            </Col>
            <Col>
              <Button
                type={sortBy === 'created_at_desc' ? 'primary' : 'default'}
                onClick={() => handleSortBy('created_at_desc')}
                icon={<SortDescendingOutlined />}
              >
                Sản phẩm mới ra
              </Button>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Text strong>Khoảng giá</Text>
          <div style={{ padding: '0 10px' }}>
            <Slider
              range
              min={10000000}
              max={150000000}
              value={priceRange}
              onChange={handlePriceChange}
              tooltip={{
                formatter: value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
              }}
              marks={{
                10000000: {
                  label: <div style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>10tr</div>
                },
                150000000: {
                  label: <div style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>150tr</div>
                }
              }}
            />
          </div>
          <Row gutter={8}>
            <Col span={6}>
              <Button 
                style={{ width: '100%' }} 
                onClick={() => handlePriceRange([0, 10000000])}
              >
                Dưới 10 triệu
              </Button>
            </Col>
            <Col span={6}>
              <Button 
                style={{ width: '100%' }} 
                onClick={() => handlePriceRange([10000000, 20000000])}
              >
                10-20 triệu
              </Button>
            </Col>
            <Col span={6}>
              <Button 
                style={{ width: '100%' }} 
                onClick={() => handlePriceRange([20000000, 30000000])}
              >
                20-30 triệu
              </Button>
            </Col>
            <Col span={6}>
              <Button 
                style={{ width: '100%' }} 
                onClick={() => handlePriceRange([30000000, 150000000])}
              >
                trên 30 triệu
              </Button>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Text strong>Loại sản phẩm</Text>
          <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
            {categories.map(category => (
              <Col key={category.category_id}>
                <Button
                  type={selectedCategory === category.category_id ? 'primary' : 'default'}
                  onClick={() => handleCategoryClick(category.category_id)}
                >
                  {category.category_name}
                </Button>
              </Col>
            ))}
          </Row>
        </Col>

        {!location.pathname.includes('/brand') && (
          <Col span={24}>
            <Text strong>Thương hiệu</Text>
            <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
              {brands.map(brand => (
                <Col key={brand.brand_id}>
                  <Button
                    type={selectedBrand === brand.brand_id ? 'primary' : 'default'}
                    onClick={() => handleBrandClick(brand.brand_id)}
                  >
                    {brand.brand_name}
                  </Button>
                </Col>
              ))}
            </Row>
          </Col>
        )}
      </Row>
    </Modal>
  );
};

export default ProductFilter;