import { reqPost } from './commonUtils';
interface QueryPeriodParams {
  counselorId: string;
  offset: number;
  size: number;
}
export async function getPeriod(params: QueryPeriodParams): Promise<any> {
  return await reqPost('queryPeriod', params);
}

interface PeriodParams {
  date: string;
  startTime: string;
  endTime: string;
  counselorId: string;
}
export async function addPeriod(params: PeriodParams): Promise<any> {
  return await reqPost('addPeriod', params);
}
