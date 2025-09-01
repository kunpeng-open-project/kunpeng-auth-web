import type { TableSize } from "@/utils/data/systemType"

/**
 * 搜索条件选项
 */
export const TableSizeEnum: { value: TableSize; label: string }[] = [
  { value: "large", label: "宽松" },
  { value: "default", label: "默认" },
  { value: "small", label: "紧凑" }
]

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
}

/**
 * 分页
 */
export class PageData {
  pageNum: number = 1
  pageSize: number = 10
  orderBy: string = null
}

/**
 * 页面基本信息配置
 */
export interface TableDialogColumn {
  //  标题
  title: string
  // 表单主键
  tableKey: string
  //请求地址路径 不传默认都是鉴权系统
  apiPath?: string
  // 列表接口地址
  listApi: string
  // 新增接口地址
  saveApi?: string
  // 新增按钮权限
  addButtonAuth?: string
  // 修改接口地址
  updateApi?: string
  // 修改按钮权限
  updateButtonAuth?: string
  // 删除接口地址
  delApi?: string
  // 删除按钮权限
  delButtonAuth?: string
  // 详情接口地址
  detailsApi?: string
  // 详情按钮权限
  detailsButtonAuth?: string
  //  排序接口地址
  sortApi?: string

  // 扩展内容
  [key: string]: any
}

/**
 * 表格显示内容
 */
export interface TableColumn {
  prop: string
  label: string
  sort?: boolean //是否排序
  width?: string
  prefixIcon?: string
  type?: string //类型 avatar 表示头像
  avatarIma?: string // 头像的默认图片
  render?: { [key: string | number]: string } // 自定义渲染 翻译数字变成中文  例如 render: { M: "目录", C: "菜单", B: "按钮", I: "接口" }
  tag?: { [key: string | number]: "primary" | "success" | "info" | "warning" | "danger" }
  tagEffect?: "dark" | "light" | "plain" //tag的主题 不传默认是dark
  tagRound?: boolean //tag是否圆角 不传默认 true
  translate?: {
    // 新增：翻译配置（需要翻译时才配置）
    api: string // 翻译接口地址（如 /user/translate）
    responseLabelKey: string // 接口返回数据中的中文名称字段（如 userName）
    microService?: string //请求的服务  如果不传默认请求鉴权系统
  }
}

// interface Translate {
//     api: string; // 翻译接口地址
//     responseLabelKey: string; // 接口返回的中文名称字段
// }

/**
 * 详情页面显示的内容
 */
export interface DetailsColumn {
  // 字段名
  prop: string
  // 显示内容
  label: string
  // 每行显示几列
  span?: number
  // 后缀
  suffix?: string
  // 自定义渲染 翻译数字变成中文  例如 render: { M: "目录", C: "菜单", B: "按钮", I: "接口" }
  render?: { [key: string | number]: string }
  // 标记是list  并且知道list中间连接符  例如  isList:","
  isList?: string
  //功能  copy 复制,formatJson 格式化 多个逗号分割
  ability?: Array<string>
}

/**
 * 详情页面显示的内容
 */
export interface SelectColumn {
  label: string
  value: string
  children?: SelectColumn
}
