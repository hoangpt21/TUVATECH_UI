import { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import ClientHeader from "../components/client/ClientHeader";
import ClientFooter from "../components/client/ClientFooter";

const ClientLayout = () => {
  return (
    <Layout>
      <ClientHeader/>
      <Layout style={{ 
        flex: '1 0 auto',
        margin: '24px auto',
        padding: '0 16px',
        maxWidth: '1200px',
        width: '100%',
        minHeight: '280px',
      }}>
          <Outlet />
      </Layout>
      <ClientFooter/>
    </Layout>
  );
};

export default ClientLayout;
