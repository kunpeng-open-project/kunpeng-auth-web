import { defineStore } from "pinia"
import { resetRouter, router, routerArrays, storageLocal, store, type userType } from "../utils"
import { useMultiTagsStoreHook } from "./multiTags"
import { removeToken, userKey } from "@/utils/auth"
import { getLogin } from "@/api/system"
import type { Result } from "@/config/requestType"

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    accessToken: storageLocal().getItem<userType>(userKey)?.accessToken ?? "",
    userId: storageLocal().getItem<userType>(userKey)?.userId ?? "",
    userName: storageLocal().getItem<userType>(userKey)?.userName ?? "",
    encoding: storageLocal().getItem<userType>(userKey)?.encoding ?? "",
    jobNumber: storageLocal().getItem<userType>(userKey)?.jobNumber ?? "",
    realName: storageLocal().getItem<userType>(userKey)?.realName ?? "",
    nickName: storageLocal().getItem<userType>(userKey)?.nickName ?? "",
    email: storageLocal().getItem<userType>(userKey)?.email ?? "",
    phoneNumber: storageLocal().getItem<userType>(userKey)?.phoneNumber ?? "",
    avatar: storageLocal().getItem<userType>(userKey)?.avatar ?? "",
    photo: storageLocal().getItem<userType>(userKey)?.photo ?? "",
    idCard: storageLocal().getItem<userType>(userKey)?.idCard ?? "",
    entryDate: storageLocal().getItem<userType>(userKey)?.entryDate ?? "",
    officialDate: storageLocal().getItem<userType>(userKey)?.officialDate ?? "",
    dimissionDate: storageLocal().getItem<userType>(userKey)?.dimissionDate ?? "",
    sex: storageLocal().getItem<userType>(userKey)?.sex ?? 2,
    roles: storageLocal().getItem<userType>(userKey)?.roles ?? [],
    permissions: storageLocal().getItem<userType>(userKey)?.permissions ?? []
    // 是否勾选了登录页的免登录
    // isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    // loginDay: 7

    /** `accessToken`的过期时间（时间戳） */
    // expires: T;
    /** 用于调用刷新accessToken的接口时所需的token */
    // refreshToken: string;
  }),
  actions: {
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<Result>((resolve, reject) => {
        getLogin(data)
          .then(data => {
            if (data.success) {
              storageLocal().setItem(userKey, data.data)
              Object.entries(data.data).forEach(([key, value]) => {
                if (this.$state.hasOwnProperty(key)) {
                  this.$state[key] = value
                }
              })
            }
            resolve(data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    /** 前端登出（不调用接口） */
    logOut() {
      Object.keys(this.$state).forEach(key => {
        this.$state[key] = null
      })
      removeToken()
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays])
      resetRouter()
      router.push("/login")
    }
    /** 刷新`token` */
    // async handRefreshToken(data) {
    //     return new Promise<RefreshTokenResult>((resolve, reject) => {
    //         refreshTokenApi(data)
    //             .then(data => {
    //                 if (data) {
    //                     // setToken(data.data);
    //                     resolve(data);
    //                 }
    //             })
    //             .catch(error => {
    //                 reject(error);
    //             });
    //     });
    // }
  }
})

export function useUserStoreHook() {
  return useUserStore(store)
}
