import React, { useEffect, useRef, useState } from 'react';
import { 
  Form, Input, Button, DatePicker, Radio, 
  Upload, message, Card, Space, Typography, Row, Col, 
  Image, Flex
} from 'antd';
import { 
  UploadOutlined, 
  EditOutlined, 
  SaveOutlined, 
  LockOutlined 
} from '@ant-design/icons';
import { 
  PASSWORD_RULE, 
  PASSWORD_RULE_MESSAGE,
  LIMIT_COMMON_FILE_SIZE,
  ALLOW_COMMON_FILE_TYPES,
  PASSWORD_RULE_CONFIRMATION,
  PHONE_RULE,
  PHONE_RULE_MESSAGE,
  PHONE_RULE_CONFIRM
} from '../../../utils/validators';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentAccount, updateAccountAPI } from '../../../redux/user/accountSlice'
import {uploadFileAPI } from '../../../apis';
const { Title, Text } = Typography;

const styles = {
  container: {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    margin: 0,
    fontWeight: 600,
    color: '#1a237e',
  },
  avatarUpload: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  avatarImage: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #fff',
  },
  uploadButton: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '2px dashed #d9d9d9',
    backgroundColor: '#fafafa',
    transition: 'all 0.3s',
  }
};

function Profile() {
  const currentAccount = useSelector(selectCurrentAccount);
  const dispatch = useDispatch()
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState({btnInfo: false, btnPass: false});
  const [avatar, setAvatar] = useState(null);
  const currentAvatar = useRef(null)
  useEffect(() => {
    if(currentAccount) {
      form.setFieldsValue({
        display_name: currentAccount.display_name,
        user_name: currentAccount.user_name,
        email: currentAccount.email,
        phone: currentAccount.phone,
        gender: currentAccount.gender,
        birthday: currentAccount.birthday && dayjs(currentAccount.birthday)
      })
      if(currentAccount.avatar_url) {
        if(!currentAvatar.current) currentAvatar.current = currentAccount.avatar_url;
        setAvatar({ url: currentAccount.avatar_url });
      }
    }
  }, [currentAccount]);

  //Clean up image banner
  useEffect(() => {
    return () => {
      avatar && URL.revokeObjectURL(avatar.url); 
    }
  }, [avatar])

  const beforeUpload = (file) => {
    if (file.size > LIMIT_COMMON_FILE_SIZE) {
      message.error('Kích thước tệp tối đa đã vượt quá. (10MB)');
      return false;
    }
    setAvatar({
      file,
      url: URL.createObjectURL(file)
    });
    return true;
  }

  const handleProfileUpdate = async (values) => {
    try {
      setLoading({...loading, btnInfo: true});
      //Xử lý ảnh
      let avatar_url = currentAccount.avatar_url;
      if(avatar && avatar.file) {
        const resUrl = await uploadFileAPI(avatar.file, 'users');
        avatar_url = resUrl;
      }
      const profile = {
        ...values,
        birthday:values?.birthday && dayjs(values.birthday).format("YYYY-MM-DD"),
        avatar_url
      }
      const res = await dispatch(updateAccountAPI(profile));
      if(!res.error) {
        message.success("Cập nhật thông tin người dùng thành công!"); 
      }
    } finally {
      setLoading({...loading, btnInfo: false});
    }
    
  };

  const handlePasswordUpdate = async (values) => {
    setEditing({...loading, btnPass: true});
    const {current_password, new_password} = values
    const res = await dispatch(updateAccountAPI({current_password, new_password}));
    if(!res.error) {
      message.success('Đổi mật khẩu thành công');
    }
    passwordForm.resetFields();
    setLoading({...loading, btnPass: false});
  };

  return (
    <Space direction="vertical" size="large" style={styles.container}>
      <Card 
        title={<Title level={4} style={styles.cardTitle}>Thông tin cá nhân</Title>}
        style={styles.card}
      >
        <Row gutter={[24, 24]}>
          <Col xxl={8} xl={8} lg={currentAccount?.role === 'admin'? 24: 8} md={currentAccount?.role === 'admin'? 24: 8} xs={24}>
            <Flex vertical align="center" gap="middle">
              <Upload
                beforeUpload={beforeUpload}
                accept={ALLOW_COMMON_FILE_TYPES}
                disabled={!editing}
                showUploadList={false}
              >
                {avatar ? (
                  <Flex style={styles.avatarUpload}>
                    <Image
                      src={avatar.url}
                      alt="Avatar"
                      preview={false}
                      style={styles.avatarImage}
                    />
                  </Flex>
                ) : (
                  <Flex vertical align="center" justify="center"  style={styles.uploadButton}>
                    <UploadOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                    <Text disabled={!editing}>Tải ảnh đại diện</Text>
                  </Flex>
                )}
              </Upload>
            </Flex>
          </Col>
          
          <Col xxl={16} xl={16} lg={currentAccount?.role === 'admin'? 24: 16} md={currentAccount?.role === 'admin'? 24: 16}  xs={24}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Form.Item
                name="display_name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input disabled={!editing} />
              </Form.Item>

              <Form.Item name="user_name" label="Tên đăng nhập">
                <Input disabled variant='borderless'/>
              </Form.Item>

              <Form.Item name="email" label="Email">
                <Input disabled variant='borderless'/>
              </Form.Item>

              <Form.Item 
                name="phone" 
                label="Số điện thoại"
                rules={[
                  { pattern: PHONE_RULE, message: PHONE_RULE_CONFIRM }
                ]}
              >
                <Input disabled={!editing} maxLength={10}/>
              </Form.Item>

              <Form.Item name="gender" label="Giới tính">
                <Radio.Group disabled={!editing}>
                  <Radio value="Nam">Nam</Radio>
                  <Radio value="Nữ">Nữ</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="birthday" label="Ngày sinh">
                <DatePicker disabled={!editing} style={{ width: '100%' }} placeholder='Ngày sinh'/>
              </Form.Item>

              <Form.Item>
                {!editing ? (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                    
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Space size={12}>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />}
                      htmlType="submit"
                      loading={loading.btnInfo}
                    >
                      Lưu thay đổi
                    </Button>
                    <Button onClick={() => setEditing(false)}>
                      Hủy
                    </Button>
                  </Space>
                )}
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>

      <Card 
        title={<Title level={4} style={styles.cardTitle}>Đổi mật khẩu</Title>}
        style={styles.card}>
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordUpdate}
        >
          <Form.Item
            name="current_password"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }
            ]}
          
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="new_password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { pattern: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
            ]}
            
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới"/>
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Xác nhận mật khẩu mới"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(PASSWORD_RULE_CONFIRMATION));
                },
              }),
            ]}
            
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới"/>
          </Form.Item>

          <Form.Item >
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading.btnPass}
              
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
}

export default Profile;
