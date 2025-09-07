import { http } from "@/utils/http"
import { Result, ResultTable } from "@/config/requestType"

/**
 * 获取表格数据
 * @param microService 微服务请求路径 http://xxx
 * @param url 请求地址
 * @param data
 */
export const getTableList = (microService: string, url: string, data?: object) => {
  return http.request<ResultTable>("post", microService + url, { data })
}

/**
 * 添加表格数据
 * @param url
 * @param data
 */
export const addTableData = (microService: string, url: string, data?: object) => {
  return http.request<Result>("post", microService + url, { data })
}

/**
 * 修改表格数据
 * @param url
 * @param data
 */
export const updateTableData = (microService: string, url: string, data?: object) => {
  return http.request<Result>("post", microService + url, { data })
}

/**
 * 查询详情数据
 * @param url
 * @param data
 */
export const queryTableDetails = (microService: string, url: string, data?: object) => {
  return http.request<Result>("post", microService + url, { data })
}

/**
 * 删除表格数据
 * @param url
 * @param data
 */
export const delTableData = (microService: string, url: string, data?: object) => {
  return http.request<Result>("post", microService + url, { data })
}

/**
 * 修改表格顺序
 * @param url
 * @param data
 */
export const updateSort = (microService: string, url: string, data?: object) => {
  return http.request<Result>("post", microService + url, { data })
}


/**
 * 审核数据
 * @param url
 * @param data
 */
export const reviewTableData = (microService: string, url: string, data?: object) => {
  return http.request<Result>("post", microService + url, { data })
}