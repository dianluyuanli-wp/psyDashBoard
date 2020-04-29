import request from '@/utils/request';
import { isAntDesignProOrDev } from '@/utils/utils';

export const domain = isAntDesignProOrDev()
  ? 'http://localhost:4000/api/'
  : 'http://47.75.180.129/api/';

//  export const domain = 'http://47.75.180.129/api/';

export const reqPost = (url: string, para: object) =>
  request(domain + url, {
    method: 'post',
    data: Object.assign({}, para, {
      name: localStorage.getItem('name'),
      token: localStorage.getItem('tk'),
    }),
  });

export const purePost = (url: string, para: object) =>
  request(domain + url, {
    method: 'post',
    data: para,
  });
