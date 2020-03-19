import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { Upload, message, Button, Icon, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { upload, getBase64 } from '@/utils/upload';
import {UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import styles from './index.less';

const props = {
  showUploadList: false,
  async onChange(info: UploadChangeParam<UploadFile<any>>) {
    if (info.file.status === 'done') {
      const ans = await upload(info);
      if (ans === 'merge success') {
        message.success(`${info.file.name} 上传成功。`);
      } else {
        message.error(`${info.file.name} 上传失败。`);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败。`);
    }
  },
};

const UploadImgWall = () => {
  const defaultFileList: Array<UploadFile<any>> = [];
  const [fileList, setFileList] = useState(defaultFileList);

  const [previewVisible, setPreviewStatus] = useState(false);
  const [previewImg, setPreviewImg] = useState('');
  async function handlePreview(file: UploadFile<any>) {
    if (!file.url && !file.preview) {
      if (!file.originFileObj) {
        return;
      }
      Object.assign(file, {
        preview: await getBase64(file.originFileObj)
      })
    }
    setPreviewImg(file.url || file.preview || '');
    setPreviewStatus(true);
  }

  function handleCancel() {
    setPreviewStatus(false);
  }
  async function handleChange(info: UploadChangeParam<UploadFile<any>>) {
    const { fileList: newFileList, file } = info;
    const ans = await upload(info);
    console.log(file);
    if (ans === 'merge success') {
      message.success(`${info.file.name} 上传成功。`);
    } else {
      message.error(`${info.file.name} 上传失败。`);
    }
    setFileList(newFileList.map(item => Object.assign(item, { status: 'done'})));
  }
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="ant-upload-text">Upload</div>
    </div>
  );
  return (
    <div>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          showUploadList={{showDownloadIcon: false}}
          onChange={handleChange}
          //  不要跑默认的智障上传方法，每上传一次就搞个post请求，有的时候还会卡状态
          customRequest={() => {}}
        >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImg} />
        </Modal>
    </div>
  )
}

export default () => {
  return (
    <PageHeaderWrapper content="这是一个新页面，从这里进行开发！" className={styles.main}>
      {/* <div style={{ paddingTop: 100, textAlign: 'center' }}>
        <Spin spinning={loading} size="large"></Spin>
      </div> */}
        <UploadImgWall />
        <Upload {...props}>
          <Button type="ghost">
            <Icon type="upload" /> 点击上传
          </Button>
        </Upload>
    </PageHeaderWrapper>
  );
};
