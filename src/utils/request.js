import Vue from "vue";
import axios from "axios";
import store from "@/store";
import { Message, MessageBox } from "element-ui";
import { ACCESS_TOKEN } from "@/store/mutation-types";

// 创建axios 实例
const service = axios.create({
    baseURL: "/api", // api base_url
    timeout: 90000, // 请求超时时间
});

const err = (error) => {
    if (
        error.code === "ECONNABORTED" ||
        error.message === "Network Error" ||
        error.message.includes("timeout")
    ) {
        Message.error("请求超时，请稍候重试");
    }
    if (error.response) {
        let data = error.response.data;
        const token = Vue.ls.get(ACCESS_TOKEN);
        console.log("------异常响应------", token);
        console.log("------异常响应------", error.response.status);
        var pathName = window.location.pathname;
        switch (error.response.status) {
            /**
             * 401:未授权，请重新登录、403:拒绝访问、404:很抱歉，资源未找到!、408:请求超时
             * 500:服务器内部错误、502：网关错误、504：网络超时、505：HTTP 版本不受支持
             */
            case 401:
                Message.error("未授权，请重新登录");
                if (token) {
                    store.dispatch("Logout").then(() => {
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    });
                }
                break;
            case 403:
                Message.error("拒绝访问");
                break;
            case 404:
                Message.error("很抱歉，资源未找到!");
                break;
            case 408:
                Message.error("请求超时");
                break;
            case 500:
                Message.error("服务器内部错误");
                break;
            case 502:
                Message.error("网关错误");
                break;
            case 504:
                Message.error("网络超时");
                break;
            case 505:
                Message.error("HTTP 版本不受支持");
                break;
            default:
                Message.error(data.message || data);
                break;
        }
    }
    return Promise.reject(error);
    // return Promise.reject(new Error(error))
};

// 请求拦截器，一般用来添加请求token和请求方法加loading
service.interceptors.request.use(
    (config) => {
        const token = Vue.ls.get(ACCESS_TOKEN);
        if (token) {
            config.headers["X-Access-Token"] = token; // 让每个请求携带自定义 token 请根据实际情况自行修改
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
        // return Promise.reject(new Error(error))
    }
);

// 响应拦截器
service.interceptors.response.use((response) => {
    return response.data;
}, err);

export { service as axios };