<template>
  <div class="main">
    <KPTableQueryMany :event-bus="eventBus" :query-params="queryParams" exclude="level,projectName" query-height="231px">
      <KPSelect v-model="queryParams.level" label="日志级别" :span="4" :options="JournalStatusEnum" @change="kpSelectChange(eventBus, queryParams)" />
      <KPSelect v-model="queryParams.projectName" label="项目名称" :span="4" :options="projectNameSelectValue" @change="kpSelectChange(eventBus, queryParams)" />
      <KPSelect v-model="queryParams.name" label="接口名称" :span="4" :options="nameSelectValue" @change="kpSelectChange(eventBus, queryParams)" />
      <KPInputText v-model="queryParams.uri" label="url" :span="4" />
      <KPInputText v-model="queryParams.parameters" label="入参" :span="4" />
      <KPInputText v-model="queryParams.result" label="出参" :span="4" />
      <KPInputText v-model="queryParams.identification" label="人ID|项目code" :span="4" />
      <KPInputText v-model="queryParams.identificationName" label="姓名|项目名称" :span="4" />
      <KPInputText v-model="queryParams.serial" label="工号" :span="4" />
      <KPInputText v-model="queryParams.phone" label="手机号" :span="4" />
      <KPInputText v-model="queryParams.clinetIp" label="访问者IP" :span="4" />
      <KPDatePicker v-model="queryParams.callTime" label="访问时间" :span="4" />
      <KPInputText v-model="queryParams.status" label="状态码" :span="4" />
      <KPInputText v-model="queryParams.message" label="返回结果" :span="4" />
    </KPTableQueryMany>

    <KPTable :event-bus="eventBus" :init-list="false" :table-key="basic.tableKey" :query-params="queryParams" :list-api="basic.listApi" :table-column="tableColumn" :details-button-auth="basic.detailsButtonAuth" details-button-row>
      <template #toolbar>
        <Auth value="auth:interface:log:clear:cache">
          <el-button icon="delete" class="operate_button" type="warning" title="清空缓存" circle @click="handleClearCache" />
        </Auth>
      </template>
    </KPTable>

    <KPDialogDetails v-model="detailsDialogVisible" :event-bus="eventBus" :table-key="basic.tableKey" :title="basic.title + '详情'" :details-api="basic.detailsApi" :details-column="detailsColumn" top="10vh" :column="3" width="70%" label-width="155px" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import mitt from "mitt"
import { removeEmptyAndNull } from "@/utils/json"
import { DetailsColumn, SelectColumn, TableColumn, TableDialogColumn } from "@/utils/data/systemData"
import { JournalStatusEnum } from "@/utils/data/serviceData"
import { postJson } from "@/api/common"
import { message } from "@/utils/message"
import { kpSelectChange } from "@/utils/list"

let basic: TableDialogColumn = {
  title: "Http调用记录",
  tableKey: "uuid",
  listApi: "/auth/http/log/page/list",
  detailsApi: "/auth/http/log/details",
  detailsButtonAuth: "auth:http:log:details"
}

/**
 * 搜索内容
 */
const queryParams = reactive({
  projectName: null as string | null,
  name: null as string | null,
  parameters: null as string | null,
  callTime: null as Date | null,
  identification: null as string | null,
  identificationName: null as string | null,
  serial: null as string | null,
  phone: null as string | null,
  uri: null as string | null,
  clinetIp: null as Date | null,
  status: null as number | null,
  message: null as number | null,
  result: null as number | null,
  pageNum: 1,
  pageSize: 10,
  level: 1,
  orderBy: null as string | null
})

/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
  { prop: "projectName", label: "项目名称", width: 110 },
  { prop: "name", label: "接口名称", sort: true, width: 200 },
  { prop: "method", label: "请求方式" },
  { prop: "parameters", label: "入参", width: 260 },
  { prop: "result", label: "出参", width: 260 },
  { prop: "identificationName", label: "姓名|项目名称", sort: true },
  { prop: "serial", label: "操作人工号", sort: true },
  { prop: "phone", label: "操作人手机号", sort: true },
  { prop: "disposeTime", label: "用时/毫秒", sort: true },
  { prop: "callTime", label: "调用时间", sort: true, width: 160 },
  { prop: "clinetIp", label: "客户端IP", sort: true, width: 130 }
]

/**
 * 详情显示列
 */
let detailsColumn: DetailsColumn[] = [
  { prop: "projectName", label: "项目名称" },
  { prop: "method", label: "请求方式" },
  { prop: "name", label: "接口名称" },
  { prop: "url", label: "请求url", span: 2 },
  { prop: "uri", label: "请求uri" },
  { prop: "uuid", label: "主键", span: 2 },
  { prop: "platForm", label: "来源" },
  { prop: "identification", label: "操作人id|项目id" },
  { prop: "identificationName", label: "操作人姓名|项目名称" },
  { prop: "phone", label: "操作人手机号" },
  { prop: "serial", label: "操作人工号" },
  { prop: "message", label: "返回内容" },
  { prop: "status", label: "返回码" },
  { prop: "clinetIp", label: "客户端IP" },
  { prop: "callTime", label: "接口调用时间" },
  { prop: "disposeTime", label: "用时/毫秒" },
  { prop: "createDate", label: "创建时间" },
  { prop: "updateDate", label: "修改时间" },
  { prop: "createUserId", label: "创建用户编号" },
  { prop: "parameters", label: "入参", span: 3, ability: ["copy", "formatJson"] },
  { prop: "result", label: "出参", span: 3, ability: ["copy", "formatJson"] }
]

// 创建事件总线实例
const eventBus = mitt()
//详情模态框
const detailsDialogVisible = ref<boolean>(false)
//项目名称
const projectNameSelectValue = ref<Array<SelectColumn>>([])
//接口名称
const nameSelectValue = ref<Array<SelectColumn>>([])

onMounted(() => {
  querySelect()
})

const querySelect = async () => {
  const body = await postJson("/auth/interface/log/project", {})
  projectNameSelectValue.value = body.data
  try {
    queryParams.projectName = projectNameSelectValue.value[0].value
    projectNameSelectValue.value.forEach(item => {
      if (item.value === "鉴权项目") {
        queryParams.projectName = item.value
      }
    })
  } catch (ex) {}
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))

  const { data } = await postJson("/auth/interface/log/name", { projectName: queryParams.projectName })
  nameSelectValue.value = data
}

/**
 * 清空缓存
 */
const handleClearCache = async () => {
  const { success } = await postJson("/auth/interface/log/clear/cache", {})
  if (!success) return
  message("清空缓存成功", { type: "success" })
}
</script>

<style lang="scss" scoped></style>