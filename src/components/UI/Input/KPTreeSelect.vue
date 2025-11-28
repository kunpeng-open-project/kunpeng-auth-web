<template>
  <el-col :span="span">
    <el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
      <template v-if="tipBody" v-slot:label>
        <span>{{ label }}</span>
        <el-tooltip class="box-item" effect="dark" :content="tipBody" :placement="tipPlacement">
          <IconifyIconOnline icon="ep:question-filled" />
        </el-tooltip>
      </template>

      <el-tree-select v-model="localValue" :data="options" :check-strictly="checkStrictly" filterable :render-after-expand="false" :show-checkbox="showCheckbox" :props="defaultProps" :placeholder="'请选择' + label" clearable :multiple="multiple" @change="handleChange" />
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup name="KPTreeSelect">
import { computed } from "vue"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: string | number | Array<string> | null // 绑定的值
    label: string // 表单项的标签
    width?: string // 整个表单项的宽度，默认为 '17%'
    options: { value: string | number; label: string; children?: any[] }[] | [] | null // 树形下拉选项
    prop?: string // 表单验证的属性
    multiple?: boolean // 是否多选
    checkStrictly?: boolean //任何节点都可以被选择，否则只有子节点可被选择。
    defaultProps?: {} // 树形下拉选项的属性
    showCheckbox?: boolean // 是否显示复选框
    span?: number // 宽度间隔 最大 24
    rules?: any // 表单验证规则
    tipBody?: string // 新增：输入框的提示信息
    tipPlacement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end"
  }>(),
  {
    width: "100%",
    defaultProps: () => ({
      label: "label",
      value: "value",
      children: "children"
    }),
    checkStrictly: true,
    showCheckbox: false,
    span: 24,
    tipPlacement: "right"
  }
)

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | Array<string> | null): void
  (e: "change", value: string | number | Array<string> | null): void
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string | number) {
    emit("update:modelValue", value)
  }
})

// 处理 change 事件
const handleChange = (value: string | number | Array<string> | null) => {
  emit("change", value)
}
</script>

<style lang="scss" scoped></style>
