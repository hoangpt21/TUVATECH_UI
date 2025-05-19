import { Form, Input, Select } from 'antd';

const { Option } = Select;

const CategoryForm = ({ form, onFinish }) => {
  return (
    <div style={{ overflowY: 'auto', maxHeight: '500px'}}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ category_type: 'product' }}
      >
        <Form.Item
          name="category_name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="category_type"
          label="Loại danh mục"
          rules={[{ required: true, message: 'Vui lòng chọn loại danh mục' }]}
        >
          <Select>
            <Option value="product">Sản phẩm</Option>
            <Option value="news">Tin tức</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </div>
  );
};

export default CategoryForm; 