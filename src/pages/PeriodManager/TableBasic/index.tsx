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
    title: '咨询时段',
    key: 'time',
    render: (item: Period) => `${item.startTime}  :  ${item.endTime}`
  },
  {
    title: '状态',
    key: 'status',
    render: (item: Period) => item.status === 'on' ? '已上架' : '已下架'
  },
  {
    title: '预约情况',
    key: 'ocupy',
    render: (item: Period) => item.count ? '有预约' : '无人预约'
  },
  {
    title: 'Action',
    key: 'action',
    render: (item: Period) => {
      return <span>
        <ActionText onClick={() => clickAction('on', item.key)} text='上架' />
        <Divider type="vertical" />
        <ActionText onClick={() => clickAction('on', item.key)} text='下架' />
      </span>
    }
  },
];

function clickAction(type: 'on' | 'off', id: string) {
  console.log(type, id);
}

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
