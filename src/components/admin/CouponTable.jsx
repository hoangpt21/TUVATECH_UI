import { Table, Button, Tag, Switch, message, Popconfirm, Tooltip, Flex } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { updateCoupon } from '../../redux/coupon/couponSlice';
import Highlighter from 'react-highlight-words';

const CouponTable = ({ coupons, loading, onEdit, onDelete, searchText }) => {
  const dispatch = useDispatch();

  const handleStatusChange = async (checked, record) => {

    const res = await dispatch(updateCoupon({ 
      id: record.coupon_id, 
      couponData: {
        is_active: checked
      }
    }));
    if (!res.error) message.success('Cập nhật trạng thái thành công');
  };

  const renderHighlightText = (text) => {
    return searchText ? (
      <Highlighter
        highlightStyle={{
          backgroundColor: '#ffc069',
          padding: 0,
        }}
        searchWords={[searchText]}
        autoEscape
        textToHighlight={text}
      />
    ) : (
      text
    );
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'coupon_idcode',
      key: 'coupon_idcode',
      align: 'center',
      width: 75,
      sorter: (a, b) => a.coupon_idcode - b.coupon_idcode,
      render: (text) => renderHighlightText(text)
    },
    {
      title: 'Mã giảm giá',
      dataIndex: 'coupon_code',
      key: 'coupon_code',
      align: 'center',
      width: 120,
      render: (text) => renderHighlightText(text)
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount_type',
      key: 'discount_type', 
      align: 'center',
      render: (type) => renderHighlightText(type)
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discount_value',
      key: 'discount_value',
      align: 'center',
      render: (value) => renderHighlightText(value)
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      key: 'start_date',
      align: 'center',
      render: (date) => renderHighlightText(date)
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'end_date',
      key: 'end_date',
      align: 'center',
      render: (date) => renderHighlightText(date)
    },
    {
      title: 'Giới hạn sử dụng',
      dataIndex: 'usage_limit',
      key: 'usage_limit',
      align: 'center',
      render: (value) => renderHighlightText(value)
    },
    {
      title: 'Đã sử dụng',
      dataIndex: 'used_count',
      align: 'center',
      key: 'used_count',
      render: (value) => renderHighlightText(value)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 130,
      render: (status) => {
        const statusMap = {
          'Đang hoạt động': 'green',
          'Hết hạn': 'red',
          'Chờ duyệt': 'blue',
          'Đã lên lịch': 'purple'
        };
        return <Tag color={statusMap[status]}>{renderHighlightText(status)}</Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      align: 'center',
      width: 118,
      key: 'created_at',
      render: (value) => renderHighlightText(value)
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 118,
      align: 'center',
      render: (isActive, record) => (
        <Switch
          checkedChildren="Kích hoạt"
          unCheckedChildren="Bị khóa"
          checked={isActive}
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 105,
      align: 'center',
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
            title="Xóa mã giảm giá"
            description="Bạn có chắc chắn muốn xóa mã giảm giá này?"
            onConfirm={() => onDelete(record.coupon_id)}
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
      dataSource={coupons}
      rowKey="coupon_id"
      loading={loading}
      pagination={{
        position: ['bottomCenter'],
        total: coupons.length,
        pageSize: 5,
        showTotal: (total) => `Tổng số ${total} mã giảm giá`,
      }}
    />
  );
};

export default CouponTable; 