<template>
	<el-col :span="span">
		<el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
			<el-select v-model="localValue" :placeholder="'请选择' + label" @change="handleChange" clearable :multiple="multiple" :disabled="disabled" :empty-values="[null, undefined]" :value-on-clear="null">
				<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"/>
			</el-select>
		</el-form-item>
	</el-col>
</template>

<script lang="ts" setup name="KPSelect">
import { computed } from 'vue';

// 接收父组件的值
const props = withDefaults(defineProps<{
	modelValue: string | number | Array<string>, // 绑定的值
	label: string, // 表单项的标签
	width?: string, // 整个表单项的宽度，默认为 '17%'
	options: { value: string | number; label: string }[], // 下拉选项
	prop?: string, // 表单验证的属性
	multiple?: boolean, // 是否多选
	disabled?: boolean,// 是否禁用
	span?: number, // 宽度间隔 最大 24
	rules?: any, // 表单验证规则
}>(), {
	width: "100%",
	disabled: false,
	span: 24
});

// 定义 emit 事件
const emit = defineEmits<{
	(e: 'update:modelValue', value: string | number): void;
	(e: 'change', value: string | number): void;
}>();

// 使用计算属性实现双向绑定
const localValue = computed({
	get() {
		return props.modelValue;
	},
	set(value: string | number) {
		emit('update:modelValue', value);
	}
});

// 处理 change 事件
const handleChange = (value: string | number) => {
	emit('change', value);
};
</script>

<style lang="scss" scoped></style>
