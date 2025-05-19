import React from 'react';
import { Typography, Card } from 'antd';
import { useSearchParams } from 'react-router-dom';
import {selectTotalProducts} from '../../redux/product/productSlice';
import ActiveProducts from '../../components/client/ActiveProducts';
import { useSelector } from 'react-redux';

const { Title } = Typography;

const Search = () => {
  const [searchParams] = useSearchParams();
  const totalProducts = useSelector(selectTotalProducts);
  const keyword = searchParams.get('keyword');

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 24 }}>
        Kết quả tìm kiếm cho "{keyword}" ({totalProducts} sản phẩm)
      </Title>
      <ActiveProducts searchKeyword={keyword} />
    </Card>
  );
};

export default Search;