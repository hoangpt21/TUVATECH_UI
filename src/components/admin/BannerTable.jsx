import { Table, Button, Popconfirm, Flex, Switch, Image, message, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useDispatch } from 'react-redux';
import { updateBanner } from '../../redux/banner/bannerSlice';
import dayjs from 'dayjs';

const BannerTable = ({ banners, loading, onEdit, onDelete, searchText }) => {
  const dispatch = useDispatch();

  const handleStatusChange = async (checked, record) => {
    const res = await dispatch(updateBanner({ 
      id: record.banner_id, 
      bannerData: {is_active: checked}
    }));
    if (!res.error) message.success('Cập nhật trạng thái thành công');
};

const columns = [
  {
    title: 'STT',
    dataIndex: 'banner_code',
    key: 'banner_code',
    align: 'center',
    width: 75,
    sorter: (a, b) => a.banner_code - b.banner_code,
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
    title: 'Ảnh banner',
    dataIndex: 'banner_url',
    key: 'banner_url',
    width: 200,
    align: 'center',
    render: (logo) => (
      <Image
        src={logo}
        alt="Logo"
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
      title: 'Tên banner',
      dataIndex: 'banner_name',
      key: 'banner_name',
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
            title="Xóa banner"
            description="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => onDelete(record.banner_id)}
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
      dataSource={banners}
      loading={loading}
      rowKey="banner_id"
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: false,
        pageSize: 5,
        showTotal: () => `Tổng: ${banners.length} thương hiệu`
      }}
    />
  );
};

export default BannerTable;