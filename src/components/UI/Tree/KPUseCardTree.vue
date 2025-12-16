<template>
  <el-card shadow="hover">
    <!-- 搜索框 -->
    <el-input v-model="filterText" prefix-icon="Search" clearable :placeholder="placeholder" style="margin-bottom: 20px" />
    <el-scrollbar :height="treeHeight">
      <el-tree ref="treeRef" node-key="value" class="filter-tree" :expand-on-click-node="false" :auto-expand-parent="false" :data="treeValue" :default-expanded-keys="expandedKeys" :props="defaultProps" :filter-node-method="filterNode" @node-click="handleNodeClick">
        <template #default="{ node, data }">
          <!-- 为自定义节点添加类名 -->

          <span class="el-tree-node__label custom-tree-label" :title="node.label" @contextmenu.prevent="showContextMenu($event, data)">
            <span class="tree-icon-container" v-if="openIcon || closeIcon">
              <IconifyIconOnline :icon="node.expanded ? openIcon || closeIcon : closeIcon || openIcon" :style="{ color: iconColor }" />
            </span>
            <span class="tree-label-content">{{ node.label }}</span>
          </span>

          <!-- 右键菜单 -->
          <el-dropdown ref="dropdownRef" :virtual-ref="triggerRef" :show-arrow="false" trigger="contextmenu" placement="bottom-start" :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [30, 0] } }] }" virtual-triggering>
            <template #dropdown>
              <el-dropdown-menu>
                <Auth v-if="updateButtonAuth" :value="updateButtonAuth">
                  <el-dropdown-item :icon="CirclePlusFilled" @click="handleDropdownNodeClick(OperateEnum.update)">编辑</el-dropdown-item>
                </Auth>
                <el-dropdown-item v-else :icon="CirclePlusFilled" @click="handleDropdownNodeClick(OperateEnum.update)">编辑</el-dropdown-item>

                <Auth v-if="delButtonAuth" :value="delButtonAuth">
                  <el-dropdown-item :icon="Delete" @click="handleDropdownNodeClick(OperateEnum.del)">删除</el-dropdown-item>
                </Auth>
                <el-dropdown-item v-else :icon="Delete" @click="handleDropdownNodeClick(OperateEnum.del)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-tree>
    </el-scrollbar>

    <template #footer>
      <Auth v-if="addButtonAuth" :value="addButtonAuth">
        <KPButton :title="addButtonTitle" icon="ri:add-fill" buttonStyle="width: 100%;font-size: 18px" style="font-size: 20px" placement="top" @click="openCardThreeDialog(OperateEnum.add, null)" />
      </Auth>
      <KPButton v-else :title="addButtonTitle" icon="ri:add-fill" buttonStyle="width: 100%;font-size: 18px" style="font-size: 20px" placement="top" @click="openCardThreeDialog(OperateEnum.add, null)" />
    </template>
  </el-card>
</template>

<script lang="ts" setup name="KPUseCardTree">
import { computed, onMounted, reactive, ref, watch } from "vue"
import { DropdownInstance, ElDropdown, ElTree } from "element-plus"
import { OperateEnum, SelectColumn } from "@/utils/kp/data/systemData"
import KPButton from "@/components/UI/KPButton/KPButton.vue"
import { CirclePlusFilled, Delete } from "@element-plus/icons-vue"
import { message, selectMessageBox } from "@/utils/message"
import { postJson } from "@/api/common"
import { serverPath } from "@/utils/serverPath"
import { Emitter } from "mitt"
import { getTreeAllValues } from "@/utils/kp/tool/tree"
import { hasAuth } from "@/router/utils"
import { removeEmptyAndNull } from "../../../utils/kp/tool/json"

const props = withDefaults(
  defineProps<{
    placeholder: string // 搜索框提示信息
    expandedKeys?: Array<string> // 默认展开项
    addButtonTitle: string //新增按钮标题
    defaultProps?: {} // 树形下拉选项的属性
    occupyHeight?: string // 最大高度
    queryApi: string // 获取数据地址
    queryParams?: any
    apiPath?: string // 请求的api地址
    eventBus: Emitter<any> // 事件总线实例
    delApi?: string // 删除接口地址
    addButtonAuth?: string // 新增按钮的权限标识 不传入表示不需要权限
    updateButtonAuth?: string // 修改按钮的权限标识 不传入表示不需要权限
    delButtonAuth?: string // 删除按钮的权限标识 不传入表示不需要权限
    openIcon?: string // 打开图标
    closeIcon?: string // 关闭图标
    iconColor?: string // 图标颜色（可选，父组件可直接传入）
  }>(),
  {
    defaultProps: () => ({
      label: "label",
      value: "value",
      children: "children"
    }),
    occupyHeight: "190px",
    expandedKeys: () => [],
    queryParams: () => ({}),
    apiPath: serverPath.authentication
  }
)
let { queryApi, queryParams, delApi, apiPath, eventBus, updateButtonAuth, delButtonAuth } = props
// 树形下拉选项的值
const treeValue = reactive<Array<SelectColumn>>([])
// 搜索框model
const filterText = ref("")
// tree的ref
const treeRef = ref<InstanceType<typeof ElTree>>()
// 右键菜单ref
const dropdownRef = ref<DropdownInstance>()
// 右键菜单触发元素ref
const triggerRef = ref({ getBoundingClientRect: () => position.value })
// 右键菜单位置
const position = ref({ top: 0, left: 0, bottom: 0, right: 0 } as DOMRect)
//右键选择的对象
const selectedNode = reactive<any>({})

onMounted(async () => {
  await queryThree(queryParams)
  emit("treeDataLoaded", treeValue)
})

const queryThree = async (queryParams: any) => {
  let body = await postJson(queryApi, removeEmptyAndNull(queryParams), apiPath)
  Object.keys(treeValue).map(key => delete treeValue[key])
  Object.assign(treeValue, body.data || [])
}

/**
 * 显示右键菜单
 * @param event 鼠标事件
 * @param data 节点数据
 */
const showContextMenu = (event: MouseEvent, data: any) => {
  // 判断是否存在需要校验的权限
  const hasAuthToCheck = !!updateButtonAuth || !!delButtonAuth
  if (hasAuthToCheck) {
    // 存在需要校验的权限时，检查是否至少有一个通过
    const updateAuthPassed = !updateButtonAuth || hasAuth(updateButtonAuth)
    const delAuthPassed = !delButtonAuth || hasAuth(delButtonAuth)

    // 如果两个权限（存在的情况下）都不通过，则阻止执行
    if (!updateAuthPassed && !delAuthPassed) return
  }

  Object.keys(selectedNode).map(key => delete selectedNode[key])
  Object.assign(selectedNode, data)
  const { clientX, clientY } = event
  position.value = DOMRect.fromRect({
    x: clientX,
    y: clientY
  })
  event.preventDefault()
  dropdownRef.value?.handleOpen()
}

/**
 * 右键菜单点击事件
 * @param edit
 */
const handleDropdownNodeClick = (edit: string) => {
  switch (edit) {
    case OperateEnum.update:
      eventBus.emit("openCardThreeDialog", { edit, selectedNode })
      emit("treeContextClick", edit, selectedNode)
      break
    case OperateEnum.del:
      // 判断是否有子集（排除 null/undefined/空数组 情况）
      const hasChildren = Array.isArray(selectedNode.children) && selectedNode.children.length > 0
      // 动态拼接提示文本
      const confirmText = `是否确认删除 ${selectedNode.label}${hasChildren ? " 及其所有层级的子节点" : ""}`

      selectMessageBox(confirmText).then(async () => {
        const delBody = await postJson(delApi, getTreeAllValues(selectedNode), apiPath)
        if (!delBody.success) return
        message("删除成功", { type: "success" })
        await queryThree(queryParams)
        emit("treeContextClick", edit, selectedNode)
      })
      break
  }
}

//  监听 filterText 改变并触发过滤
watch(filterText, val => {
  treeRef.value!.filter(val)
})
//搜索框过滤方法
const filterNode = (value: string, data) => {
  if (!value) return true
  return data.label.includes(value)
}

/**
 * 节点点击事件
 * @param node
 */
const handleNodeClick = (node: any) => {
  emit("nodeClick", node)
}

/**
 * 打开模态框
 */
const openCardThreeDialog = (edit: string, row: any) => {
  switch (edit) {
    case OperateEnum.add:
      eventBus.emit("openCardThreeDialog", { edit, row })
      emit("addClick")
      break
  }
}

const emit = defineEmits<{
  (e: "nodeClick", node: SelectColumn): void // 暴露节点点击事件
  (e: "addClick"): void // 暴露按钮点击事件
  (e: "treeContextClick", edit: string, selectedNode: any): void // 右键选中的节点功能
  (e: "treeDataLoaded", treeValue: Array<SelectColumn>): void // 加载完初始化数据后进行调用的方法
}>()

/**
 * 计算表格的最终高度
 */
const treeHeight = computed(() => {
  return `calc(100vh - ${props.occupyHeight})`
})

/**
 * 生产者 对外授权
 */
// 查询列表
eventBus.on("queryThree", (queryParams: any) => {
  // queryParams = params || po
  queryThree(queryParams)
})
</script>

<style lang="scss" scoped>
:deep(.filter-tree .custom-tree-label) {
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
}

:deep(.el-card__footer) {
  height: 60px; /* 固定高度 */
  padding: 10px 20px;
  box-sizing: border-box; /* 确保高度计算包含内边距和边框 */
}

/**
调整高度间隔
 */
:deep(.el-tree-node__content) {
  padding: 18px 0px !important; // 右侧保留缩进空间，左侧为原生层级缩进
}

:deep(.el-tree-node) {
  // 保留 Element Plus 原生的层级缩进逻辑
  & .el-tree-node__children {
    padding-left: 16px !important; // 每个层级向右缩进 16px，可按需调整
  }
}

/* 图标容器固定显示，不被挤压 */
.tree-icon-container {
  flex: 0 0 auto; /* 固定尺寸，不伸缩 */
  display: inline-flex;
  align-items: center;
}

/* 文本内容区域自适应剩余空间并溢出隐藏 */
.tree-label-content {
  flex: 1; /* 占满剩余空间 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
