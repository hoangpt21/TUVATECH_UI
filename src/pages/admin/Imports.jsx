import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Form, message, Space, Card, Input, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, SaveOutlined, CloseOutlined, FileExcelOutlined } from '@ant-design/icons';
import { fetchAllImports, createImport, updateImport, deleteImport, selectImports } from '../../redux/import/importSlice';
import { fetchAllImportDetails, createImportDetail, deleteImportDetail, selectImportDetails, deleteImportDetailByImportId } from '../../redux/import/importDetailSlice';
import { fetchAllProducts, selectProducts} from '../../redux/product/';
import { getProvincesAPI } from '../../apis';
import ImportTable from '../../components/admin/ImportTable';
import ImportForm from '../../components/admin/ImportForm';
import { exportToExcel, formatDataForExcel } from '../../utils/exportExcel';

const Imports = () => {
  const dispatch = useDispatch();
  const imports = useSelector(selectImports);
  const importDetails = useSelector(selectImportDetails);
  const products = useSelector(selectProducts);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingImport, setEditingImport] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [filteredImports, setFilteredImports] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [provinces, setProvinces] = useState({});
  const [form] = Form.useForm();
  const [isViewDetail, setIsViewDetail] = useState(false);
  const originalImports = useRef([]);
  const [oldImportsDetalsLlength, setOldImportsDetailsLength] = useState(-1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const responses = await Promise.all([
          dispatch(fetchAllImports({ isAll: true })),
          dispatch(fetchAllImportDetails({ isAll: true })),
          dispatch(fetchAllProducts({isAll: true})),
          getProvincesAPI()
        ]);
        setProvinces(responses[3]);
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    originalImports.current = imports.map((importObj, index) => {
      const importDetailsForImport = importDetails.filter(detail => detail.import_id === importObj.import_id);
      const totalAmount = importDetailsForImport.reduce((total, detail) => {
        return total + detail.quantity;
      }, 0);
      return {
        import_id: importObj.import_id,
        import_code: '#'+((index+1)),
        supplier_name: importObj.supplier_name,
        address: importObj.address,
        phone: importObj.phone,
        import_date: importObj.import_date,
        total_amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(importObj.total_amount),
        total_products: totalAmount,
      };
    } );   
    setFilteredImports(originalImports.current);
  }, [imports, importDetails]);

  useEffect(() => {
    setProductDetails(products);
  }, [products])

  const handleAdd = () => {
    setEditingImport(null);
    setIsViewDetail(false);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record, isViewOnly = false) => {
    setIsViewDetail(isViewOnly);
    setEditingImport(record);
    let importObj = imports.find(importObj => importObj.import_id === record.import_id);
    const importDetailsForImport = importDetails.filter(detail => detail.import_id === importObj.import_id);
    setOldImportsDetailsLength(importDetailsForImport?.length);
    const addreses = importObj.address.split(',').map((address) => address.trim());
    form.setFieldsValue({
      ...importObj,
      city: addreses[3],
      district: addreses[2],
      ward: addreses[1],
      street: addreses[0],
      import_details: importDetailsForImport,
      isViewOnly: isViewOnly,
    });
    setModalVisible(true);
  };

  const handleDelete = async (importId, isWithin24Hours) => {
    setLoading(true);
    if(isWithin24Hours) await dispatch(deleteImportDetailByImportId(importId))
    const res = await dispatch(deleteImport(importId));
    if (!res.error) {
      message.success('Xóa đơn nhập hàng thành công');
    }
    setLoading(false);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    const address = `${values.street}, ${values.ward}, ${values.district}, ${values.city}`;
    const importData = {
      supplier_name: values.supplier_name,
      phone: values.phone,
      address: address,
      import_date: values.import_date,
      total_amount: values?.import_details.reduce((total, detail) => {
        return total + (detail.quantity * detail.import_price);
      }, 0),
      email: values.email,
      note: values.note,
    };
    if (editingImport) {
      const oldImportDetails = importDetails.filter(detail => detail.import_id === editingImport.import_id);
      const newImportDetails = values.import_details.filter(detail => !detail.import_detail_id);
      const removedImportDetails = oldImportDetails.filter(detail => !values.import_details.some(newDetail => newDetail.import_detail_id === detail.import_detail_id));

      let res = await dispatch(updateImport({
        id: editingImport.import_id,
        importData
      }));
      let resDetails = await Promise.all([
        ...newImportDetails.map(detail => detail && dispatch(createImportDetail({ ...detail, import_id: editingImport.import_id }))),
        ...removedImportDetails.map(detail => detail && dispatch(deleteImportDetail(detail.import_detail_id))),
      ]);
      if (!res.error && resDetails.every(res => !res.error)) {
        message.success('Cập nhật đơn nhập hàng thành công');
      }
    } else {
      let res = await dispatch(createImport(importData));
      let resDetails = await Promise.all(values.import_details.map(detail => dispatch(createImportDetail({ ...detail, import_id: res.payload.import_id }))));
      if (!res.error && resDetails.every(res => !res.error)) {
        message.success('Thêm đơn nhập hàng thành công');
      }
    }
    await dispatch(fetchAllProducts({isAll: true}));
    setModalVisible(false);
    form.resetFields();
    setLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    const filtered = originalImports.current.filter((importRecord) =>
      Object.keys(importRecord).slice(1).some(key => importRecord[key] &&
        String(importRecord[key])?.toLowerCase().includes(value.toLowerCase())
      )
    );
    setSearchValue(value);
    setFilteredImports(filtered);
  };

  const handleExport = () => {
    try {
      const columns = [
        { title: 'STT', dataIndex: 'import_code' },
        { title: 'Mã nhập hàng', dataIndex: 'import_id' },
        { title: 'Tên nhà cung cấp', dataIndex: 'supplier_name' },
        { title: 'Địa chỉ', dataIndex: 'address' },
        { title: 'Số điện thoại', dataIndex: 'phone' },
        { title: 'Tổng số sản phẩm', dataIndex: 'total_products' },
        { title: 'Tổng tiền', dataIndex: 'total_amount' },
        { title: 'Ngày lập', dataIndex: 'import_date' }
      ];
      const formattedData = formatDataForExcel(filteredImports, columns);
      exportToExcel(formattedData, 'danh-sach-donnhaphang');
    } catch (error) {
      message.error('Lỗi khi xuất Excel: ' + error.message);
    }
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
      {/* Add Export button if needed later */}
      <Button
        color='cyan'
        variant='solid'
        icon={<FileExcelOutlined />}
        onClick={handleExport} // Define handleExport if needed
        disabled={loading}
      >
        Xuất Excel
      </Button>
    </Space>
  );

  return (
    <Card
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
      title="Quản lý đơn nhập hàng"
      extra={extra}
      loading={loading}
    >
      <Row gutter={[16,16]} align="middle" style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={24} md={12}>
          <Input
            allowClear
            suffix={<SearchOutlined />}
            value={searchValue}
            placeholder="Nhập từ khóa tìm kiếm"
            onChange={handleSearch}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <ImportTable
            imports={filteredImports}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchText={searchValue}
          />
        </Col>
      </Row>

      <Modal
        title={
           isViewDetail
            ?  ''
            : editingImport
            ? "Sửa đơn nhập hàng"
            : "Thêm đơn nhập hàng"
        }
        open={modalVisible}
        okText="Lưu"
        cancelText="Hủy"
        okButtonProps={{icon: <SaveOutlined />, style: {display: isViewDetail && 'none'}}}
        cancelButtonProps={{icon: <CloseOutlined />}}
        onOk={form.submit}
        width={{
          xs: '90%',
          sm: '80%',
          md: '80%',
          lg: '80%',
          xl: '80%',
          xxl: '80%',
        }}
        onCancel={() => {
          setModalVisible(false);
          setEditingImport(null);
          setIsViewDetail(false);
          setOldImportsDetailsLength(-1);
          form.resetFields();
        }}
        centered
        styles={{body: {overflow: "hidden", height: 500}}}
        confirmLoading={loading}
        maskClosable={false}
      >
        <ImportForm
          form={form}
          onFinish={handleSubmit}
          provinces={provinces}
          products={productDetails}
          oldImportsDetalsLlength={oldImportsDetalsLlength}
          setOldImportsDetailsLength={setOldImportsDetailsLength}
        />
      </Modal >
    </Card >
  );
};

export default Imports;