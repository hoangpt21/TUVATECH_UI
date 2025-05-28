import { useEffect, useState, useRef } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Table, Descriptions, Flex, Typography, Image } from 'antd';
import { PlusOutlined, UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, DeleteOutlined } from '@ant-design/icons';
import { DISTRICT_RULE_MESSAGE, EMAIL_RULE_CONFIRM, EMAIL_RULE_MESSAGE, PHONE_RULE, PHONE_RULE_CONFIRM, PHONE_RULE_MESSAGE, PROVINCE_RULE_MESSAGE, WARD_RULE_MESSAGE } from '../../utils/validators';
import { getDistrictsAPI, getWardsAPI } from '../../apis';
import dayjs from 'dayjs';

const ImportForm = ({ form, onFinish, oldImportsDetalsLlength, setOldImportsDetailsLength, products, provinces }) => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [provincesOptions, setProvincesOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const districtList = useRef(null);
  const isViewOnly = form.getFieldValue('isViewOnly') || false;
  const columns = (fields, remove, form) => {

    const baseColumn =[
      {
        title: 'Sản phẩm',
        dataIndex: 'product',
        align: 'left',
        width: 200,
        render: (_, __, index) => {
          const importDetails = form.getFieldValue('import_details') || [];
          const product = products.find(p => p.product_id === importDetails[index].product_id);
          return (
            <Space align="center">
              <Image 
                src={product?.thumbnail} 
                width={60} 
                height={60} 
                style={{ 
                  objectFit: 'contain', 
                  borderRadius: 6, 
                  border: '1px solid #eee' 
                }} 
                preview={{
                  mask: <div style={{ color: 'white' }}>Xem</div>
                }}
              />
              <Space direction="vertical" size={0}>
                <Typography.Text strong>{product?.product_name || '—'}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Giá bán: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product?.price)} | Tồn kho: {product?.stock_quantity || 0}
                </Typography.Text>
              </Space>
            </Space>
          );
        },
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        width: 150,
        align: 'center',
        render: (_, __, index) => {
          const isLast = index >= oldImportsDetalsLlength && index === fields.length - 1;;
          const value = form.getFieldValue(['import_details', index, 'quantity']);
          return isLast ? (
            <Form.Item
              name={[index, 'quantity']}
              style={{margin:0}}
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber placeholder="Số lượng" min={1} style={{ width: '100%' }} />
            </Form.Item>
          ) : (
            value ?? '—'
          );
        },
      },
      {
        title: 'Giá nhập (VNĐ)',
        dataIndex: 'import_price',
        width: 150,
        align: 'center',
        render: (_, __, index) => {
          const isLast = index >= oldImportsDetalsLlength && index === fields.length - 1;;
          const value = form.getFieldValue(['import_details', index, 'import_price']);
          const display = value != null ? value : '—';
          return isLast ? (
            <Form.Item
              name={[index, 'import_price']}
              style={{margin: 0}}
              rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
            >
              <InputNumber
                placeholder="Giá nhập"
                min={0}
                style={{ width: '100%' }}
                formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={val => val.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          ) : (
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(display)
          );
        },
      }]

     if(!isViewOnly) baseColumn.push( {
      dataIndex: 'operation',
      align: 'center',
      width: 50,
      render: (_, __, index) => (
        <Button type="link" variant='solid' color='danger' 
          onClick={() => {
            if(index < oldImportsDetalsLlength) setOldImportsDetailsLength(prev => prev>=0? prev - 1: prev);
            remove(index)
          }} 
          icon={<DeleteOutlined/>}>
        </Button>
      ),
    });
    return baseColumn;
  };
  
   useEffect(() => {
     setProvincesOptions(Object.keys(provinces).map((provinceName) => ({
       value: provinceName,
       label: provinceName
     })))
   }, [provinces, products]) // Add products dependency

   const handleCityChange = async (selectedValue) => {
     const districts = await getDistrictsAPI(provinces[selectedValue]);
     districtList.current = districts;
     setDistrictOptions(Object.keys(districts).map((districtName) => ({
       value: districtName,
       label: districtName
     })))
     setSelectedCity(selectedValue);
     setSelectedDistrict(null);
     form.setFieldsValue({ district: undefined, ward: undefined });
   };

   const handleDistrictChange = async (selectedValue) => {
     const wards = await getWardsAPI(districtList.current[selectedValue]);
     if(wards) setWardOptions(wards.map((wardName) => ({
       value: wardName,
       label: wardName
     })))
     else setWardOptions([{
       value: selectedValue,
       label: selectedValue
     }])
     setSelectedDistrict(selectedValue);
     form.setFieldsValue({ ward: undefined });
   };

  return (
    <div style={{ overflowY: 'auto', height: '500px'}}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={isViewOnly}
      >
        {isViewOnly?
          <Descriptions style={{marginBottom: 16}}  title={`Mã nhập hàng: #${form.getFieldValue('import_id')}`} items={[
            { key: 1,label: 'Ngày nhập hàng', children: dayjs(form.getFieldValue('import_date')).format("YYYY-MM-DD"), span: 'filled' },
            { key: 2,label: 'Tên nhà cung cấp', children: form.getFieldValue('supplier_name') },
            { key: 3,label: 'Số điện thoại', children: form.getFieldValue('phone') },
            { key: 4,label: 'Email', children: form.getFieldValue('email') },
            { key: 5,label: 'Địa chỉ', children: form.getFieldValue('address'), span: 'filled' },
            { key: 6,label: 'Ghi chú', children: form.getFieldValue('note'), span: 1 },
          ]} />:
        <>
          <Form.Item
            name="supplier_name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
          >
            <Input placeholder='Nhập tên nhà cung cấp' prefix={<UserOutlined/>}/>
          </Form.Item>
          <Space style={{ width: '100%' }} size={10} styles={{item:{width: '50%'}}}>
              <Form.Item
                name="phone"
                label="Số điện thoại"	
                rules={[{ required: true, message: PHONE_RULE_MESSAGE }, { pattern: PHONE_RULE, message: PHONE_RULE_CONFIRM}]}
              >
                  <Input prefix={<PhoneOutlined />} placeholder='Nhập số điện thoại' maxLength={10}/>
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: EMAIL_RULE_MESSAGE },
                  { type: 'email', message: EMAIL_RULE_CONFIRM }
                ]}
              >
                <Input placeholder='Nhập email' prefix={<MailOutlined/>}/>
              </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={10} styles={{item:{width: '50%'}}}>
              <Form.Item
                name="city"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: PROVINCE_RULE_MESSAGE }]}
              >
                <Select
                    placeholder="Chọn tỉnh/thành phố"
                    options={provincesOptions}
                    onChange={handleCityChange}
                    popupMatchSelectWidth={false}
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />
              </Form.Item>
              <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true, message: DISTRICT_RULE_MESSAGE }]}
              >
                  <Select
                    placeholder="Chọn quận/huyện"
                    disabled={!selectedCity}
                    options={selectedCity ? districtOptions : []}
                    onChange={handleDistrictChange}
                    showSearch
                    popupMatchSelectWidth={false}
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
              </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={10} styles={{item:{width: '50%'}}}>
              <Form.Item
              name="ward"
              label="Phường/Xã"
              rules={[{ required: true, message: WARD_RULE_MESSAGE }]}
              >
                <Select
                    placeholder="Chọn phường/xã"
                    disabled={!selectedDistrict}
                    options={selectedDistrict ? wardOptions : []}
                    showSearch
                    popupMatchSelectWidth={false}
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />
              </Form.Item>
              <Form.Item
              name="street"
              label="Số nhà/tên đường"
              rules={[{ required: true, message: 'Vui lòng nhập số nhà/tên đường' }]}
              >
                  <Input prefix={<EnvironmentOutlined />} placeholder='Nhập số nhà/tên đường' />
              </Form.Item>
          </Space>
          <Form.Item
            name="note"
            label="Ghi chú"
            >
                <Input.TextArea rows={4} placeholder='Nhập ghi chú' />
          </Form.Item>
        </>
        }
        <Form.List
          name="import_details"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.length === 0) {
                  return Promise.reject(new Error('Vui lòng thêm sản phẩm nhập'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
        {(fields, { add, remove }) => (
          <>
            {!isViewOnly && (
              <Flex style={{width: '100%', marginBottom: 16}} gap={10} align='center' wrap>
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn sản phẩm"
                  onChange={(value) => {
                    setSelectedProduct(value);
                  }}
                  style={{width: '70%'}}
                  popupMatchSelectWidth={'100%'}
                  optionLabelProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {products.map((product, idx) => (
                    <Select.Option
                      key={product.product_id}
                      value={idx}
                      label={product.product_name}
                    >
                      <Space align="center">
                        <Image src={product.thumbnail} width={40} height={40} style={{ objectFit: 'contain', marginRight: 12, borderRadius: 6, border: '1px solid #eee' }}  preview={{mask: <div style={{ color: 'white' }}>Xem</div>}}/>
                        <Space direction="vertical" size={0} styles={{ item: { whiteSpace: 'normal', wordWrap: 'break-word' }}}>
                          <Typography.Text strong>{product.product_name}</Typography.Text>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            Giá bán: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)} | Tồn kho: {product.stock_quantity}
                          </Typography.Text>
                        </Space>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
                <Button 
                  type="primary" 
                  style={{width: 100}} 
                  onClick={() => {
                    if (selectedProduct !== null) {
                      const product = products[selectedProduct];
                      add({
                        product_id: product.product_id,
                        product_name: product.product_name,
                        thumbnail: product.thumbnail,
                      });
                      setSelectedProduct(null);
                    }
                  }}
                >
                  Thêm
                </Button>
              </Flex>
            )}
            <Table
              dataSource={fields}
              bordered
              scroll={{ x: 900 }}
              style={{ width: "100%" }}
              columns={columns(fields, remove, form, selectedProduct)}
              pagination={false}
              rowKey="key"
            />
          </>
        )}
      </Form.List>
      </Form>
    </div>
  );
};

export default ImportForm;