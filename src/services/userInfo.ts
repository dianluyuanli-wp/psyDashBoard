import request from '@/utils/request';
import { reqPost, domain } from './commonUtils';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export interface QueryCurrentInfo {
  name: string;
  token: string;
}

export async function login(params: LoginParamsType): Promise<any> {
  const url = `${domain}login`;
  return request(url, {
    method: 'post',
    data: params,
  });
}

export async function myQueryCurrent(params: QueryCurrentInfo): Promise<any> {
  return reqPost('currentUser', params);
}

export interface userPara {
  email: string;
  showName: string;
  userInfo: string;
  phone: string;
}

export function updateUserInfo(params: userPara) {
  return reqPost('updateUser', params);
}
