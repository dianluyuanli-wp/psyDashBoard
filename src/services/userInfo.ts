import request from '@/utils/request';

const domain = 'http://localhost:4000/api/';

export async function getUserInfo(): Promise<any> {
  const url = domain + 'query';
  const res = await request(url, {
    method: 'post',
    data: {
      query: 'db.collection("user").where({name:"wang"}).get()',
    },
  });
  res.data = JSON.parse(res.data);
  return res;
}

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
  const url = domain + 'login';
  return request(url, {
    method: 'post',
    data: params,
  });
}

export async function getToken(): Promise<any> {
  const url = domain + 'getToken';
  const res = await request(url, {
    method: 'get',
  });
  res.data = JSON.parse(res.data);
  return res;
}

export async function myQueryCurrent(params: QueryCurrentInfo): Promise<any> {
  const url = domain + 'currentUser';
  const res = await request(url, {
    method: 'post',
    data: params,
  });
  return res;
}
