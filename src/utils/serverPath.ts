const config = import.meta.env;

// 环境
export const environment = config.VITE_ENVIRONMENT;
//项目code
export const projectCode = config.VITE_PROJECT_CODE;
//请求地址
export const serverPath = {
    authentication: config.VITE_AUTHENTICATION
}
