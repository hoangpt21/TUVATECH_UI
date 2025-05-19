import { Table, Button, Popconfirm, Flex, Switch, Image, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useDispatch } from 'react-redux';
import { updateBrand } from '../../redux/brand/brandSlice';
import dayjs from 'dayjs';

const BrandTable = ({ brands, loading, onEdit, onDelete, searchText }) => {
  const dispatch = useDispatch();

  const handleStatusChange = async (checked, record) => {
    const res = await dispatch(updateBrand({ 
      id: record.brand_id, 
      brandData: {
        is_active: checked,
        updated_at: dayjs().format('YYYY-MM-DD')
      }
    }));
    if (!res.error) message.success('Cập nhật trạng thái thành công');
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'brand_code',
      key: 'brand_code',
      align: 'center',
      width: 75,
      sorter: (a, b) => a.brand_code - b.brand_code,
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
      title: 'Logo',
      dataIndex: 'logo_url',
      key: 'logo_url',
      width: 100,
      align: 'center',
      render: (logo) => (
        <Image
          src={logo}
          alt="Logo"
          width={50}
          height={50}
          style={{ 
            objectFit: 'contain',
            border: '1px solid #f0f0f0',
            borderRadius: '4px'
          }}
          preview={{
            mask: <div style={{ color: 'white' }}>Xem</div>
          }} 
        />
      ),
    },
    {
      title: 'Tên thương hiệu',
      dataIndex: 'brand_name',
      key: 'brand_name',
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
      render: (text) =>
        searchText ? (
          <Highlighter
            highlightStyle={{
              backgroundColor: '#ffc069',
              padding: 0,
            }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? dayjs(text).format("YYYY-MM-DD") : ''}
          />
        ) : (
          dayjs(text).format("YYYY-MM-DD")
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
      width: 105,
      fixed: 'right',
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
            title="Xóa thương hiệu"
            description="Bạn có chắc chắn muốn xóa thương hiệu này?"
            onConfirm={() => onDelete(record.brand_id)}
            okText="Có"
            cancelText="Không"
            placement="topRight"
          >
            <Tooltip title="Xóa">
              <Button danger type="primary" icon={<DeleteOutlined />} />
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
      dataSource={brands}
      loading={loading}
      rowKey="brand_id"
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: false,
        pageSize: 5,
        showTotal: () => `Tổng: ${brands.length} thương hiệu`
      }}
    />
  );
};

export default BrandTable;