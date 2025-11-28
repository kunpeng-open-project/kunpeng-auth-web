import { http } from "@/utils/http"
import { serverPath } from "@/utils/serverPath"
import type { Result } from "@/config/requestType"

/**
 * post 接口 并且入参是json
 * @param url
 * @param data
 * @param microService 如果不传值 默认是健全系统
 */
export const postJson = (url: string, data?: object, microService?: string) => {
  if (microService) {
    return http.request<Result>("post", microService + url, { data })
  } else {
    return http.request<Result>("post", serverPath.authentication + url, { data })
  }
}

/**
 * post 接口 并且入参是json 用于下载二进制文件
 * @param url
 * @param data
 * @param microService
 */
export const postJsonBlob = (url: string, data?: object, microService?: string) => {
  const requestConfig = {
    data,
    responseType: "blob" as const // 关键：告诉 axios 接收二进制流
  }
  if (microService) {
    return http.request<Blob>("post", microService + url, requestConfig)
  } else {
    return http.request<Blob>("post", serverPath.authentication + url, requestConfig)
  }
}
