<template>
  <el-col :span="span" v-if="type != 'hidden'">
    <el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
      <el-input v-model="localValue" :placeholder="'请输入' + label" :type="type" :rows="rows" clearable :disabled="disabled" @input="handleInput" />
    </el-form-item>
  </el-col>

  <el-input v-else v-model="localValue" :placeholder="'请输入' + label" clearable :type="type" :rows="rows" :disabled="disabled" @input="handleInput" />
</template>

<script lang="ts" setup name="KPInputText">
import { computed } from "vue"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: string // 绑定的值
    label: string // 表单项的标签
    width?: string // 输入框的宽度，默认为 '17%'
    type?: string // 输入框的类型，默认为 'text'
    rows?: number // 输入框的行数，默认为 2
    prop?: string // 表单验证的属性
    span?: number // 宽度间隔 最大 24
    rules?: any // 表单验证规则
    disabled?: boolean // 新增：是否禁用输入框，默认为 false
  }>(),
  {
    width: "100%",
    type: "text",
    rows: 2,
    span: 24,
    disabled: false // 设置默认值
  }
)

// 处理 change 事件
const handleInput = (value: string | number) => {
  emit("input", value)
}

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "input", value: string | number): void // 新增 change 事件
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string) {
    emit("update:modelValue", value)
  }
})
</script>

<style lang="scss" scoped></style>