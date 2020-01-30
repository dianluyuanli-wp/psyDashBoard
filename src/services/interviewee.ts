import { reqPost } from './commonUtils';

interface UpdatePara {
  _id: string;
  status: string;
}

//  更新状态
export async function updateStatus(params: UpdatePara) {
  return await reqPost('updateStatus', params);
}

interface QueryCommonnPara {
  token: string;
}

interface GetListProp extends QueryCommonnPara {
  name: string;
}

//  获取自己的预约列表
export async function getList(params: GetListProp): Promise<any> {
  return await reqPost('getInterviewerList', params);
}
