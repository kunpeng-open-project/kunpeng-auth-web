<template>
  <el-col :span="span">
    <el-form-item :label="label" :style="{ width: width }">
      <template v-if="tipBody" v-slot:label>
        <span>{{ label }}</span>
        <el-tooltip class="box-item" effect="dark" :content="tipBody" :placement="tipPlacement">
          <IconifyIconOnline icon="ep:question-filled" />
        </el-tooltip>
      </template>

      <el-tag type="success">{{ localValue }}</el-tag>
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup name="KPTag">
import { computed } from "vue"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: string | null // 绑定的值
    label: string // 表单项的标签
    width?: string // 输入框的宽度，默认为 '17%'
    span?: number // 宽度间隔 最大 24
    tipBody?: string // 新增：输入框的提示信息
    tipPlacement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end"
  }>(),
  {
    width: "100%",
    span: 24,
    tipPlacement: "right"
  }
)

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string | null) {
    emit("update:modelValue", value)
  }
})
</script>

<style lang="scss" scoped></style>
