import { reqPost } from './commonUtils';

interface singleImg {
    uid: string, 
    size: number, 
    name: string, 
    type: string, 
    url: string
}

interface UpdatePara {
    imgList: Array<singleImg>;
}
  
//  更新页面状态
export async function uploadPageInfo(params: UpdatePara) {
    return reqPost('uploadPageInfo', params);
}

//  拉取页面状态
export async function getPageInfo() {
    return reqPost('getPageInfo', {});
}