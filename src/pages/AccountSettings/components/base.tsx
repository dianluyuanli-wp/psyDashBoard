import { UploadOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input, Upload, message, Collapse } from 'antd';
import { UploadChangeParam, RcFile } from 'antd/lib/upload/interface';
import { FormattedMessage, Dispatch, connect, injectIntl } from 'umi';
import React, { Component, Fragment } from 'react';

import { FormComponentProps } from '@ant-design/compatible/es/form';
import { CurrentUser } from '@/models/user';
import PhoneView from './PhoneView';
import styles from './BaseView.less';
import { updateUserInfo, updatePassWord, userPara, updateAvatar } from '@/services/userInfo';
import { ConnectState } from '@/models/connect';
import { getBase64 } from '@/utils/upload';

const FormItem = Form.Item;
const { Panel } = Collapse;

function beforeUpload(file: RcFile) {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isLt2M;
}

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
  dispatch: Dispatch;
  avatar?: string;
  accessToken: string;
  intl: any
}

interface ComState {
  oldPass: string,
  newPass1: string,
  newPass2: string
}

class BaseView extends Component<BaseViewProps> {
  view: HTMLDivElement | undefined = undefined;

  state: ComState;

  constructor(props: BaseViewProps) {
    super(props);
    this.state = {
      oldPass: '',
      newPass1: '',
      newPass2: ''
    };
  }

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
    const { form, intl } = this.props;
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
      message.success(intl.formatMessage({ id: 'accountsettings.basic.update.success' }));
    }
  };

  // 头像组件 方便以后独立，增加裁剪之类的功能
  AvatarView = (avatar: string) => (
    <Fragment>
      <div className={styles.avatar_title}>
        <FormattedMessage id="accountsettings.basic.avatar" defaultMessage="Avatar" />
      </div>
      <div className={styles.avatar}>
        <img src={avatar} alt="avatar" />
      </div>
      <Upload onChange={this.handelUpload} beforeUpload={beforeUpload} showUploadList={false}>
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

  handelUpload = async (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      if (!info.file.originFileObj) {
        return ;
      }
      const base64Url = await getBase64(info.file.originFileObj);
      const res = await updateAvatar({ base64: base64Url });
      const imgUrl: string = res.file_list[0].download_url;
      const updateObj = Object.assign(this.props.currentUser, { avatar: imgUrl });
      this.props.dispatch({
        type: 'user/saveCurrentUser',
        payload: updateObj
      });
      await updateUserInfo(updateObj);
    }
  }

  uploadPass = async () => {
    const { newPass1, newPass2, oldPass } = this.state;
    if(newPass1 !== newPass2) {
      message.warn('输入的新密码必须一致！');
    } else {
      const res = await updatePassWord({ oldPass, newPass: newPass1 });
      if (res.errmsg === 'ok') {
        message.success('改密成功');
      } else {
        message.error('改密失败');
      }
    }
  }

  changePass(type: string, event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      [type]: event.target.value
    })
  }

  render() {
    const {
      form: { getFieldDecorator },
      intl
    } = this.props;
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form layout="vertical" hideRequiredMark>
            <FormItem label={intl.formatMessage({ id: 'accountsettings.basic.email' })}>
              {getFieldDecorator('email', {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'accountsettings.basic.email-message' }, {}),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={intl.formatMessage({ id: 'accountsettings.basic.nickname' })}>
              {getFieldDecorator('showName', {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'accountsettings.basic.nickname-message' }, {}),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={intl.formatMessage({ id: 'accountsettings.basic.profile' })}>
              {getFieldDecorator('userInfo', {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'accountsettings.basic.profile-message' }, {}),
                  },
                ],
              })(
                <Input.TextArea
                  placeholder={intl.formatMessage({ id: 'accountsettings.basic.profile-placeholder' })}
                  rows={4}
                />,
              )}
            </FormItem>
            <FormItem label={intl.formatMessage({ id: 'accountsettings.basic.phone' })}>
              {getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage({ id: 'accountsettings.basic.phone-message' }, {}),
                  },
                  { validator: validatorPhone },
                ],
              })(<PhoneView />)}
            </FormItem>
            <Collapse>
              <Panel header='修改密码' key='1'>
                <Input.Password addonBefore={<span className={styles.spanAdd}>original password</span>} onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePass('oldPass', event)} placeholder='Enter old password' style={{ marginTop: '.2rem' }}/>
                <Input.Password addonBefore={<span className={styles.spanAdd}>new password</span>} placeholder='Enter new password' onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePass('newPass1', event)}/>
                <Input.Password addonBefore={<span className={styles.spanAdd}>confirm password</span>} placeholder='Enter new password again' onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.changePass('newPass2', event)}/>
                <Button type='primary' onClick={this.uploadPass}>修改密码</Button>
              </Panel>
            </Collapse>
            <Button className={styles.updateBtn} type="primary" onClick={this.handlerSubmit}>
              <FormattedMessage
                id="accountsettings.basic.update"
                defaultMessage="Update Information"
              />
            </Button>
          </Form>
        </div>
        <div className={styles.right}>
          {this.AvatarView(this.getAvatarURL())}
        </div>
      </div>
    );
  }
}

export default connect(
  ({ user, login }: ConnectState) =>
  ({
    currentUser: user.currentUser,
    avatar: user.currentUser?.avatar,
    accessToken: login.accessToken,
  } as BaseViewProps),
)(Form.create<BaseViewProps>()(injectIntl(BaseView)));

