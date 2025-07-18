<template>
	<div class="main">
		<KPTableQuery :event-bus="eventBus" :query-params="queryParams">
			<KPInputText v-model="queryParams.postName" label="岗位名称" :span="5"/>
			<KPInputText v-model="queryParams.postCode" label="岗位编码" :span="5"/>
			<KPSelect v-model="queryParams.status" label="状态" :span="5" :options="StartAndStopEnum" @change="handleQuery"/>
		</KPTableQuery>
		
		<KPTable :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :list-api="basic.listApi" :table-column="tableColumn" :add-button="basic.addButtonAuth" :update-button="basic.updateButtonAuth" :del-api="basic.delApi" :del-button="basic.delButtonAuth" :details-button-row="basic.detailsButtonAuth" update-button-row del-button-row checkbox action-width="190px">
			<template #status="{ row }">
				<el-switch v-model="row.status" inline-prompt :active-value="1" active-text="正常" :inactive-value="0" inactive-text="停用" @click="handleSwitchStatus(row)"/>
			</template>
		</KPTable>
		
		<KPDialogFormEdit v-model="dialogVisible" :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :rules="rules" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :update-api="basic.updateApi" :details-api="basic.detailsApi" label-width="100px">
			<KPInputText v-model="editForm.postName" label="岗位名称" prop="postName"/>
			<KPInputText v-model="editForm.postCode" label="岗位编码" prop="postCode"/>
			<KPRadio v-model="editForm.status" label="岗位状态" prop="status" :options="StartAndStopEnum"/>
			<KPInputText v-model="editForm.remark" label="备注" type="textarea"/>
		</KPDialogFormEdit>
		
		<KPDialogDetails v-model="detailsDialogVisible" :event-bus="eventBus" :table-key="basic.tableKey" :title="basic.title + '详情'" :details-api="basic.detailsApi" :details-column="detailsColumn" label-width="120px"/>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import mitt from "mitt";
import { removeEmptyAndNull } from "@/utils/json";
import { DetailsColumn, TableColumn, TableDialogColumn } from "@/utils/data/systemData";
import { StartAndStopEnum } from "@/utils/data/serviceData";
import { postJson } from "@/api/common";

let basic: TableDialogColumn = {
	title: "岗位",
	tableKey: "postId",
	listApi: "/auth/post/page/list",
	saveApi: "/auth/post/save",
	addButtonAuth: "auth:post:save",
	updateApi: "/auth/post/update",
	updateButtonAuth: "auth:post:update",
	delApi: "/auth/post/batch/remove",
	delButtonAuth: "auth:post:batch:remove",
	detailsApi: "/auth/post/details",
	detailsButtonAuth: "auth:post:details"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
	postCode: null as string | null,
	postName: null as string | null,
	status: null as number | null,
	pageNum: 1,
	pageSize: 10,
	orderBy: null as string | null
});


/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
	{ prop: 'postName', label: '岗位名称', sort: true },
	{ prop: 'postCode', label: '岗位编码', sort: true },
	{ prop: 'status', label: '岗位状态', sort: true },
	{ prop: 'remark', label: '备注' },
	{ prop: 'createDate', label: '创建时间', sort: true },
	{ prop: 'createUserName', label: '创建用户', sort: true },
	{ prop: 'updateDate', label: '修改时间', sort: true },
];

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
	{ prop: 'postId', label: '岗位Id' },
	{ prop: 'postName', label: '岗位名称' },
	{ prop: 'postCode', label: '岗位编码' },
	{ prop: 'status', label: '项目状态', render: { 0: "停用", 1: "正常" } },
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
	postName: [{ required: true, message: "请输入岗位名称", trigger: "blur" }],
	postCode: [{ required: true, message: "请输入岗位编号", trigger: "blur" }],
	status: [{ required: true, message: "请选择岗位状态", trigger: "blur" }]
});


/**
 * 需要编辑的对象内容定义
 */
class EditData {
	postId: string = null;
	postName: string = null;
	postCode: string = null;
	remark: string = null;
	status: number = 1;
};
//编辑表单数据
const editForm = reactive<EditData>(new EditData());
// 创建事件总线实例
const eventBus = mitt();
//是否显示模态框
const dialogVisible = ref<boolean>(false)
//详情模态框
const detailsDialogVisible = ref<boolean>(false)


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
	await postJson("/auth/post/do/status", { postId: val.postId });
	eventBus.emit('queryList', removeEmptyAndNull(queryParams));
};


</script>

<style lang="scss" scoped></style>