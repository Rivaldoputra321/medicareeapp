'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Form, Input, Button, notification, Layout, Typography, Menu, Upload, message, Row, Col } from 'antd';
import { UserOutlined, MedicineBoxOutlined, UserAddOutlined, AppstoreAddOutlined, UploadOutlined, LogoutOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload/interface';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

const AdminCreateDoctor = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
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

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('You can only upload JPG/PNG file!');
    }
    return isImage;
  };

  const handleLogout = () => {
    router.push('/login'); 
  };

  // Handle Back Button click to navigate to the previous page
  const handleBack = () => {
    router.back(); // Go back to the previous page in history
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      
      <Header style={{ background: '#ffffff', padding: '0 20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
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
            <Menu.Item key="1" icon={<UserAddOutlined />}>
              Membuat Dokter
            </Menu.Item>
            <Menu.Item key="2" icon={<AppstoreAddOutlined />}>
              Membuat Spesialis
            </Menu.Item>
          </Menu>
        </Sider>

        
        <Content style={{ padding: '50px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Title level={2} style={{ textAlign: 'center' }}>Edit Akun Dokter</Title>
            <Form onFinish={onFinish} layout="vertical" initialValues={{ remember: true }}>
              <Form.Item label="Nama Dokter" name="Nama Dokter" rules={[{ required: true, message: 'Silahkan masukan nama dokter!' }]}>
                <Input prefix={<UserOutlined />} placeholder="Silahkan masukan nama dokter!" />
              </Form.Item>

              <Form.Item label="Spesialis" name="Spesialis" rules={[{ required: true, message: 'Silakan masukkan spesialisasi dokter!' }]}>
                <Input prefix={<MedicineBoxOutlined />} placeholder="Silakan masukkan spesialisasi dokter!" />
              </Form.Item>

              <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Silakan masukkan email dokter!' }, { type: 'email', message: 'Silakan masukkan email yang valid!' }]}>
                <Input placeholder="Masukan email dokter" />
              </Form.Item>

              <Form.Item label="Pengalaman Dokter" name="Pengalaman" rules={[{ required: true, message: 'Silahkan masukan lama pengalaman dokter!' }]}>
                <Input placeholder="Silahkan masukan lama pengalaman dokter!" />
              </Form.Item>

              <Form.Item label="Pendidikan Dokter" name="Pendidikan dokter" rules={[{ required: true, message: 'Silahkan masukan pendidikan terakhir dokter!' }]}>
                <Input placeholder="Silahkan masukan pendidikan terakhir dokter!" />
              </Form.Item>

              <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input password!' }]}>
                <Input.Password placeholder="Masukan password" />
              </Form.Item>

              <Form.Item label="Upload Foto Dokter" name="foto" rules={[{ required: true, message: 'Silahkan upload foto dokter!' }]}>
                <Upload
                  action="/upload" 
                  listType="picture"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
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

        {/* Back Button in Bottom Right */}
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
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
    </Layout>
  );
};

export default AdminCreateDoctor;
