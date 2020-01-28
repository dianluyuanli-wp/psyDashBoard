import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useReducer } from 'react';
import { Card, DatePicker, TimePicker, Form, Button, notification } from 'antd';
import styles from './index.less';
import TableBasic from './TableBasic';
import { CurrentUser } from '@/models/user';
import { addPeriod, getPeriod } from '@/services/period';

import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
const FItem = Form.Item;

export interface Period {
  date: string;
  startTime: string;
  endTime: string;
  periodId: string;
  key: string;
  _id?: string;
}

interface PeriodAction {
  type: 'date' | 'startTime' | 'endTime' | 'periodId' | 'key';
  value: string;
}

export interface PeriodListAction {
  type: 'add' | 'init';
  payload: Period;
  list: Array<Period>;
}

interface PeriodManagerProps {
  currentUser: CurrentUser;
  accessToken: string;
}

const PeriodManager: React.FC<PeriodManagerProps> = props => {
  const { currentUser, accessToken } = props;
  useEffect(() => {
    const getList = async function() {
      const res = await getPeriod({ counselorId: currentUser.name || '' });
      console.log(res);
      const List: Array<Period> = res.data
        .map((item: string): Period => JSON.parse(item))
        .map(({ _id, ...rest }: Period) => {
          return {
            ...rest,
            key: _id,
          } as Period;
        });
      console.log(List);
      setPList({ type: 'init', payload: {} as Period, list: List });
    };
    getList();
  }, []);

  const reducer = function(state: Period, action: PeriodAction) {
    return { ...state, [action.type]: action.value };
  };
  const [period, setPeriod] = useReducer(reducer, {
    date: '',
    startTime: '',
    endTime: '',
    periodId: '',
    key: '',
  });

  const listReducer = function(state: Array<Period>, action: PeriodListAction) {
    const actionMap = {
      add: () => [action.payload].concat([...state]),
      init: () => action.list,
    };
    return actionMap[action.type]();
  };
  const [periodList, setPList] = useReducer(listReducer, []);
  const change = function(type: 'date' | 'startTime' | 'endTime', _: any, string: string) {
    setPeriod({ type, value: string });
  };

  const but = async function() {
    const { key, periodId, ...rest } = period;
    // notification.error({
    //   message: `参数错误`,
    //   description: '参数错误',
    // });
    const { errcode, id_list } = await addPeriod({ ...rest, counselorId: currentUser.name || '' });
    if (errcode === 0) {
      setPeriod({ type: 'key', value: id_list[0] });
      setPeriod({ type: 'periodId', value: id_list[0] });
      setPList({ type: 'add', list: [], payload: period });
    }
  };

  return (
    <PageHeaderWrapper className={styles.main}>
      <Card title="添加咨询时段">
        <Form className={styles.range}>
          <FItem label="咨询日期">
            <DatePicker onChange={change.bind(null, 'date')} />
          </FItem>
          <FItem label="开始时间">
            <TimePicker format={'HH:mm'} onChange={change.bind(null, 'startTime')} minuteStep={5} />
          </FItem>
          <FItem label="结束时间">
            <TimePicker format={'HH:mm'} onChange={change.bind(null, 'endTime')} minuteStep={5} />
          </FItem>
          <Button className={styles.newRecord} onClick={but} type={'primary'}>
            新建
          </Button>
        </Form>
      </Card>
      <TableBasic list={periodList} action={setPList} />
    </PageHeaderWrapper>
  );
};

export default connect(
  ({ user, login }: ConnectState) =>
    ({
      currentUser: user.currentUser,
      accessToken: login.accessToken,
    } as PeriodManagerProps),
)(PeriodManager);
