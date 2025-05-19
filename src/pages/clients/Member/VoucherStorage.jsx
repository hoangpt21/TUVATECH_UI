import React, { useState, useEffect } from 'react';
import { Card, Typography, Empty, Space, Input, Flex, Spin, Pagination, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import VoucherItem from '../../../components/client/VoucherItem';
import { getUserCoupons, selectUserCoupons } from '../../../redux/coupon/userCouponSlice';
import { getCouponById } from '../../../redux/coupon/couponSlice';

const { Title } = Typography;

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  search: {
    marginBottom: '24px',
  },
  voucherList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  pagination: {
    marginTop: '20px',
    textAlign: 'center'
  }
};

function VoucherStorage() {
  const dispatch = useDispatch();
  const userCoupons = useSelector(selectUserCoupons)
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [coupons, setCoupons] = useState([]);
  const pageSize = 5;

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const userCouponsRes = await dispatch(getUserCoupons({isAll: true}));
        if (!userCouponsRes.error) {
          const res = await Promise.all(
            userCouponsRes.payload.map(userCoupon => 
              dispatch(getCouponById({ id: userCoupon.coupon_id }))
            )
          );
          setCoupons(res.filter(item => !item?.error).map(item => item?.payload));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [dispatch]);

  const filterCoupons = () => {
    return coupons.filter(coupon => {
      const matchSearch = !searchText || coupon?.coupon_code.toLowerCase().includes(searchText.toLowerCase());
      return matchSearch;
    });
  };

  const filteredCoupons = filterCoupons();
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Flex vertical style={styles.container}>
      <Card style={styles.card} title={<Title level={4} style={{margin: 0, color: '#1a237e'}}>Kho Voucher</Title>}>
        <Spin spinning={loading}>
          <Input
            placeholder="Tìm kiếm voucher theo mã"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={styles.search}
          />

          <Space direction="vertical" style={styles.voucherList} size="middle">
            {paginatedCoupons.length > 0 ? (
              <>
                <Row gutter={[16, 16]} wrap>
                  {paginatedCoupons.map(coupon => (
                    <Col span={24}key={coupon.coupon_id}>
                      <VoucherItem
                        coupon={coupon}
                        isSaved={true}
                        usedCountOfUser={userCoupons.find(userCoupon => userCoupon.coupon_id === coupon.coupon_id)?.used_count}
                      />
                    </Col>
                  ))}
                </Row>
                <Pagination
                  current={currentPage}
                  total={filteredCoupons.length}
                  pageSize={pageSize}
                  align="center"
                  onChange={handlePageChange}
                  style={styles.pagination}
                />
              </>
            ) : (
              <Empty 
                description={
                  searchText ? "Không tìm thấy voucher phù hợp" : "Chưa có voucher nào"
                }
              />
            )}
          </Space>
        </Spin>
      </Card>
    </Flex>
  );
}

export default VoucherStorage;
