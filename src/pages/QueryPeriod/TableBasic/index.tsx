import React from 'react';
import { Table } from 'antd';
import styles from './index.less';
import { queryPeriodFreely } from '@/services/period';
import { SINGLE_PAGE_SIZE } from '../accessory';
import { parseList } from '../../PeriodManager';
import { Period, PeriodListAction } from '../../PeriodManager/types';
import { columns } from '../../PeriodManager/TableBasic/index';
import { PageSet } from '@/pages/TableBasic/types';

export default (props: {
  list: Array<Period>;
  currentPage: number;
  user: string;
  setCurrentPage: React.Dispatch<PageSet>;
  action: React.Dispatch<PeriodListAction>;
  getQueryString: Function;
  total: number;
}) => {
  const { list, action, total, currentPage, setCurrentPage, getQueryString } = props;
  async function detail(page: number) {
    const res = await queryPeriodFreely({
      queryString: getQueryString(page),
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
  return (
    <div className={styles.container}>
      <div id="components-table-demo-basic">
        <Table pagination={paginaConfig} columns={columns} dataSource={list} />
      </div>
    </div>
  );
};
