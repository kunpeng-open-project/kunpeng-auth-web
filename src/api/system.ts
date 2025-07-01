import { http } from "@/utils/http";
import { projectCode, serverPath } from "@/utils/serverPath";
import { Result, ResultList } from "@/config/requestType";


/** 登录 */
export const getLogin = (data?: object) => {
    return http.request<Result>("post", serverPath.authentication + "/auth/user/login", {data});
};

/** 退出登录 */
export const logOutLogin = () => {
    return http.request("get", serverPath.authentication + "/logout");
};

/** 获取动态路由 */
export const getAsyncRoutes = () => {
    const data = {"projectCode": projectCode};
    return http.request<ResultList>("post", serverPath.authentication + "/api/router/pure/admin", {data});
};

/** 刷新`token` */
// export const refreshTokenApi = (data?: object) => {
//     return http.request<RefreshTokenResult>("post", "/refresh-token", {data});
// };


/*查询项目下拉框*/
export const getProjectSelect = (data?: object) => {
    return http.request<Result>("post", serverPath.authentication + "/project/select", { data });
};


/*查询部门下拉框*/
export const getDeptSelect = (data?: object) => {
    return http.request<Result>("post", serverPath.authentication + "/dept/select", { data });
};


/*查询菜单下拉框*/
export const getMenuSelect = (data?: object) => {
    return http.request<Result>("post", serverPath.authentication + "/menu/select", { data });
};


/*查询角色下拉框*/
export const getRoleSelect = () => {
    return http.request<Result>("post", serverPath.authentication + "/role/select", { });
};


/*查询岗位下拉框*/
export const getPostSelect = () => {
    return http.request<Result>("post", serverPath.authentication + "/post/select", { });
};