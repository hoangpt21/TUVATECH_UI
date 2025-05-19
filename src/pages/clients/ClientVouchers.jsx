import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Empty, Pagination, Spin, message, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getActiveCoupons, selectActiveCoupons } from '../../redux/coupon/couponSlice';
import { createUserCoupon } from '../../redux/coupon/userCouponSlice';
import VoucherItem from '../../components/client/VoucherItem';
import banner_voucher from '../../assets/images/banner_coupon.jpg';
import { selectCurrentAccount } from '../../redux/user/accountSlice';
import AuthModal from '../../components/client/AuthModal';
const { Content } = Layout;
const { Title } = Typography;

const styles = {
  banner: {
    width: '100%',
    // height: '500px',
    marginBottom: '24px',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pagination: {
    textAlign: 'center',
    marginTop: '24px'
  }
};

function ClientVouchers() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const currentAccount = useSelector(selectCurrentAccount);
  const pageSize = 10;
  const activeCoupons = useSelector(selectActiveCoupons);

  // Get paginated coupons based on current page
  const getPaginatedCoupons = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return activeCoupons.slice(startIndex, endIndex);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await dispatch(getActiveCoupons({isAll: true}));
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchData();
  }, [dispatch]);

  const handleSaveCoupon = async (couponId) => {
    if (!currentAccount) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await dispatch(createUserCoupon({
      coupon_id: couponId,
    }));
    if (!res.error) {
      message.success('Lưu mã giảm giá thành công!');
    }
  };

  const paginatedCoupons = getPaginatedCoupons();

  return (
    <Content>
      <div style={styles.container}>
        <img 
          src={banner_voucher} 
          alt="Voucher Banner" 
          style={styles.banner}
        />
        <Card
          title={<Title level={4} style={{margin:0}}>Danh sách mã giảm giá</Title>}
        >
          <Spin spinning={loading}>
            {activeCoupons.length > 0 ? (
              <>
                <Row gutter={[16, 16]}>
                  {paginatedCoupons.map(coupon => (
                    <Col xs={24} sm={24} md={12} key={coupon.coupon_id}>
                      <VoucherItem 
                        coupon={coupon}
                        onSave={handleSaveCoupon}
                      />
                    </Col>
                  ))}
                </Row>
                <div style={styles.pagination}>
                  <Pagination
                    current={currentPage}
                    total={activeCoupons.length}
                    pageSize={pageSize}
                    align="center"
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <Empty description="Không có mã giảm giá nào" />
            )}
          </Spin>
        </Card>
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </Content>
  );
}

export default ClientVouchers;