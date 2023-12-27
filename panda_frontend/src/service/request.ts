import axios from 'axios';
import { ElMessage } from 'element-plus';

const defaultConfig = {
  baseURL: '', // 
};
Object.assign(axios.defaults, defaultConfig);
axios.defaults.headers['Content-Type'] = 'application/json';

axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  (resp) => {

    /* return {
      ...resp.data,
      success: resp.status === 200,
    }; */

    return resp.data;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default axios;
