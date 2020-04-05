import React from 'react';
import { Table } from 'antd';
import styles from './index.less';
import { SINGLE_PAGE_SIZE, UserListAction } from '../index';
import { queryAllUsers, User, parseList } from '@/services/user';
import { ActionText } from '@/components/smallCom/ActionText';

const columns = (action: React.Dispatch<UserListAction>) => [
  {
    title: '用户id',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '名称',
    dataIndex: 'showName',
    key: 'showName',
  },
  {
    title: '身份',
    key: 'identity',
    render: (item: User) => item.identity === 'counselor' ? '咨询师' : '管理员'
  },
  {
    title: '状态',
    key: 'isFrezzed',
    render: (item: User) => {
      const isOn = item.isFreezed;
      const text = isOn ? '冻结' : '正常';
      return <span><ActionText style={{ color: isOn ? '' : 'red'}} text={text}/></span>
    }
  },
  {
    title: 'Action',
    key: 'action',
    render: (item: User) => {
      const isOn = item.isFreezed;
      return <span>
        <ActionText onClick={() => 
          action({ type: 'update',
          // eslint-disable-next-line no-underscore-dangle
          id: item._id, action: !isOn })} text={isOn ? '解冻' : '冻结'} />
      </span>
    }
  },
];

export default (props: { list: Array<User>,
    currentPage: number, user: string, setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    action: React.Dispatch<UserListAction>,
    total: number }) => {
  const { list, action, total, currentPage, setCurrentPage } = props;
  async function detail(page: number) {
    const res = await queryAllUsers({ offset: SINGLE_PAGE_SIZE * (page - 1), size: SINGLE_PAGE_SIZE})
    const showList = parseList(res);
    setCurrentPage(page);
    action({ type: 'init', payload: {} as User, list: showList })
  }
  const paginaConfig = {    
    onChange: detail,
    total,
    current: currentPage,
    pageSize: SINGLE_PAGE_SIZE
  };
  return (
    <div className={styles.container}>
      <div id="components-table-demo-basic">
        <Table pagination={paginaConfig} columns={columns(action)} dataSource={list} />
      </div>
    </div>
  );
};
