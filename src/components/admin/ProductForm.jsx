import { Form, Input, Select, InputNumber, Upload, Button, Space, Tabs, Card, Divider, Image, message, Flex, Typography, Switch } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '../../utils/validators';
import MyEditor from './MyEditor';

const { Option } = Select;
const { Text } = Typography;

const ProductForm = ({ form, onFinish, categories, brands, isEditing, useStateHasDiscount }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [hasDiscount, setHasDiscount] = useStateHasDiscount();
  const [discountType, setDiscountType] = useState(null);

  useEffect(() => {
    if (form?.getFieldValue("images") && form?.getFieldValue("images").length > 0) {
      const images = form.getFieldValue("images");
      setFileList(images);
      setPreviewImage(images[0].url);
    } else {
      setFileList([]);
      setPreviewImage('');
    }
  }, [form?.getFieldValue("images")?.length]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const calculateSalePrice = (price, discountType, discountValue) => {
    if (!discountValue || !price) return price;
  
    if (discountType === "percent") {
      return Math.round(Math.max(price - (price * discountValue) / 100, 0));
    }
  
    if (discountType === "fixed") {
      return Math.round(Math.max(price - discountValue, 0));
    }
  
    return price;
  };
  

  const beforeUpload = (file) => {
    if (file.size > LIMIT_COMMON_FILE_SIZE) {
      message.error('Kích thước tệp tối đa đã vượt quá. (10MB)');
      return false;
    }
    return true;
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = async (info) => {
    const { file, fileList } = info;
    const isRemoved = file.status === 'removed';

    if (isRemoved) {
      const newFileList = fileList.filter(f => f.uid !== file.uid);
      setFileList(newFileList);
      setPreviewImage(newFileList.length > 0 ? (newFileList[0].url || newFileList[0].preview) : '');
      return;
    }

    const latestFile = fileList[fileList.length - 1];

    try {
      const preview = URL.createObjectURL(latestFile.originFileObj);
      setPreviewImage(preview);
      setFileList(fileList.map(f => ({
        ...f,
        status: 'done',
        url: f.uid === latestFile.uid ? preview : f.url
      })));
    } catch (error) {
      message.error('Lỗi khi tải ảnh lên');
    }
  };

  useEffect(() => {
    return () => {
      if (previewImage && !previewImage.startsWith('http')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleImageUpload = async (blobInfo, progress) => {
    try {
      const file = blobInfo.blob();
      const result = await uploadFileAPI(file, 'products');
      return result;
    } catch (error) {
      message.error('Lỗi khi tải ảnh lên');
      return '';
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const items = [
    {
      key: '1',
      label: 'Thông tin cơ bản',
      forceRender: true,
      children: (
        <div style={{ overflowY: 'auto', height: '450px'}}>
          <Form.Item
            name="product_name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="Tên sản phẩm" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá cố định (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Giá (VNĐ)"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={0}
            />
          </Form.Item>
          <Form.Item layout="horizontal" label='Giảm giá'>
            <Switch checked={hasDiscount} onChange={(value) =>{
              if (!value) form.setFieldsValue({
                selling_price: form.getFieldValue('price'),
              });
              setHasDiscount(value)
            }} />
          </Form.Item>

          {hasDiscount && (
            <Space style={{width: '100%'}} size={10} styles={{item:{width: '50%'}}}>
              <Form.Item label='Loại giảm giá'>
                <Select
                  placeholder="Chọn loại giảm giá"
                  popupMatchSelectWidth={false}
                  onChange={(value) => {
                    form.setFieldsValue({
                      selling_price: form.getFieldValue('price'),
                    });
                    form.resetFields(['discountValue'])
                    setDiscountType(value)
                  }}
                  style={{ width: '100%' }}
                >
                  <Option value="percent">Phần trăm</Option>
                  <Option value="fixed">Cố định</Option>
                </Select>
              </Form.Item>

              {discountType === "percent" && (
                <Form.Item
                  label="Giảm (%)"
                  name="discountValue"
                  rules={[
                    { required: true, message: "Nhập phần trăm giảm" },
                    {
                      type: "number",
                      min: 1,
                      max: 100,
                      message: "Chỉ cho phép từ 1% đến 100%",
                    },
                  ]}
                >
                  <InputNumber
                    style={{width: '100%'}}
                    min={1}
                    max={100}
                    formatter={(value) => `${value? value: ''}%`}
                    parser={(value) => value.replace('%', '')}
                  />
                </Form.Item>
              )}

              {discountType === "fixed" && (
                <Form.Item
                  label="Giảm (VNĐ)"
                  name="discountValue"
                  rules={[
                    { required: true, message: "Nhập số tiền giảm" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (value >= getFieldValue('price')) {
                          return Promise.reject(new Error('Giá khuyến mãi phải nhỏ hơn giá sản phẩm'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    style={{width: '100%'}}
                    min={1000}
                    step={1000}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "₫"
                    }
                    parser={(value) => value.replace(/[₫,\s]/g, "")}
                  />
                </Form.Item>
              )}
            </Space>
          )}
          <Form.Item
            label="Giá bán (VNĐ)"
            name="selling_price"
            layout='horizontal'
          >
            <InputNumber
              disabled
              variant="borderless"
              precision={2}
              style={{ width: '100%', color: 'black' }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "₫"
              }
              parser={(value) => value.replace(/[₫,\s]/g, "")}
            />
          </Form.Item>
          {(() => {
            const shouldShowStock = isEditing && form.getFieldValue('stock_quantity') >= 0;
            return shouldShowStock && (
              <Form.Item
                style={{ flex: 1 }}
                name='stock_quantity'
                layout='horizontal'
                label='Số lượng tồn'
              >
                <InputNumber
                  disabled={isEditing} // Keep disabled for existing items as per original logic
                  variant="borderless"
                  style={{ width: '100%', color: 'black' }}
                  min={0}
                />
              </Form.Item>
            );
          })()}
          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select popupMatchSelectWidth={false} placeholder="Chọn danh mục">
              {categories.map(category => (
                <Option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="brand_id"
            label="Thương hiệu"
            rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
          >
            <Select popupMatchSelectWidth={false} placeholder="Chọn thương hiệu">
              {brands.map(brand => (
                <Option key={brand.brand_id} value={brand.brand_id}>
                  {brand.brand_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            getValueFromEvent= {(e) => {
              return e?.target?.contentDocument?.body?.innerHTML; 
            }}
          >
            <MyEditor
              value={form.getFieldValue('description')}
              onChange={(value) => {
                form.setFieldsValue({
                  description: value,
                });
              }}
            />
          </Form.Item>
        </div>
      )
    },
    {
      key: '2',
      label: 'Hình ảnh sản phẩm',
      forceRender: true,
      children: (
        <div style={{ overflowY: 'auto', height: '450px'}}>
        <Form.Item
          name='images'
          label="Hình ảnh sản phẩm (Tối đa 16 ảnh, ảnh đầu tiên làm đại diện)"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Vui lòng tải lên ít nhất một hình ảnh' }]}
        >
          <Upload
            accept={ALLOW_COMMON_FILE_TYPES}
            listType="picture-card"
            customRequest={({ onSuccess }) => onSuccess()}
            fileList={fileList}
            beforeUpload={beforeUpload}
            onPreview={handlePreview}
            onChange={handleChange}
            maxCount={16}
            showUploadList={true}
          >
            {fileList.length >= 16 ? null : uploadButton}
          </Upload>
        </Form.Item>
        {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: visible => setPreviewOpen(visible),
              afterOpenChange: visible => !visible && setPreviewImage(previewImage),
            }}
            src={previewImage}
          />
        )}
      </div>)
    },
    {
      key: '3',
      label: 'Thông số kỹ thuật',
      forceRender: true,
      children: (
        <div style={{ overflowY: 'auto', height: '450px'}}>
          <Form.List name="attributes" rules={[{ required: true, message: 'Vui lòng thêm ít nhất một thông số kỹ thuật' }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                    <Card key={`attr-${name}`} title={`Thông số ${name + 1}`} size='small' style={{ marginBottom: 16, width: '100%' }} extra={<Button type='link' danger icon={<CloseOutlined />} onClick={() => remove(name)}></Button>}>
                        <Form.Item
                          {...restField}
                          name={[name, 'attribute_name']}
                          style={{ flex: 1 }}
                          rules={[{ required: true, message: 'Vui lòng nhập tên thuộc tính' }]}
                        >
                          <Input placeholder="Tên thuộc tính" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'attribute_value']}
                          style={{ flex: 1 }}
                          rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                        >
                          <Input.TextArea placeholder="Giá trị" />
                        </Form.Item>
                    </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm thông số kỹ thuật
                  </Button>
                </Form.Item>
                </>
            )}
          </Form.List>
        </div>
      )
    }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      onValuesChange={() => {
        const price = form.getFieldValue("price");
        const discountValue = form.getFieldValue("discountValue");
        let disType = discountType;
        const sellingPrice = calculateSalePrice(price, disType, discountValue);
    
        form.setFieldsValue({
          selling_price: sellingPrice,
        });
      }}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Form>
  );
};

export default ProductForm; 