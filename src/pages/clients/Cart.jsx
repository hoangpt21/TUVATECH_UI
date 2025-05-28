import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Row, Col, Typography, Card, Button, InputNumber, Space, Divider, Empty, Checkbox, Input, Spin, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getUserCart, addToCart, removeFromCart, selectCartItems } from '../../redux/cart/cartSlice';
import {  fetchProductById } from '../../redux/product';

const { Content } = Layout;
const { Title, Text } = Typography;

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState({spin: false, btn: false});
  const cartItems = useSelector(selectCartItems);
  const [cartProducts, setCartProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading({ ...loading ,spin: true});
      let carts = cartItems;
      if(!carts || carts?.length === 0) {
        const cartResponse = await dispatch(getUserCart({
          select: '*',
          isAll: true
        }));
        carts = !cartResponse?.error? cartResponse?.payload: [];
      }
      if (carts?.length > 0) {
        const productPromises = carts.map(item => 
          dispatch(fetchProductById({id: item.product_id, select: 'product_id,product_name,price,selling_price,thumbnail'}))
        );
        const resProducts = await Promise.all(productPromises);
        setCartProducts(resProducts.map(resProduct => resProduct?.payload));
      }
      setLoading({...loading, spin: false});
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch]);

  const handleQuantityChange = async (productId, operator) => {
    setLoading({...loading, btn: true});
    const res = await dispatch(addToCart({ product_id: productId, operator }));
    setLoading({...loading, btn: false});
    if (!res?.error) {
      message.success('Cập nhật số lượng thành công!');
    }
  };

  const handleRemoveItem = async (productId) => {
    setLoading({...loading, btn: true});
    const res = await dispatch(removeFromCart({productId}));
    setLoading({...loading, btn: false});
    if(!res?.error) {
      message.success('Xóa sản phẩm khỏi giỏ hàng thành công!');
      setCartProducts(prevProducts => prevProducts.filter(product => product.product_id !== productId));
      setSelectedItems(prevSelected => prevSelected.filter(id => id !== productId));
    }
  };

  const handleCheckout = () => {
    if(selectedItems.length === 0) return;
    
    const selectedProducts = cartProducts
      .filter(product => selectedItems.includes(product.product_id))
      .map(product => ({
        ...product,
        quantity: cartItems.find(item => item.product_id === product.product_id)?.quantity || 0
      }));

    navigate('/checkout', {
      state: {
        cartProducts: selectedProducts,
      }
    });
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedItems(cartProducts.map(product => product.product_id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      const newSelected = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      setSelectAll(newSelected.length === cartProducts.length);
      return newSelected;
    });
  };

  const calculateTotal = () => {
    return cartProducts.reduce((total, product) => {
      if (!selectedItems.includes(product.product_id)) return total;
      const cartItem = cartItems.find(item => item.product_id === product.product_id);
      return total + (Number(product.selling_price) * (cartItem?.quantity || 0));
    }, 0);
  };

  const calculateTotalQuantity = () => {
    return cartItems.reduce((total, item) => {
      if (!selectedItems.includes(item.product_id)) return total;
      return total + item.quantity;
    }, 0);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <Content style={{ padding: '24px', textAlign: 'center' }}>
        <Empty
          image={<ShoppingCartOutlined style={{ fontSize: '64px' }} />}
          description="Giỏ hàng của bạn đang trống"
        >
          <Link to="/">
            <Button type="primary">Tiếp tục mua sắm</Button>
          </Link>
        </Empty>
      </Content>
    );
  }

  return (
    <Content style={{ padding: '24px', background: '#f5f5f5' }}>
      <Spin spinning={loading.spin}>
        <Row>
          <Col span={24}>
            <Space>
              <Link to="/">
                <Button type="text" icon={<ArrowLeftOutlined />} />
              </Link>
              <Title level={4} style={{ margin: 0 }}>Giỏ hàng của bạn</Title>
            </Space>
          </Col>
        </Row>
        <Row gutter={[0, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card styles={{ body: { padding: '16px 24px'} }}>
              <Row align="middle" style={{ marginBottom: 16 }}>
                <Col>
                  <Checkbox checked={selectAll} onChange={handleSelectAll}>
                    Chọn tất cả
                  </Checkbox>
                </Col>
              </Row>
              <Divider style={{ margin: '0 0 16px 0' }} />
              
              {cartProducts.map((product) => {
                const cartItem = cartItems.find(item => item.product_id === product.product_id);
                if (!cartItem) return null;
                return (
                  <div key={product.product_id}>
                    <Row align="middle" gutter={16}>
                      <Col>
                        <Checkbox 
                          checked={selectedItems.includes(product.product_id)}
                          onChange={() => handleSelectItem(product.product_id)}
                        />
                      </Col>
                      <Col flex="auto">
                        <Row gutter={16} align="middle">
                          <Col flex="100px">
                            <img
                              src={product.thumbnail || '/placeholder.png'}
                              alt={product.product_name}
                              style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'contain',
                                background: '#fff',
                                borderRadius: '4px'
                              }}
                            />
                          </Col>
                          <Col flex="auto">
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Link to={`/product/detail`} state={{productId: product.product_id}}>
                                <Text style={{ fontSize: '16px', color: '#222' }}>
                                  {product.product_name}
                                </Text>
                              </Link>
                              <Space>
                                <Text type="danger" strong style={{ fontSize: '20px' }}>
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.selling_price)}
                                </Text>
                                <Text delete type="secondary">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                </Text>
                              </Space>
                            </Space>
                          </Col>
                          <Col>
                            <Space size="large">
                              <Space.Compact>
                                <Button 
                                  onClick={() => handleQuantityChange(product.product_id, '-')}
                                  disabled={cartItem.quantity <= 1 || loading.btn}
                                  icon={<MinusOutlined />}
                                >
                                </Button>
                                <Input 
                                  value={cartItem.quantity} 
                                  style={{ width: '50px', textAlign: 'center' }}
                                  readOnly
                                />
                                <Button
                                  onClick={() => handleQuantityChange(product.product_id, '+')}
                                  disabled={loading.btn}
                                  icon={<PlusOutlined />}
                                >
                                </Button>
                              </Space.Compact>
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemoveItem(product.product_id)}
                              />
                            </Space>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Divider style={{ margin: '16px 0' }} />
                  </div>
                );
              })}
            </Card>
          </Col>

          <Col xs={24}>
            <Card styles={{ body: { padding: '16px 24px'} }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Text>Tạm tính: </Text>
                  <Text strong style={{ fontSize: '20px', color: '#ee4d2d' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
                  </Text>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleCheckout} 
                    style={{ minWidth: '150px' }}
                    disabled={selectedItems.length === 0}
                  >
                    Mua ngay ({calculateTotalQuantity()})
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </Content>
  );
}

export default Cart;