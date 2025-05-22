import React from 'react';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const NewsItemSmall = ({ news }) => {
  if (!news) return null;

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <Link to={`/news/detail`} state={{newsId: news.news_id}}>
      <Card
        hoverable
        cover={
            <img
              alt={news.title}
              src={news.thumbnail}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '150px',
              }}
            />
        }
        styles={{body: { padding: 16}}}
        style={{height: '100%'}}
      >
        <Title 
          level={5}
          ellipsis={{ rows: 2}}
          style={{ 
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.4'
          }}
        >
          {news.title}
        </Title>
        <Text type="secondary" style={{ fontSize: '12px', margin:0 }}>
          {formatDate(news.published_date)}
        </Text>
      </Card>
    </Link>
  );
};

export default NewsItemSmall; 