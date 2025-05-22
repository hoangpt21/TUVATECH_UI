import React, { useEffect, useState } from 'react';
import { Card, Tag, Typography, Space, Rate } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const ProductItem = ({ product }) => {
  const [discountPercent, setDiscountPercent] = useState(0);
  const [inStock, setInStock] = useState("Còn hàng");

  useEffect(() => {
    if (product) {
      console.log(product);
      const discount = Math.round(((product.price - product.selling_price) / product.price) * 100);
      setDiscountPercent(discount);
      if(product.stock_quantity === product.reserved_quantity && product.stock_quantity > 0) setInStock("Tạm hết hàng");
      else if(product.stock_quantity === 0) setInStock("Hết hàng");
    }
  }, [product]);

  if (!product) return null;

  const showOriginalPrice = product.price !== product.selling_price;

  return (
    <Link to={`/product/detail`} state={{productId: product.product_id}}>
      <Card
        hoverable
        styles={{body: { padding: '12px'} }}
        style={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        cover={
          <div style={{ 
            position: 'relative',
            paddingTop: '75%',
            background: '#ffffff'
          }}>
            <img 
              alt={product.product_name} 
              src={product.thumbnail || '/placeholder.png'} 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: '8px'
              }} 
            />
            {discountPercent > 0 && (
              <Tag 
                color="#f5222d" 
                style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px',
                  fontSize: '13px',
                  padding: '2px 6px',
                  margin: 0
                }}
              >
                -{discountPercent}%
              </Tag>
            )}
          </div>
        }
      >
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Title 
            level={5} 
            ellipsis={{ rows: 2 }} 
            style={{ 
              marginBottom: 0,
              fontSize: '14px',
              lineHeight: '1.4',
              height: '40px'
            }}
          >
            {product.product_name}
          </Title>
          
          <div>
            {showOriginalPrice && (
              <Text delete style={{ 
                color: '#999', 
                marginRight: '8px',
                fontSize: '13px'
              }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </Text>
            )}
            <Text strong style={{ 
              color: '#ee4d2d', 
              fontSize: '16px'
            }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.selling_price)}
            </Text>
          </div>
          <Space size={5}>
            <Rate 
              disabled 
              defaultValue={product.avg_rating} 
              style={{ fontSize: '14px' }}
            /> {product.avg_rating > 0? product.avg_rating: ''}
          </Space>
          
          <div style={{ marginTop: '4px' }}>
            <Tag color={inStock === "Còn hàng" ? '#52c41a' : '#ff4d4f'} style={{ margin: 0 }}>
              {inStock}
            </Tag>
          </div>
        </Space>
      </Card>
    </Link>
  );
};

export default ProductItem;