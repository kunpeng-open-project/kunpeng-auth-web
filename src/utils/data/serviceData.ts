//是否启用
export const StartAndStopEnum: { value: number; label: string }[] = [
  { value: 0, label: "停用" },
  { value: 1, label: "正常" }
]

// 是否管理
export const ManageEnum: { value: number; label: string }[] = [
  { value: 0, label: "不管理" },
  { value: 1, label: "管理" }
]

// 用户账号状态
export const UserAccountNumberStatusEnum: { value: number; label: string }[] = [
  { value: 1, label: "正常" },
  { value: 2, label: "禁用" },
  { value: 3, label: "锁定" },
  { value: 4, label: "注销" }
]

// 用户状态
export const UserStatusEnum: { value: number; label: string }[] = [
  { value: 1, label: "实习" },
  { value: 2, label: "转正" },
  { value: 3, label: "离职" }
]

//是否显示 否0 1是
export const VisibleEnum: { value: number; label: string }[] = [
  { value: 1, label: "显示" },
  { value: 0, label: "不显示" }
]
//菜单类型
export const MenuEnum: { value: string; label: string }[] = [
  { value: "M", label: "目录" },
  { value: "C", label: "菜单" },
  { value: "B", label: "按钮" },
  { value: "I", label: "接口" }
]

// 是否
export const YesOrNo: { value: number; label: string }[] = [
  { value: 1, label: "是" },
  { value: 0, label: "否" }
]

// 是否同意
export const AgreeOrNot: { value: number; label: string }[] = [
  { value: 1, label: "同意" },
  { value: 0, label: "拒绝" }
]

//链接类型
export const FrameStatus: { value: number; label: string }[] = [
  { value: 1, label: "内部" },
  { value: 2, label: "外链内嵌" },
  { value: 3, label: "外链" }
]

// 用户性别
export const UserSexEnum: { value: number; label: string }[] = [
  { value: 1, label: "男" },
  { value: 0, label: "女" },
  { value: 2, label: "未知" }
]

// 操作
export const DataAuthorityTypeEnum: { value: number; label: string }[] = [
  { value: 1, label: "仅本人数据权限" },
  { value: 2, label: "自定义用户数据" },
  { value: 3, label: "本部门权限" },
  { value: 4, label: "本部门及以下权限" },
  { value: 5, label: "自定义数据权限" },
  { value: 6, label: "全部数据权限" }
]

export const JournalStatusEnum: { value: number; label: string }[] = [
  { value: 1, label: "最近日志" },
  { value: 2, label: "历史日志" }
]

export const LoginTypeEnum: { value: number; label: string }[] = [
  { value: 1, label: "用户登录" },
  { value: 2, label: "授权登录" },
  { value: 3, label: "免密登录" },
  { value: 4, label: "单点登录" },
]

export const PriorityEnum: { value: number; label: string }[] = [
  { value: 1, label: "紧急" },
  { value: 2, label: "高" },
  { value: 3, label: "中" },
  { value: 4, label: "低" },
  { value: 5, label: "规划调研" }
]

export const WeelPriorityEnum: { value: number; label: string }[] = [
  { value: 1, label: "紧急" },
  { value: 2, label: "高" },
  { value: 3, label: "中" },
  { value: 4, label: "低" }
]

// export const SourceEnum: { value: string; label: string }[] = [
//   { value: "会议纪要", label: "会议纪要" },
//   { value: "领导交办任务", label: "领导交办任务" },
//   { value: "团队自主规划", label: "团队自主规划" },
//   { value: "未完成任务跟进", label: "未完成任务跟进" },
//   { value: "风险预警与应对", label: "风险预警与应对" },
//   { value: "突发应急事件", label: "突发应急事件" },
//   { value: "用户反馈", label: "用户反馈" },
//   { value: "规划分解", label: "规划分解" },
//   { value: "运营需求", label: "运营需求" },
//   { value: "创新试点项目", label: "创新试点项目" },
//   { value: "制度/流程规定", label: "制度/流程规定" },
//   { value: "政策响应", label: "政策响应" },
//   { value: "其他", label: "其他" }
// ]

export const PlanStatusEnum: { value: number; label: string }[] = [
  { value: 1, label: "草稿" },
  { value: 2, label: "待审核" },
  { value: 3, label: "审核成功(待拆分)" },
  { value: 4, label: "审核驳回" },
  { value: 5, label: "进行中" },
  { value: 6, label: "已完成" },
  { value: 7, label: "逾期" }
]

export const PlanStatusReviewEnum: { value: number; label: string }[] = [
  { value: 2, label: "待审核" },
  { value: 3, label: "审核成功(待拆分)" },
  { value: 4, label: "审核驳回" },
  { value: 5, label: "进行中" },
  { value: 6, label: "已完成" },
  { value: 7, label: "逾期" }
]
