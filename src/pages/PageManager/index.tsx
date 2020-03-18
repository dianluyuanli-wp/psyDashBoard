import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { Upload, message, Button, Icon, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { upload } from '@/utils/upload';
import {UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
//  import { Spin } from 'antd';
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
  const [fileList, setFileList] = useState(defaultFileList)
  //  const fileList = [];
  function handlePreview() {

  }
  function handleChange(info: UploadChangeParam<UploadFile<any>>) {
    const { fileList: newFileList } = info;
    console.log(info.file);
    setFileList(newFileList);
    //  handleChange = ({ fileList }) => this.setState({ fileList });
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
          //  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
        >
          {fileList.length >= 8 ? null : uploadButton}
        </Upload>
        {/* <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal> */}
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
