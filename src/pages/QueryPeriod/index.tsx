import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useEffect, useState, useReducer } from 'react';
import { Card, DatePicker, Form, Button, Select } from 'antd';
import styles from './index.less';
import TableBasic from './TableBasic';
import { CurrentUser } from '@/models/user';
import moment from 'moment';
//  import { throttle } from 'lodash';
import { addPeriod, updatePeriod, queryPeriodFreely } from '@/services/period';
import { notify } from '@/utils/tools';

import { connect } from 'umi';
import { ConnectState } from '@/models/connect';

const FItem = Form.Item;
const { Option } = Select;

export const SINGLE_PAGE_SIZE = 10;

export interface Period {
  counselorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'on' | 'off';
  count: number;
  _id: string;
  //  为了渲染tab的时候不报错，必须要有这个可用
  key: string;
}

const targetTimeArray = [8, 9, 10, 11, 14, 15, 16, 17];

interface PeriodAction {
  type: 'date' | 'startTime' | 'endTime' | 'periodId' | 'key';
  value: string;
}

export interface PeriodListAction {
  type: 'add' | 'init' | 'update';
  id?: string;
  action?: 'on' | 'off';
  payload?: Period;
  list?: Array<Period>;
}

interface PeriodManagerProps {
  currentUser: CurrentUser;
  accessToken: string;
}

export function parseList(res: any): Array<Period> {
  return res.data
    .map((item: string): Period => JSON.parse(item))
    .map(
      ({ _id, ...rest }: Period) =>
        ({
          ...rest,
          _id,
          key: _id,
        } as Period),
    );
}

const PeriodManager: React.FC<PeriodManagerProps> = props => {
  const { currentUser } = props;
  const [total, setTol] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  function listReducer(state: Array<Period>, action: PeriodListAction) {
    const dUpdate = () => {
      // eslint-disable-next-line no-underscore-dangle
      const index = state.findIndex(item => item._id === action.id);
      const target = state[index];
      const { _id = '', status } = target;
      target.status = action.action || 'off';
      if (target.count === 0 && status === 'on') {
        notify('已被预约无法下架');
        return state;
      }
      updatePeriod({ _id, status: action.action || 'off' });
      return [...state.slice(0, index), target, ...state.slice(index + 1)];
    };
    const actionMap = {
      add: () => (action?.payload ? [action.payload] : []).concat([...state]),
      init: () => action?.list || [],
      update: dUpdate,
    };
    return actionMap[action.type]();
  }
  const [periodList, setPList] = useReducer(listReducer, []);

  //  初始化操作
  useEffect(() => {
    async function getList() {
      const res = await queryPeriodFreely({
        queryString: `db.collection("period").skip(0).limit(${SINGLE_PAGE_SIZE}).orderBy("date","desc").get()`,
      });
      const List = parseList(res);
      setPList({ type: 'init', payload: {} as Period, list: List });
      setTol(res.pager.Total);
    }
    getList();
  }, []);

  function reducer(state: Period, action: PeriodAction) {
    return { ...state, [action.type]: action.value };
  }
  const [period, setPeriod] = useReducer(reducer, {
    counselorId: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'off',
    count: 1,
    _id: '',
    key: '',
  });

  function change(type: 'date' | 'startTime' | 'endTime', _: moment.Moment | null, string: string) {
    setPeriod({ type, value: string });
  }

  function changePeriodTime(value: string) {
    const temp = `0${value}`.slice(-2);
    setPeriod({ type: 'startTime', value: `${temp}:00` });
    setPeriod({ type: 'endTime', value: `${temp}:50` });
  }

  async function but() {
    const { _id, key, ...rest } = period;
    if (!rest.date || !rest.startTime || !rest.endTime) {
      notify('数据未填写完整');
      return;
    }
    setCurrentPage(1);
    setTol(total + 1);
    // eslint-disable-next-line @typescript-eslint/camelcase
    const { errcode, id_list } = await addPeriod({ ...rest, counselorId: currentUser.name || '' });
    if (errcode === 0) {
      setPeriod({ type: 'key', value: id_list[0] });
      setPeriod({ type: 'periodId', value: id_list[0] });
      setPList({ type: 'add', list: [], payload: period });
    }
  }
  //  不能选以前的日期
  function disableDate(date: moment.Moment) {
    return date < moment();
  }

  return (
    <PageHeaderWrapper className={styles.main}>
      <Card title="添加咨询时段">
        <Form className={styles.range}>
          <FItem label="咨询日期">
            <DatePicker
              disabledDate={disableDate}
              onChange={(_, string) => change('date', _, string)}
            />
          </FItem>
          <FItem label="预约时段">
            <Select placeholder="请选择时段" onChange={(value: string) => changePeriodTime(value)}>
              {targetTimeArray.map(item => (
                <Option key={item} value={item}>
                  {`0${item}`.slice(-2)}:00 - {`0${item}`.slice(-2)}:50
                </Option>
              ))}
            </Select>
          </FItem>
          <Button className={styles.newRecord} onClick={but} type="primary">
            新建
          </Button>
        </Form>
      </Card>
      <TableBasic
        list={periodList}
        currentPage={currentPage}
        action={setPList}
        setCurrentPage={setCurrentPage}
        total={total}
        user={currentUser.name || ''}
      />
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
