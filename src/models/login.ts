import { Reducer } from 'redux';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import router from 'umi/router';

//  import { fakeAccountLogin } from '@/services/login';
import jwt from 'jwt-simple';
import { login } from '@/services/userInfo';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';

export interface StateType {
  status?: 'ok' | 'error';
  type?: string;
  name?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
  accessToken?: string;
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
    getTokenFromLocalStorage: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      response.name = payload.userName;
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      // Login successfully
      if (response.status === 'ok') {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params as { redirect: string };
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
        router.replace(redirect || '/');
      }
    },

    logout() {
      const { redirect } = getPageQuery();
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/user/login' && !redirect) {
        router.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      localStorage.setItem('tk', payload.accessToken);
      localStorage.setItem('name', payload.name);
      let aa = jwt.decode(payload.accessToken, 'xiaohuli');
      console.log(aa, new Date(aa.tokenTimeStamp));
      return {
        ...state,
        status: payload.status,
        type: payload.type,
        accessToken: payload.accessToken,
        name: payload.name,
      };
    },
    getTokenFromLocalStorage(state) {
      const localToken = localStorage.getItem('tk');
      return {
        ...state,
        accessToken: localToken || '',
      };
    },
  },
};

export default Model;
