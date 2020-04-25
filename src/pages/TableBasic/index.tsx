import React, { useEffect, useReducer } from 'react';
import styles from './index.less';
import { connect } from 'umi';
import { TableComProps, TableItem, TableAction, CombienData } from './types';
import { ConnectState } from '@/models/connect';
import { getList, updateStatus } from '@/services/interviewee';
import { Table, Divider, Avatar, Tag } from 'antd';
import { ActionText } from '@/components/smallCom/ActionText';
import { usePageManager } from '@/utils/commonHooks';

export const SINGLE_PAGE_SIZE = 10;
const genderMap = {
  0: '未知',
  1: '男',
  2: '女',
};

export const tableTitle = [
  {
    title: '来访者昵称',
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
];

export const dealWithRes = (res: any): Array<TableItem> =>
  res.data
    .map((item: string): { formData: object; userInfo: object } => JSON.parse(item))
    .map(({ formData, userInfo, status, _id, counselorId }: CombienData, index: number) => {
      const { nickName, gender, avatarUrl } = userInfo || {};
      const { mobile, date = '111', time = '222', saySome = 'lalala' } = formData;
      return {
        name: nickName,
        gender,
        tel: mobile,
        time: `${date} ${time}`,
        avatar: avatarUrl,
        saySome,
        status,
        key: index,
        counselorId,
        _id,
      } as TableItem;
    });

//  列表相关逻辑
export function listReducer(state: Array<TableItem>, action: TableAction) {
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
}

const TableCom: React.FC<TableComProps> = props => {
  const { currentUser, accessToken } = props;
  const [tableData, setList] = useReducer(listReducer, []);

  //  控制页码
  const [pageObj, setPage] = usePageManager();

  const changeStatus = (index: number, act: 'accept' | 'deny') => {
    // eslint-disable-next-line no-underscore-dangle
    updateStatus({ _id: tableData[index]._id, status: act });
    setList({ type: 'changeStatus', index, newAct: act });
  };

  const getInterviewerList = async (page: number) => {
    const res = await getList({
      name: currentUser.name || '',
      token: accessToken,
      size: SINGLE_PAGE_SIZE,
      offset: (page - 1) * SINGLE_PAGE_SIZE,
    });
    const parsedList = dealWithRes(res);
    setList({ type: 'init', index: 0, list: parsedList });
    setPage({ total: res.pager.Total });
  };
  useEffect(() => {
    getInterviewerList(1);
  }, []);
  const columns = [
    ...tableTitle,
    {
      title: '操作',
      key: 'action',
      render: (text: TableItem) => (
        <span>
          <ActionText text="接受预约" onClick={() => changeStatus(text.key, 'accept')} />
          <Divider type="vertical" />
          <ActionText text="驳回" onClick={() => changeStatus(text.key, 'deny')} />
        </span>
      ),
    },
  ];
  async function moreItem(pageNum: number) {
    getInterviewerList(pageNum);
    setPage({ current: pageNum });
  }
  const paginaConfig = {
    onChange: moreItem,
    total: pageObj.total,
    current: pageObj.current,
    pageSize: 10,
  };
  return (
    <div className={styles.container}>
      <div id="components-table-demo-basic">
        <Table
          pagination={paginaConfig}
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
