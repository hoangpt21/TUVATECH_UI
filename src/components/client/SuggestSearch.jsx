import React, { useEffect, useRef, useState } from 'react'
import useDebounce from '../../hooks/useDebounce';
import { Button, Card, Flex, Image, Input, List, Space, Typography } from 'antd';
import {
    SearchOutlined,
    RightOutlined,
    PlusOutlined,
  } from "@ant-design/icons";
import { Link, useNavigate } from 'react-router-dom';
import { filterProductsAPI } from '../../apis';
import useClickOutside from '../../hooks/useClickOutside';
const { Text } = Typography;
const styles = {
    searchBox: {
        width: '100%',
        '.antInputSearchButton': {
          background: '#1a237e',
          borderColor: '#1a237e',
        },
        '.antInputSearchButton:hover': {
          background: '#283593',
          borderColor: '#283593',
        },
    },
    searchSuggestions: {
        position: 'absolute',
        top: '120%',
        left: 0,
        right: 0,
        zIndex: 1000,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: 8,
        maxHeight: '400px',
        overflowY: 'auto',
    }
}

const Suggestion = ({children, isHeader, product}) => {
    if(isHeader) return (
        <Link to={`/product/detail`} state={{productId: product.product_id}} onClick={() => setShowSuggestions(false)}>
            {children}
        </Link>
    )
    return children;
}
function SuggestSearch({isHeader = false, limit, onAddProduct, productIds = []}) {
    const navigate = useNavigate(); // Sử dụng useNavigate thay vì useHistory
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const [limitList, setLimitList] = useState(limit);
    const wrapperRef = useRef(null);
    useClickOutside(wrapperRef, () => {
        if(isHeader) setShowSuggestions(false);
    });
    useEffect(() => {
        (async () => {
          if (debouncedSearchValue) {
            const result = await filterProductsAPI({
              sKw: debouncedSearchValue,
              limit: limitList,
              offset: 0,
            })
            setSuggestedProducts(result);
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
            setSuggestedProducts([]); // Reset suggested products
          }
        })()
      }, [debouncedSearchValue, limitList]);

    const handleSearch = (value) => {
        if(!value && !isHeader) {
            setLimitList(limit);
        }
        setSearchValue(value);
    };
    const handleViewAll = (value) => {
        if(!value) {
          setShowSuggestions(false);
          return;
        }
        navigate(`/search?keyword=${encodeURIComponent(searchValue)}`);
        setShowSuggestions(false);
        setSearchValue("");
    };

    return (
        <div ref={wrapperRef} style={{width: '100%', display: "flex", alignItems: "center", position: 'relative'}}>
            <Input
                placeholder="Tìm kiếm sản phẩm..."
                allowClear
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                prefix={<SearchOutlined />}
                style={styles.searchBox}
            />
            {showSuggestions && suggestedProducts.length > 0 && (
                <div>
                    <Card style={styles.searchSuggestions} size="small">
                        <List
                        dataSource={suggestedProducts} // Sử dụng state local thay vì từ Redux
                        renderItem={product => (
                            <List.Item>
                                <Suggestion isHeader={isHeader} product={product}>
                                    <Flex justify='space-between' align='center' wrap gap={5} style={{width: '100%'}}>
                                        <Space align='center' size={5}>
                                            <Image
                                                src={product.thumbnail}
                                                width={50}
                                                height={50}
                                                preview={false}
                                                style={{objectFit:"contain"}}
                                            />
                                            <Space direction="vertical" size={0}>
                                                <Text>{product.product_name}</Text>
                                                <Text type="danger">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.selling_price)}</Text>
                                            </Space>
                                        </Space>
                                        {!isHeader && !productIds.includes(product.product_id) && (
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                onClick={() => onAddProduct(product)}
                                                style={{ marginLeft: 'auto' }}
                                            />
                                        )}
                                    </Flex>
                                </Suggestion>
                            </List.Item>
                        )}
                        footer={
                            <Button
                                type="link"
                                block
                                onClick={() => {
                                    if(isHeader) handleViewAll('btn');
                                    else setLimitList(limitList + 5);
                                }}
                                icon={<RightOutlined />}
                                >
                                {isHeader? "Xem tất cả": "Xem thêm"}
                            </Button>
                        }
                        />
                    </Card>
                </div>
            )}
        </div>
    )
}

export default SuggestSearch
