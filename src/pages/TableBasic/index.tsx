import React, { useEffect, useReducer } from 'react';
import styles from './index.less';
import { connect } from 'dva';
import { CurrentUser } from '@/models/user';
import { ConnectState } from '@/models/connect';
import { Dispatch } from 'redux';
import { getList } from '@/services/userInfo';
import { Table, Divider, Avatar, Tag } from 'antd';

interface TableComProps {
  currentUser: CurrentUser;
  accessToken: string;
  dispatch: Dispatch;
}

const TableCom: React.FC<TableComProps> = props => {
  const { currentUser, accessToken } = props;

  const columns = [
    {
      title: '昵称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a href="javascript:volid(0);">{text}</a>,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (text: number) => (text === 0 ? '未知' : text === 1 ? '男' : '女'),
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
      render: tags => (
        <span>
          <Tag color={'geekblue'} key={tags.key}>
            {tags.status}
          </Tag>
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => {
        return (
          <span>
            <a href="javascript:volid(0);" onClick={accept.bind(null, text.key)}>
              接受预约
            </a>
            <Divider type="vertical" />
            <a href="javascript:volid(0);" onClick={deny.bind(null, text.key)}>
              驳回
            </a>
          </span>
        );
      },
    },
  ];
  const listReducer = function(state, action) {
    const actionMap = {
      init: () => action.list,
      changeStatus: () => {
        const index = action.index;
        const target = state[index];
        target.status = action.newAct;
        return [...state.slice(0, index), target, ...state.slice(index + 1)];
      },
    };
    return actionMap[action.type]();
  };
  const [tableData, setList] = useReducer(listReducer, []);
  const accept = (index: number) => {
    setList({ type: 'changeStatus', index, newAct: 'accept' });
  };
  const deny = (index: number) => {
    setList({ type: 'changeStatus', index, newAct: 'deny' });
  };
  useEffect(() => {
    const getInterviewerList = async () => {
      const res = await getList({
        name: currentUser.name || '',
        token: accessToken,
      });
      const xxx = res.data
        .map(item => JSON.parse(item))
        .map(({ formData, userInfo }, index: number) => {
          const { nickName, gender, avatarUrl } = userInfo;
          const { mobile, date = '111', time = '222', saySome = 'lalala' } = formData;
          return {
            name: nickName,
            gender,
            tel: mobile,
            time: date + ' ' + time,
            avatar: avatarUrl,
            saySome,
            status: 'not done',
            key: index,
          };
        });
      setList({ type: 'init', list: xxx });
    };
    getInterviewerList();
  }, []);
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
