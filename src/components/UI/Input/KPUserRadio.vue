<template>
  <el-col :span="span">
    <el-form-item v-loading="userSelectLoading" :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
      <template v-if="tipBody" v-slot:label>
        <span>{{ label }}</span>
        <el-tooltip class="box-item" effect="dark" :content="tipBody" :placement="tipPlacement">
          <IconifyIconOnline icon="ep:question-filled" />
        </el-tooltip>
      </template>

      <el-select v-model="localValue" :placeholder="'请选择' + label" :multiple="false" :empty-values="[null, undefined]" :value-on-clear="null" filterable :disabled="disabled" @click="handleClick" @change="handleChange" @visible-change="handleClick">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
  </el-col>

  <KPDialog v-model="dialogVisible" title="选择用户" width="90%" top="5vh" @dialogSave="headerDialogSave">
    <el-row :gutter="10">
      <el-col :span="24">
        <KPTableQuery :event-bus="eventBus" :query-params="queryParams">
          <KPTreeSelectApi v-model="queryParams.deptId" label="部门" api="/dept/select" :api-params="{ isTree: 1 }" :span="5" @change="kpSelectChange(eventBus, queryParams)" />
          <KPInputText v-model="queryParams.name" label="姓名或昵称" :span="5" />
          <KPInputText v-model="queryParams.phoneNumber" label="手机号" :span="5" />
          <KPInputText v-model="queryParams.jobNumber" label="工号" :span="5" />
          <KPSelect v-model="queryParams.sex" label="性别" :span="4" :options="UserSexEnum" @change="kpSelectChange(eventBus, queryParams)" />
        </KPTableQuery>
        <el-row :gutter="10">
          <el-col :span="11">
            <el-card shadow="hover">
              <template #header>待选择用户列表</template>

              <el-table ref="table" v-loading="loadingLeft" :data="dataListLeft.list" header-cell-class-name="el-table-header-cell" highlight-current-row fit allow-drag-last-column show-overflow-tooltip @current-change="singleSelectLeft">
                <el-table-column type="index" width="70" label="头像" align="center">
                  <template #default="{ row }">
                    <KPAvatar size="default" :src="row.avatar ? row.avatar : Avatar" shape="circle" />
                  </template>
                </el-table-column>
                <el-table-column prop="userName" label="账号" align="center" />
                <el-table-column prop="jobNumber" label="工号" align="center" />
                <el-table-column prop="realName" label="姓名" align="center" />
                <el-table-column prop="nickName" label="昵称" align="center" />
                <el-table-column label="性别" align="center">
                  <template #default="{ row }">
                    {{ row.sex === 1 ? "男" : row.sex === 0 ? "女" : "未知" }}
                  </template>
                </el-table-column>
                <el-table-column prop="deptNames" label="部门" align="center" />
                <el-table-column prop="postNames" label="岗位" align="center" />
              </el-table>
              <template #footer>
                <el-pagination class="pagination" :current-page="queryParams.pageNum" :page-size="queryParams.pageSize" size="small" layout="total, sizes, prev, pager, next, jumper" :total="dataListLeft.total" :page-sizes="pageSizes" @current-change="handlePaginationChange" @size-change="handlePaginationSize" />
              </template>
            </el-card>
          </el-col>
          <!-- 向右箭头 -->
          <el-col :span="1" style="display: flex; align-items: center; justify-content: center">
            <el-button type="primary" icon="arrow-right" @click="handleRightArrow" />
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>已选择用户</template>

              <el-table ref="table" :data="dataListRight" v-loading="loadingRight" header-cell-class-name="el-table-header-cell" highlight-current-row @current-change="singleSelectRight" fit allow-drag-last-column show-overflow-tooltip>
                <el-table-column type="index" width="70" label="头像" align="center">
                  <template #default="{ row }">
                    <KPAvatar size="default" :src="row.avatar ? row.avatar : Avatar" shape="circle" />
                  </template>
                </el-table-column>
                <el-table-column prop="userName" label="账号" align="center" />
                <el-table-column prop="jobNumber" label="工号" align="center" />
                <el-table-column prop="realName" label="姓名" align="center" />
                <el-table-column prop="nickName" label="昵称" align="center" />
                <el-table-column label="性别" align="center">
                  <template #default="{ row }">
                    {{ row.sex === 1 ? "男" : row.sex === 0 ? "女" : "未知" }}
                  </template>
                </el-table-column>
                <el-table-column prop="deptNames" label="部门" align="center" />
                <el-table-column prop="postNames" label="岗位" align="center" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </KPDialog>
</template>

<script lang="ts" setup name="KPUserRadio">
import { computed, onMounted, reactive, ref, watch } from "vue"
import KPDialog from "@/components/UI/Dialog/KPDialog.vue"
import { kpSelectChange } from "@/utils/kp/tool/list"
import { UserSexEnum } from "@/utils/kp/data/serviceData"
import Avatar from "@/assets/user.png"
import KPTreeSelectApi from "@/components/UI/Input/KPTreeSelectApi.vue"
import KPAvatar from "@/components/UI/Input/KPAvatar.vue"
import { PageData } from "@/utils/kp/data/systemData"
import mitt from "mitt"
import { ResultTable } from "@/config/requestType"
import { postJson } from "@/api/common"
import { removeEmptyAndNull } from "@/utils/kp/tool/json"
import { message } from "@/utils/message"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: string | null // 绑定的值（单选，string类型）
    label: string // 表单项的标签
    width?: string // 整个表单项的宽度，默认为 '17%'
    prop?: string // 表单验证的属性
    disabled?: boolean // 是否禁用
    span?: number // 宽度间隔 最大 24
    rules?: any // 表单验证规则
    tipBody?: string // 新增：输入框的提示信息
    tipPlacement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end"
  }>(),
  {
    width: "100%",
    disabled: false,
    span: 24,
    tipPlacement: "right"
  }
)

/**
 * 搜索内容
 */
const queryParams = reactive({
  ...new PageData(),
  name: null as string | null,
  phoneNumber: null as string | null,
  jobNumber: null as string | null,
  deptId: null as string | null,
  sex: null as number | null,
  orderBy: "create_date desc",
  pageSize: 8,
  neUserIds: null as Array<string> | null
})

// 创建事件总线实例
const eventBus = mitt()
// 存储已选用户的完整信息（用于生成选项标签）
const options = ref<Array<{ value: string; label: string }>>([])
// 分页每页显示条数集合
const pageSizes = ref([])
// 左侧table内容
const dataListLeft = ref<ResultTable["data"]>({ list: [], total: 0, size: 100 })
// 左侧单选选择值
const singleSelectLeftValue = ref<any>(null)
// 左侧等待框
const loadingLeft = ref<boolean>(false)
// 右侧等待框
const loadingRight = ref<boolean>(false)
// 右侧table内容（单选，只能有一个用户）
const dataListRight = ref<Array<any>>([])
// 右侧单选选择值
const singleSelectRightValue = ref<any>(null)
// 是否显示角色下用户的模态框
const dialogVisible = ref<boolean>(false)
// 用户选择框初始化等待框
const userSelectLoading = ref<boolean>(false)
// 首次初始化定时器 防止重复请求
let timer

onMounted(() => {
  setPageSizes()
})

const queryList = async () => {
  loadingLeft.value = true
  queryParams.neUserIds = dataListRight.value.map(item => item.userId)
  const { data } = await postJson("/api/user/page/list", removeEmptyAndNull(queryParams))
  dataListLeft.value = data ?? dataListLeft.value
  loadingLeft.value = false
  eventBus.emit("queryListSuccess")
}

/**
 * 左侧表格单选
 */
const singleSelectLeft = val => {
  singleSelectLeftValue.value = val
}

/**
 * 右侧表格单选
 */
const singleSelectRight = val => {
  singleSelectRightValue.value = val
}

/**
 * 移动左边到右边（单选）
 */
const handleRightArrow = async () => {
  if (!singleSelectLeftValue.value) {
    message("请先选择一个人员", { type: "warning" })
    return
  }

  // 清空右侧列表，因为单选只能有一个
  dataListRight.value = [singleSelectLeftValue.value]

  // 从左侧数据中删除已移动的项
  if (dataListLeft.value?.list) {
    await queryList()
  }

  // 清空左侧选中状态
  singleSelectLeftValue.value = null
}

/**
 * 动态设置PageSizes
 */
const setPageSizes = () => {
  // 定义默认页面大小选项
  const defaultSizes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  // 获取当前页大小（确保有默认值）
  const currentPageSize = queryParams.pageSize

  // 过滤掉小于等于currentPageSize的值
  const filteredSizes = defaultSizes.filter(size => size > currentPageSize)

  // 组合新的page-sizes：首项为currentPageSize，后续为过滤后的值
  pageSizes.value = [currentPageSize, ...filteredSizes]
}

/**
 * 页码跳转
 * @param currentPage
 */
const handlePaginationChange = async (currentPage: number) => {
  queryParams.pageNum = currentPage
  await queryList()
}

/**
 * 设置每页显示多少条数据
 * @param pageSize
 */
const handlePaginationSize = async (pageSize: number) => {
  queryParams.pageSize = pageSize
  await queryList()
}

/**
 * 点击选择用户
 */
const handleClick = async () => {
  if (props.disabled) return
  dialogVisible.value = true

  // 如果外层选择的 和里面右边选择的不一致 进行校对
  if (props.modelValue && dataListRight.value.length === 0) {
    loadingRight.value = true
    loadingLeft.value = true
    const body = await postJson("/api/user/page/list", {
      pageNum: 1,
      pageSize: 100,
      eqUserIds: [props.modelValue] // 改为数组格式
    })
    dataListRight.value = body.data.list ?? dataListRight.value

    loadingRight.value = false

    await queryList()
  } else {
    // 如果一致 判断左边如果没有初始化数据就进行初始化
    if (dataListLeft.value.list.length == 0) {
      clearTimeout(timer)
      await queryList()
    }
  }
}

const headerDialogSave = async (title, resolve) => {
  if (dataListRight.value.length === 0) {
    message("请选择一个用户", { type: "warning" })
    resolve()
    return
  }

  const selectedUser = dataListRight.value[0]
  options.value = [
    {
      value: selectedUser.userId,
      label: selectedUser.realName
    }
  ]

  // 更新选择器值并触发事件（单选，直接传string）
  emit("update:modelValue", selectedUser.userId)
  emit("change", selectedUser.userId)

  // 关闭弹窗
  dialogVisible.value = false
  resolve()
}

/**
 * 初始化表格数据和选中数据
 */
const initTableData = async () => {
  if (!props.modelValue) return

  userSelectLoading.value = true
  const body = await postJson("/api/user/page/list", {
    pageNum: 1,
    pageSize: 100,
    eqUserIds: [props.modelValue] // 改为数组格式
  })
  dataListRight.value = body.data.list ?? dataListRight.value

  if (dataListRight.value.length > 0) {
    const selectedUser = dataListRight.value[0]
    options.value = [
      {
        value: selectedUser.userId,
        label: selectedUser.realName
      }
    ]
  }

  userSelectLoading.value = false

  // 查询左边的
  queryParams.neUserIds = props.modelValue ? [props.modelValue] : []
  const { data } = await postJson("/api/user/page/list", removeEmptyAndNull(queryParams))
  dataListLeft.value = data ?? dataListLeft.value
}

eventBus.on("queryList", () => {
  queryList()
})

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void
  (e: "change", value: string | null): void
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue // 直接返回string
  },
  set(value: string | null) {
    emit("update:modelValue", value)
  }
})

// 处理 change 事件
const handleChange = async (value: string) => {
  await initTableData()
  emit("change", value)
}

/**
 * 监听modelValue变化，处理回显
 */
watch(
  () => props.modelValue,
  async newValue => {
    if (!newValue) {
      timer = setTimeout(async () => {
        await queryList()
      }, 10000)
    } else {
      if (dataListRight.value.length != 0) return
      // 查询右边的
      clearTimeout(timer)
      if (!props.modelValue) return
      await initTableData()
    }
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.operate_button {
  width: 28px;
  height: 28px;
}

.pagination {
  float: right;
  padding-bottom: 22px;
}

.el-table {
  --el-table-border-color: #ffffff;
  --el-table-border: 1px solid #ebeef5;
}
</style>
