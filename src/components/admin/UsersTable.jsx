import { EyeOutlined, DeleteOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { Table, Button, Tag, Flex, Popconfirm, Switch, Tooltip, Space, Avatar } from 'antd';
import Highlighter from 'react-highlight-words';
import dayjs from 'dayjs';

const styles = {
  avatar: {
    backgroundColor: '#1890ff'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontWeight: 500,
    color: '#1a1a1a'
  },
  userEmail: {
    color: '#666',
    fontSize: '12px'
  },
  tag: {
    borderRadius: '4px',
    padding: '4px 8px'
  }
};

const UsersTable = ({ users, loading, onViewDetails, onToggleStatus, searchText }) => {
  const columns = [
    {
      title: 'STT',
      dataIndex: 'user_code',
      key: 'user_code',
      width: 75,
      align: 'center',
      render: (text) => (
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
      ),
      sorter: (a, b) => a.user_code - b.user_code,
    },
    {
      title: 'Thông tin',
      key: 'info',
      width: 300,
      align: 'center',
      render: (_, record) => (
        <Flex align="center" gap="small" justify="center">
          <Avatar 
            src={record.avatar_url} 
            size={40}
            style={{ ...styles.avatar, backgroundColor: record.avatar_url ? 'transparent' : styles.avatar.backgroundColor }}
          >
            {record.display_name?.charAt(0)}
          </Avatar>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{record.display_name}</div>
            <div style={styles.userEmail}>{record.email}</div>
          </div>
        </Flex>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center',
      render: (text) => (
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
      ),
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      width: 120,
      render: (is_active, record) => (
        <Tooltip title={is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
          <Switch
            style={{width: 50}}
            checkedChildren={<UnlockOutlined />}
            unCheckedChildren={<LockOutlined />}
            checked={is_active}
            onChange={() => onToggleStatus(record)}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
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
          date ? dayjs(date).format('YYYY-MM-DD HH:mm') : ''
        ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Flex align="center" justify="center">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => onViewDetails(record)}
            />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="user_id"
      loading={loading}
      style={{width: '100%'}}
      pagination={{
        position: ["bottomCenter"],
        showSizeChanger: false,
        pageSize: 10,
        showTotal: (total) => `Tổng: ${total} người dùng`,
      }}
      scroll={{ x: 1200 }}
      bordered
    />
  );
}

export default UsersTable; 