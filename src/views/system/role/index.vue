<template>
  <div class="main">
    <KPTableQuery :event-bus="eventBus" :query-params="queryParams">
      <KPSelect v-model="queryParams.projectId" label="项目名称" :span="6" :options="projectSelectValue" @change="kpSelectChange(eventBus, queryParams)" />
      <KPInputText v-model="queryParams.roleName" label="角色名称" :span="6" />
      <KPInputText v-model="queryParams.roleCode" label="角色编号" :span="6" />
      <KPSelect v-model="queryParams.status" label="状态" :span="6" :options="StartAndStopEnum" @change="kpSelectChange(eventBus, queryParams)" />
    </KPTableQuery>

    <KPTable ref="tableTreeRef" :event-bus="eventBus" :query-params="queryParams" :table-key="basic.tableKey" :table-column="tableColumn" :list-api="basic.listApi" :del-api="basic.delApi" :add-button-auth="basic.addButtonAuth" :update-button-auth="basic.updateButtonAuth" :del-button-auth="basic.delButtonAuth" :details-button-auth="basic.detailsButtonAuth" details-button-row update-button-row del-button-row checkbox>
      <template #toolbar>
        <Auth value="auth:role:add:user">
          <el-button class="operate_button" icon="Setting" type="primary" title="设置用户" circle @click="openRoleUserDialog(OperateEnum.setRoleUser)" />
        </Auth>
      </template>

      <template #status="{ row }">
        <el-switch v-if="hasAuth('auth:role:update:status')" v-model="row.status" inline-prompt :active-value="1" active-text="正常" :inactive-value="0" inactive-text="停用" @click="handleSwitchStatus(row)" />
        <el-tag v-if="!hasAuth('auth:role:update:status') && row.status == 1" type="success" round effect="dark">正常</el-tag>
        <el-tag v-if="!hasAuth('auth:role:update:status') && row.status == 0" type="danger" round effect="dark">停用</el-tag>
      </template>

      <template #actions="{ row }">
        <el-button v-if="hasAuth('auth:role:menu:setting:install')" type="primary" size="small" title="菜单权限" link @click="openDrawer(OperateEnum.setMenuAuthority, row)">
          <IconifyIconOnline icon="ep:menu" />
          &nbsp;菜单权限
        </el-button>

        <el-button v-if="hasAuth('auth:role:permission:setting:install')" type="primary" size="small" title="菜单权限" link @click="openDrawer(OperateEnum.setDataAuthority, row)">
          <IconifyIconOnline icon="ri:database-2-fill" />
          &nbsp;数据权限
        </el-button>
      </template>
    </KPTable>

    <KPDialogFormEdit :event-bus="eventBus" v-model="dialogVisible" :query-params="queryParams" :rules="rules" :title="basic.title" :edit-params="editForm" :date-structure="EditData" :save-api="basic.saveApi" :details-api="basic.detailsApi" :table-key="basic.tableKey" :update-api="basic.updateApi" label-width="100px">
      <KPInputText v-model="editForm.roleName" label="角色名称" prop="roleName" />
      <KPInputText v-model="editForm.roleCode" label="角色编号" prop="roleCode" />
      <KPSelect v-model="editForm.projectIds" label="所属项目" prop="projectIds" :options="projectSelectValue" multiple />
      <KPRadio v-model="editForm.status" label="角色状态" prop="status" :options="StartAndStopEnum" />
      <KPInputText v-model="editForm.remark" label="备注" type="textarea" />
    </KPDialogFormEdit>

    <KPDialogDetails :event-bus="eventBus" v-model="detailsDialogVisible" :title="basic.title + '详情'" :details-api="basic.detailsApi" :table-key="basic.tableKey" :details-column="detailsColumn" label-width="120px" />

    <KPDialog v-model="dialogRoleUserVisible" :event-bus="eventBus" title="角色设置用户" top="10vh" @dialogSave="roleUserSave">
      <KPTableShow
        ref="tableShowRef"
        kp-table-query-height="350px"
        :query-params="tableShowRefQueryParams"
        list-api="/auth/user/list"
        :initList="false"
        actionWidth="75px"
        :table-column="[
          { prop: 'realName', label: '姓名', sort: true },
          { prop: 'nickName', label: '昵称', sort: true },
          { prop: 'jobNumber', label: '工号', sort: true },
          { prop: 'sex', label: '性别', sort: true, render: { 1: '男', 0: '女', 2: '未知' } },
          { prop: 'deptNames', label: '部门', sort: true },
          { prop: 'postNames', label: '岗位', sort: true },
          { prop: 'roleNames', label: '角色', sort: true },
          { prop: 'status', label: '状态', sort: true, render: { 1: '正常', 2: '禁用', 3: '锁定', 4: '注销' } }
        ]"
      >
        <template #actions="{ row }">
          <el-button type="danger" icon="Delete" size="small" title="删除" link @click="handleRoleUserDelete(row)">删除</el-button>
        </template>
      </KPTableShow>
      <el-row :gutter="20" style="width: 100%; margin-top: 25px">
        <KPTreeSelect v-model="deptIds" :options="deptSelectValue" label="选择部门" :span="9" @change="handleDeptChange" />
        <el-col :span="3">
          <el-button type="primary" @click="handleDeptRoleProject(2)">确定</el-button>
        </el-col>

        <KPSelect v-model="userIds" :options="userMessageSelect" label="选择用户" :span="9" multiple />
        <el-col :span="3">
          <el-button type="primary" @click="handleUserRoleProject(2)">确定</el-button>
        </el-col>
      </el-row>
    </KPDialog>

    <KPDrawer v-model="drawerVisible" :title="drawerTitle" :event-bus="eventBus" @drawerSave="drawerSave">
      <el-form :model="editForm" label-width="80px">
        <KPTag v-model="editForm.roleName" label="角色名称" prop="roleName" />
        <KPSelect v-model="editForm.projectId" label="所属项目" :options="roleProjectSelectValue" @change="handleProject" />

        <KPGroupForm label="菜单" v-if="drawerTitle === '设置菜单权限'">
          <KPTree ref="treeMenuRef" occupyHeight="350px" placeholder="请输入菜单进行搜索" :width="90" :tree-value="projectMenuSelectValue" :expanded-keys="defaultProjectMenuSelectValue" :checked-keys="defaultCheckedMenuSelectValue" checkbox />
        </KPGroupForm>

        <template v-if="drawerTitle === '设置数据权限'">
          <KPSelect v-model="editForm.permissionType" label="权限范围" :options="DataAuthorityTypeEnum" @change="handleProject" />
          <KPGroupForm label="用户权限" v-if="editForm.permissionType === 2">
            <el-table :data="rolePermissionUserSelect">
              <el-table-column align="center" :show-overflow-tooltip="true" prop="realName" label="姓名" />
              <el-table-column align="center" :show-overflow-tooltip="true" prop="jobNumber" label="工号" />
              <el-table-column align="center" :show-overflow-tooltip="true" prop="phoneNumber" label="手机号" />
              <el-table-column v-slot="{ row }" align="center" label="操作">
                <el-button type="danger" icon="Delete" size="small" title="删除" link @click="handlePermissionUserDelete(row)">删除</el-button>
              </el-table-column>
            </el-table>

            <el-row :gutter="20" style="width: 100%; margin-top: 20px">
              <KPTreeSelect v-model="deptIds" :options="deptSelectValue" label="选择部门" :span="18" @change="handleDeptChange" />
              <el-col :span="6">
                <el-button type="primary" @click="handleDeptRoleProject(1)">确定</el-button>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="width: 100%; margin-top: 20px">
              <KPSelect v-model="userIds" :options="userMessageSelect" label="选择用户" :span="18" multiple />
              <el-col :span="6">
                <el-button type="primary" @click="handleUserRoleProject(1)">确定</el-button>
              </el-col>
            </el-row>
          </KPGroupForm>

          <KPGroupForm label="部门权限" v-if="editForm.permissionType === 5">
            <KPTree ref="treeDeptRef" occupyHeight="350px" placeholder="请输入部门进行搜索" :width="90" :tree-value="deptSelectValue" :expanded-keys="defaultdeptSelectValue" :checked-keys="defaultCheckedDeptSelectValue" checkbox />
          </KPGroupForm>
        </template>
      </el-form>
    </KPDrawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue"
import mitt from "mitt"
import { removeEmptyAndNull } from "@/utils/json"
import { DetailsColumn, OperateEnum, PageData, SelectColumn, TableColumn, TableDialogColumn } from "@/utils/data/systemData"
import { DataAuthorityTypeEnum, StartAndStopEnum } from "@/utils/data/serviceData"
import { getDeptSelect, getProjectSelect } from "@/api/system"
import { postJson } from "@/api/common"
import { hasAuth } from "@/router/utils"
import { message, numberMessageBox } from "@/utils/message"
import { kpSelectChange } from "@/utils/list"
import { TreeKey } from "element-plus/es/components/tree/src/tree.type"

let basic: TableDialogColumn = {
  title: "角色",
  tableKey: "roleId",
  listApi: "/auth/role/page/list",
  saveApi: "/auth/role/save",
  addButtonAuth: "auth:role:save",
  updateApi: "/auth/role/update",
  updateButtonAuth: "auth:role:update",
  delApi: "/auth/role/batch/remove",
  delButtonAuth: "auth:role:batch:remove",
  detailsApi: "/auth/role/details",
  detailsButtonAuth: "auth:role:details"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
  ...new PageData(),
  projectId: null as string | null,
  roleName: null as string | null,
  roleCode: null as string | null,
  status: null as number | null
})

/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
  { prop: "roleName", label: "角色名称", sort: true },
  { prop: "roleCode", label: "角色编号", sort: true },
  { prop: "projectName", label: "项目名称", sort: true },
  { prop: "status", label: "角色状态", sort: true },
  { prop: "remark", label: "备注" },
  { prop: "createDate", label: "创建时间", sort: true },
  { prop: "updateDate", label: "修改时间", sort: true }
]

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
  { prop: "roleId", label: "角色Id" },
  { prop: "roleName", label: "角色名称" },
  { prop: "roleCode", label: "角色编号" },
  { prop: "status", label: "角色状态", render: { 0: "停用", 1: "正常" } },
  { prop: "projectNameList", label: "所属项目", span: 2, isList: ", " },
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
  roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  roleCode: [{ required: true, message: "请输入角色编号", trigger: "blur" }],
  projectIds: [{ required: true, message: "请选择所属项目", trigger: "blur" }],
  status: [{ required: true, message: "请选择角色状态", trigger: "blur" }]
})

/**
 * 需要编辑的对象内容定义
 */
class EditData {
  roleId: string = null
  roleCode: string = null
  roleName: string = null
  projectIds: Array<string> = []
  remark: string = null
  status: number = 1
  //设置权限用
  projectId: string = null
  menuIds: TreeKey[] = []
  //设置数据权限
  permissionType: number = 6
  choiceValue: TreeKey[] = []
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
//drawer是否显示
const drawerVisible = ref<boolean>(false)
//drawer标题
const drawerTitle = ref<string>("")
//角色所属项目下拉框
const roleProjectSelectValue = ref<Array<SelectColumn>>([])
//项目所属菜单下拉框
const projectMenuSelectValue = ref<Array<SelectColumn>>([])
//项目所属菜单默认展开行
const defaultProjectMenuSelectValue = ref<Array<string>>()
//项目所属菜单默认选中行
const defaultCheckedMenuSelectValue = ref<Array<string>>()
//部门下拉框
const deptSelectValue = ref<Array<SelectColumn>>([])
//部门默认展开行
const defaultdeptSelectValue = ref<Array<string>>()
//部门默认选中行
const defaultCheckedDeptSelectValue = ref<Array<string>>()
//KPTree的 菜单ref
const treeMenuRef = ref(null)
//KPTree的 部门ref
const treeDeptRef = ref(null)
//自定义数据权限中选中的用户
const rolePermissionUserSelect = ref<Array<any>>([])
//选中的部门
const deptIds = ref(null)
//指定部门下的用户
const userMessageSelect = ref([])
//选中的用户
const userIds = ref(null)
//是否显示角色下用户的模态框
const dialogRoleUserVisible = ref<boolean>(false)
// 角色用户ref
const tableShowRef = ref(null)
//KPtableTreeRef 的 ref
const tableTreeRef = ref(null)
//KPtableTreeRef 的 入参
const tableShowRefQueryParams = reactive<any>({})
onMounted(() => {
  querySelect()
})

const querySelect = async () => {
  const body = await getProjectSelect({ manageType: 1 })
  if (!body.success) return
  projectSelectValue.value = body.data

  const deltBody = await getDeptSelect({ isTree: 1 })
  if (!deltBody.success) return
  deptSelectValue.value = deltBody.data
  defaultdeptSelectValue.value = [deptSelectValue.value[0].value]
}

/**
 * 设置项目状态
 * @param val
 */
const handleSwitchStatus = async val => {
  await postJson("/auth/role/update/status", { roleId: val.roleId })
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

/**
 * 打开drawer
 * @param edit
 * @param row
 */
const openDrawer = async (edit: string, row: any) => {
  drawerVisible.value = true
  projectMenuSelectValue.value = []
  defaultCheckedMenuSelectValue.value = []
  defaultCheckedDeptSelectValue.value = []
  defaultCheckedDeptSelectValue.value = []
  rolePermissionUserSelect.value = []
  userMessageSelect.value = []
  deptIds.value = null
  userIds.value = null

  Object.keys(editForm).map(key => delete editForm[key])
  Object.assign(editForm, new EditData())
  editForm.roleName = row.roleName
  editForm.roleId = row.roleId

  const body = await postJson("/role/project/select", { roleId: row.roleId })
  if (!body.success) return
  roleProjectSelectValue.value = body.data
  editForm.projectId = roleProjectSelectValue.value[0].value

  switch (edit) {
    case OperateEnum.setMenuAuthority:
      drawerTitle.value = "设置菜单权限"
      handleProject(editForm.projectId)
      break
    case OperateEnum.setDataAuthority:
      drawerTitle.value = "设置数据权限"
      handleProject(editForm.projectId)
      break
  }
}

/**
 * 选择设置菜单权限中所属项目
 * @param value
 */
const handleProject = async value => {
  switch (drawerTitle.value) {
    case OperateEnum.setMenuAuthority:
      drawerTitle.value = "设置菜单权限"
      projectMenuSelectValue.value = []
      const body = await postJson("/menu/select", { isInterface: 1, isTree: 1, projectId: value })
      if (!body.success) return
      projectMenuSelectValue.value = body.data
      defaultProjectMenuSelectValue.value = [projectMenuSelectValue.value[0].value]

      //进行数据回显
      const feedback = await postJson("/auth/role/menu/query/setting/install", { roleId: editForm.roleId, projectId: value })
      if (!feedback.success) return
      defaultCheckedMenuSelectValue.value = feedback.data
      break
    case OperateEnum.setDataAuthority:
      drawerTitle.value = "设置数据权限"
      defaultCheckedDeptSelectValue.value = []
      rolePermissionUserSelect.value = []

      //进行数据回显
      const permissionBody = await postJson("/auth/role/permission/query/setting/install", { roleId: editForm.roleId, projectId: value })
      if (!permissionBody.success) return
      if (permissionBody.data == null) return
      editForm.permissionType = permissionBody.data.permissionType
      defaultCheckedDeptSelectValue.value = permissionBody.data.choiceValue

      //进行用户权限数据回显
      const roleUserBosy = await postJson("/auth/role/permission/query/setting/user", { roleId: editForm.roleId, projectId: value })
      if (!roleUserBosy.success) return
      rolePermissionUserSelect.value = roleUserBosy.data
      break
  }
}

/**
 * 保存drawer
 * @param resolve
 */
const drawerSave = async (title, resolve) => {
  switch (title) {
    case OperateEnum.setMenuAuthority:
      editForm.menuIds = treeMenuRef.value.getCheckboxNodes()
      const body = await postJson("/auth/role/menu/setting/install", removeEmptyAndNull(editForm))
      if (!body.success) {
        drawerVisible.value = false
        resolve() // ✅ 调用 resolve 告诉子组件：我这边已经处理完了
        return
      }
      message("设置成功", { type: "success" })
      break
    case OperateEnum.setDataAuthority:
      drawerTitle.value = "设置数据权限"
      if (editForm.permissionType === 5) {
        editForm.choiceValue = treeDeptRef.value.getCheckboxNodes()
      }
      if (editForm.permissionType === 2) {
        editForm.choiceValue = rolePermissionUserSelect.value.map(item => item.userId)
      }

      const bodyPermission = await postJson("/auth/role/permission/setting/install", removeEmptyAndNull(editForm))
      if (!bodyPermission.success) {
        drawerVisible.value = false
        resolve() // ✅ 调用 resolve 告诉子组件：我这边已经处理完了
        return
      }
      message("设置成功", { type: "success" })
      break
  }

  drawerVisible.value = false
  resolve() // ✅ 调用 resolve 告诉子组件：我这边已经处理完了
}

/**
 * 选择部门下拉框
 * @param title
 * @param resolve
 */
const handleDeptChange = async val => {
  if (val == null) return
  userMessageSelect.value = []

  const body = await postJson("/auth/user/list", { deptId: val })
  if (!body.success) return
  userMessageSelect.value = body.data
  userMessageSelect.value.forEach(user => {
    user.label = user.realName + "-" + user.jobNumber
    user.value = user.userId
  })
}

/**
 * 设置用户---部门
 * @param val
 */
const handleDeptRoleProject = async val => {
  if (deptIds.value == null) {
    message("请选择部门", { type: "warning" })
    return
  }

  userMessageSelect.value.forEach(item => {
    if (val === 1) {
      //设置数据权限
      const containsJob = rolePermissionUserSelect.value.some(user => user.userId === item.userId)
      if (!containsJob) rolePermissionUserSelect.value.push(item)
    }
    if (val === 2) {
      //设置用户角色
      const containsJob = tableShowRef.value.tableList.list.some(user => user.userId === item.userId)
      if (!containsJob) tableShowRef.value.tableList.list.push(item)
    }
  })
}

/**
 * 设置用户---用户
 * @param val
 */
const handleUserRoleProject = async val => {
  if (userIds.value == null) {
    message("请选择用户", { type: "warning" })
    return
  }

  userIds.value.forEach(userId => {
    if (val === 1) {
      const containsJob = rolePermissionUserSelect.value.some(user => user.userId === userId)
      if (!containsJob) rolePermissionUserSelect.value.push(userMessageSelect.value.find(user => user.userId === userId))
    }

    if (val === 2) {
      //设置用户角色
      const containsJob = tableShowRef.value.tableList.list.some(user => user.userId === userId)
      if (!containsJob) tableShowRef.value.tableList.list.push(userMessageSelect.value.find(user => user.userId === userId))
    }
  })
}

/**
 * 删除选中的用户
 * @param val
 */
const handlePermissionUserDelete = async user => {
  // 通过唯一标识（如userId）查找用户在数组中的索引
  const index = rolePermissionUserSelect.value.findIndex(item => item.userId === user.userId)

  if (index !== -1) {
    // 找到用户，删除对应索引的元素
    rolePermissionUserSelect.value.splice(index, 1)
    message("删除成功", { type: "success" })
  } else {
    message("未找到该用户", { type: "warning" })
  }
}

/**
 * 删除选中的用户
 * @param user
 */
const handleRoleUserDelete = async user => {
  // 通过唯一标识（如userId）查找用户在数组中的索引
  const index = tableShowRef.value.tableList.list.findIndex(item => item.userId === user.userId)

  if (index !== -1) {
    // 找到用户，删除对应索引的元素
    tableShowRef.value.tableList.list.splice(index, 1)
    message("删除成功", { type: "success" })
  } else {
    message("未找到该用户", { type: "warning" })
  }
}

/**
 * 打开角色用户对话框
 * @param operateEnum
 */
const openRoleUserDialog = async operateEnum => {
  if (numberMessageBox(tableTreeRef.value.multiSelectValue.length, 1)) return
  dialogRoleUserVisible.value = true
  projectMenuSelectValue.value = []
  defaultCheckedMenuSelectValue.value = []
  defaultCheckedDeptSelectValue.value = []
  defaultCheckedDeptSelectValue.value = []
  rolePermissionUserSelect.value = []
  userMessageSelect.value = []
  deptIds.value = null
  userIds.value = null

  await nextTick() // 等待组件渲染完成
  tableShowRefQueryParams.roleId = tableTreeRef.value.multiSelectValue[0].roleId
  await tableShowRef.value.queryList(tableShowRefQueryParams)
}

/**
 * 保持角色用户
 * @param title
 * @param resolve
 */
const roleUserSave = async (title, resolve) => {
  const body = await postJson("/auth/role/add/user", {
    roleId: tableShowRefQueryParams.roleId,
    userIds: tableShowRef.value.tableList.list.map(item => item.userId)
  })
  if (!body.success) {
    dialogRoleUserVisible.value = false
    resolve() // ✅ 调用 resolve 告诉子组件：我这边已经处理完了
    return
  }
  message("设置成功", { type: "success" })
  dialogRoleUserVisible.value = false
  resolve() // ✅ 调用 resolve 告诉子组件：我这边已经处理完了
}
</script>

<style lang="scss" scoped>
.operate_button {
  width: 28px;
  height: 28px;
}
</style>
