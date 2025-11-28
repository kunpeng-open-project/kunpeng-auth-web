<template>
  <el-dropdown :placement="placement" :size="size" :trigger="trigger" @command="handleCommand" @visible-change="handleVisibleChange">
    <el-button :type="type" :style="buttonClass" :title="title" :circle="circle" :color="buttonColor">
      <IconifyIconOnline :icon="icon" />
    </el-button>

    <!--    按钮样式待实现-->
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="(item, index) in items" :key="index" :command="item.value" :disabled="item.disabled" :divided="item.divided">
          <IconifyIconOnline v-if="item.icon" :icon="item.icon" :style="{ color: item.iconColor }" />
          <span style="margin-left: 5px">{{ item.label }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup name="KPButtonDropdown">
import { ref } from "vue"

const props = withDefaults(
  defineProps<{
    title?: string // 主按钮文本内容
    placement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end" // 下拉框出现的位置
    size?: "large" | "default" | "small" // 尺寸
    circle?: boolean // 是否为圆形按钮
    type?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "" | "text" // 按钮类型
    icon?: string // 图标
    buttonColor?: string
    // 下拉项数据
    items: Array<{
      label: string
      value: string | number
      icon?: string
      iconColor?: string
      disabled?: boolean
      divided?: boolean
    }>
    trigger?: "hover" | "click" // 触发方式
    buttonClass?: string
  }>(),
  {
    placement: "bottom",
    size: "large",
    circle: false,
    type: "primary",
    items: () => [],
    trigger: "hover"
  }
)

// 选中的内容
const selectValue = ref<string | number>()

// 定义事件
const emit = defineEmits<{
  (e: "value", value: string | number): void
  (e: "visible-change", visible: boolean): void
}>()

// 处理命令
const handleCommand = (value: string | number) => {
  selectValue.value = value
  const selectedItem = props.items.find(item => item.value === value)
  if (selectedItem) {
    selectValue.value = selectedItem.label
  } else {
    selectValue.value = value
  }

  emit("value", value)
}

// 处理显示状态变化
const handleVisibleChange = (visible: boolean) => {
  emit("visible-change", visible)
}
</script>

<style scoped></style>
