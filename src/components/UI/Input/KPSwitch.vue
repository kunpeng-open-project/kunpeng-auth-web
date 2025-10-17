<template>
  <el-col :span="span">
    <el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
      <el-switch v-model="localValue" inline-prompt :disabled="disabled" :active-text="activeText" :inactive-text="inactiveText" @change="change" />
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup name="KPSwitch">
import { computed } from "vue"
import { serverPath } from "@/utils/serverPath"

// 接收父组件的属性
const props = withDefaults(
  defineProps<{
    modelValue: boolean // 绑定的值（开关状态）
    label: string // 表单项标签
    width?: string // 表单项宽度
    prop?: string // 表单验证属性
    disabled?: boolean // 是否禁用
    span?: number // 栅格宽度（最大24）
    rules?: any // 表单验证规则
    api?: string // 用于初始化状态的API地址（可选）
    apiParams?: any // API请求参数
    defaultValue?: boolean // 默认值（优先于API返回）
    apiPath?: string // 请求基础路径
    activeText?: string // 开启时的文本
    inactiveText?: string // 关闭时的文本
  }>(),
  {
    width: "100%",
    disabled: false,
    span: 24,
    apiParams: () => ({}),
    apiPath: serverPath.authentication,
    activeText: "",
    inactiveText: ""
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "change", value: boolean): void
  (e: "init", value: boolean): void // 初始化完成事件
}>()

// 双向绑定计算属性
const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emit("update:modelValue", value)
  }
})

// 处理状态变化
const change = (value: boolean) => {
  emit("change", value)
}
</script>

<style lang="scss" scoped></style>
