<template>
	<div class="main">
		<KPTableQuery :event-bus="eventBus" :query-params="queryParams">
			<KPSelect v-model="queryParams.projectId" label="项目名称" :span="4" :options="projectSelectValue" @change="handleQuery"/>
			<KPSelect v-model="queryParams.loginType" label="登录类型" :span="4" :options="LoginTypeEnum" @change="handleQuery"/>
			<KPInputText v-model="queryParams.userName" label="用户账号" :span="4"/>
			<KPInputText v-model="queryParams.loginIp" label="登录IP" :span="4"/>
			<KPDatePicker v-model="queryParams.loginDate" label="访问时间" :span="4"/>
			<KPCheckboxGroup v-model="queryParams.options" label="去重" :options='[{ value: "distinct", label: "去重" }]' :noLable="false" border :span="4"/>
		</KPTableQuery>
		
		<KPTable :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :list-api="basic.listApi" :table-column="tableColumn" :details-button-row="basic.detailsButtonAuth" action-width="70px"/>
		
		<KPDialogDetails v-model="detailsDialogVisible" :event-bus="eventBus" :table-key="basic.tableKey" :title="basic.title + '详情'" :details-api="basic.detailsApi" :details-column="detailsColumn" width="60%" label-width="130px"/>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import mitt from "mitt";
import { removeEmptyAndNull } from "@/utils/json";
import { DetailsColumn, SelectColumn, TableColumn, TableDialogColumn } from "@/utils/data/systemData";
import { LoginTypeEnum } from "@/utils/data/serviceData";
import { getProjectSelect } from "@/api/system";

let basic: TableDialogColumn = {
	title: "登录日志",
	tableKey: "alrId",
	listApi: "/auth/login/record/page/list",
	detailsApi: "/auth/login/record/details",
	detailsButtonAuth: "auth:login:record:details"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
	loginDate: null as Date | null,
	loginIp: null as string | null,
	loginType: null as number | null,
	options: [] as string[] | [],
	projectId: null as string | null,
	userName: null as string | null,
	pageNum: 1,
	pageSize: 10,
	orderBy: null as string | null,
});


/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
	{ prop: 'projectId', label: '登录项目', sort: true },
	{ prop: 'userName', label: '用户账号', sort: true },
	{ prop: 'loginResult', label: '登录结果', sort: true },
	{ prop: 'loginType', label: '登录类型', sort: true, render: { 1: "账号登录", 2: "授权登录", 3: "免密登录" } },
	{ prop: 'loginIp', label: '登录IP', sort: true },
	{ prop: 'loginIpAddress', label: '登录地址', sort: true },
	{ prop: 'userPlatForm', label: '代理平台', sort: true },
	{ prop: 'userAgent', label: '浏览器信息', sort: true },
	{ prop: 'createDate', label: '登录时间', sort: true }
];

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
	{ prop: 'alrId', label: '登录记录ID' },
	{ prop: 'userId', label: '用户Id' },
	{ prop: 'projectId', label: '登录的项目' },
	{ prop: 'userName', label: '用户账号' },
	{ prop: 'loginType', label: '登录类型', render: { 1: "账号登录", 2: "授权登录", 3: "免密登录" } },
	{ prop: 'loginResult', label: '登录结果' },
	{ prop: 'loginIp', label: '登录IP' },
	{ prop: 'loginIpAddress', label: '登录地址' },
	{ prop: 'userPlatForm', label: '用户代理平台' },
	{ prop: 'userReferer', label: '用户操作来源' },
	{ prop: 'userAgent', label: '登录浏览器信息', span: 2 },
	{ prop: 'createDate', label: '创建时间' },
	{ prop: 'updateDate', label: '修改时间' },
	{ prop: 'createUserId', label: '创建用户编号' },
	{ prop: 'updateUserId', label: '修改用户编号' },
	{ prop: 'createUserName', label: '创建用户名称' },
	{ prop: 'updateUserName', label: '修改用户名称' }
];
// 创建事件总线实例
const eventBus = mitt();
//详情模态框
const detailsDialogVisible = ref<boolean>(false)
//项目下拉框
const projectSelectValue = ref<Array<SelectColumn>>([]);

onMounted(() => {
	querySelect();
});

const querySelect = async () => {
	const body = await getProjectSelect({ manageType: 1 });
	if (!body.success) return;
	projectSelectValue.value = body.data;
	// queryParams.projectId = projectSelectValue.value[0].value;
};

/**
 * 下拉框修改
 */
const handleQuery = async () => {
	eventBus.emit('queryList', removeEmptyAndNull(queryParams));
};
</script>

<style lang="scss" scoped></style>