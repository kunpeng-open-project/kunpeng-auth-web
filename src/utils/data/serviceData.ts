//是否启用
export const StartAndStopEnum: { value: number; label: string }[] = [
    { value: 0, label: "停用" },
    { value: 1, label: "正常" },
];


// 是否管理
export const ManageEnum: { value: number; label: string }[] = [
    { value: 0, label: "不管理" },
    { value: 1, label: "管理" },
];


// 用户账号状态
export const UserAccountNumberStatusEnum: { value: number; label: string }[] = [
    { value: 1, label: "正常" },
    { value: 2, label: "禁用" },
    { value: 3, label: "锁定" },
    { value: 4, label: "注销" },
];

// 用户状态
export const UserStatusEnum: { value: number; label: string }[] = [
    { value: 1, label: "实习" },
    { value: 2, label: "转正" },
    { value: 3, label: "离职" },
];




//是否显示 否0 1是
export const VisibleEnum: { value: number; label: string }[] = [
    { value: 1, label: "显示" },
    { value: 0, label: "不显示" },
];
//菜单类型
export const MenuEnum: { value: string; label: string }[] = [
    { value: "M", label: "目录" },
    { value: "C", label: "菜单" },
    { value: "B", label: "按钮" },
    { value: "I", label: "接口" }
];

// 是否
export const YesOrNo: { value: number; label: string }[] = [
    { value: 1, label: "是" },
    { value: 0, label: "否" },
];


//链接类型
export const FrameStatus: { value: number; label: string }[] = [
    { value: 1, label: "内部" },
    { value: 2, label: "外链内嵌" },
    { value: 3, label: "外链" },
];

// 用户性别
export const UserSexEnum: { value: number; label: string }[] = [
    { value: 1, label: "男" },
    { value: 0, label: "女" },
    { value: 2, label: "未知" },
];

// 操作
export const DataAuthorityTypeEnum: { value: number; label: string }[] = [
    { value: 1, label: "仅本人数据权限" },
    { value: 2, label: "自定义用户数据" },
    { value: 3, label: "本部门权限" },
    { value: 4, label: "本部门及以下权限" },
    { value: 5, label: "自定义数据权限" },
    { value: 6, label: "全部数据权限" },
];

export const JournalStatusEnum: { value: number; label: string }[] = [
    { value: 1, label: "最近日志" },
    { value: 2, label: "历史日志" },
];

export const LoginTypeEnum: { value: number; label: string }[] = [
    { value: 1, label: "用户登录" },
    { value: 2, label: "授权登录" },
    { value: 3, label: "免密登录" }
];