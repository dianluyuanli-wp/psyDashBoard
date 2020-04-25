import { CurrentUser } from '@/models/user';

export interface Period {
  date: string;
  startTime: string;
  endTime: string;
  status: 'on' | 'off';
  count: number;
  _id: string;
  //  为了渲染tab的时候不报错，必须要有这个可用
  key: string;
}

export interface PeriodAction {
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

export interface PeriodManagerProps {
  currentUser: CurrentUser;
  accessToken: string;
}
