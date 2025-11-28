<template>
  <div class="main">
    <div class="common-layout">
      <el-container>
        <el-aside width="250px">
          <KPCardTree placeholder="部门名称" :tree-value="deptSelectValue" :expanded-keys="defaultDeptSelectValue" @nodeClick="handleTreeClick" />
        </el-aside>
        <el-main style="padding: 0 0 0 10px">
          <KPTableQueryMany :event-bus="eventBus" :query-params="queryParams" label-width="85px" query-height="175px">
            <KPInputText v-model="queryParams.name" label="姓名或昵称" :span="8" />
            <KPInputText v-model="queryParams.jobNumber" label="工号" :span="8" />
            <KPSelect v-model="queryParams.sex" label="性别" :span="8" :options="UserSexEnum" @change="kpSelectChange(eventBus, queryParams)" />
            <KPSelect v-model="queryParams.status" label="状态" :span="8" :options="UserAccountNumberStatusEnum" @change="kpSelectChange(eventBus, queryParams)" />
            <KPInputText v-model="queryParams.phoneNumber" label="手机号" :span="8" />
          </KPTableQueryMany>

          <KPTable ref="tableTreeRef" :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :table-column="tableColumn" :list-api="basic.listApi" :del-api="basic.delApi" :add-button-auth="basic.addButtonAuth" :update-button-auth="basic.updateButtonAuth" :del-button-auth="basic.delButtonAuth" :details-button-auth="basic.detailsButtonAuth" :record-button-auth="basic.recordButtonAuth" details-button-row checkbox>
            <template #toolbar>
              <Auth value="auth:user:batch:cancel">
                <el-button class="operate_button" type="danger" title="注销" circle @click="handleLogout">
                  <IconifyIconOnline icon="ri:shut-down-line" />
                </el-button>
              </Auth>

              <Auth value="auth:user:unlock">
                <el-button class="operate_button" icon="Unlock" type="success" title="解锁" circle @click="handleUnlock" />
              </Auth>

              <Auth value="auth:user:reset">
                <el-button class="operate_button" icon="SetUp" type="warning" title="重置密码" circle @click="handleResetPassword" />
              </Auth>
            </template>

            <template #status="{ row }">
              <el-switch v-if="hasAuth('auth:user:forbidden') && (row.status == 1 || row.status == 2)" v-model="row.status" inline-prompt :active-value="1" active-text="正常" :inactive-value="2" inactive-text="禁用" @click="handleSwitchStatus(row)" />
              <el-tag v-if="!hasAuth('auth:user:forbidden') && row.status == 1" type="success" round effect="dark">正常</el-tag>
              <el-tag v-if="!hasAuth('auth:user:forbidden') && row.status == 2" type="danger" round effect="dark">禁用</el-tag>
              <el-tag v-if="row.status == 3" type="warning" round effect="dark">锁定</el-tag>
              <el-tag v-if="row.status == 4" type="info" round effect="dark">注销</el-tag>
            </template>
          </KPTable>
        </el-main>
      </el-container>
    </div>

    <KPDialogFormEdit #default="{ isUpdate }" v-model="dialogVisible" :event-bus="eventBus" :query-params="queryParams" :rules="rules" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :details-api="basic.detailsApi" :table-key="basic.tableKey" :update-api="basic.updateApi" label-width="100px">
      <KPInputText v-model="editForm.userName" label="用户账号" prop="userName" :span="12" :disabled="isUpdate" />
      <KPInputText v-model="editForm.jobNumber" label="工号" prop="jobNumber" :span="12" :disabled="isUpdate" />
      <KPInputText v-model="editForm.realName" label="真实姓名" prop="realName" :span="12" />
      <KPInputText v-model="editForm.nickName" label="用户昵称" prop="nickName" :span="12" />
      <KPInputText v-model="editForm.phoneNumber" label="手机号" prop="phoneNumber" :span="12" />
      <KPInputText v-model="editForm.email" label="邮箱" :span="12" />
      <KPRadio v-model="editForm.sex" label="性别" prop="sex" :options="UserSexEnum" :span="12" />
      <KPRadio v-model="editForm.userStatus" label="用户状态" prop="userStatus" :options="UserStatusEnum" :span="12" />
      <KPDatePicker v-model="editForm.entryDate" label="入职时间" :span="12" />
      <KPDatePicker v-model="editForm.officialDate" label="转正时间" :span="12" />
      <KPInputText v-model="editForm.idCard" label="身份证" :span="12" />
      <KPSelect v-model="editForm.projectIds" label="可操作项目" :options="projectSelectValue" tip-body="该用户拥有对指定项目的管理员权限" multiple :span="12" />
      <KPSelect v-model="editForm.roleIds" label="角色" prop="roleIds" :options="roleSelectValue" tip-body="当用户拥有多个角色时，其最终权限是这些角色权限的并集" multiple :span="12" />
      <KPSelect v-model="editForm.postIds" label="岗位" prop="postIds" :options="postSelectValue" multiple :span="12" />
      <KPGroupForm label="归属部门">
        <template v-for="(userDept, index) in editForm.userDepts" :key="index">
          <div :style="index == 0 ? 'margin-top: 0px' : 'margin-top: 46px'" />
          <KPTreeSelect v-model="userDept.deptId" :options="deptSelectValue" label="归属部门" :span="10" :prop="'userDepts.' + index + '.deptId'" :rules="[{ required: true, message: '请选择部门', trigger: 'blur' }]" />
          <el-col :span="1" />
          <KPRadio v-model="userDept.principal" label="是否负责人" :options="YesOrNo" :span="9" :prop="'userDepts.' + index + '.principal'" :rules="[{ required: true, message: '请选择是否负责人', trigger: 'blur' }]" />
          <el-col :span="4">
            <el-button size="small" title="新增部门" circle @click="addUserDept">
              <IconifyIconOnline icon="ri:add-fill" />
            </el-button>
            <el-button size="small" title="删除部门" circle @click="delUserDept(index)">
              <IconifyIconOnline icon="ri:subtract-fill" />
            </el-button>
          </el-col>
        </template>
      </KPGroupForm>
      <KPInputText v-model="editForm.remark" label="备注" type="textarea" />
    </KPDialogFormEdit>

    <KPDialogDetails :event-bus="eventBus" v-model="detailsDialogVisible" :title="basic.title + '详情'" top="10vh" :column="3" width="70%" :details-api="basic.detailsApi" :table-key="basic.tableKey" :details-column="detailsColumn" label-width="140px" />

    <KPDialogRecord v-model="recordDialogVisible" :event-bus="eventBus" :tabs="[{ label: '用户信息' }, { label: '用户所属部门' }, { label: '用户所属角色' }, { label: '用户所属岗位' }, { label: '用户可操作项目' }]" :tableKey="basic.tableKey" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import mitt from "mitt"
import { removeEmptyAndNull } from "@/utils/kp/tool/json"
import { DetailsColumn, PageData, SelectColumn, TableColumn, TableDialogColumn } from "@/utils/kp/data/systemData"
import { UserAccountNumberStatusEnum, UserSexEnum, UserStatusEnum, YesOrNo } from "@/utils/kp/data/serviceData"
import { getDeptSelect, getPostSelect, getProjectSelect, getRoleSelect } from "@/api/system"
import { postJson } from "@/api/common"
import { message, numberMessageBox, selectMessageBox } from "@/utils/message"
import Avatar from "@/assets/user.png"
import { kpSelectChange } from "@/utils/kp/tool/list"
import { hasAuth } from "@/router/utils"

let basic: TableDialogColumn = {
  title: "用户",
  tableKey: "userId",
  listApi: "/auth/user/page/list",
  saveApi: "/auth/user/save",
  addButtonAuth: "auth:user:save",
  updateApi: "/auth/user/update",
  updateButtonAuth: "auth:user:update",
  delApi: "/auth/user/batch/remove",
  delButtonAuth: "auth:user:batch:remove",
  detailsApi: "/auth/user/details",
  detailsButtonAuth: "auth:user:details",
  recordButtonAuth: "auth:object:change:log:page:list"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
  ...new PageData(),
  name: null as string | null,
  phoneNumber: null as string | null,
  jobNumber: null as string | null,
  status: null as number | null,
  deptId: null as string | null,
  sex: null as number | null,
  orderBy: "create_date desc"
})

/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
  { prop: "avatar", label: "头像", type: "avatar", avatarIma: Avatar },
  { prop: "userName", label: "账号", width: 100 },
  { prop: "jobNumber", label: "工号", sort: true },
  { prop: "realName", label: "姓名", sort: true },
  { prop: "nickName", label: "昵称", sort: true },
  { prop: "sex", label: "性别", sort: true, render: { 1: "男", 0: "女", 2: "未知" } },
  { prop: "deptNames", label: "部门", sort: true },
  { prop: "postNames", label: "岗位", sort: true },
  { prop: "source", label: "来源", sort: true },
  { prop: "status", label: "状态", sort: true },
  { prop: "loginDate", label: "登录时间", sort: true },
  { prop: "loginIp", label: "登录IP", sort: true }
]

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
  { prop: "userId", label: "用户Id" },
  { prop: "idCard", label: "身份证" },
  { prop: "source", label: "数据来源" },
  { prop: "userName", label: "用户账号" },
  { prop: "userStatus", label: "用户状态", render: { 1: "实习", 2: "转正", 3: "离职" } },
  { prop: "status", label: "帐号状态", render: { 1: "正常", 2: "禁用", 3: "锁定", 4: "注销" } },
  { prop: "realName", label: "真实姓名" },
  { prop: "nickName", label: "用户昵称" },
  { prop: "sex", label: "用户性别", render: { 1: "男", 0: "女", 2: "未知" } },
  { prop: "jobNumber", label: "工号" },
  { prop: "phoneNumber", label: "手机号码" },
  { prop: "email", label: "用户邮箱" },
  { prop: "entryDate", label: "入职时间" },
  { prop: "officialDate", label: "转正时间" },
  { prop: "dimissionDate", label: "离职时间" },
  { prop: "loginDate", label: "最后登陆时间" },
  { prop: "loginIp", label: "最后登陆IP" },
  { prop: "lockDate", label: "锁定时间", span: 2 },
  { prop: "deptIds", label: "部门Id集合", span: 3, isList: ", " },
  { prop: "deptNames", label: "部门名称集合", span: 3, isList: ", " },
  { prop: "roleIds", label: "角色Id集合", span: 3, isList: ", " },
  { prop: "roleNames", label: "角色名称集合", span: 3, isList: ", " },
  { prop: "postIds", label: "岗位Id集合", span: 3, isList: ", " },
  { prop: "postNames", label: "岗位名称集合", span: 3, isList: ", " },
  { prop: "projectIds", label: "可操作项目id", span: 3, isList: ", " },
  { prop: "projectNames", label: "可操作项目名称", span: 3, isList: ", " },
  { prop: "createUserId", label: "创建用户编号" },
  { prop: "createDate", label: "创建时间" },
  { prop: "createUserName", label: "创建用户名称" },
  { prop: "updateUserId", label: "修改用户编号" },
  { prop: "updateDate", label: "修改时间" },
  { prop: "updateUserName", label: "修改用户名称" },
  { prop: "remark", label: "备注", span: 3 }
]

/**
 * 新增 修改的表单校验对象
 */
const rules = reactive({
  userName: [{ required: true, message: "请输入用户账号", trigger: "blur" }],
  jobNumber: [{ required: true, message: "请输入工号", trigger: "blur" }],
  realName: [{ required: true, message: "请输入真实姓名", trigger: "blur" }],
  nickName: [{ required: true, message: "请输入用户昵称", trigger: "blur" }],
  phoneNumber: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  sex: [{ required: true, message: "请选择性别", trigger: "blur" }],
  userStatus: [{ required: true, message: "请选择用户状态", trigger: "blur" }],
  postIds: [{ required: true, message: "请选择岗位", trigger: "blur" }],
  roleIds: [{ required: true, message: "请选择角色", trigger: "blur" }]
})

/**
 * 需要编辑的对象内容定义
 */
class EditData {
  userId: string = null
  userName: string = null
  nickName: string = null
  realName: string = null
  phoneNumber: string = null
  jobNumber: string = null
  sex: number = 1
  idCard: string = null
  email: string = null
  source: string = "鉴权系统"
  userStatus: number = 1
  status: number = 1
  remark: string = null
  entryDate: Date = null
  officialDate: Date = null
  postIds: Array<string> = null
  projectIds: Array<string> = null
  roleIds: Array<string> = null
  userDepts: Array<{ deptId: string; principal: number }> = [{ deptId: null, principal: 0 }]
}

//编辑表单数据
const editForm = reactive<EditData>(new EditData())
// 创建事件总线实例
const eventBus = mitt()
//是否显示模态框
const dialogVisible = ref<boolean>(false)
//详情模态框
const detailsDialogVisible = ref<boolean>(false)
//KPtableTreeRef 的 ref
const tableTreeRef = ref(null)
//项目下拉框
const projectSelectValue = ref<Array<SelectColumn>>([])
//角色下拉框
const roleSelectValue = ref<Array<SelectColumn>>([])
//岗位下拉框
const postSelectValue = ref<Array<SelectColumn>>([])
//部门下拉框
const deptSelectValue = ref<Array<SelectColumn>>([])
//部门默认展开行
const defaultDeptSelectValue = ref<Array<string>>()
// 修改记录模态框
const recordDialogVisible = ref<boolean>(false)

onMounted(() => {
  queryProjectSelect()
  queryRoleSelect()
  queryPostSelect()
  queryDeptSelect()
})

const queryProjectSelect = async () => {
  const body = await getProjectSelect({ manageType: 1 })
  if (!body.success) return
  projectSelectValue.value = body.data
}
const queryRoleSelect = async () => {
  const body = await getRoleSelect()
  if (!body.success) return
  roleSelectValue.value = body.data
}
const queryPostSelect = async () => {
  const body = await getPostSelect()
  if (!body.success) return
  postSelectValue.value = body.data
}
const queryDeptSelect = async () => {
  const body = await getDeptSelect({ isTree: 1 })
  if (!body.success) return
  deptSelectValue.value = body.data
  defaultDeptSelectValue.value = [deptSelectValue.value[0].value]
}

/**
 * 设置项目状态
 * @param val
 */
const handleSwitchStatus = async val => {
  await postJson("/auth/user/forbidden", { userId: val.userId })
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

/**
 * 新增归属部门
 */
const addUserDept = () => {
  editForm.userDepts.push({
    deptId: null,
    principal: 0
  })
}

/**
 * 移除归属部门
 */
const delUserDept = index => {
  if (editForm.userDepts.length == 1) {
    message("至少保留一个部门", { type: "warning" })
    return
  }
  editForm.userDepts.splice(index, 1)
}

/**
 * 点击部门查询
 * @param node
 */
const handleTreeClick = async node => {
  queryParams.deptId = node.value
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

/**
 * 注销
 */
const handleLogout = async () => {
  if (numberMessageBox(tableTreeRef.value.multiSelectValue.length, 2)) return

  let values = []
  tableTreeRef.value.multiSelectValue.forEach(row => {
    values.push(row.userId)
  })

  selectMessageBox("是否注销" + values.length + " 个用户，请注意，用户注销后无法再次使用").then(async () => {
    const body = await postJson("/auth/user/batch/cancel", values)
    if (!body.success) return

    eventBus.emit("queryList", removeEmptyAndNull(queryParams))
    message(body.success ? body.data : body.message, { type: body.success ? "success" : "error" })
  })
}

/**
 * 管理员解锁
 */
const handleUnlock = async () => {
  if (numberMessageBox(tableTreeRef.value.multiSelectValue.length, 1)) return

  selectMessageBox("是否解锁该用户").then(async () => {
    const body = await postJson("/auth/user/unlock", { userId: tableTreeRef.value.multiSelectValue[0].userId })
    if (!body.success) return
    eventBus.emit("queryList", removeEmptyAndNull(queryParams))
    message(body.success ? body.data : body.message, { type: body.success ? "success" : "error" })
  })
}

/**
 * 重置密码
 */
const handleResetPassword = async () => {
  if (numberMessageBox(tableTreeRef.value.multiSelectValue.length, 1)) return

  selectMessageBox("是否把该用户密码重置为初始密码").then(async () => {
    const body = await postJson("/auth/user/reset", { userId: tableTreeRef.value.multiSelectValue[0].userId })
    if (!body.success) return
    eventBus.emit("queryList", removeEmptyAndNull(queryParams))
    message("重置密码成功", { type: "success" })
  })
}
</script>

<style lang="scss" scoped>
.operate_button {
  width: 28px;
  height: 28px;
}
</style>
