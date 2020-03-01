import React from 'react';
import styles from './index.less';
import { Table, Divider } from 'antd';
import { getPeriod } from '@/services/period';
import { Period, PeriodListAction, parseList, SINGLE_PAGE_SIZE } from '../index';
import { ActionText } from '@/components/smallCom/ActionText';

const columns = [
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
  },
  // {
  //   title: "Tags",
  //   key: "tags",
  //   dataIndex: "tags",
  // },
  {
    title: 'Action',
    key: 'action',
    render: text => (
      <span>
        <ActionText text='invite' />
        <Divider type="vertical" />
        <ActionText text='Delete' />
      </span>
    ),
  },
];

export default (props: { list: Array<Period>,
    currentPage: number, user: string, setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    action: React.Dispatch<PeriodListAction>,
    total: number }) => {
  const { list, action, total, user, currentPage, setCurrentPage } = props;
  async function detail(page: number) {
    const res = await getPeriod({ counselorId: user, offset: SINGLE_PAGE_SIZE * (page - 1), size: SINGLE_PAGE_SIZE})
    const showList = parseList(res);
    setCurrentPage(page);
    action({ type: 'init', payload: {} as Period, list: showList })
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
        <Table pagination={paginaConfig} columns={columns} dataSource={list} />
      </div>
    </div>
  );
};
