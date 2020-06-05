import React from 'react';
import { Table } from 'antd';
import styles from './index.less';
import { getPeriod } from '@/services/period';
import { parseList, SINGLE_PAGE_SIZE } from '../index';
import { Period, PeriodListAction } from '../types';
import moment from 'moment';
import { ActionText } from '@/components/smallCom/ActionText';
import { PageSet } from '@/pages/TableBasic/types';

export const columns = [
  {
    title: '咨询师id',
    dataIndex: 'counselorId',
    key: 'counselorId',
    render: (text: string) => <ActionText text={text} className={styles.action} />,
  },
  {
    title: '日期',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: '咨询时段',
    key: 'time',
    render: (item: Period) => `${item.startTime}  :  ${item.endTime}`,
  },
  {
    title: '状态',
    key: 'status',
    render: (item: Period) => {
      const isOn = item.status === 'on';
      const text = isOn ? '已上架' : '已下架';
      return (
        <span>
          <ActionText style={{ color: isOn ? '' : 'red' }} text={text} />
        </span>
      );
    },
  },
  {
    title: '预约情况',
    key: 'ocupy',
    render: (item: Period) => {
      const isFuture = moment().format('YYYY-MM-DD') < item.date;
      const hasOccupied = item.count === 0;
      if (isFuture) {
        return hasOccupied ? '已预约' : '待预约';
      }
      return hasOccupied ? '已完成' : '未完成';
    },
  },
];

export default (props: {
  list: Array<Period>;
  currentPage: number;
  user: string;
  setCurrentPage: React.Dispatch<PageSet>;
  action: React.Dispatch<PeriodListAction>;
  total: number;
}) => {
  const { list, action, total, user, currentPage, setCurrentPage } = props;
  async function detail(page: number) {
    const res = await getPeriod({
      counselorId: user,
      offset: SINGLE_PAGE_SIZE * (page - 1),
      size: SINGLE_PAGE_SIZE,
    });
    const showList = parseList(res);
    setCurrentPage({ current: page });
    action({ type: 'init', payload: {} as Period, list: showList });
  }
  const paginaConfig = {
    onChange: detail,
    total,
    current: currentPage,
    pageSize: SINGLE_PAGE_SIZE,
  };
  const columnContent = [
    ...columns,
    {
      title: 'Action',
      key: 'action',
      render: (item: Period) => {
        const isOn = item.status === 'on';
        return (
          <span>
            <ActionText
              onClick={() =>
                action({
                  type: 'update',
                  // eslint-disable-next-line no-underscore-dangle
                  id: item._id,
                  action: isOn ? 'off' : 'on',
                })
              }
              text={isOn ? '下架' : '上架'}
            />
          </span>
        );
      },
    },
  ];
  return (
    <div className={styles.container}>
      <div id="components-table-demo-basic">
        <Table pagination={paginaConfig} columns={columnContent} dataSource={list} />
      </div>
    </div>
  );
};
