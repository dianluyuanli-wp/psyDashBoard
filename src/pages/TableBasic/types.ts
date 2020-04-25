import { Dispatch } from 'umi';
import { CurrentUser } from '@/models/user';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RangeValue } from 'rc-picker/lib/interface';
import moment from 'moment';

export interface TableComProps {
  currentUser: CurrentUser;
  accessToken: string;
  dispatch: Dispatch;
}

export interface TableItem {
  name: string;
  gender: number;
  tel: string;
  time: string;
  avatar: string;
  saySome: string;
  status: string;
  key: number;
  counselorId: string;
}

export interface TableAction {
  type: string;
  index: number;
  newAct?: string;
  list?: Array<TableItem>;
}

export interface FormData {
  date: string;
  mobile: string;
  saySome: string;
  time?: string;
  startTime?: string;
  endTime?: string;
}

export interface UserInfo {
  avatarUrl: string;
  city: string;
  country: string;
  gender: number;
  language: string;
  nickName: string;
  province: string;
}

export interface CombienData {
  formData: FormData;
  userInfo: UserInfo;
  status: string;
  [key: string]: any;
}

export interface PageObj {
  total: number;
  current: number;
}

export interface PageSet {
  total?: number;
  current?: number;
}

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
