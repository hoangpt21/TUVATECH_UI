import { Form, Input, Select, InputNumber, DatePicker, Switch, Space } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const CouponForm = ({ form, onFinish }) => {
  const startDate = Form.useWatch('start_date', form);
  const usageLimit = Form.useWatch('usage_limit', form);
  const discountType = Form.useWatch('discount_type', form);
  
  return (
    <div style={{ overflowY: 'auto', height: '500px'}}>
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="coupon_code"
        label="Mã giảm giá"
        rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
      >
        <Input placeholder="Nhập mã giảm giá" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
      >
        <Input.TextArea rows={4} placeholder="Nhập mô tả" />
      </Form.Item>
      <Space styles={{item: {width: '100%'}}} style={{width: '100%'}}>
        <Form.Item
          name="discount_type"
          label="Loại giảm giá"
          rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
        >
          <Select placeholder="Chọn loại giảm giá" popupMatchSelectWidth={false}>
            <Option value="percentage">Phần trăm</Option>
            <Option value="amount">Số tiền</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="discount_value"
          label="Giá trị giảm"
          rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập giá trị giảm (%) hoặc số tiền (VNĐ)"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            min={0}
          />
        </Form.Item>
      </Space>

      <Form.Item
        name="min_order_value"
        label="Đơn hàng tối thiểu (VNĐ)"
        rules={[{ required: true, message: 'Vui lòng nhập đơn hàng tối thiểu' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Nhập đơn hàng tối thiểu"
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          min={0}
        />
      </Form.Item>

      <Form.Item
        name="max_discount_value"
        label="Giảm giá tối đa (VNĐ)"
        hidden={discountType === 'amount'}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Nhập giảm giá tối đa"
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          min={0}
        />
      </Form.Item>

      <Space styles={{item: {width: '100%'}}} style={{width: '100%'}}>
        <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="Chọn ngày bắt đầu"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
        </Form.Item>
        <Form.Item
            name="end_date"
            label="Ngày kết thúc"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc' },
            ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder="Chọn ngày kết thúc"
            disabledDate={(current) => {
              if (!startDate) return false;
              return current && current <= startDate;
            }}
          />
        </Form.Item>
      </Space>

      <Form.Item
        name="max_users"
        label="số lượng người dùng tối đa"
        rules={[{ required: true, message: 'Vui lòng nhập số lượng người dùng tối đa' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Nhập số lượng người dùng tối đa"
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          min={0}
        />
      </Form.Item>

      <Form.Item
        name="max_usage_per_user"
        label="Số lần sử dụng tối đa mỗi người"
        rules={[
          { required: true, message: 'Vui lòng nhập số lần sử dụng tối đa mỗi người' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || value <= getFieldValue('max_users')) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Giới hạn phải <= số lượng người dùng tối đa'));
            },
          }),
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          max={usageLimit}
          placeholder="Nhập số lần sử dụng tối đa mỗi người"
        />
      </Form.Item>
    </Form>
    </div>
  );
};

export default CouponForm; 