import { reqPost } from './commonUtils';

interface QueryPeriodParams {
  counselorId: string;
  offset: number;
  size: number;
}
export async function getPeriod(params: QueryPeriodParams): Promise<any> {
  return reqPost('queryPeriod', params);
}

interface PeriodParams {
  date: string;
  startTime: string;
  endTime: string;
  counselorId: string;
  count: number;
  status: 'on' | 'off';
}
export async function addPeriod(params: PeriodParams): Promise<any> {
  return reqPost('addPeriod', params);
}
