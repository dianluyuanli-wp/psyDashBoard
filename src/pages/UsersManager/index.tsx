import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useEffect, useState, useReducer } from 'react';
import { Card, Form, Button, Select, Input } from 'antd';
import styles from './index.less';
import TableBasic from './TableBasic';
import { updateUserInfo } from '@/services/userInfo';

import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import { CommonComPara } from '@/models/global';
import { queryAllUsers, User, parseList, NewUser, addUser } from '@/services/user';
import { notify } from '@/utils/tools';

const FItem = Form.Item;
const { Option } = Select;

export const SINGLE_PAGE_SIZE = 10;
export const COUNSELOR = 'counselor';
export const MANAGER = 'manager';

export interface Period {
  date: string;
  startTime: string;
  endTime: string;
  status: 'on' | 'off';
  count: number;
  _id: string;
  //  为了渲染tab的时候不报错，必须要有这个可用
  key: string;
}

const roleArray = [{ value: COUNSELOR, label: '咨询师' }, { value: MANAGER, label: '管理员'}];

interface NewUserAction {
  type: 'createName' | 'identity';
  value: string;
}

export interface UserListAction {
  type: 'add' | 'init' | 'update';
  id?: string;
  action?: boolean;
  payload?: User;
  list?: Array<User>;
}

const UsersManager: React.FC<CommonComPara> = props => {
  const { currentUser } = props;
  //  设置总的页码
  const [total, setTol] = useState(0);
  //  设置页码
  const [currentPage, setCurrentPage] = useState(1);
  //  设置列表相关操作
  const [userList, setUserList] = useReducer(listReducer, []);

  function listReducer(state: Array<User>, action: UserListAction) {
    const dUpdate = () => {
      // eslint-disable-next-line no-underscore-dangle
      const index = state.findIndex(item => item._id === action.id);
      const target = state[index];
      const { _id = '' } = target;
      target.isFreezed = action.action || false;
      updateUserInfo({ targetId: _id, isFreezed: action.action });
      return [...state.slice(0, index), target, ...state.slice(index + 1)];
    };
    const actionMap = {
      add: () => (action?.payload ? [action.payload] : []).concat([...state]),
      init: () => action?.list || [],
      update: dUpdate
    };
    return actionMap[action.type]();
  };

  //  初始化列表
  useEffect(() => {
    async function getList() {
      const res = await queryAllUsers({ offset: 0, size: SINGLE_PAGE_SIZE });
      const List = parseList(res);
      setUserList({ type: 'init', payload: {} as User, list: List });
      setTol(res.pager.Total);
    };
    getList();
  }, []);

  //  设置添加的用户
  const [newUser, setNewUser] = useReducer(changeNewUser, {
    createName: '',
    identity: COUNSELOR
  });

  function changeNewUser(state: NewUser, action: NewUserAction) {
    return { ...state, [action.type]: action.value };
  };

  function changeRole(value: 'counselor' | 'manager') {
    setNewUser({ type: 'identity', value });
  }

  function changeInput(event: React.ChangeEvent<HTMLInputElement>) {
    setNewUser({ type: 'createName', value: event.target.value });
  }

  async function createUser() {
    const { ...rest } = newUser;
    if (!rest.createName) {
      notify(`用户id未填写`);
      return;
    }
    setCurrentPage(1);
    setTol(total + 1);
    // eslint-disable-next-line @typescript-eslint/camelcase
    const { errcode, id_list } = await addUser(newUser);
    if (errcode === 0) {
      const newParseUser = { _id: id_list[0], showName: '', avatar: '', userInfo: '', name: newUser.createName, identity: newUser.identity}
      setUserList({ type: 'add', list: [], payload: newParseUser });
    } else if(errcode === 1) {
      notify(`用户id重复`);
    }
  };

  return (
    <PageHeaderWrapper className={styles.main}>
      <Card title="添加账号">
        <Form className={styles.range}>
          <FItem label="用户id">
            <Input onChange={changeInput} />
          </FItem>
          <FItem label="用户角色">
            <Select placeholder="请选择角色" defaultValue={COUNSELOR} onChange={(value: 'counselor' | 'manager') => changeRole(value)}>
              {roleArray.map(item => <Option key={item.value} value={item.value}>{item.label}</Option>)}
            </Select>
          </FItem>
          <Button className={styles.newRecord} onClick={createUser} type='primary'>
            新建
          </Button>
        </Form>
      </Card>
      <TableBasic list={userList}
        currentPage={currentPage}
        action={setUserList} setCurrentPage={setCurrentPage}
        total={total} user={currentUser.name || ''}/>
    </PageHeaderWrapper>
  );
};

export default connect(
  ({ user, login }: ConnectState) =>
    ({
      currentUser: user.currentUser,
      accessToken: login.accessToken,
    } as CommonComPara),
)(UsersManager);
