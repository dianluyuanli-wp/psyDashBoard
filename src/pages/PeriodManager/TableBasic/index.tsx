import React from 'react';
import styles from './index.less';
import { Table, Divider, Tag } from 'antd';
import { Period, PeriodListAction } from '../index';
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

export default (props: { list: Array<Period>; action: React.Dispatch<PeriodListAction> }) => {
  const { list, action } = props;
  return (
    <div className={styles.container}>
      <div id="components-table-demo-basic">
        <Table columns={columns} dataSource={list} />
      </div>
    </div>
  );
};
