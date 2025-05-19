import { Table, Space, Button, Tag, Tooltip, Rate } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import dayjs from 'dayjs'; // Import dayjs for date formatting

const ReviewsTable = ({ reviews, loading, onViewDetail, searchText }) => {
  // Data is now enriched in the parent component (Reviews.jsx)
  const columns = [
    {
      title: 'STT',
      dataIndex: 'review_code', // Corrected: Use 'id' for review ID
      key: 'review_code',
      sorter: (a, b) => a.review_code - b.review_code,
      width: 75,
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
      title: 'Sản phẩm', // Changed title back
      dataIndex: 'product_name', // Use enriched data field
      key: 'product_name', // Use enriched data field
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
      title: 'Khách hàng', // Changed title back
      dataIndex: 'display_name', // Use enriched data field
      key: 'display_name', // Use enriched data field
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
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      align: 'center',
      render: (rating) => <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />, // Adjust size
    },
    {
      title: 'Trạng thái',
      dataIndex: 'moderation_status',
      key: 'moderation_status',
      align: 'center',
      render: (status) => {
        const statusMap = {
          pending: { color: 'gold', text: 'Chờ duyệt' }, // Changed color for better visibility
          approved: { color: 'green', text: 'Đã duyệt' }, // Changed color
          rejected: { color: 'red', text: 'Đã từ chối' } // Changed color
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status || '-' };
        return <Tag color={color}> {searchText ? (
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
        )}
        </Tag>
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={date ? dayjs(date).format('YYYY-MM-DD HH:mm') : ''}
          />
        ) : (
          date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
        ),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      fixed: 'right', // Fix action column to the right
      width: 100, // Set width for action column
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)} // Call onView with the full order record
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={reviews} // This now contains enriched data
      rowKey="review_id" // Ensure rowKey uses the correct review ID field 'id'
      loading={loading}
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: false,
        pageSize: 5,
        showTotal: (total) => `Tổng: ${total} đánh giá`, // Improved total display
      }}
      scroll={{ x: 1000 }} // Enable horizontal scroll if content overflows
    />
  );
};

export default ReviewsTable; 