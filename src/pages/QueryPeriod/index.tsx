import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useEffect, useReducer } from 'react';
import { Card, DatePicker, Form, Button, Switch, Input } from 'antd';
import styles from './index.less';
import TableBasic from './TableBasic';
import moment from 'moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RangeValue } from 'rc-picker/lib/interface';
import { updatePeriod, queryPeriodFreely } from '@/services/period';
import { notify } from '@/utils/tools';
import { usePageManager } from '@/utils/commonHooks';
import { Period, PeriodManagerProps, PeriodListAction } from '../PeriodManager/types';

import { connect } from 'umi';
import { ConnectState } from '@/models/connect';

const FItem = Form.Item;
const { RangePicker } = DatePicker;

export const SINGLE_PAGE_SIZE = 10;
export interface QueryObj {
  switchOn: boolean;
  period: RangeValue<moment.Moment>;
  counselorId: string;
}

export interface QueryAction {
  counselorId?: string;
  switchOn?: boolean;
  period?: RangeValue<moment.Moment>;
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
  const [pageObj, setPage] = usePageManager();

  //  列表相关reducer
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

  //  筛选条件相关reducer
  function queryReducer(state: QueryObj, action: QueryAction): QueryObj {
    return { ...state, ...action };
  }
  const [queryObj, setQuery] = useReducer(queryReducer, {
    switchOn: true,
    period: [moment(), moment().add(7, 'days')],
    counselorId: '',
  } as QueryObj);

  async function buttonClick() {
    const res = await queryPeriodFreely({
      queryString: getQueryString(1),
    });
    const List = parseList(res);
    setPList({ type: 'init', payload: {} as Period, list: List });
    setPage({ total: res.pager.Total });
  }

  //  初始化操作
  useEffect(() => {
    buttonClick();
  }, []);

  function getQueryString(pageNum: number) {
    const queryJsonString = JSON.stringify(
      Object.assign(
        {},
        queryObj.switchOn
          ? {
              date: `_.gt('${queryObj.period?.[0]?.format('YYYY-MM-DD')}
              ').and(_.lt('${queryObj.period?.[1]?.format('YYYY-MM-DD')}'))`,
            } : {},
        queryObj.counselorId ? { counselorId: `'${queryObj.counselorId}'` } : {},
      ),
    ).replace(/"/g, '');
    //  这里要替换下，否则后台会理解为字符串而不是查询条件
    return `db.collection('period').where(${queryJsonString}).skip(${(pageNum - 1) *
      SINGLE_PAGE_SIZE}).limit(${SINGLE_PAGE_SIZE}).orderBy('date','desc').get()`;
  }

  function queryPeriod(momentArray: RangeValue<moment.Moment>) {
    setQuery({
      period: momentArray,
    });
  }

  function changeSwitch(checked: boolean) {
    setQuery({
      switchOn: checked,
    });
  }

  function changeInput(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery({
      counselorId: event.target.value,
    });
  }

  return (
    <PageHeaderWrapper className={styles.main}>
      <Card title="查询条件">
        <Form className={styles.range}>
          <FItem label="日期过滤">
            <Switch defaultChecked={queryObj.switchOn} onChange={changeSwitch} />
          </FItem>
          {queryObj.switchOn && (
            <FItem label="咨询日期">
              <RangePicker onChange={queryPeriod} size="small" defaultValue={queryObj.period} />
            </FItem>
          )}
          <FItem label="咨询师id">
            <Input size="small" defaultChecked={queryObj.switchOn} onChange={changeInput} />
          </FItem>
          <Button className={styles.newRecord} onClick={buttonClick} type="primary">
            搜索
          </Button>
        </Form>
      </Card>
      <TableBasic
        list={periodList}
        currentPage={pageObj.current}
        getQueryString={getQueryString}
        action={setPList}
        setCurrentPage={setPage}
        total={pageObj.total}
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
