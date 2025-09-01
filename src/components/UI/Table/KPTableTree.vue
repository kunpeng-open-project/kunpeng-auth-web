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
          <el-button v-bind:title="tableIsFold ? '折叠' : '展开'" link circle style="margin-right: -5px" @click="handleTableIsFold">
            <IconifyIconOnline :icon="tableIsFold ? 'ri:arrow-up-down-fill' : 'ri:arrow-left-right-fill'" />
          </el-button>

          <el-button size="large" title="刷新" link circle :loading="loading" @click="handleQuery">
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
    <el-table v-if="tableShow" ref="tableRef" v-loading="loading" :data="tableList" :style="tableHeaderStyles" :size="tableSize" :height="tableHeight" fit :row-key="rowKey" :default-expand-all="tableIsFold" :tree-props="{ children: 'children' }" @sort-change="sortChangeOrderBy" @selection-change="multiSelect">
      <el-table-column align="center" type="index" width="30">
        <IconifyIconOnline icon="ri:draggable" class="draggable" />
      </el-table-column>
      <template v-if="checkbox">
        <el-table-column type="selection" width="30" align="center" />
      </template>
      <el-table-column v-for="(column, index) in tableColumn" :key="column.prop" :prop="column.prop" :label="column.label" :width="column.width" :align="index === 0 ? '' : 'center'" :sortable="column.sort === undefined ? false : 'custom'" :sort-orders="['ascending', 'descending']" :render-header="renderHeader" show-overflow-tooltip>
        <template #default="{ row }">
          <slot :name="column.prop" :row="row">
            <template v-if="column.type === 'avatar'">
              <KPAvatar :size="tableSize" :src="row[column.prop] ? row[column.prop] : column.avatarIma" shape="circle" />
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

      <el-table-column v-if="isActionColumnShow" label="操作" align="center" :width="actionWidth" fixed="right">
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
  </el-card>
</template>

<script lang="ts" setup name="KPTableTree">
import { useLayout } from "@/layout/hooks/useLayout"
import { computed, nextTick, onMounted, ref, toRefs, h, useSlots } from "vue"
import { delTableData, getTableList, updateSort } from "@/api/table"
import { ResultTable } from "@/config/requestType"
import { OperateEnum, PageData, TableColumn, TableSizeEnum } from "@/utils/data/systemData"
import { Emitter } from "mitt"
import { removeEmptyAndNull } from "@/utils/json"
import { message, messageNum, numberMessageBox, selectMessageBox } from "@/utils/message"
import { hasAuth } from "@/router/utils"
import Sortable, { MoveEvent } from "sortablejs"
import { treeToList, treeToListNumber } from "@/utils/tree"
import { serverPath } from "@/utils/serverPath"
import KPAvatar from "@/components/UI/Input/KPAvatar.vue"
import { postJson } from "@/api/common"
import type { TableSize } from "@/utils/data/systemType"

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
    rowKey?: string //树型结构的主键key
    sortApi?: string // 排序的api
    initList?: boolean // 是否初始化列表数据
    isExpand?: boolean // 是否展开
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
    rowKey: props => props.tableKey, // 设置 rowKey 的默认值为 tableKey
    initList: true,
    isExpand: false,
    apiPath: serverPath.authentication
  }
)

const { layoutTheme } = useLayout()
// 接收父组件的值 变成响应式 数据  tableColumn table列的定义说明
const { tableColumn } = toRefs(props)
// 接收父组件的值 变成普通数据
let { listApi, delApi, queryParams, eventBus, kpTableQueryHeight, tableKey, sortApi, initList } = props
//table列表数据
const tableList = ref<ResultTable["data"]["list"]>([])
//table 等待框
const loading = ref(false)
//搜索栏是否隐藏
const paramsIsShow = ref(true)
//表格大小
const tableSize = ref<TableSize>("default")
//多选选择值
const multiSelectValue = ref<Array<any>>([])
// table是否展开
const tableIsFold = ref(props.isExpand)
//table 是否显示 用于展开和关闭 使用
const tableShow = ref(true)
//是否允许移动
const isTableMove = ref(true)
//tableRef
const tableRef = ref()
//移动的list
const tableMoveList = ref<Array<any>>([])
// 动态操作区域宽度
const actionWidth = ref("100px")

onMounted(() => {
  if (!initList) return
  queryList(removeEmptyAndNull(queryParams))
  initSort()
})

/**
 * 手动初始化
 * @param queryParams 入参
 */
const init = (queryParams: any) => {
  queryList(removeEmptyAndNull(queryParams))
  initSort()
}

/**
 * 查询列表
 * @param queryParams 入参
 */
const queryList = async (queryParams: any) => {
  eventBus.emit("tableQueryList")
  loading.value = true
  const { data } = await getTableList(props.apiPath, listApi, queryParams)
  tableList.value = data.list ?? tableList.value
  loading.value = false
  eventBus.emit("queryListSuccess")

  await initActionWidthObserver()

  // 遍历所有列，对需要翻译的列执行批量翻译
  if (tableList.value.length <= 0) return

  props.tableColumn.forEach(column => {
    if (column.translate) {
      // 提取当前列的所有ID
      const parameter = tableList.value.map(row => row[column.prop])
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
      message("请在 KPTableTree 标签中配置tableKey或table-key属性", { type: "error" })
      return
    }

    if (!delApi) {
      message("请在 KPTableTree 标签中配置delApi或del-api属性", { type: "error" })
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
 * 折叠和打开折叠
 */
const handleTableIsFold = () => {
  if (tableIsFold.value) {
    tableShow.value = false
    tableIsFold.value = false
    nextTick(() => {
      tableShow.value = true
    })
  } else {
    tableShow.value = false
    tableIsFold.value = true
    nextTick(() => {
      tableShow.value = true
    })
  }
  refresh()
}

/**
 * 打开详情模态框
 * @param row
 */
const openDetailsDialog = (row: any) => {
  eventBus.emit("openDetailsDialog", row)
}

/**
 * 拖拽
 */
const initSort = async () => {
  isTableMove.value = true
  const el = tableRef.value.$el.querySelector(".el-table__body tbody")
  new Sortable(el, {
    animation: 150,
    forceFallback: true,
    dragClass: "sortableGhost",
    handle: ".draggable",
    onStart: () => {
      // 开始拖拽前把树形结构数据扁平化
      tableMoveList.value = treeToList(tableList.value)
    },
    onMove: (evt: MoveEvent) => {
      // 类型断言：明确 evt.dragged 和 evt.related 是表格行元素
      const draggedTr = evt.dragged as HTMLTableRowElement
      const relatedTr = evt.related as HTMLTableRowElement

      const oldRow = tableMoveList.value[draggedTr.rowIndex] // 移动的元素
      const newRow = tableMoveList.value[relatedTr.rowIndex] // 目标位置元素
      console.log(oldRow, newRow)
      if (oldRow.parentId !== newRow.parentId) {
        // 移动的元素与新元素父级id不相同
        messageNum("不允许跨层级移动", { type: "error" })
        isTableMove.value = false
        refresh()
      }
    },
    onEnd: async evt => {
      if (!isTableMove.value) {
        messageNum("不允许跨层级移动", { type: "error" })
        return
      }

      const oldRow = tableMoveList.value[evt.oldIndex] // 移动的那个元素
      const newRow = tableMoveList.value[evt.newIndex] // 新的元素
      // alert(evt.oldIndex)
      // alert(evt.newIndex)
      if (evt.oldIndex === evt.newIndex || oldRow.parentId !== newRow.parentId) return

      loading.value = true
      // console.log(evt.oldIndex + "---" + evt.newIndex);
      //删除老位置
      tableMoveList.value.splice(tableMoveList.value.indexOf(oldRow), 1)
      if (evt.oldIndex < evt.newIndex) {
        //向下移动
        //获取有多少个层级
        const number = treeToListNumber(newRow)
        tableMoveList.value.splice(evt.newIndex + number, 0, oldRow)
        moveChildren(oldRow, evt.newIndex + number, +0)
      } else {
        //向上移动
        tableMoveList.value.splice(evt.newIndex, 0, oldRow)
        moveChildren(oldRow, evt.newIndex + 1, +1)
      }

      let parameter: any[] = []
      let num: number = 1
      tableMoveList.value.forEach(item => {
        parameter.push({ [tableKey]: item[tableKey], sort: num++ })
      })

      const { success } = await updateSort(props.apiPath, sortApi, parameter)
      if (!success) {
        loading.value = false
        refresh()
        return
      }

      await queryList(queryParams)
      refresh()

      message("设置顺序成功", { type: "success" })
    }
  })
}

/**
 * 拖拽刷新
 */
const refresh = () => {
  tableShow.value = false
  nextTick(() => {
    tableShow.value = true
  })
  setTimeout(() => {
    initSort()
  }, 800)
}

/**
 * 树形结构移动顺序
 * @param tree
 * @param newIndex
 * @param num
 */
const moveChildren = (tree: any, newIndex: number, num) => {
  if (!tree.children) return newIndex
  tree.children.forEach(item => {
    tableMoveList.value.splice(tableMoveList.value.indexOf(item), 1)
    tableMoveList.value.splice(newIndex, 0, item)
    // newIndex = newIndex + num;
    // console.log(item.menuName + "---" + newIndex);
    newIndex = moveChildren(item, newIndex + num, num)
  })
  return newIndex
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
  tableList.value.forEach(item => {
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

// 查询列表
eventBus.on("init", (queryParams: any) => {
  init(queryParams)
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
    return `calc(100vh - 195px - ${kpTableQueryHeight})`
  } else {
    return "calc(100vh - 195px)"
  }
})
</script>

<style lang="scss" scoped>
.el-table {
  --el-table-border-color: #fff;
  --el-table-border: 1px solid #ebeef5;
}

/* 移除带有 no-bottom-line 类名的 el-table 底部的横线 */
.no-bottom-line::after {
  display: none;
}

:deep(.el-table__header .el-table__cell.is-leaf, .el-table__fixed-right .el-table__header .el-table__cell.is-leaf) {
  color: var(--header-text-color) !important;
  background-color: var(--header-bg-color) !important;
}

.switchStatus {
  --el-switch-on-color: #13ce66;
  --el-switch-off-color: #ff4949;
}

.action-buttons {
  /*	display: flex;
	  flex-wrap: nowrap; // 防止换行
	  white-space: nowrap; // 防止内容换行
	  overflow: visible; // 确保内容不被隐藏 */

  display: flex;
  flex-wrap: nowrap; // 禁止换行
  gap: 0; // 按钮间距（可调整）
  width: fit-content !important; // 容器宽度=按钮总宽度（核心！）
  min-width: unset !important; // 取消最小宽度限制，避免干扰计算

  /* padding: 4px 8px;         // 上下内边距 */
  overflow: visible !important; // 关键：即使超出容器也显示所有按钮
  white-space: nowrap; // 禁止文字换行
}

.pagination {
  float: right;
  padding-bottom: 22px;
}

.operate_button {
  width: 28px;
  height: 28px;
}

.el-table::after {
  display: none;
}

.draggable {
  cursor: pointer;
}
</style>

<!--
<style lang="scss" scoped>
.el-table {
	&#45;&#45;el-table-border-color: #ffffff;
	&#45;&#45;el-table-border: 1px solid #ebeef5;
}

/* 移除带有 no-bottom-line 类名的 el-table 底部的横线 */
.no-bottom-line::after {
	display: none;
}

:deep(.el-table__header th) {
	background-color: var(&#45;&#45;header-bg-color);
	color: var(&#45;&#45;header-text-color);
}

.switchStatus {
	&#45;&#45;el-switch-on-color: #13ce66;
	&#45;&#45;el-switch-off-color: #ff4949;
}

.action-buttons {
	display: flex;
	flex-wrap: nowrap; // 防止换行
	white-space: nowrap; // 防止内容换行
	overflow: visible; // 确保内容不被隐藏
}

.operate_button {
	width: 28px;
	height: 28px
}

.el-table::after {
	display: none;
}

.draggable {
	cursor: pointer;
}
</style>-->
