import { message } from "antd"
import axios from "axios"
import {refreshTokenAPI} from "../apis"
import {logoutAccountAPI} from "../redux/user/accountSlice"
import { API_ROOT } from "./environment"
// Đây là kỹ thuật inject store để có thể dùng redux store trong các file .js thông thường (vì redux store chỉ dùng cho các file react component)
let axiosReduxStore;
export const injectStore = mainStore => { axiosReduxStore = mainStore }

let authorizeAxiosInstance = axios.create({
  baseURL: API_ROOT
});
//Thời gian chờ cho một request: 10 phút
authorizeAxiosInstance.defaults.timeout = 1000 * 60 * 10;
// Cấu hình để cho phép gửi cookie
authorizeAxiosInstance.defaults.withCredentials = true;

//Cấu hình interceptor
//request interceptor: can thiệp vào giữa những cái request API
authorizeAxiosInstance.interceptors.request.use((config) => {
    // Do something before request is sent
    return config;
  }, (error) => {
    // Do something with request error
    return Promise.reject(error);
});

let refreshTokenPromise = null

//response interceptor: can thiệp vào giữa những cái reponse nhận về
authorizeAxiosInstance.interceptors.response.use((response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, (error) => {
    if(error.response?.status === 401) {
      axiosReduxStore.dispatch(logoutAccountAPI(false));
    }
    const originalRequests = error.config;
    if(error.response?.status === 410 && originalRequests) {
      if(!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
          .then(data => {
            return data?.accessToken;
          })
          .catch((_error) => {
            axiosReduxStore.dispatch(logoutAccountAPI(false));
            return Promise.reject(_error)
          })
          .finally(() => {
            refreshTokenPromise = null;
          })
      }
      return refreshTokenPromise.then(accessToken => {
        // Return là để gọi lại các api ban đầu bị lỗi
        return authorizeAxiosInstance(originalRequests)
      })
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    let errorMessage = error?.message;
    if(error.response?.data?.message) {
        errorMessage = error.response?.data?.message
    }
    if(error.response?.status !== 410) {
        message.error(errorMessage);
    }
    return Promise.reject(error);
});

export default authorizeAxiosInstance;

//Cách dùng
//B1: import authorizeAxiosInstance
//B2: Sử dụng cho api thay cho axios:
// authorizeAxiosInstance.get/put/post