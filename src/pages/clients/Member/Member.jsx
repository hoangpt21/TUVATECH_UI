import React from "react";
import { Layout, theme } from "antd";
import { Outlet } from "react-router-dom";
import MemberSideBar from "../../../components/client/MemberSideBar";

const {Content } = Layout;

const Member = () => {
  window.scrollTo(0, 0);
  const {
    token: { colorBgContainer, borderRadiusLG, boxShadowTertiary },
  } = theme.useToken();
  return (
    <Layout style={{
      padding: '24px 0',
      background: colorBgContainer,
      borderRadius: borderRadiusLG,
      boxShadow: boxShadowTertiary
    }}>
      <MemberSideBar/>
      <Content
        style={{
          padding: '0 24px',
          minHeight: 280,
        }}
      >
        <Outlet/>
      </Content>
    </Layout>
  );
};

export default Member;
