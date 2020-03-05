import request from '@/utils/request';

export const domain = 'http://localhost:4000/api/';

//  export const domain = 'http://47.75.180.129/api/';

// export const commonPara = {
//   name: localStorage.getItem('name'),
//   token: localStorage.getItem('tk'),
// };

export const reqPost = (url: string, para: object) => 
  request(domain + url, {
    method: 'post',
    data: Object.assign({}, para, {
      name: localStorage.getItem('name'),
      token: localStorage.getItem('tk'),
    }),
  });
