import React, {useState } from "react";
import { Button, Layout, Col, Row, Image, Drawer} from "antd";
import {
  MenuOutlined,
} from "@ant-design/icons";
import logo_brand from "../../assets/images/logo_horizontal.png"
import ClientHeaderAction from "./ClientHeaderAction";
import { Link } from "react-router-dom";
import SuggestSearch from "./SuggestSearch";

const { Header } = Layout;

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    height: '64px',
    padding: '0',
    background: '#fdfdfd',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  row: {
    margin: "auto",
    width: "100%",
    height: '100%',
    maxWidth: "1200px",
  },
  logo: {
    width: '100%',
    height: '50px',
    objectFit: 'contain',
  },
  button: {
    color: '#1a237e',
    fontWeight: 500,
    height: '40px',
    padding: '0 15px',
    '&:hover': {
      color: '#283593',
      backgroundColor: '#f0f2ff',
    },
  },
  menuButton: {
    fontSize: '20px',
    padding: '4px 12px',
    height: '40px',
  },
  drawerBody: {
    padding: '20px',
  }
};

const ClientHeader = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  return (
    <Header style={styles.header}>
      <Row gutter={[16, 16]} align="middle" style={styles.row}>
        <Col xxl={4} xl={4} lg={4} md={7} sm={7} xs={7}>
          <Link to="/">
            <Image
              src={logo_brand}
              preview={false}
              style={styles.logo}
            />
          </Link>
        </Col>

        <Col xxl={8} xl={8} lg={6} md={14} sm={14} xs={14}>
            <SuggestSearch isHeader={true} limit={2}/>
        </Col>

        <Col xxl={12} xl={12} lg={14} md={0} sm={0} xs={0} >
          <ClientHeaderAction />
        </Col>

        <Col xxl={0} xl={0} lg={0} md={3} sm={3} xs={3} >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{...styles.button, ...styles.menuButton}}
          />
        </Col>
      </Row>

      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        style={styles.drawerBody}
      >
        <ClientHeaderAction isMobile={true} />
      </Drawer>
    </Header>
  );
};

export default ClientHeader;
