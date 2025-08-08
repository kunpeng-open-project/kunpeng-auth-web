<template>
	<div class="main">
		<KPTableQuery :event-bus="eventBus" :query-params="queryParams">
			<KPSelectApi v-model="queryParams.projectId" label="所属项目" api="/project/select" :api-params="{manageType: 1}" :span="5" @change="kpSelectChange(eventBus, queryParams)"/>
			<KPInputText v-model="queryParams.dictName" label="字典名称" :span="5"/>
			<KPInputText v-model="queryParams.dictType" label="字典类型" :span="5"/>
			<KPSelect v-model="queryParams.status" label="状态" :span="5" :options="StartAndStopEnum" @change="kpSelectChange(eventBus, queryParams)"/>
		</KPTableQuery>
		
		<KPTable :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :list-api="basic.listApi" :table-column="tableColumn" :add-button="basic.addButtonAuth" :update-button="basic.updateButtonAuth" :del-api="basic.delApi" :del-button="basic.delButtonAuth" :details-button-row="basic.detailsButtonAuth" update-button-row del-button-row checkbox action-width="270px">
			<template #status="{ row }">
				<el-switch v-model="row.status" inline-prompt :active-value="1" active-text="正常" :inactive-value="0" inactive-text="停用" @click="handleSwitchStatus(row)"/>
			</template>
			
			<template #actions="{ row }">
				<!--				<el-button type="primary" size="small" title="设置数据" link @click="openDictDataView(row)">-->
				<el-button type="primary" size="small" title="设置数据" link @click="toPage('query',{ dictTypeId: row.dictTypeId })">
					<IconifyIconOnline icon="fa-solid:warehouse"/>&nbsp;设置数据
				</el-button>
			</template>
		</KPTable>
		
		<KPDialogFormEdit v-model="dialogVisible" :event-bus="eventBus" :table-key="basic.tableKey" :rules="rules" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :update-api="basic.updateApi" :details-api="basic.detailsApi" label-width="100px">
			<KPSelectApi v-model="editForm.projectIds" label="所属项目" prop="projectIds" api="/project/select" :api-params="{manageType: 1}" multiple/>
			<KPInputText v-model="editForm.dictName" label="字典名称" prop="dictName"/>
			<KPInputText v-model="editForm.dictType" label="字典类型" prop="dictType"/>
			<KPRadio v-model="editForm.status" label="状态" prop="status" :options="StartAndStopEnum"/>
			<KPInputText v-model="editForm.remark" label="备注" type="textarea"/>
		</KPDialogFormEdit>
		
		<KPDialogDetails v-model="detailsDialogVisible" :event-bus="eventBus" :table-key="basic.tableKey" :title="basic.title + '详情'" :details-api="basic.detailsApi" :details-column="detailsColumn" label-width="120px"/>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import mitt from "mitt";
import { removeEmptyAndNull } from "@/utils/json";
import { DetailsColumn, PageData, TableColumn, TableDialogColumn } from "@/utils/data/systemData";
import { StartAndStopEnum } from "@/utils/data/serviceData";
import { postJson } from "@/api/common";
import { routeUtil } from "@/utils/routeUtil";
import { kpSelectChange } from "@/utils/list";
import KPSelectApi from "@/components/UI/Input/KPSelectApi.vue";

let basic: TableDialogColumn = {
	title: "字典类型",
	tableKey: "dictTypeId",
	listApi: "/auth/dict/type/page/list",
	saveApi: "/auth/dict/type/save",
	addButtonAuth: "auth:dict:type:save",
	updateApi: "/auth/dict/type/update",
	updateButtonAuth: "auth:dict:type:update",
	delApi: "/auth/dict/type/batch/remove",
	delButtonAuth: "auth:dict:type:batch:remove",
	detailsApi: "/auth/dict/type/details",
	detailsButtonAuth: "auth:dict:type:details"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
	...new PageData(),
	projectId: null as string | null,
	dictName: null as string | null,
	dictType: null as string | null,
	status: null as number | null,
});


/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
	{ prop: 'dictName', label: '字典名称', sort: true },
	{ prop: 'dictType', label: '字典类型', sort: true },
	{ prop: 'projectNames', label: '所属项目', sort: true },
	{ prop: 'status', label: '岗位状态', sort: true },
	{ prop: 'remark', label: '备注' },
	{ prop: 'createDate', label: '创建时间', sort: true },
	{ prop: 'createUserName', label: '创建用户', sort: true },
	{ prop: 'updateDate', label: '修改时间', sort: true }
];

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
	{ prop: 'dictTypeId', label: '字典类型ID' },
	{ prop: 'dictName', label: '字典名称' },
	{ prop: 'dictType', label: '字典类型' },
	{ prop: 'status', label: '字典状态', render: { 0: "停用", 1: "正常" } },
	{ prop: 'projectIds', label: '项目id集合', span: 2 },
	{ prop: 'projectNames', label: '项目名称集合', span: 2 },
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
	projectIds: [{ required: true, message: "请选择所属项目", trigger: "blur" }],
	dictName: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
	dictType: [{ required: true, message: "请输入字典类型", trigger: "blur" }],
	status: [{ required: true, message: "请选择字典状态", trigger: "blur" }]
});


/**
 * 需要编辑的对象内容定义
 */
class EditData {
	projectIds: Array<string> = [];
	dictTypeId: string = null;
	dictName: string = null;
	dictType: string = null;
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
//字典数据页面
const { toPage } = routeUtil("字典数据管理", "SystemDictData", "/system/dict/data");

/**
 * 设置项目状态
 * @param val
 */
const handleSwitchStatus = async (val) => {
	await postJson("/auth/dict/type/do/status", { dictTypeId: val.dictTypeId });
	eventBus.emit('queryList', removeEmptyAndNull(queryParams));
};

</script>

<style lang="scss" scoped></style>