import { reqPost } from './commonUtils';

interface UpdatePara {
  _id: string;
  status: string;
}

//  更新状态
export async function updateStatus(params: UpdatePara) {
  return reqPost('updateStatus', params);
}

interface QueryCommonnPara {
  token: string;
}

interface GetListProp extends QueryCommonnPara {
  name: string;
  offset: number;
  size: number;
}

//  获取自己的预约列表
export async function getList(params: GetListProp): Promise<any> {
  return reqPost('getInterviewerList', params);
}

interface InterviewerQueryFreely {
  queryString: string;
}
//  自有查询预约列表
export async function queryInterviewerFreely(params: InterviewerQueryFreely): Promise<any> {
  return reqPost('queryInterviewerFreely', params);
}
