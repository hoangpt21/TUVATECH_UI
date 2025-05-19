import { useState, useEffect, useRef } from 'react';
import { Button, Modal, message, Space, Form, Card, Row, Col, Input, Select } from 'antd';
import { PlusOutlined, FileExcelOutlined, SearchOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveCategories } from '../../redux/category/categorySlice';
import { selectActiveBrands } from '../../redux/brand/brandSlice';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';
import ProductTable from '../../components/admin/ProductTable';
import ProductForm from '../../components/admin/ProductForm';
import { selectProductImages, fetchProductImages, createImage, deleteImage } from '../../redux/image/imageSlice';
import { 
  selectProducts,
  selectProductAttributes,
  fetchAllProducts,
  fetchAllAttributes,
  createProduct, 
  createProductAttribute,
  updateProduct,
  deleteProduct,
  deleteProductAttributesByProductId,
} from '../../redux/product';
import { fetchActiveCategoriesByType } from '../../redux/category/categorySlice';
import { getActiveBrands } from '../../redux/brand/brandSlice';
import { uploadFileAPI } from '../../apis';
import dayjs from 'dayjs';

const styles = {
  card: {
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  searchInput: {
    width: '100%'
  }
};

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const productAttributes = useSelector(selectProductAttributes);
  const productImages = useSelector(selectProductImages);
  const categories = useSelector(selectActiveCategories);
  const brands = useSelector(selectActiveBrands);
  const [productDetails, setProductDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const originalProducts = useRef([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchAllProducts({isAll: true})),
        dispatch(fetchAllAttributes({isAll: true})),
        dispatch(fetchProductImages({isAll: true, productId: true})),
        dispatch(fetchActiveCategoriesByType({categoryType: 'product', isAll: true})),
        dispatch(getActiveBrands({isAll: true}))
      ]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    originalProducts.current = products.map((product, index) => ({
      product_id: product.product_id,
      product_code: '#' + ((index+1)),
      thumbnail: product.thumbnail,
      product_name: product.product_name,
      price: product.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : '-',
      selling_price: product.selling_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.selling_price) : '-',
      is_active: product.is_active,
      brand_name: brands.find(brand => brand.brand_id === product.brand_id)?.brand_name,
      category_name: categories.find(category => category.is_active && category.category_id === product.category_id)?.category_name || 'Danh mục không tồn tại',
      created_at: product.created_at ? dayjs(product.created_at).format('YYYY-MM-DD') : '-',
      stock_quantity: product.stock_quantity,
    }));
    setFilteredProducts(originalProducts.current);
  }, [products, brands, categories, productImages, productAttributes]);

  useEffect(() => {
    (() => {
      let productInfos = [];
      for (const product of products) {
        let images = productImages.filter(image => image.product_id === product.product_id).map(image => ({
          image_id: image.image_id,
          uid: `-${image.image_id}`,
          name: `image-${image.image_id}.png`,
          status: 'done',
          url: image.image_url
        }));
        productInfos.push({
          ...product,
          images,
          attributes: productAttributes.filter(attribute => attribute.product_id === product.product_id)
        })
      }
      setProductDetails(productInfos);
    })();
  }, [products, productImages, productAttributes]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.product_id);
    setIsEditing(true);
    form.setFieldsValue(productDetails.find(product => product.product_id === record.product_id));
    setModalVisible(true);
  };
  
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      // 3. Xóa sản phẩm chính
      const productRes = await dispatch(deleteProduct(id));
      if(!productRes.error) message.success('Xóa sản phẩm thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
    setLoading(true);
    if (editingId) {
      // Cập nhật sản phẩm
      const productToUpdate = productDetails.find(p => p.product_id === editingId);
      const productData = {
        product_name: values.product_name,
        description: values.description, 
        category_id: values.category_id,
        brand_id: values.brand_id,
        price: values.price,
        selling_price: values.selling_price,
      };

      // Xử lý thumbnail và ảnh sản phẩm song song
      const promises = [];

      // Kiểm tra và cập nhật thumbnail
      if (values.images?.length > 0) {
        const firstImage = values.images[0];
        if (firstImage?.originFileObj) {
          promises.push(
            uploadFileAPI(firstImage.originFileObj, 'products')
              .then(thumbnailUrl => {
                productData.thumbnail = thumbnailUrl;
              })
          );
        } else if (firstImage?.url !== productToUpdate.images?.[0]?.url) {
          productData.thumbnail = firstImage.url;
        }
      }

      // Cập nhật thông tin sản phẩm sau khi có thumbnail
      promises.push(
        Promise.resolve()
          .then(async () => {
            const productRes = await dispatch(updateProduct({
              id: editingId,
              productData
            }));
            if (!productRes.error) {
              message.success('Cập nhật sản phẩm thành công');
            }
            return productRes;
          })
      );

      // Cập nhật attributes nếu có
      if (values.attributes?.length > 0) {
        promises.push(
          dispatch(deleteProductAttributesByProductId(editingId))
            .then(() => {
              return Promise.all(
                values.attributes.map(attr =>
                  dispatch(createProductAttribute({
                    product_id: editingId,
                    attribute_name: attr.attribute_name,
                    attribute_value: attr.attribute_value
                  }))
                )
              );
            })
        );
      }

      // Xử lý cập nhật ảnh sản phẩm
      if (values.images?.length > 0) {
        const oldImages = productToUpdate.images || [];
        const currentImages = values.images || [];

        // Xóa ảnh cũ không còn sử dụng
        const imagesToDelete = oldImages.filter(img =>
          !currentImages.some(curImg => curImg?.url === img.url)
        );

        if (imagesToDelete.length > 0) {
          promises.push(
            Promise.all(
              imagesToDelete.map(img => dispatch(deleteImage(img.image_id)))
            )
          );
        }

        // Upload và tạo ảnh mới
        const newImages = currentImages.filter(img => img?.originFileObj);
        if (newImages.length > 0) {
          promises.push(
            Promise.all(newImages.map(img => uploadFileAPI(img.originFileObj, 'products')))
              .then(imageUrls => {
                return Promise.all(
                  imageUrls.map(url =>
                    dispatch(createImage({
                      product_id: editingId,
                      image_url: url
                    }))
                  )
                );
              })
          );
        }
      }

      // Chờ tất cả các thao tác hoàn thành
      await Promise.all(promises);

    } else {
      try {
        // 1. Tạo sản phẩm chính và xử lý ảnh
        let thumbnail = '';
        let imageUrls = [];
        // Upload tất cả ảnh trước nếu có
        if (values.images?.length > 0) {
          imageUrls = await Promise.all(
            values.images.map(img => uploadFileAPI(img.originFileObj, 'products'))
          );
          // Lấy ảnh đầu tiên làm thumbnail
          thumbnail = imageUrls[0];
        }

        // Tạo sản phẩm với thumbnail
        const productRes = await dispatch(createProduct({
          product_name: values.product_name,
          description: values.description, 
          category_id: values.category_id,
          brand_id: values.brand_id,
          price: values.price,
          selling_price: values.selling_price,
          thumbnail: thumbnail
        }));

        const newProductId = productRes.payload.product_id;
        const promises = [];

        // 2. Tạo attributes nếu có
        if (values.attributes?.length > 0) {
          const attributePromises = values.attributes.map(attr => 
            dispatch(createProductAttribute({
              product_id: newProductId,
              attribute_name: attr.attribute_name,
              attribute_value: attr.attribute_value
            }))
          );
          promises.push(Promise.all(attributePromises));
        }

        // 3. Tạo các bản ghi ảnh cho sản phẩm
        if (imageUrls.length > 0) {
          const imagePromises = imageUrls.map(url =>
            dispatch(createImage({
              product_id: newProductId,
              image_url: url
            }))
          );
          promises.push(Promise.all(imagePromises));
        }

        // Chờ tất cả hoàn thành
        await Promise.all(promises);
        message.success('Thêm sản phẩm thành công');

      } catch (error) {
        message.error('Lỗi khi tạo sản phẩm: ' + error.message);
      }
    }
    } catch (error) {
      message.error('Đã có lỗi xảy ra: ' + error.message);
    } finally {
      setHasDiscount(false)
      setModalVisible(false);
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const columns = [
        { title: 'STT', dataIndex: 'product_code' },
        { title: 'Ảnh', dataIndex: 'thumbnail' },
        { title: 'Tên sản phẩm', dataIndex: 'product_name' },
        { title: 'Danh mục', dataIndex: 'category_name' },
        { title: 'Thương hiệu', dataIndex: 'brand_name' },
        { title: 'Số lượng', dataIndex: 'stock_quantity' },
        { title: 'Giá', dataIndex: 'price' },
        { title: 'Giá bán', dataIndex: 'selling_price' },
        { title: 'Trạng thái', dataIndex: 'is_active' },
        { title: 'Ngày tạo', dataIndex: 'created_at' },
      ];
      const formattedData = formatDataForExcel(filteredProducts, columns);
      exportToExcel(formattedData, 'danh-sach-san-pham');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    let filtered = originalProducts.current;
    if (selectedCategory) {
      filtered = filtered.filter(product => selectedCategory === product.category_name);
    }
    if (value) {
      filtered = filtered.filter((product) => 
        Object.keys(product).some((key) => 
          (key !== 'product_id' && key !== 'thumbnail' && key !== 'is_active' && key !== 'action') && product[key] && String(product[key]).toLowerCase().includes(value.toLowerCase())
        )
      );
    }
    setSearchValue(value);
    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (value) => {
    let filtered = originalProducts.current;
    if (value) {
      filtered = filtered.filter(product => product.category_name === value);
    }
    if (searchValue) {
      filtered = filtered.filter((product) => 
        Object.keys(product).some((key) => 
          (key !== 'product_id' && key !== 'thumbnail' && key !== 'is_active' && key !== 'action') && product[key] && String(product[key]).toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
    setSelectedCategory(value);
    setFilteredProducts(filtered);
  };

  const extra = (
    <Space>
      <Button 
        type="primary" 
        icon={<PlusOutlined />}
        onClick={handleAdd}
        disabled={loading}
      >
        Thêm mới
      </Button>
      <Button 
        color='cyan'
        variant='solid'
        icon={<FileExcelOutlined />}
        onClick={handleExport}
        disabled={loading}
      >
        Xuất Excel
      </Button>
    </Space>
  );

  return (
    <Card 
      style={styles.card}
      title="Quản lý sản phẩm" 
      extra={extra}
      loading={loading}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24}>
          <Select
            style={styles.searchInput}
            allowClear
            placeholder="Chọn danh mục"
            onChange={handleCategoryChange}
            options={categories.filter(category => category.is_active).map(category => ({
              value: category.category_name,
              label: category.category_name
            }))}
          />
        </Col>
        <Col xxl={12} xl={12} lg={12} md={24} sm={24} xs={24}>
          <Input
            style={styles.searchInput}
            allowClear
            suffix={<SearchOutlined />}
            placeholder="Nhập từ khóa tìm kiếm"
            onChange={handleSearch}
            value={searchValue}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <ProductTable
            products={filteredProducts}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchText={searchValue}
          />
        </Col>
      </Row>

      <Modal
        title={editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        open={modalVisible}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{icon: <SaveOutlined />}}
        cancelButtonProps={{icon: <CloseOutlined />}}
        onOk={form.submit}
        onCancel={() => {
          setModalVisible(false);
          setIsEditing(false);
          setHasDiscount(false)
          form.resetFields();
        }}
        width={{
          xs: '90%',
          sm: '80%',
          md: '80%',
          lg: '80%',
          xl: '80%',
          xxl: '80%',
        }}
        centered
        styles={{body: {overflow: "hidden", height: 500}}}
        maskClosable={false}
        confirmLoading={loading}
      >
          <ProductForm
            form={form}
            onFinish={handleSubmit}
            categories={categories.filter(category => category.is_active)}
            brands={brands}
            isEditing={isEditing}
            useStateHasDiscount={() => [hasDiscount, setHasDiscount]}
          />
      </Modal>
    </Card>
  );
};

export default Products;