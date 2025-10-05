<template>
  <el-tooltip :content="content ? content : title" :placement="placement">
    <el-button :size="size" :link="link" :circle="circle" :round="round" :type="type" :style="buttonStyle" @click="handleClick">
      <IconifyIconOnline :icon="icon" style="margin-right: 2px" />
      <div v-if="title">
        {{ title }}
      </div>
    </el-button>
  </el-tooltip>
</template>

<script lang="ts" setup name="KPButton">
const props = withDefaults(
  defineProps<{
    content?: string // 按钮鼠标放上去显示文字 如果不设置默认就是title
    title?: string //按钮显示文字
    placement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end"
    size?: "large" | "default" | "small"
    link?: boolean
    circle?: boolean
    type?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "" | "text"
    icon?: string
    round?: boolean
    // 新增样式相关props
    buttonStyle?: string //css 样式
  }>(),
  {
    placement: "bottom",
    size: "large",
    link: false,
    circle: false,
    type: "primary",
    round: false
  }
)

const emit = defineEmits<{
  (e: "click", ...args: any): void
}>()
const handleClick = (...args: any) => {
  emit("click", ...args)
}
</script>
