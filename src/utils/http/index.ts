import Axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type CustomParamsSerializer
} from "axios";
import type {
    PureHttpError,
    RequestMethods,
    PureHttpResponse,
    PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import NProgress from "../progress";
import { getToken, formatToken } from "@/utils/auth";
import { useUserStore, useUserStoreHook } from "@/store/modules/user";
import { suite } from "node:test";
import todo = module
import { message } from "@/utils/message";
import { json } from "stream/consumers";

let isMessageShown = false;
// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
    // 请求超时时间
    timeout: 10000,
    headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
    },
    // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
    paramsSerializer: {
        serialize: stringify as unknown as CustomParamsSerializer
    }
};

class PureHttp {
    constructor() {
        this.httpInterceptorsRequest();
        this.httpInterceptorsResponse();
    }

    /** `token`过期后，暂存待执行的请求 */
    private static requests = [];

    /** 防止重复刷新`token` */
    private static isRefreshing = false;

    /** 初始化配置对象 */
    private static initConfig: PureHttpRequestConfig = {};

    /** 保存当前`Axios`实例对象 */
    private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

    /** 重连原始请求 */
    private static retryOriginalRequest(config: PureHttpRequestConfig) {
        return new Promise(resolve => {
            PureHttp.requests.push((token: string) => {
                config.headers["Authorization"] = formatToken(token);
                resolve(config);
            });
        });
    }

    /** 请求拦截 */
    private httpInterceptorsRequest(): void {
        PureHttp.axiosInstance.interceptors.request.use(
            async (config: PureHttpRequestConfig): Promise<any> => {
                // 开启进度条动画
                NProgress.start();
                // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
                if (typeof config.beforeRequestCallback === "function") {
                    config.beforeRequestCallback(config);
                    return config;
                }
                if (PureHttp.initConfig.beforeRequestCallback) {
                    PureHttp.initConfig.beforeRequestCallback(config);
                    return config;
                }
                /** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
                const whiteList = ["/refresh-token", "/login"];
                return whiteList.some(url => config.url.endsWith(url))
                    ? config
                    : new Promise(resolve => {
                        config.headers["Authorization"] = formatToken(getToken());
                        resolve(config);


                        // TODO 以前的
                        // const data = getToken();
                        // if (data) {
                        //   const now = new Date().getTime();
                        //   const expired = parseInt(data.expires) - now <= 0;
                        //   if (expired) {
                        //     if (!PureHttp.isRefreshing) {
                        //       PureHttp.isRefreshing = true;
                        //       // token过期刷新
                        //       useUserStoreHook()
                        //         .handRefreshToken({ refreshToken: data.refreshToken })
                        //         .then(res => {
                        //           const token = res.data.accessToken;
                        //           config.headers["Authorization"] = formatToken(token);
                        //           PureHttp.requests.forEach(cb => cb(token));
                        //           PureHttp.requests = [];
                        //         })
                        //         .finally(() => {
                        //           PureHttp.isRefreshing = false;
                        //         });
                        //     }
                        //     resolve(PureHttp.retryOriginalRequest(config));
                        //   } else {
                        //     config.headers["Authorization"] = formatToken(
                        //       data.accessToken
                        //     );
                        //     resolve(config);
                        //   }
                        // } else {
                        //   resolve(config);
                        // }
                    });
            },
            error => {
                return Promise.reject(error);
            }
        );
    }

    /** 响应拦截 */
    private httpInterceptorsResponse(): void {
        const instance = PureHttp.axiosInstance;
        instance.interceptors.response.use((response: PureHttpResponse) => {
                this.handleError(response.data);
                const $config = response.config;
                // 关闭进度条动画
                NProgress.done();
                // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
                if (typeof $config.beforeResponseCallback === "function") {
                    $config.beforeResponseCallback(response);
                    return response.data;
                }
                if (PureHttp.initConfig.beforeResponseCallback) {
                    PureHttp.initConfig.beforeResponseCallback(response);
                    return response.data;
                }
                return response.data;
            },
            (error: PureHttpError) => {
                const $error = error;
                $error.isCancelRequest = Axios.isCancel($error);
                // 关闭进度条动画
                NProgress.done();
                // 所有的响应异常 区分来源为取消请求/非取消请求
                return Promise.reject($error);
            }
        );
    }

    /** 通用请求工具函数 */
    public request<T>(
        method: RequestMethods,
        url: string,
        param?: AxiosRequestConfig,
        axiosConfig?: PureHttpRequestConfig
    ): Promise<T> {
        const config = {
            method,
            url,
            ...param,
            ...axiosConfig
        } as PureHttpRequestConfig;

        // 单独处理自定义请求/响应回调
        return new Promise((resolve, reject) => {
            PureHttp.axiosInstance.request(config)
                .then((response: undefined) => {
                    resolve(response);
                }).catch(error => {
                // reject(error);
                try {
                    if (error.response.status === 200) {
                        const data = error.response.data;
                        reject(data);
                    } else {
                        message("服务异常, 错误码：" + error.response.status, {
                            type: "error"
                        });
                    }
                } catch (ex) {
                    message("网络链接错误，请稍后再试！", {type: "error"});
                }
            });
        });
    }

    /** 单独抽离的`post`工具函数 */
    public post<T, P>(
        url: string,
        params?: AxiosRequestConfig<P>,
        config?: PureHttpRequestConfig
    ): Promise<T> {
        return this.request<T>("post", url, params, config);
    }

    /** 单独抽离的`get`工具函数 */
    public get<T, P>(
        url: string,
        params?: AxiosRequestConfig<P>,
        config?: PureHttpRequestConfig
    ): Promise<T> {
        return this.request<T>("get", url, params, config);
    }


    public handleError(data: any) {
        switch (data.code) {
            case 200:
                break;
            case 606: //未登录或token已失效
            case 607: //无效token
            case 608: //token已过期
            case 609: //token错误或已过期
            case 610: //账号在其他地方登录, 请被迫下线
                if (!isMessageShown) {
                    isMessageShown = true;
                    useUserStoreHook().logOut();
                    message(data.message, {type: "error"});
                    setTimeout(() => {
                        isMessageShown = false;
                    }, 1000 * 20); // 20秒后重置标志位
                }
                break;
            default:
                message(data.message, {type: "error"});
                break;
        }
    }
}

export const http = new PureHttp();
