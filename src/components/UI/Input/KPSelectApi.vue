<template>
	<el-col :span="span">
		<el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
			<el-select v-model="localValue" :placeholder="'请选择' + label" @change="handleChange" clearable :multiple="multiple" :disabled="disabled" :empty-values="[null, undefined]" :value-on-clear="null">
				<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"/>
			</el-select>
		</el-form-item>
	</el-col>
</template>

<script lang="ts" setup name="KPSelectApi">
import { computed, onMounted, ref } from 'vue';
import { postJson } from "@/api/common";

// 接收父组件的值
const props = withDefaults(defineProps<{
	modelValue: string | number | Array<string>, // 绑定的值
	label: string, // 表单项的标签
	width?: string, // 整个表单项的宽度，默认为 '17%'
	prop?: string, // 表单验证的属性
	multiple?: boolean, // 是否多选
	disabled?: boolean,// 是否禁用
	span?: number, // 宽度间隔 最大 24
	rules?: any, // 表单验证规则
	api: string // 查询下拉框值的api请求地址
	apiParams?: any,
	defaultValue?: string | number  // 设置默认值
	defaultLabel?: string | number  // 设置默认值lable
	defaultNumber?: number, //设置地几个为默认值 从 1 开始
}>(), {
	width: "100%",
	disabled: false,
	span: 24,
	apiParams: () => {
	}
});

//下拉选项
const options = ref<{ value: string | number; label: string }[]>([]);

onMounted(() => {
	postJson(props.api, props.apiParams).then(body => {
		options.value = body.data;
		
		if (props.defaultNumber) {
			localValue.value = options.value[props.defaultNumber - 1].value;
			firstDefaultChange(localValue.value); // 触发方法
		}
		if (props.defaultValue) {
			options.value.forEach(item => {
				if (item.value == props.defaultValue) {
					localValue.value = item.value;
					firstDefaultChange(localValue.value); // 触发方法
				}
			})
		}
		if (props.defaultLabel) {
			options.value.forEach(item => {
				if (item.label == props.defaultLabel) {
					localValue.value = item.value;
					firstDefaultChange(localValue.value); // 触发方法
				}
			})
		}
	})
});


// 定义 emit 事件
const emit = defineEmits<{
	(e: 'update:modelValue', value: string | number): void;
	(e: 'change', value: string | number): void;
	(e: 'firstDefaultChange', value: string | number): void; // 新增：默认值设置事件
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

// 处理 触发默认值设置事件的方法
const firstDefaultChange = (value: string | number) => {
	emit('firstDefaultChange', value); // 触发自定义事件
};
</script>

<style lang="scss" scoped></style>
