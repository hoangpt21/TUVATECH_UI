import React, { useEffect, useState } from 'react';
import { Form, Rate, Input, Upload, Typography, Image, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '../../utils/validators';

const { TextArea } = Input;
const { Title } = Typography;

const ReviewForm = ({ onFinish, form, productName }) => {
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

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
    return false;
  };

  const handlePreview = async (file) => {
    if (!file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }
    setPreviewImage(file.preview);
    setPreviewOpen(true);
  };

  const handleChange = async (info) => {
    const { file, fileList } = info;
    const isRemoved = file.status === 'removed';

    if (isRemoved) {
      const newFileList = fileList.filter(f => f.uid !== file.uid);
      setFileList(newFileList);
      setPreviewImage(newFileList.length > 0 ? newFileList[0].preview : '');
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

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        onFinish({ ...values, images: fileList });
        form.resetFields();
        setFileList([]);
      }}
    >
      <Title level={4} style={{margin: '16px 0'}}>{productName}</Title>
      <Form.Item
        name="rating"
        label="Đánh giá chung"
        rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá' }]}
        style={{ textAlign: 'center' }}
      >
        <Rate 
          tooltips={['Rất Tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời']}
          style={{ fontSize: '30px'}}
        />
      </Form.Item>

      <Form.Item
        name="comment"
        label="Nhận xét của bạn"
        rules={[
          { required: true, message: 'Vui lòng nhập nhận xét' },
          { min: 15, message: 'Nhận xét phải có ít nhất 15 ký tự' }
        ]}
      >
        <TextArea rows={4} placeholder="Xin mời chia sẻ một số cảm nhận về sản phẩm (nhập tối thiểu 15 kí tự)" />
      </Form.Item>

      <Form.Item label="Thêm hình ảnh">
        <Upload
          accept={ALLOW_COMMON_FILE_TYPES}
          listType="picture-card"
          getValueFromEvent={normFile}
          customRequest={({ onSuccess }) => onSuccess()}
          fileList={fileList}
          beforeUpload={beforeUpload}
          onPreview={handlePreview}
          onChange={handleChange}
          maxCount={3}
          showUploadList={true}
        >
          {fileList.length >= 3 ? null : uploadButton}
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
  );
};

export default ReviewForm;