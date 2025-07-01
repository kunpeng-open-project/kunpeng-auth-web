<template>
	<el-dialog
			v-model="dialogVisible"
			:title="title"
			:modal="true"
			center draggable
			:width="width"
			:destroy-on-close="true"
			close-on-press-escape="false"
			:show-close="false"
			:close-on-click-modal="false"
			:fullscreen="dialogFulls">
		
		<template #header>
			<el-row :gutter="20">
				<el-col :span="12" style="text-align: left">
					{{ title }}
				</el-col>
				<el-col :span="12" style="text-align: right; margin-top: -10px">
					<el-button size="large" :title="dialogFulls ? '最小化' : '最大化'" text circle @click="dialogFulls = !dialogFulls">
						<IconifyIconOnline :icon="dialogFulls ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'"/>
					</el-button>
					<el-button icon="Close" size="large" title="关闭" text circle style="margin-left: -8px" @click="dialogVisible = false"/>
				</el-col>
			</el-row>
		</template>
		
		<el-scrollbar :max-height="dialogFulls?'calc(100vh - 130px)':'70vh'">
			<div style="margin-top: 12px" v-loading="dialogLoading">
				<el-form :model="fromParams" ref="editRef" :rules="rules" :inline="true" class="demo-form-inline" :label-width="labelWidth">
					<el-row :gutter="30">
						<slot/>
					</el-row>
				</el-form>
			</div>
		</el-scrollbar>
		
		
		<template #footer>
			<div :class="dialogFulls ? 'dialog-footer-full':'dialog-footer'">
				<el-button type="primary" :loading="dialogLoading" @click="handleSave(editRef)">保 存</el-button>
				<el-button @click="dialogVisible = false">关 闭</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup name="KPDialogForm">
import { computed, ref } from "vue";
import { toReactive } from "@vueuse/core";
import { Emitter } from "mitt";

// 接收父组件的值
const props = withDefaults(defineProps<{
	eventBus: Emitter<any>, // 事件总线实例
	modelValue: boolean, // 通过 v-model 传递的值
	title: string, // 对话框标题
	fromParams: any, //表单对象
	width?: string, // 对话框宽度
	labelWidth?: string, //文本框说明文字宽度
	rules?: any, // 表单验证规则
}>(), {
	width: "50%",
	labelWidth: "100px"
});

// 接收父组件的值 变成普通数据
let {
	eventBus
} = props;
// 接收父组件的值 变成 reactive 对象
const { fromParams } = toReactive(props);
// 定义 emits
const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'handleSave', value: {}): void;
}>();

//模态框是否全屏
const dialogFulls = ref<boolean>(false);
//模态框等待框
const dialogLoading = ref<boolean>(false);
// 表单验证ref
const editRef = ref(null);


/**
 * 保存数据
 */
const handleSave = async () => {
	dialogLoading.value = true;
	emit('handleSave', fromParams);
	dialogLoading.value = false;
};


// 使用计算属性实现双向绑定
const dialogVisible = computed({
	get() {
		if (props.modelValue) dialogFulls.value = false;
		return props.modelValue;
	},
	set(newValue: boolean) {
		emit('update:modelValue', newValue);
	}
});

</script>

<style lang="scss" scoped>
.dialog-footer-full {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: white;
	padding: 10px;
	/*border-top: 1px solid #e4e7ed;*/
	/*text-align: right;*/
}

:deep(.is-horizontal) {
	display: none !important;
}
</style>
