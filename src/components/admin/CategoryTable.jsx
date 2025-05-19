import { Table, Button, Popconfirm, Tag, Flex, Switch, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useDispatch } from 'react-redux';
import { updateCategory } from '../../redux/category/categorySlice';
import dayjs from 'dayjs';

const CategoryTable = ({ categories, loading, onEdit, onDelete, searchText }) => {
  const dispatch = useDispatch();

  const handleStatusChange = async (checked, record) => {
    const res = await dispatch(updateCategory({ 
      id: record.category_id, 
      categoryData: {
        is_active: checked,
        updated_at: dayjs().format('YYYY-MM-DD')
      }
    }));
    if(!res.error) message.success('Cập nhật trạng thái thành công');
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'category_code',
      key: 'category_code',
      align: 'center',
      width: 75,
      sorter: (a, b) => a.category_code - b.category_code,
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ?  text.toString() : ''}
          />
        ) : (
          text
        )
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
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
      title: 'Loại danh mục',
      align: 'center',
      dataIndex: 'category_type',
      key: 'category_type',
      width: 150,
      render: (type) => (
        <Tag color={type === 'Sản phẩm' ? 'blue' : 'green'}>
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={type}
          />
        </Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
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
      title: 'Kích hoạt',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      width: 120,
      render: (status, record) => (
        <Switch
          checkedChildren="Kích hoạt" 
          unCheckedChildren="Bị khóa"
          checked={status}
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      )
    },
    {
      title: 'Thao tác',
      align: 'center',
      key: 'action',
      fixed: 'right',
      width: 100,
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
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => onDelete(record.category_id)}
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
      dataSource={categories}
      loading={loading}
      rowKey="category_id"
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: false, // Disable page size changer
        pageSize: 5, 
        showTotal: () => `Tổng: ${categories.length} danh mục`
      }}
    />
  );
};

export default CategoryTable;