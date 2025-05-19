import React, { memo, useEffect, useRef, useState } from 'react';
import { Form, Input, Modal, Switch, Select } from 'antd';
import { UserOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { DISTRICT_RULE_MESSAGE, NAME_RULE_MESSAGE, PHONE_RULE, PHONE_RULE_CONFIRM, PHONE_RULE_MESSAGE, PROVINCE_RULE_MESSAGE, WARD_RULE_MESSAGE } from '../../utils/validators';
import { getDistrictsAPI, getWardsAPI } from '../../apis';
const styles = {
  modalBody: {
    maxHeight: 'calc(100vh - 300px)', 
    overflowY: 'auto',
  }
};

function AddressForm({ editingAddress, visible, onCancel, onSubmit, provinces, isInCheckout = false }) {
  const [form] = Form.useForm();
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [provincesOptions, setProvincesOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const districtList = useRef(null);

  useEffect(() => {
    setProvincesOptions(Object.keys(provinces).map((provinceName) => ({
      value: provinceName,
      label: provinceName
    })))
  }, [provinces])

  useEffect(() => {
    if(editingAddress) form.setFieldsValue(editingAddress);
  },[editingAddress]);

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

  const handleSubmit = (values) => {
    const address = values;
    onSubmit(address);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedCity(null);
    setSelectedDistrict(null);
    onCancel()
  };

  return (
    <Modal
    title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
    open={visible}
    cancelText="Hủy"
    okText= {editingAddress ? 'Cập nhật' : 'Thêm mới'}
    onCancel={handleCancel}
    onOk={() => form.submit()}
    styles={{ body:styles.modalBody}}>
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
        >
            <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: NAME_RULE_MESSAGE }]}
            >
                <Input prefix={<UserOutlined />} placeholder='Nhập họ và tên người nhận'/>
            </Form.Item>

            <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: PHONE_RULE_MESSAGE }, { pattern: PHONE_RULE, message: PHONE_RULE_CONFIRM}]}
            >
                <Input prefix={<PhoneOutlined />} placeholder='Nhập số điện thoại' maxLength={10}/>
            </Form.Item>
            <Form.Item
              name="city"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: PROVINCE_RULE_MESSAGE }]}
            >
              <Select
                  placeholder="Chọn tỉnh/thành phố"
                  options={provincesOptions}
                  onChange={handleCityChange}
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
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
            </Form.Item>

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

            {!isInCheckout &&
              <Form.Item
              name="is_default"
              valuePropName="checked"
              >
                  <Switch checkedChildren="Địa chỉ mặc định" unCheckedChildren="Đặt làm mặc định" />
              </Form.Item>}
        </Form>
    </Modal>
  )
}

export default memo(AddressForm);
