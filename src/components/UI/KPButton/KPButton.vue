<template>
  <el-tooltip :content="content" :placement="placement">
    <el-button :size="size" :link="link" :circle="circle" :round="round" @click="handleClick" :type="type" :style="buttonStyle">
      <IconifyIconOnline
        :icon="icon"
        :style="{
          fontSize: fontSize + 'px',
          fontWeight: 900,
          color: textColor
        }"
      />
      <div
        v-if="isContent"
        :style="{
          marginLeft: icon ? '5px' : '0',
          fontWeight: 600,
          color: textColor,
          fontSize: fontSize + 'px'
        }"
      >
        {{ content }}
      </div>
    </el-button>
  </el-tooltip>
</template>

<script lang="ts" setup name="KPButton">
const props = withDefaults(
  defineProps<{
    content: string
    isContent?: boolean // 是否显示按钮文字
    placement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end"
    size?: "large" | "default" | "small"
    link?: boolean
    circle?: boolean
    type?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "" | "text"
    icon?: string
    // iconSize?: number
    round?: boolean
    // 新增样式相关props
    textColor?: string // 文字和图标的颜色
    fontSize?: number // 文字大小
    buttonStyle?: Record<string, any> // 整个按钮的额外样式
  }>(),
  {
    placement: "bottom",
    size: "large",
    link: false,
    circle: false,
    type: "primary",
    round: false,
    isContent: true
  }
)

const emit = defineEmits<{
  (e: "click", ...args: any): void
}>()
const handleClick = (...args: any) => {
  emit("click", ...args)
}
</script>
