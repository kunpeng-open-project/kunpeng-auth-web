<template>
	<el-drawer
			v-model="dialogVisible"
			:destroy-on-close="true"
			:show-close="false"
			:direction="direction"
			:lock-scroll="true"
			:close-on-press-escape="false"
			:modal="true"
			:with-header="true"
			:title="title"
			:size="size"
	>
		<template #header="{ close, titleId, titleClass }">
			<h4 :id="titleId" :class="titleClass">
				<el-tooltip content="关闭" placement="bottom">
					<el-button icon="close" size="large" text circle @click="close" class="operateButton"/>
				</el-tooltip>
				<el-tooltip content="保存" placement="bottom">
					<el-button icon="check" size="large" text circle @click="handleSave" class="operateButton"/>
				</el-tooltip>
			</h4>
			
			<h3 style="color:#000000;">{{ title }}</h3>
		
		
		</template>
		
		<!--		style  取消滚动条-->
		<div style="overflow: hidden; height: 100%" v-loading="dialogLoading">
			<slot/>
		</div>
	</el-drawer>
</template>


<script lang="ts" setup name="KPDrawer">
import { computed, ref } from "vue";
import { Emitter } from "mitt";

// 接收父组件的值
const props = withDefaults(defineProps<{
	eventBus: Emitter<any>, // 事件总线实例
	modelValue: boolean, // 通过 v-model 传递的值
	direction?: string, // Drawer 打开的方向
	size?: string, //Drawer 窗体的大小, 百分吧比
	title: string, // 抽屉标题
}>(), {
	direction: "rtl",
	size: "30%",
});


// 定义 emits
const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'drawerSave', title: string, resolve: () => void): void; // 明确 resolve 类型
}>();

// 抽屉等待框
const dialogLoading = ref<boolean>(false);


/**
 * 保存数据
 */
const handleSave = async () => {
	dialogLoading.value = true;
	await new Promise<void>((resolve) => {
		emit('drawerSave', props.title, resolve); // 把 resolve 当作参数传给父组件
	});
	dialogLoading.value = false;
};

// 使用计算属性实现双向绑定
const dialogVisible = computed({
	get() {
		return props.modelValue;
	},
	set(newValue: boolean) {
		emit('update:modelValue', newValue);
	}
});
</script>

<style lang="scss" scoped>
.operateButton {
	color: black;
	font-weight: 900;
	font-size: 20px;
}

.operateButton  .el-icon{
	font-weight: 900;
}
</style>
