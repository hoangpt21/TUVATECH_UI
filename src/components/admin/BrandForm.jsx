import { Form, Input, Upload, Image, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '../../utils/validators';
import MyEditor from './MyEditor';

const BrandForm = ({ form, onFinish }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);


  useEffect(() => {
    if (form?.getFieldValue("logo") && form?.getFieldValue("logo")[0]?.url) setPreviewImage(form?.getFieldValue("logo")[0]?.url);
    else setPreviewImage('');
    if (form?.getFieldValue("logo")) setFileList(form?.getFieldValue("logo"));
    else setFileList([]);
  }, [form?.getFieldValue("logo")]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
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
    <div style={{ overflowY: 'auto', height: '500px'}}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="brand_name"
          label="Tên thương hiệu"
          rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          getValueFromEvent= {(e) => {
            return e?.target?.contentDocument?.body?.innerHTML; 
          }}
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <MyEditor
            value={form.getFieldValue('description')}
            onChange={value => form.setFieldsValue({ description: value })}
          />
        </Form.Item>

        <Form.Item
          name="logo"
          label="Logo"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Vui lòng tải lên logo' }]}
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
      </Form>
    </div>
  );
};

export default BrandForm;