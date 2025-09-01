<template>
  <el-col :span="span">
    <el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
      <el-radio-group v-model="localValue">
        <el-radio v-for="item in options" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup name="KPRadio">
import { computed } from "vue"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: any // 绑定的值
    label: string // 表单项的标签
    width?: string // 输入框的宽度，默认为 '17%'
    options: Array<{ value: string | number; label: string }> // 选项数组
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
  (e: "update:modelValue", value: any): void
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: any) {
    emit("update:modelValue", value)
  }
})
</script>

<style lang="scss" scoped></style>
