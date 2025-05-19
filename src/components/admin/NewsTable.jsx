import { Table, Button, Tooltip, Popconfirm, Flex, Switch, message } from 'antd';
import { EditOutlined, DeleteOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { updateNews } from '../../redux/news/newsSlice';
import dayjs from 'dayjs';
import Highlighter from 'react-highlight-words';

const NewsTable = ({ news, loading, onEdit, onDelete, searchText }) => {
  const dispatch = useDispatch();

  const handleStatusChange = async (checked, record) => {
    const res = await dispatch(updateNews({ 
      id: record.news_id, 
      newsData: {
        status: checked ? 'published' : 'archived',
        published_date: checked ? dayjs().format('YYYY-MM-DD') : null,
      }
    }));
    if (!res.error) message.success('Cập nhật trạng thái thành công');
  };
  
  const columns = [
    {
      title: 'STT',
      dataIndex: 'news_code',
      key: 'news_code', 
      align: 'center',
      width: 75,
      sorter: (a, b) => a.news_code - b.news_code,
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        )
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
      width: 200,
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        )
    },
    {
      title: 'Bút danh',
      dataIndex: 'pseudonym',
      key: 'pseudonym',
      align: 'center',
      width: 120,
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        )
    },
    {
      title: 'Tương tác',
      dataIndex: 'interactions',
      key: 'interactions',
      align: 'center',
      width: 120,
      render: (_, record) => {
        const content = (
          <Flex vertical align="center" gap={8}>
            <Flex align="center" gap={4}>
              <LikeOutlined />
              {record.likes || 0}
            </Flex>
            <Flex align="center" gap={4}>
              <DislikeOutlined />
              {record.dislikes || 0}
            </Flex>
          </Flex>
        );
        return searchText ? (
          <Flex vertical align="center" gap={8}>
            <Flex align="center" gap={4}>
              <LikeOutlined />
              <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0,
                }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={(record.likes || 0).toString()}
              />
            </Flex>
            <Flex align="center" gap={4}>
              <DislikeOutlined />
              <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0,
                }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={(record.dislikes || 0).toString()}
              />
            </Flex>
          </Flex>
        ) : (
          content
        );
      }
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'published_date',
      key: 'published_date',
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status, record) => (
        <Switch
          checkedChildren="Đã đăng" 
          unCheckedChildren="Lưu trữ"
          checked={status === 'Đã đăng'}
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      )
    },
    {
      title: 'Thao tác',
      align: 'center',
      key: 'action',
      width: 105,
      fixed: 'right',
      render: (_, record) => (
        <Flex justify='center' align='center' gap={5}>
        <Tooltip title="Sửa">
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
          </Button>
        </Tooltip>
        <Popconfirm
          title="Xóa tin tức"
          description="Bạn có chắc chắn muốn xóa tin tức này?"
          onConfirm={() => onDelete(record.news_id)}
          okText="Có"
          cancelText="Không"
          placement="topRight"
        >
          <Tooltip title="Xóa">
            <Button color='red' variant='solid' icon={<DeleteOutlined />}>
            </Button>
          </Tooltip>
        </Popconfirm>
      </Flex>
      ),
    },
  ];

  return (
    <Table
      bordered
      scroll={{ x: 1000 }}
      style={{ width: "100%" }}
      columns={columns}
      dataSource={news}
      rowKey="news_id"
      loading={loading}
      pagination={{
        position: ['bottomCenter'],
        total: news.length,
        pageSize: 5,
        showTotal: (total) => `Tổng số ${total} tin tức`,
      }}
    />
  );
};

export default NewsTable; 