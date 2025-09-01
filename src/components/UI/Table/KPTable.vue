<template>
  <el-card shadow="always">
    <template #header>
      <el-row style="margin-bottom: -20px">
        <el-col :span="12">
          <Auth v-if="addButtonAuth" :value="addButtonAuth">
            <el-button class="operate_button" icon="Plus" type="primary" title="新增" circle @click="openEditDialog(OperateEnum.add, null)" />
          </Auth>
          <el-button v-else-if="!addButtonAuth && addBatchButton" class="operate_button" icon="Plus" type="primary" title="新增" circle @click="openEditDialog(OperateEnum.add, null)" />

          <Auth v-if="updateButtonAuth" :value="updateButtonAuth">
            <el-button class="operate_button" icon="Edit" type="success" size="small" title="修改" circle @click="openEditDialog(OperateEnum.update, null)" />
          </Auth>
          <el-button v-else-if="!updateButtonAuth && updateBatchButton" class="operate_button" icon="Edit" type="success" size="small" title="修改" circle @click="openEditDialog(OperateEnum.update, null)" />

          <Auth v-if="delButtonAuth" :value="delButtonAuth">
            <el-button class="operate_button" icon="Delete" type="danger" size="small" title="删除" circle @click="handleDelete(null)" />
          </Auth>
          <el-button v-else-if="!delButtonAuth && delBatchButton" class="operate_button" icon="Delete" type="danger" size="small" title="删除" circle @click="handleDelete(null)" />

          <slot name="toolbar" />
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button size="large" title="刷新" link circle @click="handleQuery" :loading="loading">
            <IconifyIconOnline icon="ep:refresh" />
          </el-button>
          <el-dropdown trigger="click">
            <el-button size="large" title="密度" link circle>
              <IconifyIconOnline icon="ep:list" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(item, index) in TableSizeEnum" :key="index" v-bind:style="{ background: tableSize === item.value ? '#50A2FA' : '', color: tableSize === item.value ? 'white' : '' }" @click="handleTableHeight(item.value)">
                  {{ item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button size="large" v-bind:title="paramsIsShow ? '隐藏' : '显示'" link circle @click="handleParamsIsShow">
            <IconifyIconOnline :icon="paramsIsShow ? 'ep:hide' : 'ep:view'" />
          </el-button>
        </el-col>
      </el-row>
    </template>

    <el-table v-loading="loading" ref="tableRef" :data="tableList.list" :style="tableHeaderStyles" :size="tableSize" :height="tableHeight" @sort-change="sortChangeOrderBy" @selection-change="multiSelect" fit>
      <template v-if="checkbox">
        <el-table-column type="selection" width="30" align="center" />
      </template>
      <!--      :render-header="renderHeader" 替换成监听器 -->
      <el-table-column v-for="column in tableColumn" :key="column.prop" :prop="column.prop" :label="column.label" :min-width="column.width" align="center" :show-overflow-tooltip="column.type === 'avatar' ? false : true" :sortable="column.sort === undefined ? false : 'custom'" :sort-orders="['ascending', 'descending']">
        <template #default="{ row }">
          <slot :name="column.prop" :row="row">
            <template v-if="column.type === 'avatar'">
              <KPAvatar :size="tableSize" w :src="row[column.prop] ? row[column.prop] : column.avatarIma" shape="circle" />
            </template>
            <template v-else>
              <el-tag v-if="column.tag" :type="column.tag[row[column.prop]]" :round="column.tagRound === undefined ? true : column.tagRound" :effect="column.tagEffect ? column.tagEffect : 'dark'">
                <template v-if="column.prefixIcon">
                  <div style="display: inline-flex; align-items: center">
                    <IconifyIconOnline v-if="row.icon != null" :icon="getIcon(row, column)" class="mr-2" />
                    {{ row[column.prop] }}
                  </div>
                </template>

                <template v-if="column.render">
                  {{ column.render[row[column.prop]] }}
                </template>
              </el-tag>

              <template v-else>
                <template v-if="column.prefixIcon">
                  <div style="display: inline-flex; align-items: center">
                    <IconifyIconOnline v-if="row.icon != null" :icon="getIcon(row, column)" class="mr-2" />
                    {{ row[column.prop] }}
                  </div>
                </template>
                <template v-else>
                  {{ column.render ? column.render[row[column.prop]] : row[column.prop] }}
                </template>
              </template>
            </template>
          </slot>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" v-if="isActionColumnShow" :width="actionWidth" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button v-if="detailsButtonRow && hasAuth(detailsButtonAuth)" type="primary" icon="View" size="small" title="详情" link @click="openDetailsDialog(row)">详情</el-button>
            <el-button v-else-if="detailsButtonRow && !detailsButtonAuth" type="primary" icon="View" size="small" title="详情" link @click="openDetailsDialog(row)">详情</el-button>

            <el-button v-if="updateButtonRow && hasAuth(updateButtonAuth)" type="success" icon="Edit" size="small" title="修改" link @click="openEditDialog(OperateEnum.updateRow, row)">修改</el-button>
            <el-button v-else-if="updateButtonRow && !updateButtonAuth" type="success" icon="Edit" size="small" title="修改" link @click="openEditDialog(OperateEnum.updateRow, row)">修改</el-button>

            <el-button v-if="delButtonRow && hasAuth(delButtonAuth)" type="danger" icon="Delete" size="small" title="删除" link @click="handleDelete(row)">删除</el-button>
            <el-button v-else-if="delButtonRow && !delButtonAuth" type="danger" icon="Delete" size="small" title="删除" link @click="handleDelete(row)">删除</el-button>
            <slot name="actions" :row="row" />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-pagination class="pagination" :current-page="queryParams.pageNum" :page-size="queryParams.pageSize" size="small" layout="total, sizes, prev, pager, next, jumper" :total="tableList.total" :page-sizes="pageSizes" @current-change="handlePaginationChange" @size-change="handlePaginationSize" />
    </template>
  </el-card>
</template>

<script lang="ts" setup name="KPTable">
import { useLayout } from "@/layout/hooks/useLayout"
import { computed, h, nextTick, onMounted, ref, toRefs, useSlots, watch } from "vue"
import { delTableData, getTableList } from "@/api/table"
import { ResultTable } from "@/config/requestType"
import { OperateEnum, PageData, TableColumn, TableSizeEnum } from "@/utils/data/systemData"
import { Emitter } from "mitt"
import { removeEmptyAndNull } from "@/utils/json"
import { message, numberMessageBox, selectMessageBox } from "@/utils/message"
import { hasAuth } from "@/router/utils"
import KPAvatar from "@/components/UI/Input/KPAvatar.vue"
import { serverPath } from "@/utils/serverPath"
import { postJson } from "@/api/common"
import type { TableSize } from "@/utils/data/systemType"
import Table from "@pureadmin/table"

//接收父组件的值
const props = withDefaults(
  defineProps<{
    eventBus: Emitter<any> // 事件总线实例
    listApi: string // 获取列表的地址
    delApi?: string // 删除的地址
    checkbox?: boolean // 是否有复选框
    tableColumn: Array<TableColumn> // 表格列的定义
    tableKey?: string //tableList  主键的key
    addButtonAuth?: string // 新增按钮的权限标识 不传入表示不需要权限
    updateButtonAuth?: string // 修改按钮的权限标识 不传入表示不需要权限
    delButtonAuth?: string // 删除按钮的权限标识 不传入表示不需要权限
    detailsButtonAuth?: string // 详情按钮的权限标识 不传入表示不需要权限
    addBatchButton?: boolean // 无权限的新增按钮
    updateBatchButton?: boolean // 无权限的修改按钮
    delBatchButton?: boolean // 无权限的删除按钮
    detailsButtonRow?: boolean //是否显示行内详情按钮
    updateButtonRow?: boolean // 是否显示行内修改按钮
    delButtonRow?: boolean // 是否显示行内删除按钮
    queryParams?: PageData // 查询参数
    kpTableQueryHeight?: string // 表格高度，默认值
    initList?: boolean // 是否初始化列表数据
    apiPath?: string // 请求的api地址
  }>(),
  {
    detailsButtonRow: false,
    checkbox: false,
    updateButtonRow: false,
    delButtonRow: false,
    addBatchButton: false,
    updateBatchButton: false,
    delBatchButton: false,
    kpTableQueryHeight: "70px",
    queryParams: () => new PageData(),
    initList: true,
    apiPath: serverPath.authentication
  }
)

const { layoutTheme } = useLayout()
// 接收父组件的值 变成响应式 数据  tableColumn table列的定义说明
const { tableColumn } = toRefs(props)
// 接收父组件的值 变成普通数据
let { listApi, delApi, queryParams, eventBus, tableKey, initList } = props
// 接收父组件的值 变成响应式 数据  kpTableQueryHeight
const kpTableQueryHeight = ref(props.kpTableQueryHeight)
//table列表数据
const tableList = ref<ResultTable["data"]>({ list: [], total: 0, size: 100 })
//table 等待框
const loading = ref(false)
//搜索栏是否隐藏
const paramsIsShow = ref(true)
//表格大小
const tableSize = ref<TableSize>("default")
//多选选择值
const multiSelectValue = ref<Array<any>>([])
//分页每页显示条数集合
const pageSizes = ref([])
// 动态操作区域宽度
const actionWidth = ref("100px")
// 定义表格实例的 ref
const tableRef = ref<InstanceType<typeof Table> | null>(null)

onMounted(async () => {
  setPageSizes()
  if (!initList) return
  queryList(removeEmptyAndNull(queryParams))
})

/**
 * 查询列表
 * @param queryParams 入参
 */
const queryList = async (queryParams: any) => {
  eventBus.emit("tableQueryList")
  loading.value = true
  const { data } = await getTableList(props.apiPath, listApi, queryParams)
  tableList.value = data ?? tableList.value
  loading.value = false
  eventBus.emit("queryListSuccess")

  await initActionWidthObserver()

  // 遍历所有列，对需要翻译的列执行批量翻译
  if (tableList.value.list.length <= 0) return

  props.tableColumn.forEach(column => {
    if (column.translate) {
      // 提取当前列的所有ID
      const parameter = tableList.value.list.map(row => row[column.prop])
      batchTranslate(column, parameter)
    }
  })
}

/**
 * 处理删除操作
 * @param row
 */
const handleDelete = (row: any) => {
  let ids = []
  if (row == null) {
    if (numberMessageBox(multiSelectValue.value.length, 2)) return
    multiSelectValue.value.forEach(item => {
      ids.push(item[tableKey])
    })
  } else {
    if (!tableKey) {
      message("请在 KPTable 标签中配置tableKey或table-key属性", { type: "error" })
      return
    }

    if (!delApi) {
      message("请在 KPTable 标签中配置delApi或del-api属性", { type: "error" })
      return
    }
    ids.push(row[tableKey])
  }

  selectMessageBox("是否确认删除 " + ids.length + " 条数据").then(async () => {
    const body = await delTableData(props.apiPath, delApi, ids)
    if (!body.success) return

    await queryList(queryParams)
    message(body.success ? body.data : body.message, { type: body.success ? "success" : "error" })
  })
}

/**
 * 刷新
 */
const handleQuery = () => {
  queryList(removeEmptyAndNull(queryParams))
}

/**
 * 设置密度
 * @param type
 */
const handleTableHeight = (type: TableSize) => {
  tableSize.value = type
}

/**
 * 设置是否隐藏搜索栏
 * @param type
 */
const handleParamsIsShow = () => {
  paramsIsShow.value = !paramsIsShow.value
  eventBus.emit("updateParamsIsShow", paramsIsShow.value)
}

/**
 * 页码跳转
 * @param currentPage
 */
const handlePaginationChange = async (currentPage: number) => {
  queryParams.pageNum = currentPage
  await queryList(removeEmptyAndNull(queryParams))
}

/**
 * 设置每页显示多少条数据
 * @param pageSize
 */
const handlePaginationSize = async (pageSize: number) => {
  queryParams.pageSize = pageSize
  await queryList(removeEmptyAndNull(queryParams))
}

/**
 * 排序
 * @param column
 */
const sortChangeOrderBy = async column => {
  if (column.order == null) return
  let order = column.order == "ascending" ? " asc" : " desc"
  queryParams.orderBy = column.prop + order
  await queryList(removeEmptyAndNull(queryParams))
}

/**
 * 多选的值
 * @param val
 */
const multiSelect = val => {
  multiSelectValue.value = val
  eventBus.emit("receiveMultiSelectValue", multiSelectValue.value)
}

/**
 * 打开模态框
 * @param edit 操作类型
 * @param row 行内数据
 */
const openEditDialog = (edit: string, row: any) => {
  eventBus.emit("openEditDialog", { edit, row })
  emit("openEditDialog", edit, row)
}

/**
 * 打开详情模态框
 * @param row
 */
const openDetailsDialog = (row: any) => {
  eventBus.emit("openDetailsDialog", row)
}

/**
 * 获取动态图标
 * @param row 行数据
 * @param column 列定义
 */
const getIcon = (row: any, column: TableColumn) => {
  return row[column.prefixIcon]
}

/**
 * 动态设置PageSizes
 */
const setPageSizes = () => {
  // 定义默认页面大小选项
  const defaultSizes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  // 获取当前页大小（确保有默认值）
  const currentPageSize = queryParams.pageSize

  // 过滤掉小于等于currentPageSize的值
  const filteredSizes = defaultSizes.filter(size => size > currentPageSize)

  // 组合新的page-sizes：首项为currentPageSize，后续为过滤后的值
  pageSizes.value = [currentPageSize, ...filteredSizes]
}

/**
 * 动态设置列宽度
 * @param column
 */
const renderHeader = ({ column }) => {
  // 创建临时 span 计算文字宽度
  const tempSpan = document.createElement("span")
  tempSpan.style.fontSize = "14px" // 匹配表头字体大小
  tempSpan.style.fontWeight = "500" // 匹配表头字体粗细
  tempSpan.innerText = column.label
  document.body.appendChild(tempSpan)

  // 设置最小宽度（文字宽度 + 额外空间）
  const textWidth = tempSpan.getBoundingClientRect().width
  // column.minWidth = textWidth + 55;
  if (column.sortable === "custom") {
    column.minWidth = textWidth + 55
  } else {
    column.minWidth = textWidth + 25
  }
  document.body.removeChild(tempSpan)

  // 返回 VNode
  return h(
    "span",
    {
      style: {
        whiteSpace: "nowrap",
        display: "inline-block"
      }
    },
    column.label
  )
}

/**
 * 初始化宽度监听：监听.action-buttons容器
 */
const initActionWidthObserver = async () => {
  await nextTick() // 等待DOM结构生成
  // await new Promise(resolve => setTimeout(resolve, 100)); // 等待100ms（确保按钮渲染完成，可根据项目调整）

  const actionContainers = document.querySelectorAll(".action-buttons")
  if (actionContainers.length === 0) return

  // 4. 计算每个容器的真实宽度（此时按钮已完全显示）
  let maxWidth = 0
  actionContainers.forEach(container => {
    // 用getBoundingClientRect()获取包含padding的真实宽度
    const rect = container.getBoundingClientRect()
    const actualWidth = rect.width
    maxWidth = Math.max(maxWidth, actualWidth)
  })

  actionWidth.value = `${maxWidth === 0 ? 0 : maxWidth + 20}px`
}

/**
 * 列翻译器
 * @param column
 * @param ids
 */
const batchTranslate = async (column: TableColumn, ids: (string | number)[]) => {
  const { api, responseLabelKey, microService } = column.translate
  const prop = column.prop

  if (!api || !responseLabelKey) {
    message(`[${column.label}]列翻译配置缺失：需指定 api 和 responseLabelKey`)
    return
  }

  // 去重
  const parameter = Array.from(new Set(ids.filter(id => id != null)))
  if (parameter.length === 0) return

  const { data } = await postJson(api, parameter, microService)

  const translateMap = new Map<string | number, string>()
  data.list.forEach(respItem => {
    const originalId = respItem[prop]
    if (originalId != null) {
      translateMap.set(originalId, respItem[responseLabelKey])
    }
  })
  tableList.value.list.forEach(item => {
    item[prop] = translateMap.get(item[prop])
  })
}

/**
 * 计算：操作列是否需要显示（优先级：插槽存在 > 行内按钮配置）
 */
const isActionColumnShow = computed(() => {
  // 1. 最高优先级：外部传入了 actions 插槽 → 直接显示
  const hasExternalActions = !!useSlots().actions
  if (hasExternalActions) return true

  // 如果有详情按钮并且不需要权限 直接显示
  if (props.detailsButtonRow && !props.detailsButtonAuth) {
    return true
  } else {
    if (hasAuth(props.detailsButtonAuth)) return true
  }

  // 如果有修改按钮并且不需要权限 直接显示
  if (props.updateButtonRow && !props.updateButtonAuth) {
    return true
  } else {
    if (hasAuth(props.updateButtonAuth)) return true
  }

  // 如果有删除按钮并且不需要权限 直接显示
  if (props.delButtonRow && !props.delButtonAuth) {
    return true
  } else {
    if (hasAuth(props.delButtonAuth)) return true
  }

  return false
})
/**
 * 暴露方法
 */
const emit = defineEmits<{
  (e: "openEditDialog", edit: string, row: any): void
}>()

/**
 * 生产者 对外授权
 */
// 查询列表
eventBus.on("queryList", (queryParams: any) => {
  queryList(queryParams)
})

//重新设置搜索框的高度
eventBus.on("setTableHeight", (queryHeight: any) => {
  kpTableQueryHeight.value = queryHeight
})
/**
 * 允许父组件看到的数据
 */
defineExpose({ multiSelectValue })

/**
 * 计算属性，根据 layoutTheme.value.theme 的值返回对应的样式对象
 */
const tableHeaderStyles = computed(() => {
  switch (layoutTheme.value.theme) {
    case "light": //浅色
      return {
        "--header-bg-color": "#F5F7FA",
        "--header-text-color": "#303133"
      }
      break
    case "dark": //深色
      return {}
    case "system": //自动
      return {}
    default:
      return {
        "--header-bg-color": "#262727",
        "--header-text-color": "#E5EAF3"
      }
  }
})

/**
 * 计算表格的最终高度
 */
const tableHeight = computed(() => {
  if (paramsIsShow.value) {
    return `calc(100vh - 260px - ${kpTableQueryHeight.value})`
  } else {
    return "calc(100vh - 260px)"
  }
})

/**
 * 监听表格密度变化，重新计算表头宽度
 */
watch(
  tableSize,
  async newSize => {
    // 等待表格DOM更新（密度切换后表格会重新渲染，需等待DOM稳定）
    await nextTick()
    // 重新执行所有列的 render-header 逻辑
    await reCalculateHeaderWidth()
  },
  { immediate: true }
)

/**
 * 重新计算所有表头的最小宽度（适配密度变化）
 */
const reCalculateHeaderWidth = async () => {
  await nextTick()
  if (!tableRef.value) return

  const columns = tableRef.value.columns
  if (!columns.length) return

  const dynamicWidth = tableSize.value === "large" ? 35 : tableSize.value === "small" ? -25 : 0

  columns.forEach(column => {
    // 创建临时 span 计算文字宽度
    const tempSpan = document.createElement("span")
    // 根据当前 tableSize 设置字体大小（匹配 Element Plus 样式）
    const fontSizeMap = { large: "16px", small: "12px", default: "14px" }
    tempSpan.style.fontSize = fontSizeMap[tableSize.value] || fontSizeMap.default

    tempSpan.style.fontWeight = "500"
    tempSpan.innerText = column.label // 使用真实列的 label
    document.body.appendChild(tempSpan)

    // 计算 minWidth（基于真实列的 sortable 属性）
    const textWidth = tempSpan.getBoundingClientRect().width

    //如果用户自己设置了宽度 就用设置的 不进行自动分配
    const width = props.tableColumn.find(item => item.prop === column.property)?.width ?? 0
    if (width != 0) {
      column.minWidth = width + dynamicWidth
    } else {
      //自动分配宽度
      if (column.sortable === true || column.sortable === "custom") {
        column.minWidth = textWidth + dynamicWidth + 55 // 有排序功能，加额外宽度
      } else {
        column.minWidth = textWidth + dynamicWidth + 25 // 无排序功能，基础宽度
      }
    }

    document.body.removeChild(tempSpan)
  })

  // 强制表格重新渲染列（通过更新 key）
  const tableEl = tableRef.value.$el
  if (tableEl) {
    const oldKey = tableEl.getAttribute("data-key") || "1"
    tableEl.setAttribute("data-key", oldKey === "1" ? "2" : "1")
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  --el-table-border-color: #ffffff;
  --el-table-border: 1px solid #ebeef5;
}

:deep(.el-table__header .el-table__cell.is-leaf, .el-table__fixed-right .el-table__header .el-table__cell.is-leaf) {
  background-color: var(--header-bg-color) !important;
  color: var(--header-text-color) !important;
}

.switchStatus {
  --el-switch-on-color: #13ce66;
  --el-switch-off-color: #ff4949;
}

.action-buttons {
  /*	display: flex;
    flex-wrap: nowrap; // 防止换行
    white-space: nowrap; // 防止内容换行
    overflow: visible; // 确保内容不被隐藏*/

  display: flex;
  flex-wrap: nowrap; // 禁止换行
  white-space: nowrap; // 禁止文字换行
  gap: 0px; // 按钮间距（可调整）
  /*padding: 4px 8px;         // 上下内边距*/
  overflow: visible !important; // 关键：即使超出容器也显示所有按钮
  width: fit-content !important; // 容器宽度=按钮总宽度（核心！）
  min-width: unset !important; // 取消最小宽度限制，避免干扰计算
}

.pagination {
  float: right;
  padding-bottom: 22px;
}

.operate_button {
  width: 28px;
  height: 28px;
}
</style>
