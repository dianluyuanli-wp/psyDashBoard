import request from '@/utils/request';
import { reqPost } from './commonUtils';

interface QueryUserParams {
  offset: number;
  size: number;
}

export interface NewUser {
  createName: string;
  identity: 'counselor' | 'manager'
}

export interface User {
  _id: string,
  name: string,
  showName: string,
  identity: string,
  avatar: string,
  isFreezed?: boolean,
  userInfo: string
}

export async function query(): Promise<any> {
  return request('/api/users');
}

export async function queryCurrent(): Promise<any> {
  return request('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}

export async function queryAllUsers(params: QueryUserParams): Promise<any> {
  return reqPost('queryAllUser', params);
}

export async function addUser(params: NewUser): Promise<any> {
  return reqPost('addUser', params);
}

export function parseList(res: any): Array<User>{
  return res.data
  .map((item: string): User => JSON.parse(item))
  .map(({ _id, ...rest }: User) => ({
      ...rest,
      _id,
      key: _id
    } as User)
  );
}

export async function queryUser(setUserList: React.Dispatch<React.SetStateAction<User[]>>) {
  const res = await queryAllUsers({ offset: 0, size: 50 });
  setUserList(parseList(res).filter(item => item.identity === 'counselor'));
}
