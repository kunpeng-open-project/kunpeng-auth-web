/**
 * 搜索条件选项
 */
export const TableSizeEnum: { value: string; label: string }[] = [
    { value: "large", label: "宽松" },
    { value: "default", label: "默认" },
    { value: "small", label: "紧凑" },
];

/**
 * 操作类型
 */
export const OperateEnum = {
    query: "查询",
    add: "新增",
    update: "修改",
    updateRow: "行内修改",
    reset: "重置",
    setMenuAuthority: "设置菜单权限",
    setDataAuthority: "设置数据权限",
    setRoleUser: "设置角色用户"
};


/**
 * 分页
 */
export class PageData {
    pageNum: number = 1;
    pageSize: number = 10;
    orderBy: string = null;
};

/**
 * 页面基本信息配置
 */
export interface TableDialogColumn {
    //  标题
    title: string;
    // 表单主键
    tableKey: string;
    // 列表接口地址
    listApi: string;
    // 新增接口地址
    saveApi?: string;
    // 新增按钮权限
    addButtonAuth?: string;
    // 修改接口地址
    updateApi?: string;
    // 修改按钮权限
    updateButtonAuth?: string;
    // 删除接口地址
    delApi?: string;
    // 删除按钮权限
    delButtonAuth?: string;
    // 详情接口地址
    detailsApi?: string;
    // 详情按钮权限
    detailsButtonAuth?: string;
    //  排序接口地址
    sortApi?: string;
    // 扩展内容
    [key: string]: any;
}


/**
 * 表格显示内容
 */
export interface TableColumn {
    prop: string;
    label: string;
    //是否排序
    sort?: boolean;
    width?: string;
    prefixIcon?: string;
    type?: string; //类型 avatar 表示头像
    avatarIma?: string; // 头像的默认图片
    // 自定义渲染 翻译数字变成中文  例如 render: { M: "目录", C: "菜单", B: "按钮", I: "接口" }
    render?: {};
}

/**
 * 详情页面显示的内容
 */
export interface DetailsColumn {
    // 字段名
    prop: string;
    // 显示内容
    label: string;
    // 每行显示几列
    span?: number;
    // 后缀
    suffix?: string;
    // 自定义渲染 翻译数字变成中文  例如 render: { M: "目录", C: "菜单", B: "按钮", I: "接口" }
    render?: {};
    // 是否是list
    isList?: boolean;
    //功能  copy,formatJson 多个逗号分割
    ability?: Array<string>;
}


/**
 * 详情页面显示的内容
 */
export interface SelectColumn {
    label: string;
    value: string;
    children?: SelectColumn;
}
