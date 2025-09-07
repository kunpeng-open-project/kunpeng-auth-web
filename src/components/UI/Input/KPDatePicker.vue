<template>
  <el-col :span="span">
    <el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
      <el-date-picker v-model="localValue" :type="type" :placeholder="'请选择' + label" :style="{ width: '100%' }" :value-format="valueFormat" :disabled="disabled" :range-separator="rangeSeparator" :start-placeholder="startPlaceholder" :end-placeholder="endPlaceholder" @change="handleChange" />
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup name="KPDatePicker">
import { computed } from "vue"
import type { DateValue } from "@/utils/data/systemType"

type typeEnum = "year" | "years" | "month" | "months" | "date" | "dates" | "datetime" | "week" | "datetimerange" | "daterange" | "monthrange" | "yearrange"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: DateValue // 绑定的值
    label: string // 表单项的标签
    width?: string // 输入框的宽度，默认为 '100%'
    prop?: string // 表单验证的属性
    span?: number // 宽度间隔 最大 24
    rules?: any // 表单验证规则
    type?: typeEnum // 日期类型
    valueFormat?: string // 输入日期格式
    rangeSeparator?: string // 范围分隔符 选择范围时的分隔符
    startPlaceholder?: string // 范围选择时开始日期的占位内容
    endPlaceholder?: string // 范围选择时结束日期的占位内容
    disabled?: boolean // 新增：是否禁用输入框，默认为 false
  }>(),
  {
    width: "100%",
    span: 24,
    type: "date",
    valueFormat: "YYYY-MM-DD",
    rangeSeparator: "-",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    disabled: false // 设置默认值
  }
)

// 处理 change 事件
const handleChange = (value: DateValue) => {
  emit("change", value)
}

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: DateValue): void
  (e: "change", value: DateValue): void // 新增 change 事件
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: DateValue) {
    emit("update:modelValue", value)
  }
})
</script>

<style lang="scss" scoped></style>
