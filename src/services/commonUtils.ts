import request from '@/utils/request';
export const domain = 'http://localhost:4000/api/';

export const commonPara = {
  name: localStorage.getItem('name'),
  token: localStorage.getItem('tk'),
};

export const reqPost = function(url: string, para: object) {
  return request(domain + url, {
    method: 'post',
    data: Object.assign(para, commonPara),
  });
};
