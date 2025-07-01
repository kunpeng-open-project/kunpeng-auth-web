<template>
	<div class="main">
		
		<KPTableQuery :event-bus="eventBus" :query-params="queryParams" :date-structure="QueryData" exclude="orderBy,isTree">
			<KPInputText v-model="queryParams.deptName" label="部门名称" :span="5"/>
			<KPInputText v-model="queryParams.source" label="数据来源" :span="5"/>
			<KPSelect v-model="queryParams.status" label="状态" :span="5" :options="StartAndStopEnum" @change="handleQuery"/>
		</KPTableQuery>
		
		<KPTableTree :event-bus="eventBus" :query-params="queryParams" :list-api="basic.listApi" :table-column="tableColumn" checkbox :add-button="basic.addButtonAuth" :update-button="basic.updateButtonAuth" :del-button="basic.delButtonAuth" :details-button-row="basic.detailsButtonAuth" update-button-row del-button-row :table-key="basic.tableKey" :sort-api="basic.sortApi" :del-api="basic.delApi" @open-edit-dialog="openEditDialog" isExpand action-width="190px">
			<template #status="{ row }">
				<el-switch v-model="row.status" inline-prompt :active-value="1" active-text="正常" :inactive-value="0" inactive-text="停用" @click="handleSwitchStatus(row)"/>
			</template>
		</KPTableTree>
		
		<KPDialogFormEdit :event-bus="eventBus" v-model="dialogVisible" :query-params="queryParams" :rules="rules" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :details-api="basic.detailsApi" :table-key="basic.tableKey" :update-api="basic.updateApi" label-width="100px">
			<KPTreeSelect v-model="editForm.parentId" :options="deptSelectValue" label="上级部门" prop="parentId"/>
			<KPInputText v-model="editForm.deptName" label="部门名称" prop="deptName"/>
			<KPRadio v-model="editForm.status" label="部门状态" prop="status" :options="StartAndStopEnum"/>
			<KPInputText v-model="editForm.remark" label="备注" type="textarea" rows="4"/>
		</KPDialogFormEdit>
		
		<KPDialogDetails :event-bus="eventBus" v-model="detailsDialogVisible" :title="basic.title + '详情'" :details-api="basic.detailsApi" :table-key="basic.tableKey" :details-column="detailsColumn" label-width="120px"/>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import mitt from "mitt";
import { removeEmptyAndNull } from "@/utils/json";
import { DetailsColumn, SelectColumn, TableColumn, TableDialogColumn } from "@/utils/data/systemData";
import { StartAndStopEnum } from "@/utils/data/serviceData";
import { getDeptSelect } from "@/api/system";
import { postJson } from "@/api/common";

let basic: TableDialogColumn = {
	title: "部门",
	tableKey: "deptId",
	listApi: "/auth/dept/list",
	saveApi: "/auth/dept/save",
	addButtonAuth: "auth:dept:save",
	updateApi: "/auth/dept/update",
	updateButtonAuth: "auth:dept:update",
	delApi: "/auth/dept/batch/remove",
	delButtonAuth: "auth:dept:batch:remove",
	detailsApi: "/auth/dept/details",
	detailsButtonAuth: "auth:dept:details",
	sortApi: "/auth/dept/do/set/sort"
}

/**
 * 搜索内容对象内容定义
 */
class QueryData {
	deptName: string = null;
	source: string = null;
	status: string = null;
	orderBy: string = "sort asc";
	isTree: number = 1
};

/**
 * 搜索内容
 */
const queryParams = reactive<QueryData>(new QueryData());

/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
	{ prop: 'deptName', label: '部门名称', sort: true },
	{ prop: 'hierarchy', label: '层级', sort: true },
	{ prop: 'source', label: '数据来源', sort: true },
	{ prop: 'status', label: '部门状态', sort: true },
	{ prop: 'remark', label: '备注' },
	{ prop: 'createDate', label: '创建时间', sort: true },
	{ prop: 'createUserName', label: '创建用户', sort: true },
	{ prop: 'updateDate', label: '修改时间', sort: true },
];

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
	{ prop: 'deptId', label: '部门Id' },
	{ prop: 'deptName', label: '部门名称' },
	{ prop: 'status', label: '项目状态', render: { 0: "停用", 1: "正常" } },
	{ prop: 'hierarchy', label: '部门层级', suffix: "级" },
	{ prop: 'parentId', label: '父部门id' },
	{ prop: 'topDeptId', label: '根部门id' },
	{ prop: 'trilateralId', label: '三方系统主键' },
	{ prop: 'source', label: '数据来源' },
	{ prop: 'ancestors', label: '祖级列表', span: 2 },
	{ prop: 'createDate', label: '创建时间' },
	{ prop: 'updateDate', label: '修改时间' },
	{ prop: 'createUserId', label: '创建用户编号' },
	{ prop: 'updateUserId', label: '修改用户编号' },
	{ prop: 'createUserName', label: '创建用户名称' },
	{ prop: 'updateUserName', label: '修改用户名称' },
	{ prop: 'remark', label: '备注', span: 2 }
];

/**
 * 新增 修改的表单校验对象
 */
const rules = reactive({
	deptName: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
	status: [{ required: true, message: "请选择部门状态", trigger: "blur" }]
});


/**
 * 需要编辑的对象内容定义
 */
class EditData {
	deptId: string = null;
	deptName: string = null;
	parentId: string = null;
	remark: string = null;
	status: number = 1;
	source: string = "鉴权系统";
};
//编辑表单数据
const editForm = reactive<EditData>(new EditData());
// 创建事件总线实例
const eventBus = mitt();
//是否显示模态框
const dialogVisible = ref<boolean>(false)
//详情模态框
const detailsDialogVisible = ref<boolean>(false)
//部门下拉框
const deptSelectValue = ref<Array<SelectColumn>>();


/**
 * 下拉框修改
 */
const handleQuery = async () => {
	eventBus.emit('queryList', removeEmptyAndNull(queryParams));
};

/**
 * 设置项目状态
 * @param val
 */
const handleSwitchStatus = async (val) => {
	await postJson("/auth/dept/do/status", { deptId: val.deptId });
	eventBus.emit('queryList', removeEmptyAndNull(queryParams));
};

const openEditDialog = async (edit: string, row: any) => {
	const body = await getDeptSelect({ isTree: 1 });
	if (!body.success) return;
	deptSelectValue.value = body.data;
};


</script>

<style lang="scss" scoped></style>