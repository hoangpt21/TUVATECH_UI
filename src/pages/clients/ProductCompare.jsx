import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Card, Row, Col, Button, Image, Typography, Table, Spin, message, Layout, Flex } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { fetchProductById, fetchProductAttributesByProductId } from "../../redux/product";

const { Title, Text } = Typography;
const { Content } = Layout;

const ProductCompare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);

  const productIds = location.state?.productIds || [];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin sản phẩm
        const productRes = await Promise.all(
          productIds.map(id => dispatch(fetchProductById({ id })))
        );
        const productList = productRes.map(res => res.payload).filter(Boolean);
        setProducts(productList);

        // Lấy thông số kỹ thuật
        const attrRes = await Promise.all(
          productIds.map(id => dispatch(fetchProductAttributesByProductId({ productId: id, isAll: true })))
        );
        // Chuẩn hóa dữ liệu thuộc tính
        const attrList = attrRes.map(res => res.payload || []);
        // Lấy tất cả tên thuộc tính duy nhất
        const allAttrNames = Array.from(
          new Set(attrList.flat().map(attr => {
            const words = attr.attribute_name.trim()
              .replace(/[^a-zA-ZÀ-ỹ\s]/g, '')
              .split(' ')
              .filter(word => word.length > 0);
            if (words.length > 0) {
              words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
            }
            return words.join(' ');
          }))
        );
        // Tạo bảng thuộc tính cho từng sản phẩm
        const attrTable = allAttrNames.map(attrName => ({
          attribute: attrName,
          values: attrList.map(list => {
            const found = list.find(attr => attr.attribute_name.trim().replace(/[^a-zA-ZÀ-ỹ\s]/g, '').toLowerCase() === attrName.toLowerCase());
            return found ? found.attribute_value : "-";
          })
        }));
        setAttributes(attrTable);
      } catch (err) {
        message.error("Lỗi khi lấy dữ liệu so sánh!");
      }
      setLoading(false);
    };
    if (productIds.length > 1) fetchData();
    else {
        navigate(-1, { replace: true })
        setLoading(false)
    };
  }, [productIds, dispatch]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (products.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Text type="danger">Vui lòng chọn ít nhất 2 sản phẩm để so sánh!</Text>
      </div>
    );
  }

  return (
    <Content>
        <Flex justify="space-between" align="center" style={{ margin: '16px 0' }}>
            <Button 
                onClick={() => navigate(-1)} 
                icon={<ArrowLeftOutlined />}
            >
                Quay lại
            </Button>
            <Title level={2} style={{ margin: 0 }}>
                So sánh sản phẩm
            </Title>
            <div style={{ width: 85 }}></div>
        </Flex>
        <Row gutter={[16,16]} style={{ marginBottom: 32 }}>
            {products.map((prod) => (
            <Col xxl={24 / products.length} xl={24 / products.length} lg={24 / products.length} md={24} sm={24} xs={24} key={prod.product_id} style={{height: 280}}>
              <Card
                hoverable
                style={{ textAlign: "center", height: '100%'}}
                styles={{body:{ padding: 16}}}
              >
                <Image
                  src={prod.thumbnail}
                  width={100}
                  height={100}
                  style={{ objectFit: "contain", marginBottom: 8 }}
                  preview={false}
                />
                <Title level={5} style={{margin:0}} ellipsis={{rows: 2}}>
                    {prod.product_name}
                </Title>
                <div style={{ margin: "8px 0", color: "#ee4d2d", fontSize: 18 }}>
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(prod.selling_price)}
                </div>
                <Button
                    type="primary"
                    onClick={() => navigate("/product/detail", { state: { productId: prod.product_id } })}
                    style={{ marginTop: 8 }}
                >
                    Mua ngay
                </Button>
                </Card>
            </Col>
            ))}
        </Row>
        <Card title="Bảng thông số kỹ thuật" style={{ marginBottom: 32 }}>
            <Table
            bordered
            pagination={false}
            dataSource={attributes}
            scroll={{ x: 1000 }}
            style={{ width: "100%" }}
            rowKey="attribute"
            columns={[
                {
                title: "Thông số",
                dataIndex: "attribute",
                key: "attribute",
                width: 200,
                render: text => <b>{text}</b>
                },
                ...products.map((prod, idx) => ({
                title: prod.product_name,
                dataIndex: ["values", idx],
                key: prod.product_id,
                align: "center"
                }))
            ]}
            />
        </Card>
    </Content>
  );
};

export default ProductCompare;