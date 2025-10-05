<template>
  <div class="main">
    <KPTableQuery :event-bus="eventBus" :query-params="queryParams" exclude="projectId,orderBy,isTree">
      <KPSelect v-model="queryParams.projectId" label="项目名称" :span="4" :options="projectSelectValue" @change="kpSelectChange(eventBus, queryParams)" />
      <KPInputText v-model="queryParams.menuName" label="菜单名称" :span="4" />
      <KPInputText v-model="queryParams.perms" label="权限标识" :span="4" />
      <KPSelect v-model="queryParams.visible" label="是否显示" :span="4" :options="VisibleEnum" @change="kpSelectChange(eventBus, queryParams)" />
      <KPSelect v-model="queryParams.isEnable" label="是否启用" :span="4" :options="StartAndStopEnum" @change="kpSelectChange(eventBus, queryParams)" />
    </KPTableQuery>

    <KPTableTree ref="tableTreeRef" :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :table-column="tableColumn" :init-list="false" :list-api="basic.listApi" :sort-api="basic.sortApi" :del-api="basic.delApi" :add-button-auth="basic.addButtonAuth" :update-button-auth="basic.updateButtonAuth" :del-button-auth="basic.delButtonAuth" :details-button-auth="basic.detailsButtonAuth" @open-edit-dialog="openEditDialog" details-button-row update-button-row del-button-row checkbox>
      <template #toolbar>
        <Auth value="auth:menu:do:copy">
          <el-button class="operate_button" icon="Document-copy" type="warning" size="small" title="复制" circle @click="handleCopy" />
        </Auth>
      </template>

      <template #isEnable="{ row }">
        <el-switch v-if="hasAuth('auth:menu:do:enable')" v-model="row.isEnable" inline-prompt :active-value="1" active-text="正常" :inactive-value="0" inactive-text="停用" @click="handleSwitchStatus(row)" />
        <el-tag v-if="!hasAuth('auth:menu:do:enable') && row.isEnable == 1" type="success" round effect="dark">是</el-tag>
        <el-tag v-if="!hasAuth('auth:menu:do:enable') && row.isEnable == 0" type="danger" round effect="dark">否</el-tag>
      </template>
    </KPTableTree>

    <KPDialogFormEdit :event-bus="eventBus" v-model="dialogVisible" :query-params="queryParams" :rules="rules" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :details-api="basic.detailsApi" :table-key="basic.tableKey" :update-api="basic.updateApi" label-width="100px">
      <KPSelect v-model="editForm.projectId" label="所属系统" :options="projectSelectValue" prop="projectId" disabled />
      <KPTreeSelect v-model="editForm.parentId" :options="menuSelectValue" label="上级菜单" />
      <KPRadioButton v-model="editForm.menuType" :options="MenuEnum" label="菜单类型" prop="menuType" />
      <template v-if="editForm.menuType === 'M'">
        <KPInputText v-model="editForm.menuName" label="目录名称" prop="menuName" :span="12" />
        <KPRadio v-model="editForm.isEnable" label="是否启用" prop="isEnable" :options="YesOrNo" :span="12" />
        <KPIconSelect v-model="editForm.icon" label="菜单图标" prop="icon" :span="12" />
        <KPRadio v-model="editForm.frameStatus" label="链接类型" prop="frameStatus" :options="FrameStatus" :span="12" />
        <KPInputText v-model="editForm.routePath" label="路由地址" prop="routePath" :span="12" />
        <KPRadio v-model="editForm.visible" label="是否显示" prop="visible" :options="YesOrNo" :span="12" />
      </template>

      <template v-if="editForm.menuType === 'C'">
        <KPInputText v-model="editForm.menuName" label="菜单名称" prop="menuName" :span="12" />
        <KPRadio v-model="editForm.isEnable" label="是否启用" prop="isEnable" :options="YesOrNo" :span="12" />
        <KPIconSelect v-model="editForm.icon" label="菜单图标" prop="icon" :span="12" />
        <KPRadio v-model="editForm.frameStatus" label="链接类型" prop="frameStatus" :options="FrameStatus" :span="12" />
        <KPInputText v-model="editForm.routeName" label="路由名称" prop="routeName" :span="12" />
        <KPRadio v-model="editForm.isCache" label="是否缓存" prop="isCache" :options="YesOrNo" :span="12" />
        <KPInputText v-model="editForm.routePath" label="路由地址" prop="routePath" :span="12" @input="handleRoutePath" />
        <KPRadio v-model="editForm.visible" label="是否显示" prop="visible" :options="YesOrNo" :span="12" />
        <KPInputText v-model="editForm.routeComponent" label="组件路径" prop="routeComponent" :span="12" />
        <KPInputText v-model="editForm.perms" label="权限标识" prop="perms" :span="12" />
      </template>

      <template v-if="editForm.menuType === 'B'">
        <KPInputText v-model="editForm.menuName" label="按钮名称" prop="menuName" />
        <KPInputText v-model="editForm.perms" label="权限标识" prop="perms" :rules="[{ required: true, message: '请输入权限标识', trigger: 'blur' }]" />
      </template>

      <template v-if="editForm.menuType === 'I'">
        <KPInputText v-model="editForm.menuName" label="接口名称" prop="menuName" />
        <KPInputText v-model="editForm.perms" label="权限标识" prop="perms" :rules="[{ required: true, message: '请输入权限标识', trigger: 'blur' }]" />
      </template>

      <KPInputText v-model="editForm.remark" label="备注" type="textarea" rows="4" />
    </KPDialogFormEdit>

    <KPDialogDetails :event-bus="eventBus" v-model="detailsDialogVisible" :title="basic.title + '详情'" :details-api="basic.detailsApi" :table-key="basic.tableKey" :details-column="detailsColumn" label-width="120px" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import mitt from "mitt"
import { removeEmptyAndNull } from "@/utils/json"
import { DetailsColumn, PageData, SelectColumn, TableColumn, TableDialogColumn } from "@/utils/data/systemData"
import { FrameStatus, MenuEnum, StartAndStopEnum, VisibleEnum, YesOrNo } from "@/utils/data/serviceData"
import { getMenuSelect, getProjectSelect } from "@/api/system"
import { postJson } from "@/api/common"
import { message, numberMessageBox } from "@/utils/message"
import { kpSelectChange } from "@/utils/list"
import { hasAuth } from "@/router/utils"

let basic: TableDialogColumn = {
  title: "菜单",
  tableKey: "menuId",
  listApi: "/auth/menu/list",
  saveApi: "/auth/menu/save",
  addButtonAuth: "auth:menu:save",
  updateApi: "/auth/menu/update",
  updateButtonAuth: "auth:menu:update",
  delApi: "/auth/menu/batch/remove",
  delButtonAuth: "auth:menu:batch:remove",
  detailsApi: "/auth/menu/details",
  detailsButtonAuth: "auth:menu:details",
  sortApi: "/auth/menu/do/set/sort"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
  ...new PageData(),
  projectId: null as string | null,
  menuName: null as string | null,
  perms: null as string | null,
  visible: null as number | null,
  isEnable: null as number | null,
  isTree: 1,
  orderBy: "sort asc"
})

/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
  { prop: "menuName", label: "菜单名称", sort: true, width: 200, prefixIcon: "icon" },
  { prop: "sort", label: "顺序" },
  { prop: "perms", label: "权限标识", sort: true },
  { prop: "menuType", label: "菜单类型", sort: true, render: { M: "目录", C: "菜单", B: "按钮", I: "接口" }, tag: { M: "primary", C: "success", B: "warning", I: "danger" }, tagEffect: "light", tagRound: false },
  { prop: "isEnable", label: "是否启用", sort: true },
  { prop: "visible", label: "是否显示", sort: true, render: { 1: "显示", 0: "不显示" }, tag: { 1: "success", 0: "danger" }, tagEffect: "light", tagRound: false },
  { prop: "routeName", label: "路由名称" },
  { prop: "routePath", label: "路由地址" },
  { prop: "routeComponent", label: "路由组件路径" },
  { prop: "createDate", label: "创建时间", sort: true },
  { prop: "updateDate", label: "修改时间", sort: true }
]

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
  { prop: "menuId", label: "菜单Id" },
  { prop: "parentId", label: "父菜单ID" },
  { prop: "menuName", label: "菜单名称" },
  { prop: "menuType", label: "菜单类型", render: { M: "目录", C: "菜单", B: "按钮", I: "接口" } },
  { prop: "perms", label: "权限标识" },
  { prop: "frameStatus", label: "链接类型", render: { 1: "内部", 2: "外链内嵌", 3: "外链" } },
  { prop: "isEnable", label: "是否启用", render: { 1: "是", 0: "否" } },
  { prop: "visible", label: "是否显示", render: { 1: "是", 0: "否" } },
  { prop: "isCache", label: "是否缓存", render: { 1: "是", 0: "否" } },
  { prop: "routeName", label: "路由名称" },
  { prop: "routePath", label: "路由地址" },
  { prop: "routeComponent", label: "路由组件" },
  { prop: "ancestors", label: "祖级列表", span: 2 },
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
  projectId: [{ required: true, message: "请选择所属系统", trigger: "blur" }],
  menuType: [{ required: true, message: "请选择菜单系统", trigger: "blur" }],
  menuName: [{ required: true, message: "请输入目录名称", trigger: "blur" }],
  icon: [{ required: true, message: "请选择菜单图标", trigger: "blur" }],
  frameStatus: [{ required: true, message: "请选择链接类型", trigger: "blur" }],
  visible: [{ required: true, message: "请选择是否显示", trigger: "blur" }],
  isEnable: [{ required: true, message: "请选择是否启用", trigger: "blur" }],
  routePath: [{ required: true, message: "请输入路由地址", trigger: "blur" }],
  routeName: [{ required: true, message: "请输入路由名称", trigger: "blur" }],
  isCache: [{ required: true, message: "请选择是否缓存", trigger: "blur" }],
  routeComponent: [{ required: true, message: "请输入组件路径", trigger: "blur" }]
})

/**
 * 需要编辑的对象内容定义
 */
class EditData {
  projectId: string = null
  parentId: string = null
  menuId: string = null
  menuType: string = null
  menuName: string = null
  isEnable: number = 1
  icon: string = null
  frameStatus: number = 1
  routePath: string = null
  visible: number = 1
  routeName: string = null
  isCache: number = 0
  routeComponent: string = null
  perms: string = null
  remark: string = null
}

//编辑表单数据
const editForm = reactive<EditData>(new EditData())
// 创建事件总线实例
const eventBus = mitt()
//是否显示模态框
const dialogVisible = ref<boolean>(false)
//详情模态框
const detailsDialogVisible = ref<boolean>(false)
//项目下拉框
const projectSelectValue = ref<Array<SelectColumn>>([])
//菜单下拉框
const menuSelectValue = ref<Array<SelectColumn>>()
//KPtableTreeRef 的 ref
const tableTreeRef = ref(null)

onMounted(() => {
  querySelect()
})

const querySelect = async () => {
  const body = await getProjectSelect({ manageType: 1 })
  if (!body.success) return
  projectSelectValue.value = body.data
  queryParams.projectId = projectSelectValue.value[0].value
  eventBus.emit("init", removeEmptyAndNull(queryParams))
}

/**
 * 路由地址监控
 * @param value
 */
const handleRoutePath = async value => {
  editForm.routeComponent = "views/" + value + ".vue"
}

/**
 * 设置项目状态
 * @param val
 */
const handleSwitchStatus = async val => {
  await postJson("/auth/menu/do/enable", { menuId: val.menuId })
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

const openEditDialog = async (edit: string, row: any) => {
  editForm.projectId = queryParams.projectId
  editForm.menuType = "M"
  const body = await getMenuSelect({ projectId: queryParams.projectId, isTree: 1 })
  if (!body.success) return
  menuSelectValue.value = body.data
}

const handleCopy = async () => {
  if (numberMessageBox(tableTreeRef.value.multiSelectValue.length, 1)) return
  const { success } = await postJson("/auth/menu/do/copy", { menuId: tableTreeRef.value.multiSelectValue[0].menuId })
  if (!success) return

  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
  message("复制成功", { type: "success" })
}
</script>

<style lang="scss" scoped>
.operate_button {
  width: 28px;
  height: 28px;
}
</style>
