import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { Upload, message, Button, Icon } from 'antd';
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

export default () => {
  return (
    <PageHeaderWrapper content="这是一个新页面，从这里进行开发！" className={styles.main}>
      {/* <div style={{ paddingTop: 100, textAlign: 'center' }}>
        <Spin spinning={loading} size="large"></Spin>
      </div> */}
        <Upload {...props}>
          <Button type="ghost">
            <Icon type="upload" /> 点击上传
          </Button>
        </Upload>
    </PageHeaderWrapper>
  );
};
