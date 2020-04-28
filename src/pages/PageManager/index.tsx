import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useReducer } from 'react';
import { Upload, message, Button, Modal, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { upload, getBase64 } from '@/utils/upload';
import { uploadPageInfo, getPageInfo } from '@/services/pageManager';
import { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import BraftEditor, { EditorState } from 'braft-editor';
import styles from './index.less';
import 'braft-editor/dist/index.css';

const { Item: FormItem } = Form;

const layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

// interface FormData {
//   user: { pageContent: string }
// }

interface EditorObj {
  state: EditorState;
  text: string;
  rawString: string;
}

const UploadImgWall = () => {
  const defaultFileList: Array<UploadFile<any>> = [];
  //  文件列表
  const [fileList, setFileList] = useState(defaultFileList);
  //  预览状态
  const [previewVisible, setPreviewStatus] = useState(false);
  //  预览的图片
  const [previewImg, setPreviewImg] = useState('');

  //  富文本编辑器内容
  function editorReducer(state: EditorObj, action: EditorObj): EditorObj {
    return { ...state, ...action };
  }
  const [editorState, setEditorState] = useReducer(editorReducer, {
    state: BraftEditor.createEditorState(null),
    text: '',
    rawString: '',
  });

  const formRef = useRef(null);

  //  初始化文件列表
  useEffect(() => {
    async function pageInfo() {
      const { data } = await getPageInfo();
      const { imgList, text, rawString } = JSON.parse(data[0]);
      setFileList(imgList);
      setEditorState({
        //  rawString必须是双引号的JSON字符串格式
        state: BraftEditor.createEditorState(rawString.replace(/'/g, '"')),
        rawString,
        text,
      });
    }
    pageInfo();
  }, []);

  async function handlePreview(file: UploadFile<any>) {
    if (!file.url && !file.preview) {
      if (!file.originFileObj) {
        return;
      }
      Object.assign(file, {
        preview: await getBase64(file.originFileObj),
      });
    }
    setPreviewImg(file.url || file.preview || '');
    setPreviewStatus(true);
  }

  function handleCancel() {
    setPreviewStatus(false);
  }
  async function handleChange(info: UploadChangeParam<UploadFile<any>>) {
    const { fileList: newFileList, file } = info;
    if (file.status === 'removed') {
      setFileList(newFileList);
      return;
    }
    const ans = await upload(info);
    if (ans.errmsg === 'ok') {
      message.success(`${info.file.name} 上传成功。`);
    } else {
      message.error(`${info.file.name} 上传失败。`);
      return;
    }
    setFileList(
      newFileList.map(item => {
        if (item.name === file.name) {
          return Object.assign(item, { status: 'done', url: ans.file_list[0].download_url });
        }
        return item;
      }),
    );
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="ant-upload-text">Upload</div>
    </div>
  );
  async function updatePageInfo() {
    const clearImgList = fileList.map(({ uid, size, name, type, url = '' }) => ({
      uid,
      size,
      name,
      type,
      url,
    }));
    const res = await uploadPageInfo({
      imgList: clearImgList,
      text: editorState.text,
      rawString: editorState.rawString,
    });
    if (res.errmsg === 'ok') {
      message.success('更新成功');
    } else {
      message.error('更新失败');
    }
  }

  function handelEditor(currentEditorState: EditorState) {
    setEditorState({
      state: currentEditorState,
      //  上传的时候必须是单引号，否则云开发后台存储会报错
      text: currentEditorState.toHTML().replace(/"/g, "'"),
      rawString: currentEditorState.toRAW().replace(/"/g, "'"),
    });
  }

  async function inlineImgUpload(para: any) {
    const res = await upload({
      file: {
        originFileObj: para.file,
      },
    } as UploadChangeParam<UploadFile<any>>);
    const url = res.file_list[0].download_url;
    para.success({
      url,
    });
    console.log(url);
  }

  return (
    <div>
      <Modal visible={previewVisible} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImg} />
      </Modal>
      <Form {...layout} ref={formRef} onFinish={updatePageInfo}>
        <FormItem label="首页轮播图">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            showUploadList={{ showDownloadIcon: false }}
            onChange={handleChange}
            //  不要跑默认的智障上传方法，每上传一次就搞个post请求，有的时候还会卡状态
            customRequest={() => {}}
          >
            {fileList.length >= 3 ? null : uploadButton}
          </Upload>
        </FormItem>
        <BraftEditor
          value={editorState.state}
          onChange={handelEditor}
          media={{
            uploadFn: inlineImgUpload,
          }}
        />
        <Button className={styles.btn} type="primary" htmlType="submit">
          页面信息上传
        </Button>
      </Form>
    </div>
  );
};

export default () => (
  <PageHeaderWrapper content="这是一个新页面，从这里进行开发！" className={styles.main}>
    {/* <div style={{ paddingTop: 100, textAlign: 'center' }}>
        <Spin spinning={loading} size="large"></Spin>
      </div> */}
    <UploadImgWall />
  </PageHeaderWrapper>
);
