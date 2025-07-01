import type { RouteRecordName } from "vue-router";

export type cacheType = {
  mode: string;
  name?: RouteRecordName;
};

export type positionType = {
  startIndex?: number;
  length?: number;
};

export type appType = {
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
    // 判断是否手动点击Collapse
    isClickCollapse: boolean;
  };
  layout: string;
  device: string;
  viewportSize: { width: number; height: number };
};

export type multiType = {
  path: string;
  name: string;
  meta: any;
  query?: object;
  params?: object;
};

export type setType = {
  title: string;
  fixedHeader: boolean;
  hiddenSideBar: boolean;
};

export type userType = {
  accessToken: string; /** token */
  userId:string; /** 用户id */
  userName: string; /** 用户名 */
  encoding?: string; /** 人员编码 */
  jobNumber: string; /** 工号 */
  realName: string; /** 真实姓名 */
  nickName?: string;/** 昵称 */
  email?: string; /** 邮箱 */
  phoneNumber?: string; /** 手机号 */
  sex?: number; /** 性别  0男 1女 2未知 */
  avatar?: string;  /** 头像 */
  photo?: string;  /** 形象照 */
  idCard?: string; /** 身份证号 */
  entryDate?: string; /** 入职日期 */
  officialDate?: string; /** 转正时间 */
  dimissionDate?: string; /** 离职时间 */
  roles?: Array<string>; /** 当前登录用户的角色 */
  permissions?: Array<string>; /** 当前登录用户的按钮级别权限 */
  /** `accessToken`的过期时间（时间戳） */
  // expires: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  // refreshToken: string;


};
