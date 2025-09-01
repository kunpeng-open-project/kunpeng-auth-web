<template>
  <div :style="{ width: width + '%', marginLeft: (100 - width) / 2 + '%' }">
    <el-input v-model="filterText" prefix-icon="Search" clearable :placeholder="placeholder" style="margin-bottom: 20px" />

    <div class="operation-buttons">
      <el-checkbox v-model="isExpandCollapseChecked" @change="toggleExpandCollapse" v-if="checkbox">展开/折叠</el-checkbox>
      <el-checkbox v-model="isSelectAllChecked" @change="toggleSelectAll" v-if="checkbox">全选/全不选</el-checkbox>
    </div>
    <el-scrollbar :max-height="treeHeight">
      <el-tree ref="treeRef" node-key="value" class="filter-tree" :expand-on-click-node="false" :auto-expand-parent="false" :data="treeValue" :default-expanded-keys="expandedKeys" :default-checked-keys="checkedKeys" :props="defaultProps" :filter-node-method="filterNode" @node-click="click" :show-checkbox="checkbox" :check-strictly="checkStrictly">
        <template #default="{ node }">
          <!-- 为自定义节点添加类名 -->
          <span class="custom-tree-label" :title="node.label">{{ node.label }}</span>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup name="KPTree">
import { computed, nextTick, ref, watch } from "vue"
import { ElTree } from "element-plus"
import { SelectColumn } from "@/utils/data/systemData"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    placeholder: string // 搜索框提示信息
    treeValue: Array<SelectColumn> // 树形下拉选项的值
    expandedKeys?: Array<string | number> // 默认展开项
    checkedKeys?: Array<string | number> // 默认选中项
    defaultProps?: {} // 树形下拉选项的属性
    occupyHeight?: string // 最大高度
    width?: number //  树形下拉选项的宽度 1-100 的偶数
    checkbox?: boolean // 是否多选
    isExpand?: boolean // 是否展开
    isSelectAll?: boolean // 是否全选
    checkStrictly?: boolean // 是否父子节点关联
  }>(),
  {
    defaultProps: () => ({
      label: "label",
      value: "value",
      children: "children"
    }),
    occupyHeight: "200px",
    expandedKeys: () => [],
    treeValue: () => [],
    checkedKeys: () => [],
    width: 100,
    checkbox: false,
    isExpand: false,
    isSelectAll: false,
    checkStrictly: false
  }
)

// 搜索框model
const filterText = ref("")
// tree的ref
const treeRef = ref<InstanceType<typeof ElTree>>()
// 展开/折叠 checkbox 状态
const isExpandCollapseChecked = ref(false)
// 全选/全不选 checkbox 状态
const isSelectAllChecked = ref(false)

/**
 * 切换展开/折叠
 */
const toggleExpandCollapse = () => {
  if (!treeRef.value) return
  if (isExpandCollapseChecked.value) {
    treeRef.value.store._getAllNodes().forEach(item => {
      item.expanded = true
    })
  } else {
    treeRef.value.store._getAllNodes().forEach(item => {
      item.expanded = false
    })
  }
}

/**
 * 切换全选/全不选
 */
const toggleSelectAll = () => {
  if (!treeRef.value || !props.checkbox) return
  if (isSelectAllChecked.value) {
    treeRef.value.setCheckedKeys(treeRef.value.store._getAllNodes().map(node => node.data.value))
  } else {
    treeRef.value.setCheckedKeys([])
  }
}

//搜索框过滤方法
const filterNode = (value: string, data) => {
  if (!value) return true
  return data.label.includes(value)
}

/**
 * 节点点击事件
 * @param node
 */
const click = (node: any) => {
  emit("click", node)
}

/**
 * 返回多选的内容，包括半选的内容
 */
const getCheckboxNodes = () => {
  if (!treeRef || !treeRef.value) {
    return []
  }

  const checkedNodes = treeRef.value.getCheckedNodes(false, true)
  return checkedNodes.map(node => node.value)
}

//  监听 filterText 改变并触发过滤
watch(filterText, val => {
  treeRef.value!.filter(val)
})

watch(
  () => [props.expandedKeys, props.treeValue, props.checkedKeys],
  async ([expandedKeys, treeValue, checkedKeys]) => {
    isSelectAllChecked.value = props.isSelectAll
    toggleSelectAll()

    if (expandedKeys || treeValue) {
      isSelectAllChecked.value = false

      // 等待 DOM 更新完成
      await nextTick()
      setTimeout(() => {
        // 展开/折叠
        if (props.isExpand) {
          isExpandCollapseChecked.value = props.isExpand
          toggleExpandCollapse()
        }
        // 全选 非全选
        if (props.isSelectAll) {
          isSelectAllChecked.value = props.isSelectAll
          toggleSelectAll()
        }
      }, 10)
    }

    if (checkedKeys) {
      await nextTick()
      let num = 0
      let selectAllInterval = setInterval(() => {
        num += 1
        if (treeRef.value == null) return
        const allNodes = treeRef.value.store._getAllNodes()
        const checkedNodes = treeRef.value.getCheckedNodes()
        if (allNodes.length === 0) return
        if (allNodes.length === checkedNodes.length) isSelectAllChecked.value = true
        if (num >= 15) clearInterval(selectAllInterval)
      }, 40)
    }
  },
  { deep: true, immediate: true }
) // 加上 immediate 更稳妥);

/**
 * 计算表格的最终高度
 */
const treeHeight = computed(() => {
  return `calc(100vh - ${props.occupyHeight})`
})

/**
 * 暴露方法
 */
const emit = defineEmits<{
  (e: "click", node: any): void
}>()

/**
 * 允许父组件看到的数据
 */
defineExpose({ getCheckboxNodes })
</script>

<style lang="scss" scoped>
/*解决 文字太长 显示省略号*/
:deep(.filter-tree .custom-tree-label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 85%;
  box-sizing: border-box; /* 确保宽度计算包含内边距和边框 */
  display: block; /* 以块级元素显示，确保宽度约束生效 */
}

.operation-buttons {
  text-align: left;
  margin-bottom: 10px;
}
</style>
