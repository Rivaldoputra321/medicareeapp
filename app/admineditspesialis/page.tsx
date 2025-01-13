'use client';  // Ensure the component is client-side

import { useState } from 'react'; // Import useState from React
import { useRouter } from 'next/navigation';  // Use 'next/navigation' instead of 'next/router' for App directory routing

import { Form, Input, Button, notification, Layout, Typography, Menu, Upload, message, Row, Col } from 'antd';
import { MedicineBoxOutlined, AppstoreAddOutlined, UploadOutlined, LogoutOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload/interface';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const AdminCreateDoctor = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  
  // Use useRouter from next/navigation (for app directory)
  const router = useRouter();

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Received values:', values);

    setTimeout(() => {
      setLoading(false);
      notification.success({
        message: 'Berhasil',
        description: 'Dokter telah berhasil dibuat.',
      });
    }, 1000);
  };

  const handleUploadChange = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    setFileList(fileList);

    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleLogout = () => {
    console.log("User logged out");
    notification.success({
      message: 'Logout Berhasil',
      description: 'Anda telah keluar dari sistem.',
    });
  };

  const handleBack = () => {
    router.back(); // Navigate back to the previous page
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#ffffff', padding: '0 20px', boxShadow: '0 20px 20px rgba(0, 0, 0, 0.9)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>MediCare Admin Panel</Title>
          </Col>
          <Col>
            <Button 
              type="link" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout} 
              style={{ float: 'right', fontSize: '16px' }}
            >
              Logout
            </Button>
          </Col>
        </Row>
      </Header>

      <Layout>
        <Sider width={200} className="site-layout-background" style={{ background: '#ffffff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="2" icon={<AppstoreAddOutlined />}>
              Membuat Dokter
            </Menu.Item>
            <Menu.Item key="1" icon={<MedicineBoxOutlined />}>
              Membuat Spesialis
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout>
          <Content style={{ padding: '50px 20px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <Title level={2} style={{ textAlign: 'center' }}>Edit Spesialis</Title>
              <Form onFinish={onFinish} layout="vertical" initialValues={{ remember: true }}>

                <Form.Item label="Nama Spesialis" name="Spesialis" rules={[{ required: true, message: 'Silakan masukkan spesialisasi dokter!' }]}>
                  <Input prefix={<MedicineBoxOutlined />} placeholder="Silakan masukkan nama spesialis baru!" />
                </Form.Item>

                <Form.Item label="Gambar Spesialis" name="foto" rules={[{ required: true, message: 'Silahkan upload gambar spesialis!' }]}>
                  <Upload
                    action="/upload" 
                    listType="picture"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={(file: RcFile) => {
                      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                      if (!isJpgOrPng) {
                        message.error('You can only upload JPG/PNG file!');
                      }
                      return isJpgOrPng;
                    }}
                    showUploadList={{ showRemoveIcon: true }}
                  >
                    <Button icon={<UploadOutlined />}>Klik Untuk Upload</Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Simpan Perubahan
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Content>
        </Layout>
      </Layout>

      {/* Back Button in Bottom Right */}
      <Button 
        type="primary" 
        icon={<AppstoreAddOutlined />} 
        onClick={handleBack} 
        style={{
          position: 'fixed', 
          bottom: '30px', 
          right: '30px', 
          borderRadius: '50%', 
          padding: '16px', 
          fontSize: '20px',
        }}
      >
        Back
      </Button>
    </Layout>
  );
};

export default AdminCreateDoctor;
