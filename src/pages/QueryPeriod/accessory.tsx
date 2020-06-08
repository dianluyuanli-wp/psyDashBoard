// eslint-disable-next-line import/no-extraneous-dependencies
import { RangeValue } from 'rc-picker/lib/interface';
import moment from 'moment';

export const STATUS_ARR = ['已预约', '待预约', '已完成', '未完成'];

export const SINGLE_PAGE_SIZE = 10;
export interface QueryObj {
  switchOn: boolean;
  period: RangeValue<moment.Moment>;
  counselorId: string;
  periodStatus: Array<string>;
}

export interface QueryAction {
  counselorId?: string;
  switchOn?: boolean;
  period?: RangeValue<moment.Moment>;
  periodStatus?: Array<string>;
}

export function getTypeQueryStr(vArr: Array<string>) {
  const typeMap = {
    已预约: () => ({
      date: `_.gte(${moment().format('YYYY-MM-DD')})`,
      count: '_.eq(0)',
    }),
    待预约: () => ({
      date: `_.gte(${moment().format('YYYY-MM-DD')})`,
      count: '_.eq(1)',
    }),
    已完成: () => ({
      date: `_.lt(${moment().format('YYYY-MM-DD')})`,
      count: '_.eq(0)',
    }),
    未完成: () => ({
      date: `_.lt(${moment().format('YYYY-MM-DD')})`,
      count: '_.eq(1)',
    }),
  };
  return JSON.stringify(vArr.map(item => typeMap[item]())).replace(/"/g, '');
}
