import React, { useEffect, useReducer } from 'react';
import styles from './index.less';
import { connect } from 'dva';
import { CurrentUser } from '@/models/user';
import { ConnectState } from '@/models/connect';
import { Dispatch } from 'redux';
import { getList, updateStatus } from '@/services/interviewee';
import { Table, Divider, Avatar, Tag } from 'antd';
import { ActionText } from '@/components/smallCom/ActionText';

interface TableComProps {
  currentUser: CurrentUser;
  accessToken: string;
  dispatch: Dispatch;
}

interface TableItem {
  name: string;
  gender: number;
  tel: string;
  time: string;
  avatar: string;
  saySome: string;
  status: string;
  key: number;
}

interface TableAction {
  type: string;
  index: number;
  newAct?: string;
  list?: Array<TableItem>;
}

interface FormData {
  date: string;
  mobile: string;
  saySome: string;
  time?: string;
  startTime?: string;
  endTime?: string;
}

interface UserInfo {
  avatarUrl: string;
  city: string;
  country: string;
  gender: number;
  language: string;
  nickName: string;
  province: string;
}

interface CombienData {
  formData: FormData;
  userInfo: UserInfo;
  status: string;
  [key: string]: any;
}

const genderMap = {
  0: '未知',
  1: '男',
  2: '女'
}

const TableCom: React.FC<TableComProps> = props => {
  const { currentUser, accessToken } = props;
  function listReducer(state: Array<TableItem>, action: TableAction) {
    const actionMap = {
      init: () => action.list,
      changeStatus: () => {
        const { index } = action;
        const target = state[index];
        target.status = action.newAct || 'accept';
        return [...state.slice(0, index), target, ...state.slice(index + 1)];
      },
    };
    return actionMap[action.type]();
  };
  const [tableData, setList] = useReducer(listReducer, []);
  const changeStatus = (index: number, act: 'accept' | 'deny') => {
    // eslint-disable-next-line no-underscore-dangle
    updateStatus({ _id: tableData[index]._id, status: act });
    setList({ type: 'changeStatus', index, newAct: act });
  };
  useEffect(() => {
    const getInterviewerList = async () => {
      const res = await getList({
        name: currentUser.name || '',
        token: accessToken,
      });
      const parsedList: Array<TableItem> = res.data
        .map((item: string): { formData: object; userInfo: object } => JSON.parse(item))
        .map(({ formData, userInfo, status, _id }: CombienData, index: number) => {
          const { nickName, gender, avatarUrl } = userInfo || {};
          const { mobile, date = '111', time = '222', saySome = 'lalala' } = formData;
          return {
            name: nickName,
            gender,
            tel: mobile,
            time: `${date  } ${  time}`,
            avatar: avatarUrl,
            saySome,
            status,
            key: index,
            _id,
          } as TableItem;
        });
      setList({ type: 'init', index: 0, list: parsedList });
    };
    getInterviewerList();
  }, []);
  const columns = [
    {
      title: '昵称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <ActionText text={text} className={styles.action} />,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (text: number) => genderMap[text],
    },
    {
      title: '电话',
      dataIndex: 'tel',
      key: 'tel',
    },
    {
      title: '预约时段',
      key: 'time',
      dataIndex: 'time',
    },
    {
      title: '状态',
      key: 'status',
      render: (tags: TableItem) => {
        const colorMap = {
          apply: 'geekblue',
          accept: 'green',
          deny: 'gray',
        };
        return (
          <span>
            <Tag color={colorMap[tags.status]} key={tags.key}>
              {tags.status}
            </Tag>
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text: TableItem) => 
          <span>
            <ActionText text='接受预约' onClick={() => changeStatus(text.key, 'accept')} />
            <Divider type="vertical" />
            <ActionText text='驳回' onClick={() => changeStatus(text.key, 'deny')} />
          </span>
    },
  ];
  return (
    <div className={styles.container}>
      <div id="components-table-demo-basic">
        <Table
          columns={columns}
          expandedRowRender={record => (
            <div className={styles.detail}>
              <Avatar src={record.avatar} />
              <p className={styles.say}>我想对你说: {record.saySome}</p>
            </div>
          )}
          dataSource={tableData}
        />
      </div>
    </div>
  );
};

export default connect(
  ({ user, login }: ConnectState) =>
    ({
      currentUser: user.currentUser,
      accessToken: login.accessToken,
    } as TableComProps),
)(TableCom);
