<template>
	<div class="main">
		<el-card style="margin-top: 20px">
			<template #header>
				<div class="card-header">
					<el-row :gutter="20" style=" margin-bottom: -20px">
						<el-col :span="20"><span>接口调用次数列表</span></el-col>
						<el-col :span="4"><KPSelect v-model="queryParams.projectName" label="项目名称" :options="projectSelectValue" @change="handleQuery"></KPSelect></el-col>
					</el-row>
				</div>
			</template>
			
			<KPTableShow ref="tableShowRef" :query-params="queryParams"  list-api="/auth/interface/call/interface/call/list" :initList="false" kp-table-query-height="-49px" :table-column="[
						{ prop: 'projectName', label: '项目名称' },
						{ prop: 'name', label: '接口名称' },
						{ prop: 'uri', label: 'uri' },
						{ prop: 'method', label: '请求方式' },
						{ prop: 'num', label: '调用次数' },
				]" />
<!--			<el-table v-loading="interfaceCallListLoading" :data="interfaceCallListValue" :header-cell-style="{'text-align':'center'}" :cell-style="{'text-align':'center'}">-->
<!--				<el-table-column prop="projectName" label="项目名称" width="150" />-->
<!--				<el-table-column prop="name" label="接口名称" />-->
<!--				<el-table-column prop="url" label="url" />-->
<!--				<el-table-column prop="method" label="请求方式" width="100" />-->
<!--				<el-table-column prop="num" label="调用次数" width="100" />-->
<!--			</el-table>-->
		</el-card>
	</div>
</template>

<script setup lang="ts">

//项目
import { onMounted, reactive, ref } from "vue";
import KPSelect from "@/components/UI/Input/KPSelect.vue";
import { getProjectSelect } from "@/api/system";
import KPTableShow from "@/components/UI/Table/KPTableShow.vue";
import { removeEmptyAndNull } from "@/utils/json";
import mitt from "mitt";
import { postJson } from "@/api/common";

const queryParams = reactive({
	projectName: null as string | null
});
//项目下拉框
const projectSelectValue = ref<Array<any>>([]);
// tableref
const tableShowRef = ref(null);

onMounted(() => {
	querySelect();
});
const querySelect = async () => {
	const body = await postJson("/auth/interface/call/project/name",{ });
	if (!body.success) return;
	projectSelectValue.value = body.data;
	queryParams.projectName = projectSelectValue.value[0].value;
	await tableShowRef.value.queryList(queryParams);
};
const handleQuery = async () => {
	await tableShowRef.value.queryList(queryParams);
};
</script>

<style lang="scss" scoped></style>