import { userKey } from "./auth"
import { getQueryMap } from "@pureadmin/utils"
import type { userType } from "@/store/types"
import { getSsoLogin } from "@/api/system"
import { projectCode } from "@/utils/serverPath"
/**
 * 简版前端单点登录，根据实际业务自行编写，平台启动后本地可以跳后面这个链接进行测试 http://localhost:8848/#/permission/page/index?username=sso&roles=admin&accessToken=eyJhbGciOiJIUzUxMiJ9.admin
 * 划重点：
 * 判断是否为单点登录，不为则直接返回不再进行任何逻辑处理，下面是单点登录后的逻辑处理
 * 1.清空本地旧信息；
 * 2.获取url中的重要参数信息，然后通过 setToken 保存在本地；
 * 3.删除不需要显示在 url 的参数
 * 4.使用 window.location.replace 跳转正确页面
 */
import { storageLocal } from "@/store/utils"

void (async () => {
  // 获取 url 中的参数
  const params = getQueryMap(location.href) as userType

  if (!params.accessToken) return

  // 递归执行函数
  const run = async () => {
    try {
      const body = await getSsoLogin({
        projectCode: projectCode,
        accessToken: params.accessToken
      })

      if (body.code === 200) {
        // 成功：保存数据并跳转
        storageLocal().setItem(userKey, body.data)
        const newUrl = `${location.origin}${location.pathname}`
        window.location.replace(newUrl)
        return // 终止递归
      }
    } catch (error) {
      console.warn("SSO登录请求失败，将重试：", error)
    }

    setTimeout(run, 30)
  }

  // 首次执行
  run()
})()
