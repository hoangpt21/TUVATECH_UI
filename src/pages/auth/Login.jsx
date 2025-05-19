import { Col, Flex, Image, Row, Form, Input, Button, Typography, Alert, Divider } from 'antd'
import { GoogleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import authbg from "../../assets/images/auth_background.jpg"
import logo from "../../assets/images/logo_horizontal.png"
import React, { useEffect, useState } from 'react'
import { EMAIL_RULE_CONFIRM, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '../../utils/validators'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginAccountAPI } from '../../redux/user/accountSlice'
import { useSelector } from 'react-redux'
import { selectCurrentAccount } from '../../redux/user/accountSlice'
import { API_ROOT } from '../../utils/environment'
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
  },
  alert: {maxWidth: 355.58, marginBottom: 16}
}

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const registeredEmail = searchParams.get("registeredEmail");
  const verifiedEmail = searchParams.get("verifiedEmail");
  const currentAccount = useSelector(selectCurrentAccount);
  
  useEffect(() => {
    if(currentAccount) {
      navigate('/', { replace: true })
    }
  }, [currentAccount]);

  const submitLogin = async (values) => {
    const {email, password} = values;
    setLoading(true);
    await dispatch(loginAccountAPI({email, password}));
    setLoading(false);
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
            Đăng nhập
          </Typography.Title>
          <Typography.Text type="secondary" style={styles.subTitle}>
            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
          </Typography.Text>
          { verifiedEmail &&
            <Alert
              message={<Typography.Text>
                Email <Typography.Link>{verifiedEmail}</Typography.Link> của bạn đã được xác minh.<br/>
                Bây giờ bạn có thể đăng nhập để thực hiện mua sắm! Chúc bạn một ngày tốt lành!
              </Typography.Text>}
              type="success"
              showIcon
              style={styles.alert}
            />
          }
          { registeredEmail &&
            <Alert
              message={<Typography.Text>
                Một email đã được gửi đến <Typography.Link>{registeredEmail}</Typography.Link><br/>
                Vui lòng kiểm tra và xác minh tài khoản của bạn trước khi đăng nhập!
              </Typography.Text>}
              type="success"
              showIcon
              style={styles.alert}
            />
          }
          <Form
            name="login"
            style={styles.form}
            onFinish={submitLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: EMAIL_RULE_MESSAGE },
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
              <Flex justify='end' style={{marginBottom: 10}}>
                <Link to="/forgot-password">
                  <Typography.Text type="secondary" style={{margin: 0}}>
                    Quên mật khẩu?
                  </Typography.Text>
                </Link>
              </Flex>
            <Form.Item noStyle>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Đăng nhập
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
                if(API_ROOT === '/') window.location.href = `http://localhost:3000/v1/users/google/auth`;
                else window.location.href = `${API_ROOT}/v1/users/google/auth`;
              }}
            >
              Google
            </Button>
            <Flex justify='center' style={{marginTop: 8}}>
              <Typography.Text type="secondary">
                Chưa có tài khoản? {' '}
                  <Link to="/register">
                    Đăng ký ngay
                  </Link>
              </Typography.Text>
            </Flex>
          </Form>
        </Flex>
      </Col>
    </Row>
  )
}

export default Login
