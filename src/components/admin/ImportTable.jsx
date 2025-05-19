import { Table, Button, Popconfirm, Flex, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import dayjs from 'dayjs';

const ImportTable = ({ imports, loading, onEdit, onDelete, searchText }) => {

  const columns = [
    {
      title: 'STT',
      dataIndex: 'import_code',
      width: 75,
      align: 'center',
      key: 'import_code',
      sorter: (a, b) => a.import_code - b.import_code,
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
        ),
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
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
        ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
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
        ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
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
        ),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'import_date',
      key: 'import_date',
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
            textToHighlight={text ? dayjs(text).format("YYYY-MM-DD") : ''}
          />
        ) : (
          dayjs(text).format("YYYY-MM-DD")
        ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
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
        ),
    },
    {
      title: 'Tổng sản phẩm nhập',
      dataIndex: 'total_products',
      key: 'total_products',
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
        ),
    },
    {
      title: 'Thao tác',
      align: 'center',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const isWithin24Hours = dayjs().diff(dayjs(record.import_date), 'hour') <= 24;
        return (
          <Flex justify='center' align='center' gap={5}>
            {isWithin24Hours?
                <Tooltip title="Sửa (trong 24h)">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record)}
                  />
                </Tooltip> :
                <Tooltip title="Xem chi tiết">
                    <Button
                      type="primary"
                      onClick={() => onEdit(record, true)}
                      icon={<EyeOutlined />}
                    >
                    </Button>
                </Tooltip>
              }
                <Popconfirm
                  title="Xóa đơn nhập hàng"
                  description="Bạn có chắc chắn muốn xóa đơn nhập hàng này?"
                  onConfirm={() => onDelete(record.import_id, isWithin24Hours)}
                  okText="Có"
                  cancelText="Không"
                  placement="topRight"
                >
                  <Tooltip title="Xóa">
                    <Button danger type="primary" icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
          </Flex>
        );
      },
    },
  ];

  return (
    <Table
      bordered
      scroll={{ x: 1000 }}
      style={{ width: "100%" }}
      columns={columns}
      dataSource={imports}
      loading={loading}
      rowKey="import_id"
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: false,
        pageSize: 5,
        showTotal: () => `Tổng: ${imports?.length || 0} đơn nhập hàng`
      }}
    />
  );
};

export default ImportTable;