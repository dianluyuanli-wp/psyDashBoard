import { UploadOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input, Upload, message } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component, Fragment } from 'react';
import { Dispatch } from 'redux';

import { FormComponentProps } from '@ant-design/compatible/es/form';
import { connect } from 'dva';
import { CurrentUser } from '../data.d';
import PhoneView from './PhoneView';
import styles from './BaseView.less';
import { updateUserInfo, userPara, updateAvatar } from '@/services/userInfo';
import { ConnectState } from '@/models/connect';

const FormItem = Form.Item;

//  UploadChangeParam<UploadFile<any>>
function handelUpload(info) {
  if (info.file.status === 'uploading') {
    return;
  }
  if (info.file.status === 'done') {
    // Get this url from response in real world.
    //  setState是异步的，要通过回调的形式来调用cropper
    getBase64(info.file.originFileObj, imageUrl => {
        // this.setState({
        //   imageUrl,
        //   loading: false,
        // }, this.getCropper),
        updateAvatar({ base64: imageUrl });
        console.log(imageUrl);
      }
    );
  }
  console.log(info);
}

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ avatar }: { avatar: string }) => (
  <Fragment>
    <div className={styles.avatar_title}>
      <FormattedMessage id="accountsettings.basic.avatar" defaultMessage="Avatar" />
    </div>
    <div className={styles.avatar}>
      <img src={avatar} alt="avatar" />
    </div>
    <Upload onChange={handelUpload} showUploadList={false}>
      <div className={styles.button_view}>
        <Button>
          <UploadOutlined />
          <FormattedMessage
            id="accountsettings.basic.change-avatar"
            defaultMessage="Change avatar"
          />
        </Button>
      </div>
    </Upload>
  </Fragment>
);

const validatorPhone = (rule: any, value: string, callback: (message?: string) => void) => {
  const values = value.split('-');
  if (!values[0]) {
    callback('Please input your area code!');
  }
  if (!values[1]) {
    callback('Please input your phone number!');
  }
  callback();
};

interface BaseViewProps extends FormComponentProps {
  currentUser?: CurrentUser;
  dispatch: Dispatch<any>;
  accessToken: string;
}

class BaseView extends Component<BaseViewProps> {
  view: HTMLDivElement | undefined = undefined;

  componentDidMount() {
    this.setBaseInfo();
  }

  setBaseInfo = () => {
    const { currentUser, form } = this.props;
    if (currentUser) {
      Object.keys(form.getFieldsValue()).forEach(key => {
        const obj = {};
        obj[key] = currentUser[key] || null;
        form.setFieldsValue(obj);
      });
    }
  };

  getAvatarURL() {
    const { currentUser } = this.props;
    if (currentUser) {
      if (currentUser.avatar) {
        return currentUser.avatar;
      }
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  }

  getViewDom = (ref: HTMLDivElement) => {
    this.view = ref;
  };

  handlerSubmit = async (event: React.MouseEvent) => {
    event.preventDefault();
    const { form } = this.props;
    form.validateFields(err => {
      if (!err) {
        //  message.success(formatMessage({ id: 'accountsettings.basic.update.success' }));
      }
    });
    const { dispatch } = this.props;
    const updateObj = form.getFieldsValue();
    dispatch({
      type: 'user/saveCurrentUser',
      payload: Object.assign(this.props.currentUser, updateObj)
    });
    const res = await updateUserInfo(updateObj as userPara);
    if (res.errmsg === 'ok') {
      message.success(formatMessage({ id: 'accountsettings.basic.update.success' }));
    }
    //  console.log(form.getFieldsValue());
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form layout="vertical" hideRequiredMark>
            <FormItem label={formatMessage({ id: 'accountsettings.basic.email' })}>
              {getFieldDecorator('email', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'accountsettings.basic.email-message' }, {}),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={formatMessage({ id: 'accountsettings.basic.nickname' })}>
              {getFieldDecorator('showName', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'accountsettings.basic.nickname-message' }, {}),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={formatMessage({ id: 'accountsettings.basic.profile' })}>
              {getFieldDecorator('userInfo', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'accountsettings.basic.profile-message' }, {}),
                  },
                ],
              })(
                <Input.TextArea
                  placeholder={formatMessage({ id: 'accountsettings.basic.profile-placeholder' })}
                  rows={4}
                />,
              )}
            </FormItem>
            <FormItem label={formatMessage({ id: 'accountsettings.basic.phone' })}>
              {getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'accountsettings.basic.phone-message' }, {}),
                  },
                  { validator: validatorPhone },
                ],
              })(<PhoneView />)}
            </FormItem>
            <Button type="primary" onClick={this.handlerSubmit}>
              <FormattedMessage
                id="accountsettings.basic.update"
                defaultMessage="Update Information"
              />
            </Button>
          </Form>
        </div>
        <div className={styles.right}>
          <AvatarView avatar={this.getAvatarURL()} />
        </div>
      </div>
    );
  }
}

export default connect(
  ({ user, login }: ConnectState) =>
  ({
    currentUser: user.currentUser,
    accessToken: login.accessToken,
  } as BaseViewProps),
)(Form.create<BaseViewProps>()(BaseView));

