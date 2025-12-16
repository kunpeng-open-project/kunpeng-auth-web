<template>
  <div class="main">
    <div class="common-layout">
      <el-container>
        <el-aside width="250px">
          <KPUseCardTree placeholder="字典分类名称" addButtonTitle="新增字典分类" :event-bus="eventBus" query-api="/dict/type/select" :query-params="{ projectId: projectId }" del-api="/auth/dict/type/batch/remove" add-button-auth="auth:dict:type:save" update-button-auth="auth:dict:type:update" del-button-auth="auth:dict:type:batch:remove" open-icon="ri:database-fill" iconColor="#409EFF" occupy-height="250px" @nodeClick="handleTreeClick" @treeDataLoaded="handleTreeDataLoaded" />
        </el-aside>

        <el-main style="padding: 0 0 0 10px">
          <KPTableQuery :event-bus="eventBus" :query-params="queryParams" exclude="dictTypeId">
            <KPSelectApi v-model="projectId" label="所属项目" api="/project/select" :api-params="{ manageType: 1 }" :span="6" @change="hendleProject($event, eventBus)" />
            <KPInputText v-model="queryParams.label" label="字典标签" :span="6" />
            <KPSelect v-model="queryParams.status" label="状态" :span="6" :options="StartAndStopEnum" @change="kpSelectChange(eventBus, queryParams)" />
          </KPTableQuery>

          <KPTable :event-bus="eventBus" :table-key="basic.tableKey" :table-column="tableColumn" :query-params="queryParams" :init-list="false" :list-api="basic.listApi" :del-api="basic.delApi" :add-button-auth="basic.addButtonAuth" :update-button-auth="basic.updateButtonAuth" :del-button-auth="basic.delButtonAuth" :details-button-auth="basic.detailsButtonAuth" :record-button-auth="basic.recordButtonAuth" details-button-row update-button-row del-button-row record-button-row checkbox>
            <template #status="{ row }">
              <el-switch v-if="hasAuth('auth:dict:data:do:status')" v-model="row.status" inline-prompt :active-value="1" active-text="正常" :inactive-value="0" inactive-text="停用" @click="handleSwitchStatus(row)" />
              <el-tag v-if="!hasAuth('auth:dict:data:do:status') && row.status == 1" type="success" round effect="dark">正常</el-tag>
              <el-tag v-if="!hasAuth('auth:dict:data:do:status') && row.status == 0" type="danger" round effect="dark">停用</el-tag>
            </template>
          </KPTable>
        </el-main>
      </el-container>
    </div>

    <KPDialogCardThreeEdit v-model="typeVisible" :event-bus="eventBus" :query-params="{ projectId: projectId }" title="字典分类" table-key="dictTypeId" :edit-params="typeEditForm" :dateStructure="TypeEditData" label-width="110px" save-api="/auth/dict/type/save" details-api="/auth/dict/type/details" update-api="/auth/dict/type/update" :afterSaveOpenEditDialog="afterSaveOpenThreeEditDialog">
      <KPSelectApi v-model="typeEditForm.projectIds" label="所属项目" prop="projectIds" api="/project/select" :api-params="{ manageType: 1 }" multiple :rules="[{ required: true, message: '请选择所属项目', trigger: 'blur' }]" />
      <KPInputText v-model="typeEditForm.dictName" label="字典名称" prop="dictName" :rules="[{ required: true, message: '请输入字典名称', trigger: 'blur' }]" />
      <KPInputText v-model="typeEditForm.dictType" label="字典类型" prop="dictType" :rules="[{ required: true, message: '请输入字典类型', trigger: 'blur' }]" />
      <KPRadio v-model="typeEditForm.status" label="状态" prop="status" :options="StartAndStopEnum" :rules="[{ required: true, message: '请选择字典状态', trigger: 'blur' }]" />
      <KPInputText v-model="typeEditForm.remark" label="备注" type="textarea" />
    </KPDialogCardThreeEdit>

    <KPDialogFormEdit v-model="dataVisible" :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :update-api="basic.updateApi" :details-api="basic.detailsApi" label-width="120px" :afterSaveOpenEditDialog="afterSaveOpenEditDialog">
      <KPSelectApi v-model="editForm.dictTypeId" label="所属分类" api="/dict/type/select" prop="dictTypeId" :rules="[{ required: true, message: '请先点击左侧分类名称', trigger: 'blur' }]" disabled />
      <KPInputText v-model="editForm.label" label="字典标签" prop="label" :rules="[{ required: true, message: '请输入字典标签', trigger: 'blur' }]" />
      <KPInputText v-model="editForm.value" label="字典键值" prop="value" :rules="[{ required: true, message: '请输入字典键值', trigger: 'blur' }]" />
      <!--      <KPRadio v-model="editForm.selected" label="是否默认选中" prop="selected" :options="YesOrNo" :rules="[{ required: true, message: '请选择是否默认选中', trigger: 'blur' }]" />-->
      <KPRadio v-model="editForm.status" label="状态" prop="status" :options="StartAndStopEnum" :rules="[{ required: true, message: '请选择字典数据状态', trigger: 'blur' }]" />
      <KPInputText v-model="editForm.remark" label="备注" type="textarea" />
    </KPDialogFormEdit>

    <KPDialogDetails v-model="detailsDialogVisible" :event-bus="eventBus" :table-key="basic.tableKey" :title="basic.title + '详情'" :details-api="basic.detailsApi" :details-column="detailsColumn" label-width="120px" />

    <KPDialogRecord v-model="recordDialogVisible" :event-bus="eventBus" :tabs="[{ label: '字典数据' }]" :tableKey="basic.tableKey" />
  </div>
</template>

<script setup lang="ts">
import mitt, { type Emitter } from "mitt"
import { reactive, ref } from "vue"
import { StartAndStopEnum } from "@/utils/kp/data/serviceData"
import { kpSelectChange, kpUseCardTreeChange } from "@/utils/kp/tool/list"
import { DetailsColumn, PageData, SelectColumn, TableColumn, TableDialogColumn } from "@/utils/kp/data/systemData"
import { hasAuth } from "@/router/utils"
import { removeEmptyAndNull } from "@/utils/kp/tool/json"
import { postJson } from "@/api/common"

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
  detailsButtonAuth: "auth:dict:data:details",
  recordButtonAuth: "auth:object:change:log:page:list"
}

/**
 * 字典类型结构
 */
class TypeEditData {
  dictTypeId: string = null
  projectIds: Array<string> = []
  dictName: string = null
  dictType: string = null
  status: number = 1
  remark: string = null
}
/**
 * 搜索内容
 */
const queryParams = reactive({
  ...new PageData(),
  dictTypeId: "init",
  label: null as string | null,
  status: null as number | null
})
/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
  { prop: "label", label: "字典标签", sort: true },
  { prop: "value", label: "字典键值", sort: true },
  // { prop: "selected", label: "是否默认选中", sort: true, render: { 1: "是", 0: "否" } },
  { prop: "status", label: "状态", sort: true },
  { prop: "dictTypeId", label: "字典类型", sort: true, translate: { api: "/api/dict/query/ids/list", responseLabelKey: "dictType" } },
  { prop: "createDate", label: "创建时间", sort: true },
  { prop: "createUserName", label: "创建用户", sort: true },
  { prop: "updateDate", label: "修改时间", sort: true }
]
/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
  { prop: "dictTypeId", label: "字典类型ID" },
  { prop: "dictDataId", label: "字典数据ID" },
  { prop: "dictName", label: "字典名称" },
  { prop: "dictType", label: "字典类型" },
  { prop: "label", label: "字典标签" },
  { prop: "value", label: "字典键值" },
  { prop: "status", label: "字典状态", render: { 0: "停用", 1: "正常" }, span: 2 },
  /*{ prop: "selected", label: "是否默认选中", render: { 1: "是", 0: "否" } },*/
  { prop: "createDate", label: "创建时间" },
  { prop: "updateDate", label: "修改时间" },
  { prop: "createUserId", label: "创建用户编号" },
  { prop: "updateUserId", label: "修改用户编号" },
  { prop: "createUserName", label: "创建用户名称" },
  { prop: "updateUserName", label: "修改用户名称" },
  { prop: "remark", label: "备注", span: 2 }
]
/**
 * 字典数据结构
 */
class EditData {
  dictDataId: string = null
  dictTypeId: string = null
  label: string = null
  value: string = null
  selected: number = 0
  remark: string = null
  status: number = 1
}

// 创建事件总线实例
const eventBus = mitt()
//是否显示字典类型编辑模态框
const typeVisible = ref<boolean>(false)
//字典类型表单编辑数据
const typeEditForm = reactive<TypeEditData>(new TypeEditData())
//是否显示字典数据编辑模态框
const dataVisible = ref<boolean>(false)
//字典数据表单编辑数据
const editForm = reactive<EditData>(new EditData())
// 当前点击的字典类型
const clickDictType = ref<string>("")
//详情模态框
const detailsDialogVisible = ref<boolean>(false)
// 修改记录模态框
const recordDialogVisible = ref<boolean>(false)
//所属项目
const projectId = ref<string>("16f96664df6c87baee87430f76c7334d")

const handleTreeDataLoaded = async (treeValue: Array<SelectColumn>) => {
  if (treeValue.length < 1) return
  queryParams.dictTypeId = treeValue[0].value

  clickDictType.value = treeValue[0].value
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}
/**
 * 点击节点
 * @param node
 */
const handleTreeClick = async (node: SelectColumn) => {
  clickDictType.value = node.value
  queryParams.dictTypeId = node.value
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

/**
 * 打开模态框保存功能后执行
 * @param editParams
 */
const afterSaveOpenEditDialog = async editParams => {
  editParams.dictTypeId = clickDictType.value
}

/**
 * 打开字典类型编辑模态框保存功能后执行
 * @param editParams
 */
const afterSaveOpenThreeEditDialog = async editParams => {
  typeEditForm.projectIds.push(projectId.value)
}

/**
 * 设置项目状态
 * @param val
 */
const handleSwitchStatus = async val => {
  await postJson("/auth/dict/data/do/status", { dictDataId: val.dictDataId })
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

const hendleProject = async (selectedValue, eventBus: Emitter<any>) => {
  kpUseCardTreeChange(selectedValue, eventBus)
  queryParams.dictTypeId = "init"
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}
</script>

<style lang="scss" scoped></style>
