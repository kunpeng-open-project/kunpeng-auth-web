<template>
  <el-dropdown :placement="placement" :size="size" :trigger="trigger" @command="handleCommand" @visible-change="handleVisibleChange">
    <span class="el-dropdown-link" :style="{ color: textColor, fontSize: fontSize + 'px' }">
      <IconifyIconOnline v-if="icon" :icon="icon" />
      <span :style="{ color: contentColor }">{{ content }}</span>
      &nbsp; {{ isSelectValue ? selectValue : "" }}
      <el-icon v-if="rightIcon" class="el-icon--right"><arrow-down /></el-icon>
    </span>
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

<script lang="ts" setup name="KPDropdown">
import { ref, watch } from "vue"

const props = withDefaults(
  defineProps<{
    content?: string // 主按钮文本内容
    placement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end" // 下拉框出现的位置
    size?: "large" | "default" | "small" // 尺寸
    link?: boolean // 是否为链接按钮
    circle?: boolean // 是否为圆形按钮
    type?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "" | "text" // 按钮类型
    icon?: string // 图标
    round?: boolean // 是否为圆角按钮
    textColor?: string // 其他文字和图标的颜色
    contentColor?: string // content 文字颜色
    fontSize?: number // 文字大小
    rightIcon?: boolean // 是否显示右侧图标
    isSelectValue?: boolean // 是否显示选中值
    // 下拉项数据
    items: Array<{
      label: string
      value: string | number
      icon?: string
      iconColor?: string
      disabled?: boolean
      divided?: boolean
    }>
    defaultValue?: string | number // 默认选中的值
    trigger?: "hover" | "click" // 触发方式
  }>(),
  {
    placement: "bottom",
    size: "large",
    link: false,
    circle: false,
    type: "primary",
    round: false,
    textColor: "var(--el-color-primary)",
    items: () => [],
    trigger: "hover",
    rightIcon: false,
    isSelectValue: false
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

watch(
  () => props.defaultValue,
  newValue => {
    if (newValue !== null) {
      selectValue.value = newValue
    }
  },
  { immediate: true }
) // immediate: true 确保初始值生效
</script>

<style scoped>
.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  border: none !important;
}

.el-dropdown-link:focus {
  border: none !important; /* 确保边框也被移除，加 !important 提高优先级 */
  outline: none; /* 移除焦点时的外边框 */
}
</style>
