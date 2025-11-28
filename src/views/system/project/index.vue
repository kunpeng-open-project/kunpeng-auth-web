<template>
  <div class="main">
    <KPTableQuery :event-bus="eventBus" :query-params="queryParams">
      <KPInputText v-model="queryParams.projectName" label="项目名称" :span="6" />
      <KPInputText v-model="queryParams.projectCode" label="项目编号" :span="6" />
      <KPSelect v-model="queryParams.status" label="状态" :span="6" :options="StartAndStopEnum" @change="kpSelectChange(eventBus, queryParams)" />
    </KPTableQuery>

    <KPTable :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :table-column="tableColumn" :list-api="basic.listApi" :del-api="basic.delApi" :add-button-auth="basic.addButtonAuth" :update-button-auth="basic.updateButtonAuth" :del-button-auth="basic.delButtonAuth" :details-button-auth="basic.detailsButtonAuth" :record-button-auth="basic.recordButtonAuth" details-button-row update-button-row del-button-row record-button-row checkbox>
      <template #status="{ row }">
        <el-switch v-if="hasAuth('auth:project:do:status')" v-model="row.status" inline-prompt :active-value="1" active-text="正常" :inactive-value="0" inactive-text="停用" @click="handleSwitchStatus(row)" />
        <el-tag v-if="!hasAuth('auth:project:do:status') && row.status == 1" type="success" round effect="dark">正常</el-tag>
        <el-tag v-if="!hasAuth('auth:project:do:status') && row.status == 0" type="danger" round effect="dark">停用</el-tag>
      </template>

      <template #actions="{ row }">
        <el-button v-if="hasAuth('auth:project:menu:setting:install')" type="primary" size="small" title="设置权限" link @click="openDrawer(row)">
          <IconifyIconOnline icon="ep:menu" />
          &nbsp;设置权限
        </el-button>

        <KPButton title="进入系统" :content="'打开' + row.projectName" link size="small" icon="ri:openai-fill" @click="handleOpenSystem(row.projectUrl)" />
      </template>
    </KPTable>

    <KPDialogFormEdit #default="{ isUpdate }" v-model="dialogVisible" :event-bus="eventBus" :query-params="queryParams" :rules="rules" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :details-api="basic.detailsApi" :table-key="basic.tableKey" :update-api="basic.updateApi" label-width="135px">
      <KPInputText v-model="editForm.projectName" label="项目名称" prop="projectName" />
      <KPInputText v-model="editForm.projectCode" label="项目编号" prop="projectCode" />
      <KPInputText v-if="isUpdate" v-model="editForm.tokenFailure" type="number" label="token过期时间" tip-body="授权token有效时长,单位小时" prop="tokenFailure" />
      <KPInputText v-if="isUpdate" v-model="editForm.tokenGainMaxNum" type="number" label="token获取次数" tip-body="每日获取token的最大次数" prop="tokenGainMaxNum" />
      <KPInputText v-model="editForm.projectUrl" label="项目地址" />
      <KPRadio v-model="editForm.status" label="项目状态" prop="status" :options="StartAndStopEnum" :span="12" />
      <KPRadio v-model="editForm.manage" label="管理状态" prop="manage" :options="ManageEnum" :span="12" />
      <KPInputText v-model="editForm.remark" label="备注" type="textarea" />
    </KPDialogFormEdit>

    <KPDialogDetails :event-bus="eventBus" v-model="detailsDialogVisible" :title="basic.title + '详情'" :details-api="basic.detailsApi" :table-key="basic.tableKey" :details-column="detailsColumn" width="60%" label-width="150px" />

    <KPDrawer v-model="drawerVisible" title="设置权限" :event-bus="eventBus" @drawerSave="drawerSave">
      <el-form :model="editForm" label-width="80px">
        <KPTag v-model="editForm.projectName" label="项目名称" prop="roleName" />
        <KPSelect v-model="editForm.purviewProjectId" label="权限项目" :options="projectSelectValue" @change="handleProject" />

        <KPGroupForm label="接口">
          <KPTree ref="treeMenuRef" occupyHeight="350px" placeholder="请输入菜单进行搜索" :width="90" :tree-value="projectMenuSelectValue" :expanded-keys="defaultProjectMenuSelectValue" :checked-keys="defaultCheckedMenuSelectValue" checkbox />
        </KPGroupForm>
      </el-form>
    </KPDrawer>

    <KPDialogRecord v-model="recordDialogVisible" :event-bus="eventBus" :tabs="[{ label: '项目信息' }]" :tableKey="basic.tableKey" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import mitt from "mitt"
import { ManageEnum, StartAndStopEnum } from "@/utils/kp/data/serviceData"
import { removeEmptyAndNull } from "@/utils/kp/tool/json"
import { TreeKey } from "element-plus/es/components/tree/src/tree.type"
import { DetailsColumn, PageData, SelectColumn, TableColumn, TableDialogColumn } from "@/utils/kp/data/systemData"
import { postJson } from "@/api/common"
import { hasAuth } from "@/router/utils"
import { getMenuSelect, getProjectSelect } from "@/api/system"
import { message } from "@/utils/message"
import { kpSelectChange } from "@/utils/kp/tool/list"
import { getToken } from "@/utils/auth"

let basic: TableDialogColumn = {
  title: "项目",
  tableKey: "projectId",
  listApi: "/auth/project/page/list",
  saveApi: "/auth/project/save",
  addButtonAuth: "auth:project:save",
  updateApi: "/auth/project/update",
  updateButtonAuth: "auth:project:update",
  delApi: "/auth/project/batch/remove",
  delButtonAuth: "auth:project:batch:remove",
  detailsApi: "/auth/project/details",
  detailsButtonAuth: "auth:project:details",
  recordButtonAuth: "auth:object:change:log:page:list"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
  ...new PageData(),
  projectCode: null as string | null,
  projectName: null as string | null,
  status: null as number | null
})

/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
  { prop: "projectName", label: "项目名称", sort: true },
  { prop: "projectCode", label: "项目编号", sort: true },
  { prop: "projectUrl", label: "项目地址", sort: true },
  { prop: "status", label: "项目状态", sort: true },
  { prop: "manage", label: "管理状态", sort: true, render: { 0: "不管理", 1: "管理" } },
  { prop: "remark", label: "备注" },
  { prop: "createDate", label: "创建时间", sort: true },
  { prop: "updateDate", label: "修改时间", sort: true }
]

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
  { prop: "projectId", label: "项目Id" },
  { prop: "projectName", label: "项目名称" },
  { prop: "projectCode", label: "项目编号" },
  { prop: "status", label: "项目状态", render: { 0: "停用", 1: "正常" } },
  { prop: "tokenFailure", label: "token过期时间", suffix: "小时" },
  { prop: "tokenGainMaxNum", label: "token获取最大次数", suffix: "次" },
  { prop: "appId", label: "appId" },
  { prop: "manage", label: "管理状态", render: { 0: "不管理", 1: "管理" } },
  { prop: "appSecret", label: "appSecret", span: 2 },
  { prop: "projectUrl", label: "项目地址", span: 2 },
  { prop: "createDate", label: "创建时间" },
  { prop: "updateDate", label: "修改时间" },
  { prop: "createUserId", label: "创建用户编号" },
  { prop: "updateUserId", label: "修改用户编号" },
  { prop: "createUserName", label: "创建用户名称" },
  { prop: "updateUserName", label: "修改用户名称" },
  { prop: "remark", label: "备注", span: 2 }
]

/**
 * 新增 修改的表单校验对象
 */
const rules = reactive({
  projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  projectCode: [{ required: true, message: "请输入项目编号", trigger: "blur" }],
  status: [{ required: true, message: "请选择项目状态", trigger: "blur" }],
  manage: [{ required: true, message: "请选择管理状态", trigger: "blur" }],
  tokenFailure: [{ required: true, message: "请输入token过期时间", trigger: "blur" }],
  tokenGainMaxNum: [{ required: true, message: "请输入token获取次数", trigger: "blur" }]
})

/**
 * 需要编辑的对象内容定义
 */
class EditData {
  projectId: string = null
  projectName: string = null
  projectCode: string = null
  projectUrl: string = null
  remark: string = null
  status: number = 1
  manage: number = 1
  appId: string = null
  appSecret: string = null
  tokenFailure: number = 12
  tokenGainMaxNum: number = 100

  menuIds: TreeKey[] = []
  purviewProjectId: string = null
  primaryKeyId: string = null
}

//编辑表单数据
const editForm = reactive<EditData>(new EditData())
// 创建事件总线实例
const eventBus = mitt()
//是否显示模态框
const dialogVisible = ref<boolean>(false)
//详情模态框
const detailsDialogVisible = ref<boolean>(false)
//drawer是否显示
const drawerVisible = ref<boolean>(false)
//项目下拉框
const projectSelectValue = ref<Array<SelectColumn>>([])
//项目所属菜单下拉框
const projectMenuSelectValue = ref<Array<SelectColumn>>([])
//项目所属菜单默认展开行
const defaultProjectMenuSelectValue = ref<Array<string>>([])
//项目所属菜单默认选中行
const defaultCheckedMenuSelectValue = ref<Array<string>>([])
//KPTree的 菜单ref
const treeMenuRef = ref(null)
// 修改记录模态框
const recordDialogVisible = ref<boolean>(false)

/**
 * 设置项目状态
 * @param val
 */
const handleSwitchStatus = async val => {
  await postJson("/auth/project/do/status", { projectId: val.projectId })
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

/**
 * 打开drawer
 * @param row
 */
const openDrawer = async (row: any) => {
  drawerVisible.value = true

  Object.keys(editForm).map(key => delete editForm[key])
  Object.assign(editForm, new EditData())

  projectSelectValue.value = []
  projectMenuSelectValue.value = []
  defaultProjectMenuSelectValue.value = []
  defaultCheckedMenuSelectValue.value = []

  const body = await getProjectSelect({ manageType: 1 })
  if (!body.success) return
  projectSelectValue.value = body.data

  editForm.projectName = row.projectName
  editForm.projectId = row.projectId

  //首次进来 选中第一个
  editForm.purviewProjectId = projectSelectValue.value[0].value
  handleProject(editForm.purviewProjectId)
}

const handleProject = async val => {
  projectMenuSelectValue.value = []
  defaultProjectMenuSelectValue.value = []
  defaultCheckedMenuSelectValue.value = []

  //查询改项目下的接口
  const body = await getMenuSelect({ isInterface: 2, isTree: 1, projectId: val })
  if (!body.success) return
  projectMenuSelectValue.value = body.data
  defaultProjectMenuSelectValue.value = [projectMenuSelectValue.value[0].value]

  //进行数据回显
  const bodyPermission = await postJson("/auth/project/menu/query/setting/install", {
    projectId: editForm.projectId,
    purviewProjectId: val
  })
  if (!bodyPermission.success) {
    drawerVisible.value = false
    return
  }
  defaultCheckedMenuSelectValue.value = bodyPermission.data
}

const drawerSave = async (title, resolve) => {
  editForm.menuIds = treeMenuRef.value.getCheckboxNodes()
  const body = await postJson("/auth/project/menu/setting/install", removeEmptyAndNull(editForm))
  if (!body.success) {
    drawerVisible.value = false
    resolve() // ✅ 调用 resolve 告诉子组件：我这边已经处理完了
    return
  }

  drawerVisible.value = false
  resolve() // ✅ 调用 resolve 告诉子组件：我这边已经处理完了
  message("设置成功", { type: "success" })
}

/**
 * sso登录后跳转到不同的系统
 * @param url
 */
const handleOpenSystem = async (url: string) => {
  if (!url) {
    message("项目地址不存在，请联系管理员配置", { type: "warning" })
    return
  }

  if (!url.endsWith("/")) url = url + "/"

  url = url + "#/welcome?accessToken=" + getToken()

  // 3. 新窗口打开地址（target="_blank" 等价效果）
  window.open(url, "_blank")
}
</script>
<style lang="scss" scoped></style>
