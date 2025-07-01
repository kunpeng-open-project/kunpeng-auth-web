<template>
	<el-col :span="span">
		<el-form-item :label="noLable?label:''" :style="{ width: width }" :prop="prop" :rules="rules">
			<el-checkbox-group v-model="localValue" @change="handleChange">
				<el-checkbox
					v-for="(item, index) in options"
					:key="index"
					:label="item.label"
					:border="border"
					:value="item.value"
				/>
			</el-checkbox-group>
		</el-form-item>
	</el-col>
</template>

<script lang="ts" setup name="KPCheckboxGroup">
import { computed } from 'vue';

// 定义 props
const props = withDefaults(
	defineProps<{
		modelValue: any[]; // 绑定的值
		label: string; // 表单项的标签
		width?: string; // 输入框的宽度，默认为 '100%'
		prop?: string; // 表单验证的属性
		rules?: any; // 表单验证规则
		span?: number; // 宽度间隔 最大 24，默认为 24
		options?: { label: string; value: any }[]; // 复选框选项
		border?: boolean; // 是否显示边框，默认为 false
		noLable?: boolean; // 是否隐藏标签，默认为 true
	}>(),
	{
		width: '100%',
		span: 24,
		border: false,
		options: () => [],
		noLable: true
	}
);

// 定义 emit 事件
const emit = defineEmits<{
	(e: 'update:modelValue', value: any[]): void;
	(e: 'change', value: any[]): void;
}>();

// 使用计算属性实现双向绑定
const localValue = computed({
	get() {
		return props.modelValue;
	},
	set(value: any[]) {
		emit('update:modelValue', value);
	}
});

// 处理 change 事件
const handleChange = (value: any[]) => {
	emit('change', value);
};
</script>

<style lang="scss" scoped>
</style>