import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Row, Col, Typography, Card, Button, Form, Input, Empty, Space, Divider, Radio, List, Tag, message, Image } from 'antd';
import { CarOutlined, CloseOutlined, PlusOutlined, RocketOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { createOrder } from '../../redux/order/orderSlice';
import { selectCurrentAccount } from '../../redux/user/accountSlice';
import { getAddressesAPI, selectAddresses, sortAddresses } from '../../redux/address/addressSlice';
import { getUserCoupons, selectUserCoupons, updateUserCoupon } from '../../redux/coupon/userCouponSlice';
import { removeFromCart } from '../../redux/cart/cartSlice';
import {createOrderItem} from '../../redux/order/orderItemSlice';
import AddressForm from '../../components/client/AddressForm';
import { getPayMentMethodAPI, getProvincesAPI } from '../../apis';
import { getCouponById, updateCoupon } from '../../redux/coupon/couponSlice';
import momoIcon from '../../assets/images/momo.png';
import vnpayIcon from '../../assets/images/VNP.jpg';
import codIcon from '../../assets/images/COD.png';

const { Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const selectedProductsFromCart = location.state?.cartProducts || [];
  const [loading, setLoading] = useState(false);
  const addresses = useSelector(selectAddresses); 
  const user = useSelector(selectCurrentAccount);
  const userCoupons = useSelector(selectUserCoupons);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [provinces, setProvinces] = useState({});
  const shippingFees = {
    standard: 20000,
    express: 35000,
    sameday: 50000
  };
  const shippingFee = shippingFees[shippingMethod];
  const subtotal = useMemo(() => selectedProductsFromCart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0) ,[]) 
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      const percentageDiscount = subtotal * appliedCoupon.discount_value / 100;
      return Math.min(percentageDiscount, appliedCoupon.max_discount_value);
    }
    return appliedCoupon.discount_value;
  }, [appliedCoupon, subtotal]);
  const total = useMemo(() => (subtotal + shippingFee - discount),[shippingFee, discount]) ;

  useEffect(() => {
    const fetchData = async () => {
      if(!selectedProductsFromCart?.length) navigate('/cart')
      const [addressesRes, userCouponsRes, provincesRes] = await Promise.all([
        dispatch(getAddressesAPI({ isAll: true })),
        dispatch(getUserCoupons({isAll: true})),
        getProvincesAPI()
      ]);
      if (!addressesRes.error) {
        if (addressesRes?.payload.length > 0) {
          dispatch(sortAddresses());
          setSelectedAddress(addressesRes?.payload?.find(a => a.is_default));
        }
      }
      if(provincesRes) setProvinces(provincesRes);
      if(!userCouponsRes.error) {
        const res = await Promise.all(
          userCouponsRes.payload.map(userCoupon => 
            dispatch(getCouponById({ id: userCoupon.coupon_id }))
          )
        );
        setCoupons(res.filter(item => !item?.error).map(item => item?.payload));
      }
    };
    fetchData();
  }, [dispatch]);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleShippingMethodChange = (e) => {
    setShippingMethod(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleApplyCoupon = async () => {
    const coupon = coupons.find(c => c.coupon_code === couponCode);
    if (!coupon) {
      message.error('Mã giảm giá không hợp lệ');
      return;
    }
    const currentDate = new Date();
    const endDate = new Date(coupon.end_date);
    if (currentDate > endDate) {
      message.error('Mã giảm giá đã hết hạn');
      return;
    }
    const userCoupon = userCoupons.find(uc => uc.coupon_id === coupon.coupon_id);
    if (userCoupon && userCoupon.used_count === coupon.max_usage_per_user) {
      message.error('Bạn đã sử dụng hết số lần cho phép của mã giảm giá này');
      return;
    }
    if(subtotal < coupon.min_order_value) {
      message.error(`Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.min_order_value)} để áp dụng mã giảm giá này`);
      return;
    }
    setAppliedCoupon(coupon);
    message.success('Áp dụng mã giảm giá thành công');
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      message.error('Vui lòng chọn địa chỉ giao hàng');
      return;
    }
    try {
      setLoading(true);
      const shipping_method = shippingMethod === 'standard'? 'Giao hàng tiêu chuẩn': 
        shippingMethod === 'express'? 'Giao hàng nhanh': 'Giao hàng trong ngày';
      const payment_method = paymentMethod ==='cod'? 'Thanh toán khi nhận hàng': 'Thanh toán qua VNPay';
      const orderData = {
        recipient_full_address: `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`,
        shipping_method_name:shipping_method,
        payment_method,
        total_price: total,
        shipping_fee: shippingFee,
        discount_amount: discount,
        coupon_code_used: appliedCoupon?.coupon_code,
        note: form.getFieldValue('note'),
        recipient_full_name: selectedAddress.full_name,
        recipient_phone_number: selectedAddress.phone,
        recipient_email: user?.email,
      };
      const orderRes = await dispatch(createOrder(orderData));
      if (!orderRes.error) {
        const userCoupon = userCoupons.find(uc => uc.coupon_id === appliedCoupon?.coupon_id);
        await Promise.all([
          ...selectedProductsFromCart.map(item => dispatch(createOrderItem({
            order_id: orderRes.payload.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            subtotal_price: item.selling_price * item.quantity,
            product_name: item.product_name,
            thumbnail: item.thumbnail,
          }))),
          ...selectedProductsFromCart.map(item => dispatch(removeFromCart({ productId: item.product_id, isOrdered: true }))),
          appliedCoupon? dispatch(updateCoupon({id: appliedCoupon?.coupon_id, couponData: {used_count: Number(appliedCoupon.used_count) + 1} })): Promise.resolve(),
          userCoupon? dispatch(updateUserCoupon({couponId: userCoupon?.coupon_id, userCouponData: {used_count: Number(userCoupon.used_count) + 1} })): Promise.resolve()
        ]);
        if(paymentMethod === 'cod') {
          navigate(`/payment-status?status=success&orderId=${parseInt(orderRes?.payload.order_id)}`, {replace: true});
        } else if(paymentMethod === 'vnpay') {
          const resVnpayUrl = await getPayMentMethodAPI(orderRes?.payload.total_price, orderRes?.payload.order_id, paymentMethod);
          window.location.replace(resVnpayUrl);
        } 
        // else if(paymentMethod === 'momo') {
        //   const resMomoUrl = await getPayMentMethodAPI(orderRes?.payload.total_price, orderRes?.payload.order_id, paymentMethod);
        //   window.location.replace(resMomoUrl);
        // }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Phần địa chỉ giao hàng */}
          <Card title="Địa chỉ giao hàng" style={{ marginBottom: 24 }} styles={{body: {paddingTop: 12}}}>
            <div style={{ marginBottom: newAddress ? 16 : 0 }}>
              {addresses.length > 0 && (
                <List
                  dataSource={addresses}
                  header={<Text strong>Địa chỉ có sẵn:</Text>}
                  pagination={{
                    pageSize: 5,
                    align: 'center',	
                  }}
                  renderItem={address => (
                    <List.Item
                      onClick={() => handleAddressSelect(address)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedAddress?.address_id === address.address_id ? '#f0f7ff' : 'transparent',
                        padding: '12px',
                        borderRadius: '8px'
                      }}
                    >
                      <List.Item.Meta
                        title={<Space>
                          <Text strong>{address.full_name}</Text>
                          <Text type="secondary">|</Text>
                          <Text>{address.phone}</Text>
                          {address?.is_default ? <Tag color="blue">Mặc định</Tag> : null}
                        </Space>}
                        description={`${address.street}, ${address.ward}, ${address.district}, ${address.city}`}
                      />
                    </List.Item>
                  )}
                />
              )}
              {addresses.length === 0 && (
                <Empty description="Chưa có địa chỉ giao hàng" />
              )}
            </div>
            
            {newAddress ? (
              <>
                <Text strong>Địa chỉ mới:</Text>
                <Divider style={{margin:12}} />
                <div onClick={() => setSelectedAddress(newAddress)} style={{ position: 'relative', cursor: 'pointer', padding: '16px', border: '1px dashed #d9d9d9', backgroundColor: selectedAddress?.isNew? '#f0f7ff' : 'transparent', borderRadius: '8px' }}>
                  <Button 
                    type="text"
                    icon={<CloseOutlined />}
                    style={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => {
                      setNewAddress(null);
                      setSelectedAddress(null);
                    }}
                  />
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Text strong>{newAddress.full_name}</Text>
                      <Text type="secondary">|</Text>
                      <Text>{newAddress.phone}</Text>
                    </Space>
                    <Text>{`${newAddress.street}, ${newAddress.ward}, ${newAddress.district}, ${newAddress.city}`}</Text>
                  </Space>
                </div>
              </>
            ) : (
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={() => {
                  setShowAddressForm(true);
                }}
                style={{ marginTop: 16 }}
              >
                Nhập địa chỉ mới
              </Button>
            )}
          </Card>

          {/* Phần sản phẩm */}
          <Card title="Sản phẩm đã chọn" style={{ marginBottom: 24 }}>
            <List
              dataSource={selectedProductsFromCart}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Image preview={{mask: <div style={{ color: 'white' }}>Xem</div> }} src={item.thumbnail} alt={item.product_name} style={{ width: 80, height: 80, objectFit: 'contain' }} />}
                    title={<Link to={`/product/detail`} state={{productId: item?.product_id}}>{item.product_name}</Link>}
                    description={
                      <Space direction="vertical" size={5}>
                        <Text>Số lượng: {item.quantity}</Text>
                        <Text>Giá bán: <Text type="danger">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.selling_price)}</Text></Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Phương thức vận chuyển */}
          <Card title="Phương thức vận chuyển" style={{ marginBottom: 24 }}>
            <Radio.Group onChange={handleShippingMethodChange} value={shippingMethod}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="standard">
                  <Space>
                    <CarOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                    <Text>Giao hàng tiêu chuẩn</Text>
                    <Tag color="blue">3-5 ngày</Tag>
                    <Text type="secondary">20.000₫</Text>
                  </Space>
                </Radio>
                <Radio value="express">
                  <Space>
                    <ThunderboltOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                    <Text>Giao hàng nhanh</Text>
                    <Tag color="green">1-2 ngày</Tag>
                    <Text type="secondary">35.000₫</Text>
                  </Space>
                </Radio>
                <Radio value="sameday">
                  <Space>
                    <RocketOutlined style={{ fontSize: '16px', color: '#fa8c16' }} />
                    <Text>Giao hàng trong ngày</Text>
                    <Tag color="orange">Trong ngày</Tag>
                    <Text type="secondary">50.000₫</Text>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Card>

          {/* Mã giảm giá */}
          <Card title="Mã giảm giá" style={{ marginBottom: 24 }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="Nhập mã giảm giá" 
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
              />
              <Button type="primary" onClick={handleApplyCoupon}>
                Áp dụng
              </Button>
            </Space.Compact>
          </Card>

          {/* Ghi chú */}
          <Card title="Ghi chú" style={{ marginBottom: 24 }}>
            <Form form={form}>
              <Form.Item name="note">
                <TextArea rows={4} placeholder="Nhập ghi chú cho đơn hàng (nếu có)" />
              </Form.Item>
            </Form>
          </Card>

          {/* Phương thức thanh toán */}
          <Card title="Phương thức thanh toán">
            <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="cod">
                  <Space align="center">
                    <Image src={codIcon} preview={false} width={40} height={40} style={{objectFit: 'contain'}} />
                    <Text>Thanh toán khi nhận hàng</Text>
                    <Tag color="green">COD</Tag>
                  </Space>
                </Radio>
                <Radio value="vnpay">
                  <Space align="center">
                    <Image src={vnpayIcon} preview={false} width={40} height={40} style={{objectFit: 'contain'}} />
                    <Text>Thanh toán qua VNPay</Text>
                    <Tag color="blue">Online</Tag>
                  </Space>
                </Radio>
                {/* <Radio value="momo">
                  <Space align="center">
                    <Image src={momoIcon} preview={false} width={40} height={40} style={{objectFit: 'contain'}} />
                    <Text>Thanh toán qua Momo</Text>
                    <Tag color="blue">Online</Tag>
                  </Space>
                </Radio> */}
              </Space>
            </Radio.Group>
          </Card>
        </Col>

        {/* Tổng quan đơn hàng */}
        <Col xs={24} lg={8}>
          <Card title="Tổng quan đơn hàng" style={{ position: 'sticky',  top: '88px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text>Tạm tính:</Text>
                <Text>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</Text>
              </Row>
              <Row justify="space-between">
                <Text>Phí vận chuyển:</Text>
                <Text>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</Text>
              </Row>
              {appliedCoupon && (
                <Row justify="space-between">
                  <Text>Giảm giá:</Text>
                  <Text>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount)}</Text>
                </Row>
              )}
              <Divider />
              <Row justify="space-between">
                <Text strong>Tổng tiền:</Text>
                <Text strong type="danger" style={{ fontSize: 20 }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                </Text>
              </Row>
              <Button 
                type="primary" 
                size="large" 
                block
                loading={loading}
                onClick={handleSubmit}
              >
                Đặt hàng
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <AddressForm
        visible={showAddressForm}
        onCancel={() => setShowAddressForm(false)}
        onSubmit={ (values) => {
          handleAddressSelect({...values, isNew: true});
          setNewAddress({...values, isNew: true});
          setShowAddressForm(false)
        }}
        provinces={provinces}
        isInCheckout={true}
      />
    </Content>
  );
}

export default Checkout;