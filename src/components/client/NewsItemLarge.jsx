import React from 'react';
import { Card, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined, MessageOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const NewsItemLarge = ({ news }) => {
  if (!news) return null;

  return (
    <Link to={`/news/detail`} state={{ newsId: news.news_id}} style={{ width: '100%'}}>
      <Card
        hoverable
        style={{ marginBottom: '24px', borderRadius: '8px', overflow: 'hidden' }}
        styles={{ 
          body: { padding: 16 },
        }}
        cover={
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src={news.thumbnail}
              alt={news.title}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
            />
            <div 
              style={{ 
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                backgroundColor: '#4CAF50',
                padding: '8px 12px',
                borderRadius: '4px',
                textAlign: 'center',
                color: 'white',
                lineHeight: '1.2',
                zIndex: 1
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {dayjs(news.published_date).format('DD')}
              </div>
              <div style={{ fontSize: '14px' }}>
                Thg {dayjs(news.published_date).format('M')}
              </div>
              <div style={{ fontSize: '14px' }}>
                {dayjs(news.published_date).format('YYYY')}
              </div>
            </div>
          </div>
        }
      >
          <Title 
            level={3} 
            ellipsis={{ rows: 2 }} 
            style={{ 
              marginTop: 0,
            }}
          >
            {news.title}
          </Title>
          <Space size="middle" style={{ fontSize: '14px', color: '#666666' }}>
            <Space size="small">
              <UserOutlined />
              <Text style={{ color: '#666666' }}>{news.pseudonym}</Text>
            </Space>
            <Space size="small">
              <LikeOutlined />
              <Text style={{ color: '#666666' }}>{news.likes || 0}</Text>
            </Space>
            <Space size="small">
              <DislikeOutlined />
              <Text style={{ color: '#666666' }}>{news.dislikes || 0}</Text>
            </Space>
          </Space>
      </Card>
    </Link>
  );
};

export default NewsItemLarge;