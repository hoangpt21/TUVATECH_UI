import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Row, Col, Input, Card, Typography, Space, Empty, Badge, Flex, Spin, Pagination, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveNews, selectActiveNews } from '../../redux/news/newsSlice';
import { fetchActiveCategoriesByType, selectActiveCategories } from '../../redux/category/categorySlice';
import NewsItemLarge from '../../components/client/NewsItemLarge';
import { Link } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text } = Typography;

const ClientNews = () => {
  const dispatch = useDispatch();
  const news = useSelector(selectActiveNews);
  const categories = useSelector(selectActiveCategories);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchActiveNews({ isAll: true })),
        dispatch(fetchActiveCategoriesByType({ categoryType: 'news', isAll: true }))
      ]);
      setLoading(false);
    };
    window.scrollTo(0, 0);
    fetchData();
  }, [dispatch]);

  // Filter news by keyword and category
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchKeyword = item.title.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchCategory = !selectedCategory || item.category_id === selectedCategory;
      return matchKeyword && matchCategory;
    });
  }, [news, searchKeyword, selectedCategory]);

  // Sắp xếp tin tức theo ngày đăng mới nhất
  const sortedNews = useMemo(() => 
    [...filteredNews].sort((a, b) => 
      new Date(b.published_date) - new Date(a.published_date)
    ), [filteredNews]);

  // Get top 5 trending news based on likes-dislikes difference
  const trendingNews = useMemo(() =>
    [...news]
      .sort((a, b) => ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0)))
      .slice(0, 5),
    [news]
  );

  return (
    <Content>
      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <List
              dataSource={sortedNews}
              locale={{
                emptyText: <Empty description="Không tìm thấy tin tức nào" />
              }}
              pagination={{
                pageSize: 5,
                total: sortedNews.length,
                pageSize: 5,
                style: { marginTop: '24px', textAlign: 'center' }
              }}
              renderItem={item => (
                <List.Item>
                  <NewsItemLarge news={item} />
                </List.Item>
              )}
            />
          </Col>

          <Col xs={24} md={8}>
            <div style={{ position: 'sticky', top: '88px' }}>
              <Input
                placeholder="Tìm kiếm theo tiêu đề..."
                prefix={<SearchOutlined />}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ marginBottom: '24px' }}
              />

              <Card 
                title={<Title level={5} style={{ margin: 0 }}>Danh mục</Title>}
                style={{ marginBottom: '24px' }}
                styles={{ body: { padding: '12px'} }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div
                    onClick={() => setSelectedCategory(null)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: selectedCategory === null ? '#e6f7ff' : 'transparent',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Text>Tất cả</Text>
                    <Badge 
                      count={news.length}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  </div>
                  {categories.map(category => (
                    <div
                      key={category.category_id}
                      onClick={() => setSelectedCategory(selectedCategory === category.category_id ? null : category.category_id)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: selectedCategory === category.category_id ? '#e6f7ff' : 'transparent',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Text>{category.category_name}</Text>
                      <Badge 
                        count={news.filter(item => item.category_id === category.category_id).length}
                        style={{ backgroundColor: '#52c41a' }}
                      />
                    </div>
                  ))}
                </Space>
              </Card>

              <Card 
                title={<Title level={5} style={{ margin: 0 }}>Bài viết nổi bật</Title>}
                styles={{ body:  {padding: '12px'} }}
              >
                <Flex vertical gap="middle" style={{ width: '100%' }}>
                  {trendingNews.map(item => (
                    <Link 
                      key={item.news_id}
                      to={`/news/detail`}
                      state={{ newsId: item.news_id }}
                    >
                      <Flex align="center" gap="small">
                        <img 
                          src={item.thumbnail} 
                          alt={item.title}
                          style={{ 
                            width: 80, 
                            height: 60, 
                            objectFit: 'cover',
                            borderRadius: 4 
                          }} 
                        />
                        <Flex vertical>
                          <Title
                            level={5}
                            ellipsis={{ rows: 2 }}
                            style={{ margin: 0}}
                          >
                            {item.title}
                          </Title>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(item.published_date).toLocaleDateString()}
                          </Text>
                        </Flex>
                      </Flex>
                    </Link>
                  ))}
                </Flex>
              </Card>
            </div>
          </Col>
        </Row>
      </Spin>
    </Content>
  );
};

export default ClientNews;