import { Form, Input, Select, Upload, Image, message } from 'antd';
import MyEditor from '../../components/admin/MyEditor';
import { useEffect, useState } from 'react';
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '../../utils/validators';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const NewsForm = ({ form, onFinish, categories }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (form?.getFieldValue("thumbnail") && form?.getFieldValue("thumbnail")[0]?.url) {
      setPreviewImage(form.getFieldValue("thumbnail")[0].url);
    } else {
      setPreviewImage('');
    }
    if (form?.getFieldValue("thumbnail")) {
      setFileList(form.getFieldValue("thumbnail"));
    } else {
      setFileList([]);
    }
  }, [form?.getFieldValue("thumbnail")]);

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

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
      setPreviewImage('');
      setFileList([]);
      return;
    }

    const latestFile = fileList[fileList.length - 1];

    try {
      const preview = URL.createObjectURL(latestFile.originFileObj);
      setPreviewImage(preview);
      setFileList([{
        ...latestFile,
        status: 'done',
        url: preview
      }]);
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

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="title"
        label="Tiêu đề"
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
      >
        <Input placeholder="Nhập tiêu đề" />
      </Form.Item>

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
        name="thumbnail"
        label="Ảnh đại diện"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[{ required: !previewImage, message: 'Vui lòng tải lên ảnh đại diện' }]}
      >
        <Upload
          accept={ALLOW_COMMON_FILE_TYPES}
          listType="picture-card"
          customRequest={({ onSuccess }) => onSuccess()}
          fileList={fileList}
          beforeUpload={beforeUpload}
          onPreview={handlePreview}
          onChange={handleChange}
          maxCount={1}
          showUploadList={true}
        >
          {fileList.length >= 1 ? null : uploadButton}
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

      <Form.Item
        name="content"
        label="Nội dung"
        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
      >
        <MyEditor
          value={form.getFieldValue('content')}
          onChange={value => form.setFieldsValue({ content: value })}
        />
      </Form.Item>

      <Form.Item
        name="pseudonym"
        label="Bút danh"
        rules={[{ required: true, message: 'Vui lòng nhập bút danh' }]}
      >
        <Input placeholder="Nhập bút danh" />
      </Form.Item>
    </Form>
  );
};

export default NewsForm;
