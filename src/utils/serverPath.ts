const config = import.meta.env

// 环境
export const environment = config.VITE_ENVIRONMENT
//项目code
export const projectCode = config.VITE_PROJECT_CODE
//minio 地址
export const minioUrl = config.VITE_MINIO
//请求地址
export const serverPath = {
  gateway: config.VITE_GATEWAY,
  authentication: config.VITE_AUTHENTICATION,
  weekFlow: config.VITE_WEEK_FLOW
}
