<template>
  <el-card shadow="hover">
    <!-- 搜索框 -->
    <el-input v-model="filterText" prefix-icon="Search" clearable :placeholder="placeholder" style="margin-bottom: 20px" />
    <el-scrollbar :height="treeHeight">
      <el-tree ref="treeRef" node-key="value" class="filter-tree" :expand-on-click-node="false" :auto-expand-parent="false" :data="treeValue" :default-expanded-keys="expandedKeys" :props="defaultProps" :filter-node-method="filterNode" @node-click="click">
        <template #default="{ node }">
          <!-- 为自定义节点添加类名 -->
          <span class="custom-tree-label" :title="node.label">{{ node.label }}</span>
        </template>
      </el-tree>
    </el-scrollbar>
  </el-card>
</template>

<script lang="ts" setup name="KPTree">
import { computed, ref, watch } from "vue"
import { ElTree } from "element-plus"
import { SelectColumn } from "@/utils/data/systemData"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    placeholder: string // 搜索框提示信息
    treeValue: Array<SelectColumn> // 树形下拉选项的值
    expandedKeys: Array<string> // 默认展开项
    defaultProps?: {} // 树形下拉选项的属性
    occupyHeight?: string // 最大高度
  }>(),
  {
    defaultProps: () => ({
      label: "label",
      value: "value",
      children: "children"
    }),
    occupyHeight: "190px",
    expandedKeys: () => [],
    treeValue: () => []
  }
)

// 搜索框model
const filterText = ref("")
// tree的ref
const treeRef = ref<InstanceType<typeof ElTree>>()

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
const click = (node: any) => {
  emit("click", node)
}

const emit = defineEmits<{
  (e: "click", node: any): void
}>()

/**
 * 计算表格的最终高度
 */
const treeHeight = computed(() => {
  // 'calc(100vh - 190px)'
  return `calc(100vh - ${props.occupyHeight})`
})
</script>

<style lang="scss" scoped>
:deep(.filter-tree .custom-tree-label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 85%;
  box-sizing: border-box; /* 确保宽度计算包含内边距和边框 */
  display: block; /* 以块级元素显示，确保宽度约束生效 */
}
</style>
