<template>
	<div class="main">
		<KPTableQuery :event-bus="eventBus" :query-params="queryParams" exclude="dictTypeId">
			<KPInputText v-model="queryParams.label" label="字典标签" :span="5"/>
			<KPSelect v-model="queryParams.status" label="状态" :span="5" :options="StartAndStopEnum" @change="handleQuery"/>
		</KPTableQuery>
		
		<KPTable :event-bus="eventBus" :table-key="basic.tableKey" :query-params="queryParams" :init-list="false" :list-api="basic.listApi" :table-column="tableColumn" :add-button="basic.addButtonAuth" :update-button="basic.updateButtonAuth" :del-api="basic.delApi" :del-button="basic.delButtonAuth" :details-button-row="basic.detailsButtonAuth" update-button-row del-button-row checkbox action-width="190px">
			<template #status="{ row }">
				<el-switch v-model="row.status" inline-prompt :active-value="1" active-text="正常" :inactive-value="0" inactive-text="停用" @click="handleSwitchStatus(row)"/>
			</template>
		</KPTable>
		
		<KPDialogFormEdit v-model="dialogVisible" :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :rules="rules" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :update-api="basic.updateApi" :details-api="basic.detailsApi" label-width="120px" :afterSaveOpenEditDialog="afterSaveOpenEditDialog">
			<KPInputText v-model="editForm.label" label="字典标签" prop="label"/>
			<KPInputText v-model="editForm.value" label="字典键值" prop="value"/>
			<KPRadio v-model="editForm.selected" label="是否默认选中" prop="selected" :options="YesOrNo"/>
			<KPRadio v-model="editForm.status" label="状态" prop="status" :options="StartAndStopEnum"/>
			<KPInputText v-model="editForm.remark" label="备注" type="textarea"/>
		</KPDialogFormEdit>
		
		<KPDialogDetails v-model="detailsDialogVisible" :event-bus="eventBus" :table-key="basic.tableKey" :title="basic.title + '详情'" :details-api="basic.detailsApi" :details-column="detailsColumn" label-width="120px"/>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import mitt from "mitt";
import { removeEmptyAndNull } from "@/utils/json";
import { DetailsColumn, TableColumn, TableDialogColumn } from "@/utils/data/systemData";
import { StartAndStopEnum, YesOrNo } from "@/utils/data/serviceData";
import { postJson } from "@/api/common";
import { routeUtil } from "@/utils/routeUtil";

let basic: TableDialogColumn = {
	title: "字典数据",
	tableKey: "dictDataId",
	listApi: "/auth/dict/data/page/list",
	saveApi: "/auth/dict/data/save",
	addButtonAuth: "auth:dict:data:save",
	updateApi: "/auth/dict/data/update",
	updateButtonAuth: "auth:dict:data:update",
	delApi: "/auth/dict/data/batch/remove",
	delButtonAuth: "auth:dict:data:batch:remove",
	detailsApi: "/auth/dict/data/details",
	detailsButtonAuth: "auth:dict:data:details"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
	dictTypeId: null as string | null,
	label: null as string | null,
	status: null as number | null,
	pageNum: 1,
	pageSize: 10,
	orderBy: null as string | null
});

/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
	{ prop: 'label', label: '字典标签', sort: true },
	{ prop: 'value', label: '字典键值', sort: true },
	{ prop: 'selected', label: '是否默认选中', sort: true, render: { 1: '是', 0: '否' } },
	{ prop: 'status', label: '岗位状态', sort: true },
	{ prop: 'dictType', label: '字典类型', sort: true },
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
	{ prop: 'dictDataId', label: '字典数据ID' },
	{ prop: 'dictType', label: '字典类型' },
	{ prop: 'selected', label: '是否默认选中', render: { 1: '是', 0: '否' } },
	{ prop: 'label', label: '字典标签' },
	{ prop: 'value', label: '字典键值' },
	{ prop: 'status', label: '字典状态', render: { 0: "停用", 1: "正常" }, span: 2 },
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
	label: [{ required: true, message: "请输入字典标签", trigger: "blur" }],
	value: [{ required: true, message: "请输入字典键值", trigger: "blur" }],
	status: [{ required: true, message: "请选择字典数据状态", trigger: "blur" }],
	selected: [{ required: true, message: "请选择是否默认选中", trigger: "blur" }]
});


/**
 * 需要编辑的对象内容定义
 */
class EditData {
	dictDataId: string = null;
	dictTypeId: string = null;
	label: string = null;
	value: string = null;
	selected: number = 0;
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

const { initToPage, parameter } = routeUtil("字典数据管理", "SystemDictData", "/system/dict/data");
initToPage("query");

onMounted(() => {
	queryParams.dictTypeId = parameter.dictTypeId;
	eventBus.emit('queryList', removeEmptyAndNull(queryParams));
});

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
	await postJson("/auth/dict/data/do/status", { dictDataId: val.dictDataId });
	eventBus.emit('queryList', removeEmptyAndNull(queryParams));
};

/**
 * 打开模态框保存功能后执行
 * @param editParams
 */
const afterSaveOpenEditDialog = async (editParams) => {
	editParams.dictTypeId = parameter.dictTypeId;
};

</script>

<style lang="scss" scoped></style>