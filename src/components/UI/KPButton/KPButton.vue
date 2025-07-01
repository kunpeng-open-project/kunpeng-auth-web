<template>
	<el-tooltip :content="content" :placement="placement">
		<el-button :size="size" :title="content" :link="link" :circle="circle" @click="handleClick" :type="type">
			<IconifyIconOnline :icon="icon" :style="{ fontSize: iconSize + 'px' }"/>
		</el-button>
	</el-tooltip>
</template>

<script lang="ts" setup name="KPButton">

const props = withDefaults(defineProps<{
	content: string, // 标题
	placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end', // Tooltip 组件出现的位置
	size?: 'large' | 'default' | 'small', // 尺寸
	link?: boolean, // 是否为链接按钮
	circle?: boolean, // 是否为圆形按钮
	type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | '' | 'text', // 按钮类型，在设置color时，后者优先。 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | '' | 'text' (deprecated)
	icon?: string, // 图标
	iconSize?: number // 自定义图标大小
}>(), {
	placement: "bottom",
	size: "large",
	link: false,
	circle: false,
	type: "primary",
	iconSize: 20,
});


// 定义 emit 事件
const emit = defineEmits<{
	(e: 'click', ...args: any): void; // 新增 change 事件
}>();
const handleClick = (...args: any) => {
	emit("click", ...args);
};
</script>