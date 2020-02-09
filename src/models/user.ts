import { Effect } from 'dva';
import { Reducer } from 'redux';

//  import { queryCurrent, query as queryUsers } from '@/services/user';
import { query as queryUsers } from '@/services/user';
import { myQueryCurrent } from '@/services/userInfo';

export interface CurrentUser {
  avatar?: string;
  name?: string;
  showName?: string;
  email?: string;
  phone?: string;
  userInfo?: string;
  accessToken?: string;
}

export interface UserModelState {
  currentUser?: CurrentUser;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent({ payload }, { call, put }) {
      const response = yield call(myQueryCurrent, payload);
      yield put({
        type: 'saveCurrentUser',
        payload: response?.data ? JSON.parse(response.data[0]) : {},
      });
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        //  ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
        },
      };
    },
  },
};

export default UserModel;
