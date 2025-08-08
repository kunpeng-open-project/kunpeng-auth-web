import { http } from "@/utils/http";
import { serverPath } from "@/utils/serverPath";
import { Result } from "@/config/requestType";


/**
 * post 接口 并且入参是json
 * @param url
 * @param data
 * @param microService 如果不传值 默认是健全系统
 */
export const postJson = (url: string, data?: object, microService?: string) => {
    if (microService){
        return http.request<Result>("post", microService + url, { data });
    }else{
        return http.request<Result>("post", serverPath.authentication + url, { data });
    }
};