import React, { useEffect, useState } from 'react';
import { Row, Col, Empty, Space, Button, Spin, Badge } from 'antd';
import { CloseOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import ProductItem from './ProductItem';
import ProductFilter from './ProductFilter';
import { filterProductsAPI } from '../../apis';

const ActiveProducts = ({ 
  brandId = null,
  searchKeyword = ''
}) => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [onReset, setOnReset] = useState(false);
  const [countFilter, setCountFilter] = useState(0);
  const [filterParams, setFilterParams] = useState({
    brandId,
    searchKeyword,
    sortBy: '',
    minPrice: null,
    maxPrice: null,
    categoryId: null
  });

  useEffect(() => {
    loadProducts(0, filterParams);
  }, []);

  const loadProducts = async (newOffset = 0, filterParams) => {
    setLoading(true);
    try {
      const result = await filterProductsAPI({
        ...filterParams,
        limit: 20,
        offset: newOffset
      });
      if (result?.products.length > 0) {
        setProducts(prev => newOffset === 0 ? result.products : [...prev, ...result.products]);
        setTotalProducts(result?.total);
      }
      if (result?.products.length < 20) {
        setHasMore(false);
      } else setHasMore(true);
      
      if (newOffset === 0) {
        setOffset(20);
      } else {
        setOffset(newOffset + 20);
      }
    } finally {
      setLoading(false);
    }
  };

  const onFilterChange = async ({sortBy, priceRange, categoryId: selectedCategory, brandId: selectedBrand}) => {
    setFilterParams(prev => ({
      ...prev,
      sortBy,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      categoryId: selectedCategory,
      brandId: selectedBrand || prev.brandId
    }));
    setOffset(0);
    await loadProducts(0, {
      ...filterParams,
      sortBy,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      categoryId: selectedCategory,
      brandId: selectedBrand || filterParams.brandId
    });
    setFilterVisible(false);
  };

  const handleLoadMore = () => {
    loadProducts(offset, filterParams);
  };

  return (
    <Spin spinning={loading}>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Space.Compact>
            <Button 
              icon={<Badge count={countFilter} size="small"><FilterOutlined /></Badge>}
              onClick={() => setFilterVisible(true)}
            >
              Bộ lọc
            </Button>
            {(filterParams.sortBy || filterParams.minPrice || filterParams.maxPrice || filterParams.categoryId || (filterParams.brandId && !brandId)) && (
              <Button 
                icon={<CloseOutlined/>}
                onClick={(e) => {
                  setOnReset(true);
                  e.stopPropagation();
                  setFilterParams({
                    brandId,
                    searchKeyword,
                    sortBy: '',
                    minPrice: null,
                    maxPrice: null,
                    categoryId: null
                  });
                  loadProducts(0, {
                    brandId,
                    searchKeyword,
                    sortBy: '',
                    minPrice: null,
                    maxPrice: null,
                    categoryId: null
                  });
                }}
                style={{ cursor: 'pointer' }}
              >
              </Button>
            )}
          </Space.Compact>
        </Col>
        <Col xs={24}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {products.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {products.map((product, i) => (
                    <Col xs={12} sm={8} md={6} key={i}>
                      <ProductItem product={product} />
                    </Col>
                  ))}
                </Row>
                <Row justify="center">
                  {hasMore && totalProducts - products.length? <Button 
                    onClick={handleLoadMore}
                    type="primary"
                    icon={<PlusOutlined />}
                    loading={loading}
                  >
                    Xem thêm {totalProducts - products.length} Laptop
                  </Button>: null}
                </Row>
              </>
            ) : (
              <Empty description="Không tìm thấy sản phẩm nào" />
            )}
          </Space>
        </Col>

        <ProductFilter 
          visible={filterVisible}
          onFilterChange={onFilterChange}
          onClose={() => setFilterVisible(false)}
          useOnReset={() => [onReset, setOnReset]}
          useCountFilter={() => [countFilter, setCountFilter]}
        />
      </Row>
    </Spin>
  );
};

export default ActiveProducts;