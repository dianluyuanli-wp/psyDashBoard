import React from 'react';
import styles from './index.less';
import { Table, Divider } from 'antd';
import { getPeriod } from '@/services/period';
import { Period, PeriodListAction, parseList } from '../index';
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
        <ActionText text={'invite'} />
        <Divider type="vertical" />
        <ActionText text={'Delete'} />
      </span>
    ),
  },
];

export default (props: { list: Array<Period>,
    currentPage: number, user: string, setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    action: React.Dispatch<PeriodListAction>,
    total: number }) => {
  const { list, action, total, user, currentPage, setCurrentPage } = props;
  const detail = async function(page: number, pageSize?: number) {
    const res = await getPeriod({ counselorId: user, offset: 3 * (page - 1), size: 3})
    const list = parseList(res);
    setCurrentPage(page);
    action({ type: 'init', payload: {} as Period, list })
  }
  const paginaConfig = {    
    onChange: detail,
    total: total,
    current: currentPage,
    pageSize: 3
  };
  return (
    <div className={styles.container}>
      <div id="components-table-demo-basic">
        <Table pagination={paginaConfig} columns={columns} dataSource={list} />
      </div>
    </div>
  );
};
