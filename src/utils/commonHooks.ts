import { useReducer } from 'react';
import { PageObj, PageSet } from '@/pages/TableBasic/types';

//  控制页码
export function usePageManager(): [PageObj, React.Dispatch<PageSet>] {
  function pageReducer(state: PageObj, action: PageSet) {
    return { ...state, ...action };
  }
  const res = useReducer(pageReducer, {
    current: 1,
    total: 1,
  } as PageObj);
  return [res[0], res[1]];
}
