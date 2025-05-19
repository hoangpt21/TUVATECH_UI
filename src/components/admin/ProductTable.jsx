import { Table, Button, Popconfirm, Switch, message, Tooltip, Flex, Image, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useDispatch } from 'react-redux';
import { updateProduct } from '../../redux/product/productSlice';
import dayjs from 'dayjs';

const ProductTable = ({ products, loading, onEdit, onDelete, searchText }) => {
  const dispatch = useDispatch();

  const handleStatusChange = async (checked, record) => {
    const res = await dispatch(updateProduct({ 
      id: record.product_id, 
      productData: {
        is_active: checked,
        updated_at: dayjs().format('YYYY-MM-DD')
      }
    }));
    if(!res.error) message.success('Cập nhật trạng thái thành công');
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'product_code',
      align: 'center',
      width: 75,
      key: 'product_code',
      sorter: (a, b) => a.product_code - b.product_code,
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
      title: 'Hình ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 130,
      align: 'center',
      render: (text) => <Image 
        src={text} 
        width={60} 
        preview={{
          mask: <div style={{ color: 'white' }}>Xem</div>
        }}
      />
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
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
    }, {
      title: 'Giá sản phẩm (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (text, record) =>
        searchText ? (record.selling_price == text ? 
            <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />: <Space direction="vertical" size={0} style={{maxWidth: '100%'}}>
            <span style={{ textDecoration: 'line-through', color: 'rgba(0,0,0,0.4)' }}>
              <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffc069',
                  padding: 0,
                }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
              />
            </span> 
            <span>
              <Highlighter
                  highlightStyle={{
                    backgroundColor: '#ffc069',
                    padding: 0,
                  }}
                  searchWords={[searchText]}
                  autoEscape
                  textToHighlight={record.selling_price ? record.selling_price.toString() : ''}
                />
            </span>
          </Space>
        ) : ( record.selling_price == text?
          text:
          <Space direction="vertical" size={0} style={{maxWidth: '100%'}}>
            <span style={{ textDecoration: 'line-through', color: 'rgba(0,0,0,0.4)' }}> {text}</span>
            <span>{record.selling_price}</span>
          </Space>
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
      title: 'Thương hiệu',
      dataIndex: 'brand_name',
      key: 'brand_name',
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
      title: 'Số lượng',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
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
            textToHighlight={text?.toString()}
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
      width: 105,
      render: (_, record) => (
        <Flex justify='center' align='center' gap={5}>
          <Tooltip title="Sửa">
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => onDelete(record.product_id)}
            placement="topRight"
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button color='danger' variant='solid' icon={<DeleteOutlined />} />
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
      dataSource={products}
      loading={loading}
      rowKey="product_id"
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: false,
        pageSize: 5,
        showTotal: () => `Tổng: ${products.length} sản phẩm`
      }}
    />
  );
};

export default ProductTable; 