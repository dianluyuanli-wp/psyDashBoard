import request from '@/utils/request';

const domain = 'http://localhost:4000/api/';

const commonPara = {
  name: localStorage.getItem('name'),
  token: localStorage.getItem('tk'),
};

interface QueryPeriodParams {
  counselorId: string;
}
export async function getPeriod(params: QueryPeriodParams): Promise<any> {
  const url = domain + 'queryPeriod';
  const res = await request(url, {
    method: 'post',
    data: Object.assign(commonPara, params),
  });
  return res;
}

interface PeriodParams {
  date: string;
  startTime: string;
  endTime: string;
  counselorId: string;
}
export async function addPeriod(params: PeriodParams): Promise<any> {
  const url = domain + 'addPeriod';
  const res = await request(url, {
    method: 'post',
    data: Object.assign(commonPara, params),
  });
  return res;
}
