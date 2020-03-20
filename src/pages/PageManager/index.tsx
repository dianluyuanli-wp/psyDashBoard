import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { Upload, message, Button, Icon, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { upload, getBase64 } from '@/utils/upload';
import { uploadPageInfo, getPageInfo } from '@/services/pageManager';
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
  //  文件列表
  const [fileList, setFileList] = useState(defaultFileList);
  //  预览状态
  const [previewVisible, setPreviewStatus] = useState(false);
  //  预览的图片
  const [previewImg, setPreviewImg] = useState('');

  //  初始化文件列表
  useEffect(() => {
    async function pageInfo() {
      const { data } = await getPageInfo();
      const { imgList } = JSON.parse(data[0]);
      setFileList(imgList);
    };
    pageInfo();
  }, []);

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
    if (ans.errmsg === 'ok') {
      message.success(`${info.file.name} 上传成功。`);
    } else {
      message.error(`${info.file.name} 上传失败。`);
      return;
    }
    setFileList(newFileList.map(item => {
      if (item.name === file.name) {
        return Object.assign(item, { status: 'done', url: ans.file_list[0].download_url });
      }
      return item;
    }));
  }
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="ant-upload-text">Upload</div>
    </div>
  );
  async function updatePageInfo() {
    const clearImgList = fileList.map(({ uid, size, name, type, url = '' }) => ({ uid, size, name, type, url }));
    const res = await uploadPageInfo({
      imgList: clearImgList
    })
    if (res.errmsg === 'ok') {
      message.success('更新成功');
    }
  }
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
        <Button type='primary' onClick={updatePageInfo}>页面信息上传</Button>
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
