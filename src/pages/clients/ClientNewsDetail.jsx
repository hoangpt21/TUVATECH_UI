import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Row, Col, Card, Typography, Space, Spin, Tag, Button, message, Flex } from 'antd';
import { CalendarOutlined, UserOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveNews, getNewsById, selectActiveNews, selectNewsDetail, setNewsDetail, updateNews } from '../../redux/news/newsSlice';
import dayjs from 'dayjs';
import DOMPurify from 'dompurify';

const { Content } = Layout;
const { Title, Text } = Typography;

const ClientNewsDetail = () => {
  const { state } = useLocation();
  const newsId = state?.newsId;
  const dispatch = useDispatch();
  const newsDetail = useSelector(selectNewsDetail);
  const activeNews = useSelector(selectActiveNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const existingNews = activeNews.find(n => n.news_id === parseInt(newsId));
      if (!existingNews) {
        await Promise.all([
          activeNews?.length === 0? dispatch(fetchActiveNews({ isAll: true })): Promise.resolve(),
          dispatch(getNewsById({ newsId }))
        ])
      } else {
        if (activeNews?.length === 0) {
          await dispatch(fetchActiveNews({ isAll: true }));
        }
        dispatch(setNewsDetail(existingNews));
      }
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [dispatch, newsId]);

  const trendingNews = useMemo(() =>
    [...activeNews]
      .sort((a, b) => ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (a.dislikes || 0)))
      .slice(0, 5),
    [activeNews]
  );

  const handleReaction = async (type) => {
    if (!newsDetail) return;

    const updatedData = {
      likes: type === 'like' ? (newsDetail.likes || 0) + 1 : newsDetail.likes || 0,
      dislikes: type === 'dislike' ? (newsDetail.dislikes || 0) + 1 : newsDetail.dislikes || 0
    };
    const res = await dispatch(updateNews({ 
      id: newsDetail.news_id, 
      newsData: updatedData 
    }));
    if(!res.error) {
      message.success(`Đã ${type === 'like' ? 'đánh giá hữu ích' : 'đánh giá không hữu ích'}`);
    }
  };

  return (
    <Content style={{ background: '#f5f5f5' }}>
      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card>
              {newsDetail && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Title level={2}>{newsDetail.title}</Title>
                  
                  <Space size="small" style={{ fontSize: '14px', color: '#8c8c8c' }}>
                    <CalendarOutlined />
                    <Text>{dayjs(newsDetail.published_date).format('DD/MM/YYYY')}</Text>
                    <UserOutlined style={{ marginLeft: '8px' }} />
                    <Text>{newsDetail.pseudonym}</Text>
                  </Space>

                  <img
                    src={newsDetail.thumbnail}
                    alt={newsDetail.title}
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />

                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(newsDetail.content)
                    }}
                    style={{ 
                      fontSize: '16px', 
                      lineHeight: '1.8',
                      width: '100%',
                      overflow: 'hidden',
                    }}
                  />

                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Text>Bài viết này có hữu ích không?</Text>
                    <Space>
                      <Button 
                        icon={<LikeOutlined />} 
                        onClick={() => handleReaction('like')}
                      >
                        Hữu ích ({newsDetail.likes || 0})
                      </Button>
                      <Button 
                        icon={<DislikeOutlined />} 
                        onClick={() => handleReaction('dislike')}
                      >
                        Không hữu ích ({newsDetail.dislikes || 0})
                      </Button>
                    </Space>
                  </Space>
                </Space>
              )}
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]} style={{marginTop: 24}}>
          <Col span={24}>
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
                      <Flex key={item.news_id} align="center" gap="small">
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
          </Col>
        </Row>
      </Spin>
    </Content>
  );
};

export default ClientNewsDetail;