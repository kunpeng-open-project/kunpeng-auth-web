import { http } from "@/utils/http";
import { serverPath } from "@/utils/serverPath";
import { Result } from "@/config/requestType";


/* 请求post 接口 并且入参是json */
export const postJson = (url, data?: object) => {
    return http.request<Result>("post", serverPath.authentication + url, { data });
};