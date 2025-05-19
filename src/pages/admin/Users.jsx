import { useState, useEffect, useMemo } from 'react';
import { Button, message, Card, Row, Col, Input, Select } from 'antd';
import { FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  listAllUsersAPI,
  selectAllUsers,
  updateUserRoleAPI,
  updateUserStatusAPI,
} from '../../redux/user/usersSlice';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import UsersTable from '../../components/admin/UsersTable';
import UserDetailModal from '../../components/admin/UserDetailModal';
import dayjs from 'dayjs';

const styles = {
  card: {
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  searchInput: {
    width: '100%',
  },
  filterSelect: {
    width: '100%',
  }
};

const Users = () => {
  const dispatch = useDispatch();
  const allUsers = useSelector(selectAllUsers) || [];

  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    setLoading(true);
    dispatch(listAllUsersAPI({isAll: true}))
      .catch(() => message.error('Lỗi khi tải danh sách người dùng'))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user, index) => {
      const searchLower = searchValue.toLowerCase();
      const roleText = user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng';
      const matchesSearch = !searchValue ||
        (user.display_name && user.display_name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.includes(searchLower)) ||
        (('#' + (index+1)).toString().includes(searchLower))||
        (roleText && roleText.toLowerCase().includes(searchLower)) ||
        (user.created_at && dayjs(user.created_at).format('YYYY-MM-DD HH:mm').includes(searchLower));

      const matchesRole = !selectedRole || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [allUsers, searchValue, selectedRole]);

  const showDetailModal = (user) => {
    setSelectedUserForDetail(user);
    setIsDetailModalVisible(true);
  };

  const handleDetailCancel = () => {
    setIsDetailModalVisible(false);
    setSelectedUserForDetail(null);
  };

  const handleToggleStatus = async (user) => {
    setLoading(true);
    try {
      await dispatch(updateUserStatusAPI({...user, is_active: !user.is_active }));
      message.success(`${user.is_active ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
      dispatch(listAllUsersAPI());
    } catch (error) {
      message.error(error.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailUpdate = () => {
    dispatch(listAllUsersAPI());
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleRoleFilterChange = (value) => {
    setSelectedRole(value);
  };

  const handleExport = () => {
    try {
      const dataToExport = filteredUsers.map((user, index) => ({
        user_code: '#'+(index+1),
        user_name: user.user_name,
        email: user.email,
        display_name: user.display_name,
        phone: user.phone,
        gender: user.gender || 'Không xác định',
        role: user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng',
        is_active: user.is_active ? 'Hoạt động' : 'Khóa',
        created_at: user.created_at ? dayjs(user.created_at).format('DD/MM/YYYY HH:mm') : '',
      }));

      const columns = [
        { title: 'STT', dataIndex: 'user_code' },
        { title: 'Avatar', dataIndex: 'avatar_url' },
        { title: 'Tên đăng nhập', dataIndex: 'user_name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Họ tên', dataIndex: 'display_name' },
        { title: 'Điện thoại', dataIndex: 'phone' },
        { title: 'Giới tính', dataIndex: 'gender' },
        { title: 'Vai trò', dataIndex: 'role' },
        { title: 'Trạng thái', dataIndex: 'is_active' },
        { title: 'Ngày tạo', dataIndex: 'created_at' },
      ];

      const formattedData = formatDataForExcel(dataToExport, columns);
      exportToExcel(formattedData, 'danh-sach-nguoi-dung');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
  };

  return (
    <Card 
      title="Quản lý người dùng"
      extra={
        <Button
        color='cyan'
        variant='solid'
        icon={<FileExcelOutlined />}
        onClick={handleExport}
      >
        Xuất Excel
      </Button>
      }
      style={styles.card}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        {/* <Col xs={24} sm={12} md={12} lg={12}>
          <Select
            style={styles.filterSelect}
            allowClear
            placeholder="Lọc theo vai trò"
            onChange={handleRoleFilterChange}
            value={selectedRole}
            options={[
              { value: 'admin', label: 'Quản trị viên' },
              { value: 'client', label: 'Khách hàng' }
            ]}
          />
          </Col> */}
          <Col xs={24} sm={12} md={12} lg={12}>
          <Input
            style={styles.searchInput}
            allowClear
            suffix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Tìm theo tên, email, SĐT, giới tính..."
            onChange={handleSearchChange}
            value={searchValue}
          />
        </Col>
      </Row>

      <UsersTable
        users={filteredUsers.map((user, index) => ({
          ...user,
          user_code: '#'+(index+1)
        }))}
        loading={loading}
        onViewDetails={showDetailModal}
        onToggleStatus={handleToggleStatus}
        searchText={searchValue}
      />

      <UserDetailModal
        visible={isDetailModalVisible}
        user={selectedUserForDetail}
        onClose={handleDetailCancel}
        onUpdate={handleDetailUpdate}
      />
    </Card>
  );
};

export default Users;