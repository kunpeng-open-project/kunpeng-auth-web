<template>
  <el-col :span="span">
    <el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
      <IconSelect v-model="localValue" class="w-full" />
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup name="KPIconSelect">
import { computed } from "vue"
import { IconSelect } from "@/components/ReIcon"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: string | number | Array<string> // 绑定的值
    label: string // 表单项的标签
    width?: string // 整个表单项的宽度，默认为 '17%'
    prop?: string // 表单验证的属性
    span?: number // 宽度间隔 最大 24
    rules?: any // 表单验证规则
  }>(),
  {
    width: "100%",
    span: 24
  }
)

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void
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
</script>

<style lang="scss" scoped></style>
