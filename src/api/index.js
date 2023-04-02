import { axios } from "@/utils/request";

/**
 * get请求
 * @param url 请求api
 * @param parameter 请求参数
 */
export function getAction(url, parameter) {
    return axios({
        url: url,
        method: "get",
        params: parameter,
    });
}

/**
 * post请求
 * @param url 请求api
 * @param parameter 请求参数
 */
export function postAction(url, parameter) {
    return axios({
        url: url,
        method: "post",
        data: parameter,
    });
}

export function postAction1(url, parameter) {
    return axios({
        url: url,
        method: "post",
        data: parameter,
        contentType: "application/json", //请求头类型
    });
}

export function postAction2(url, parameter) {
    return axios({
        url: url,
        method: "post",
        data: parameter,
        timeout: 300000, // 请求超时时间
    });
}

/**
 * post method= {post | put}
 */
export function httpAction(url, parameter, method) {
    return axios({
        url: url,
        method: method,
        data: parameter,
    });
}

/**
 * put请求
 */
export function putAction(url, parameter) {
    return axios({
        url: url,
        method: "put",
        data: parameter,
    });
}

/**
 *  delete请求
 */
export function deleteAction(url, parameter) {
    return axios({
        url: url,
        method: "delete",
        params: parameter,
    });
}

/**
 * 下载文件 用于excel导出
 */
export function downFile(url, parameter) {
    return axios({
        url: url,
        params: parameter,
        method: "get",
        responseType: "blob",
    });
}