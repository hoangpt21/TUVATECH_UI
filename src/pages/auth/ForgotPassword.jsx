import React, { useState, useRef } from "react";
import { Form, Input, Button, Modal, Typography, message, Layout, Card } from "antd";
import { MailOutlined, LockOutlined, ReloadOutlined } from "@ant-design/icons";
import logo from "../../assets/images/logo_horizontal.png";
import { sendOTPByEmailAPI, resetPasswordByEmail, verifyOTPByEmailAPI } from "../../apis";
import { useNavigate } from "react-router-dom";

const EMAIL_RULE = [
  { required: true, message: "Vui lòng nhập email" },
  { type: "email", message: "Email không hợp lệ" }
];

const PASSWORD_RULE = [
  { required: true, message: "Vui lòng nhập mật khẩu mới" },
  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
];

function ForgotPassword() {
  const navigator = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpResendDisabled, setOtpResendDisabled] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(30);
  const otpResendInterval = useRef(null);

  // Gửi OTP về email
  const handleSendOtp = async (values) => {
    setEmail(values.email);
    setOtpLoading(true);
    await sendOTPByEmailAPI(values.email);
    setOtpLoading(false);
    setOtpModalVisible(true);
    message.success("Đã gửi mã OTP về email!");
  };

  // Xác nhận OTP
  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
        const res = await verifyOTPByEmailAPI(email, otp);
        if(res?.status){
            message.success("Xác thực OTP thành công!");
            setOtpModalVisible(false);
            setStep(2);
      }
    } else {
      message.error("Mã OTP không hợp lệ!");
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    setOtpResendDisabled(true);
    setOtpResendTimer(30);
    await sendOTPByEmailAPI(email);
    message.success("Đã gửi lại mã OTP!");
    handleStartResendTimer();
  };

  // Đếm ngược 30s cho nút gửi lại OTP
  const handleStartResendTimer = () => {
    setOtpResendDisabled(true);
    setOtpResendTimer(30);
    if (otpResendInterval.current) clearInterval(otpResendInterval.current);
    otpResendInterval.current = setInterval(() => {
      setOtpResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(otpResendInterval.current);
          setOtpResendDisabled(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Đổi mật khẩu mới
  const handleChangePassword = async (values) => {
    await resetPasswordByEmail(email, values.password);
    message.success("Đổi mật khẩu thành công!");
    navigator("/login")
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f7f8fa" }}>
      <Layout.Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Card
          style={{
            width: 400,
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: "32px 32px 24px 32px",
          }}
          styles={{ body:{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 0
          }}}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "70%",
              maxWidth: 260,
              objectFit: "contain",
              display: "block"
            }}
          />
          <Typography.Title level={2} style={{ textAlign: "center"}}>
            Quên mật khẩu
          </Typography.Title>
          <Typography.Text type="secondary" style={{ textAlign: "center", marginBottom: 24}}>
            Hãy nhập số email của bạn vào bên dưới để bắt đầu quá trình khôi phục mật khẩu.
          </Typography.Text>
          {step === 1 && (
            <Form layout="vertical" onFinish={handleSendOtp} style={{ width: "100%" }}>
              <Form.Item name="email" rules={EMAIL_RULE}>
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email của bạn"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={otpLoading}
                  size="large"
                  style={{ borderRadius: 8 }}
                >
                  Tiếp tục
                </Button>
              </Form.Item>
            </Form>
          )}

          {step === 2 && (
            <Form layout="vertical" onFinish={handleChangePassword} style={{ width: "100%" }}>
              <Form.Item
                name="password"
                rules={PASSWORD_RULE}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu mới"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              <Form.Item
                name="confirm"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                    }
                  })
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu mới"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large" style={{ borderRadius: 8 }}>
                  Xác nhận
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
        <Modal
          open={otpModalVisible}
          title="Nhập mã OTP"
          onCancel={() => setOtpModalVisible(false)}
          footer={null}
          centered
          styles={{ body: {padding: "24px 32px" }}}
        >
          <Typography.Text>
            Vui lòng kiểm tra email và nhập mã OTP gồm 6 số:
          </Typography.Text>
          <Input
            style={{ margin: "16px 0", borderRadius: 8, fontSize: 18, letterSpacing: 6, textAlign: "center" }}
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Nhập mã OTP"
            size="large"
          />
          <Button
            type="primary"
            block
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6}
            size="large"
            style={{ borderRadius: 8 }}
          >
            Xác nhận
          </Button>
          <Button
            type="link"
            icon={<ReloadOutlined />}
            disabled={otpResendDisabled}
            onClick={handleResendOtp}
            style={{ marginTop: 8 }}
          >
            Nhận OTP mới {otpResendDisabled && `(${otpResendTimer}s)`}
          </Button>
        </Modal>
      </Layout.Content>
    </Layout>
  );
}

export default ForgotPassword;