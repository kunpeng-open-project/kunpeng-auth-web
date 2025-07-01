<template>
	<el-col :span="span">
		<el-form-item :label="label" :prop="prop" class="form-item">
			<el-row class="form-row">
				<slot/>
			</el-row>
		</el-form-item>
	</el-col>
</template>


<script lang="ts" setup name="KPGroupForm">

// 接收父组件的值
const props = withDefaults(defineProps<{
	label: string, // 表单项的标签
	span?: number, // 宽度间隔 最大 24
	prop?: string, // 表单验证的属性
}>(), {
	span: 24,
});
</script>


<style lang="scss" scoped>
.form-item {
	width: 100%;
}

.form-row {
	border: #dfe1e8 1px solid;
	width: 100%;
	margin-left: 2px;
	padding: 14px 0px
}
</style>
