import { http } from "@/utils/http";
import { Result, ResultTable } from "@/config/requestType";
import { serverPath } from "@/utils/serverPath";


/**
 * 获取表格数据
 * @param url
 * @param data
 */
export const getTableList = (url: string, data?: object) => {
    return http.request<ResultTable>("post", serverPath.authentication + url, { data });
};


/**
 * 添加表格数据
 * @param url
 * @param data
 */
export const addTableData = (url: string, data?: object) => {
    return http.request<Result>("post", serverPath.authentication + url, { data });
};


/**
 * 修改表格数据
 * @param url
 * @param data
 */
export const updateTableData = (url: string, data?: object) => {
    return http.request<Result>("post", serverPath.authentication + url, { data });
};


/**
 * 查询详情数据
 * @param url
 * @param data
 */
export const queryTableDetails = (url: string, data?: object) => {
    return http.request<Result>("post", serverPath.authentication + url, { data });
};


/**
 * 删除表格数据
 * @param url
 * @param data
 */
export const delTableData = (url: string, data?: object) => {
    return http.request<Result>("post", serverPath.authentication + url, { data });
};


/**
 * 修改表格顺序
 * @param url
 * @param data
 */
export const updateSort = (url: string, data?: object) => {
    return http.request<Result>("post", serverPath.authentication + url, { data });
};
