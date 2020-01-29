import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useEffect, useState, useReducer } from 'react';
import { Card, DatePicker, TimePicker, Form, Button, notification } from 'antd';
import styles from './index.less';
import TableBasic from './TableBasic';
import { CurrentUser } from '@/models/user';
import moment from 'moment';
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

export const parseList = function(res: any): Array<Period>{
  return res.data
  .map((item: string): Period => JSON.parse(item))
  .map(({ _id, ...rest }: Period) => {
    return {
      ...rest,
      key: _id,
    } as Period;
  });
}

const PeriodManager: React.FC<PeriodManagerProps> = props => {
  const { currentUser } = props;
  const [total, setTol] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    const getList = async function() {
      const res = await getPeriod({ counselorId: currentUser.name || '', offset: 0, size: 3 });
      const List = parseList(res);
      setPList({ type: 'init', payload: {} as Period, list: List });
      setTol(res.pager.Total);
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
  const change = function(type: 'date' | 'startTime' | 'endTime', _: moment.Moment | null, string: string) {
    setPeriod({ type, value: string });
  };

  const but = async function() {
    const { key, periodId, ...rest } = period;
    if (!rest.date || !rest.startTime || !rest.endTime) {
      notification.error({
        message: `数据未填写完整`,
        description: '数据未填写完整',
      });
      return;
    }
    setCurrentPage(1);
    setTol(total + 1);
    const { errcode, id_list } = await addPeriod({ ...rest, counselorId: currentUser.name || '' });
    if (errcode === 0) {
      setPeriod({ type: 'key', value: id_list[0] });
      setPeriod({ type: 'periodId', value: id_list[0] });
      setPList({ type: 'add', list: [], payload: period });
    }
  };
  //  不能选以前的日期
  const disableDate = function(date: moment.Moment) {
      return date < moment();
  }

  //  开始时间从八点开始
  const disableStartOur = function() {
    return new Array(8).fill('').map((item, index) => index);
  }
  //  结束小时置灰
  const disableEndHour = function() {
    return new Array(24).fill('').map((item, index) => index)
      .filter(item => item < parseInt(period.startTime.split(':')[0]));
  }
  //  结束分钟置灰
  const disableEndMinute = function(selectHour: number) {
    return new Array(60).fill('').map((item, index) => index)
      .filter(item => {
        const [hour, minute] = period.startTime.split(':').map(item => parseInt(item));
        return selectHour > hour ? false : item <= minute;
      })
  }

  return (
    <PageHeaderWrapper className={styles.main}>
      <Card title="添加咨询时段">
        <Form className={styles.range}>
          <FItem label="咨询日期">
            <DatePicker disabledDate={disableDate} onChange={change.bind(null, 'date')} />
          </FItem>
          <FItem label="开始时间">
            <TimePicker format={'HH:mm'} hideDisabledOptions disabledHours={disableStartOur} onChange={change.bind(null, 'startTime')} minuteStep={5} />
          </FItem>
          <FItem label="结束时间">
            <TimePicker format={'HH:mm'} hideDisabledOptions disabledHours={disableEndHour} disabledMinutes={disableEndMinute} onChange={change.bind(null, 'endTime')} minuteStep={5} />
          </FItem>
          <Button className={styles.newRecord} onClick={but} type={'primary'}>
            新建
          </Button>
        </Form>
      </Card>
      <TableBasic list={periodList}
        currentPage={currentPage}
        action={setPList} setCurrentPage={setCurrentPage}
        total={total} user={currentUser.name || ''}/>
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
