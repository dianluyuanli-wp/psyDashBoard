import {UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { reqPost, purePost } from '@/services/commonUtils';

const SIZE = 1 * 1024 * 1024; // 切片大小

// 生成文件切片
function createFileChunk(file: File | Blob | undefined, size = SIZE) {
    if (!file) {
        return [];
    }
    const fileChunkList = [];
    let cur = 0;
    while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) });
        cur += size;
    }
    return fileChunkList;
}

export function getFileDate(file: File | Blob | undefined, callback: Function) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    if (file) {
        reader.readAsArrayBuffer(file);
    }
}

export function getBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString());
    reader.onerror = error => reject(error);
  });
}

export async function uploadFile(params: FormData) {
    return purePost('uploadFile', params);
}

export async function fileMergeReq(name: string) {
    return reqPost('fileMergeReq', { fileName: name, size: SIZE });
}

export async function upload(info: UploadChangeParam<UploadFile<any>>) {
    const fileList = createFileChunk(info.file.originFileObj);
    if (!info.file.originFileObj) {
        return '';
    }
    const { name: filename } = info.file.originFileObj;
    const dataPkg = fileList.map(({ file }, index) => ({
        chunk: file,
        hash: `${filename}-${index}` // 文件名 + 数组下标
        }));
    const uploadReqList = dataPkg.map(({ chunk, hash}) => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('hash', hash);
        formData.append('filename', filename);
        return formData
    }).map(item => uploadFile(item));
    await Promise.all(uploadReqList);
    const ans = await fileMergeReq(filename);
    return ans;
}