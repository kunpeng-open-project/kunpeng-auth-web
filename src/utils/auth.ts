import { useUserStoreHook } from "@/store/modules/user"
import { isIncludeAllChildren, isString, storageLocal } from "@pureadmin/utils"
import { projectCode } from "@/utils/serverPath"

export const userKey = "user-info" + projectCode

export const multipleTabsKey = "user-info"
/** 获取`token` */
export function getToken(): string {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return useUserStoreHook().accessToken
}

/** 删除`token`以及key值为`user-info`的localStorage信息 */
export function removeToken() {
  storageLocal().removeItem(userKey)
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token
}

/** 是否有按钮级别的权限（根据登录接口返回的`permissions`字段进行判断）*/
export const hasPerms = (value: string | Array<string>): boolean => {
  if (!value) return false
  const allPerms = "*:*:*"
  const { permissions } = useUserStoreHook()
  if (!permissions) return false
  if (permissions.length === 1 && permissions[0] === allPerms) return true
  const isAuths = isString(value) ? permissions.includes(value) : isIncludeAllChildren(value, permissions)
  return isAuths ? true : false
}
