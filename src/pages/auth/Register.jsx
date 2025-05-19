import { Col, Flex, Image, Row, Form, Input, Button, Typography, Divider } from 'antd';
import { GoogleOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import authbg from "../../assets/images/auth_background.jpg"
import logo from "../../assets/images/logo_horizontal.png"
import React, { useEffect, useState } from 'react'
import { EMAIL_RULE_CONFIRM , PASSWORD_RULE, PASSWORD_RULE_MESSAGE, PASSWORD_RULE_CONFIRMATION } from '../../utils/validators';
import { Link, useNavigate } from 'react-router-dom';
import { registerUserAPI } from '../../apis';
import { API_ROOT } from '../../utils/environment';
import { selectCurrentAccount } from '../../redux/user/accountSlice';
import { useSelector } from 'react-redux';
const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' // Thêm gradient background
  },
  image: {
    height: '100vh',
    width: '100%', 
    objectFit: 'cover', 
    objectPosition: 'center'
  },
  formContainer: {
    width: 'fit-content',
    padding: '30px',
    background: 'rgba(255, 255, 255, 0.5)', // Thêm background màu trắng trong suốt
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)', // Thêm box-shadow mềm
    backdropFilter: 'blur(8px)', // Thêm hiệu ứng blur
    borderRadius: '20px', // Bo tròn góc
    margin: 'auto'
  },
  form:{
    width: '100%', 
    maxWidth: 400,
  },
  logo: {
    width: '220px',
    height: 'auto',
    marginBottom: 10
  }, 
  title: {
    margin: 0, 
    marginBottom: '8px',
  },
  subTitle: {
    marginBottom: '16px', 
    fontSize: 16
  }
}

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const currentAccount = useSelector(selectCurrentAccount);

  useEffect(() => {
    if(currentAccount) {
      navigate('/', { replace: true })
    }
  }, [currentAccount]);
  const submitRegister = async (values) => {
    try {
      const {display_name, email, phone, password} = values;
      setLoading(true);
      await registerUserAPI({display_name, email, phone, password});
      navigate(`/login?registeredEmail=${email}`)
    } finally{
      setLoading(false);
    }
   
  };

  return (
    <Row style={styles.container} align="middle">
      <Col xxl={10} xl={10} lg={12} md={0} sm={0} xs={0}>
        <Image src={authbg} style={styles.image} preview={false}/>
      </Col>
      <Col xxl={14} xl={14} lg={12} md={24} sm={24} xs={24}>
        <Flex style={styles.formContainer}  justify='center' align='center' vertical>
          <Link to="/">
            <Image 
              src={logo}
              preview={false}
              style={styles.logo}
            />
          </Link>
          <Typography.Title level={2} style={styles.title}>
            Đăng ký tài khoản
          </Typography.Title>
          <Typography.Text type="secondary" style={styles.subTitle}>
            Tạo tài khoản để trải nghiệm dịch vụ của chúng tôi
          </Typography.Text>
          <Form
            name="register"
            style={styles.form}
            onFinish={submitRegister}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="display_name"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên'}
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Họ và tên" 
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: EMAIL_RULE_CONFIRM }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Địa chỉ E-mail" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { pattern: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng nhập xác thực mật khẩu' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(PASSWORD_RULE_CONFIRMATION));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu"
              />
            </Form.Item>

            <Form.Item noStyle>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Đăng ký
              </Button>
            </Form.Item>
            <Flex align='center' style={{marginTop: 8}}>
              <Divider style={{flex: 1, margin:'10px 0', fontWeight: 400}} >
                Hoặc
              </Divider>
            </Flex>
            <Button 
              icon={<GoogleOutlined />} 
              block
              style={{
                backgroundColor: '#fff',
                color: '#DB4437',
                border: '1px solid #DB4437',
              }}
              size="large"
              onClick={() => {
                if(API_ROOT === '/') window.location.href = `http://localhost/v1/users/google/auth`;
                else window.location.href = `${API_ROOT}/v1/users/google/auth`;
              }}
            >
              Google
            </Button>
            <Flex justify='center' style={{marginTop: 8}}>
              <Typography.Text type="secondary">
                Đã có tài khoản? {' '}
                <Link to="/login">
                  Đăng nhập ngay
                </Link>
              </Typography.Text>
            </Flex>
          </Form>
        </Flex>
      </Col>
    </Row>
  )
}

export default Register;
