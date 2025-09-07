<template>
  <el-col :span="span">
    <el-form-item :label="label" :style="{ width: width }" :prop="prop" :rules="rules" v-loading="userSelectLoading">
      <el-select v-model="localValue" :placeholder="'请选择' + label" :multiple="true" collapse-tags :max-collapse-tags="maxTags" :empty-values="[null, undefined]" :value-on-clear="null" filterable :disabled="disabled" @click="handleClick" @change="handleChange">
        <!--				<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"/>-->
        <!-- 动态生成选项：使用已选用户列表作为选项源 -->
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

              <el-table ref="table" v-loading="loadingLeft" :data="dataListLeft.list" header-cell-class-name="el-table-header-cell" highlight-current-row @selection-change="multiSelectLeft" fit allow-drag-last-column show-overflow-tooltip>
                <el-table-column type="selection" width="30" align="center" />
                <el-table-column type="index" width="70" label="头像" align="center">
                  <template #default="{ row }">
                    <KPAvatar size="default" :src="row.avatar ? row.avatar : Avatar" shape="circle" />
                  </template>
                </el-table-column>
                <el-table-column prop="userName" label="账号" align="center" />
                <el-table-column prop="jobNumber" label="工号" align="center" />
                <el-table-column prop="realName" label="姓名" align="center" />
                <el-table-column prop="nickName" label="昵称" align="center" />
                <el-table-column type="sex" label="性别" align="center">
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
          <!-- 向左箭头 -->
          <el-col :span="1" style="display: flex; align-items: center; justify-content: center">
            <el-button type="primary" icon="arrow-left" @click="handleLeftArrow" />
          </el-col>
          <!-- 向右箭头 -->
          <el-col :span="1" style="display: flex; align-items: center; justify-content: center">
            <el-button type="primary" icon="arrow-right" @click="handleRightArrow" />
          </el-col>
          <el-col :span="11">
            <el-card shadow="hover">
              <template #header>已选择用户列表</template>

              <el-table ref="table" :data="dataListRight" v-loading="loadingRight" header-cell-class-name="el-table-header-cell" highlight-current-row @selection-change="multiSelectRight" fit allow-drag-last-column show-overflow-tooltip>
                <el-table-column type="selection" width="30" align="center" />
                <el-table-column type="index" width="70" label="头像" align="center">
                  <template #default="{ row }">
                    <KPAvatar size="default" :src="row.avatar ? row.avatar : Avatar" shape="circle" />
                  </template>
                </el-table-column>
                <el-table-column prop="userName" label="账号" align="center" />
                <el-table-column prop="jobNumber" label="工号" align="center" />
                <el-table-column prop="realName" label="姓名" align="center" />
                <el-table-column prop="nickName" label="昵称" align="center" />
                <el-table-column type="sex" label="性别" align="center">
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

<script lang="ts" setup name="KPUserMultiple">
import { computed, onMounted, reactive, ref, watch } from "vue"
import KPDialog from "@/components/UI/Dialog/KPDialog.vue"
import { kpSelectChange } from "@/utils/list"
import { UserSexEnum } from "@/utils/data/serviceData"
import Avatar from "@/assets/user.png"
import KPTreeSelectApi from "@/components/UI/Input/KPTreeSelectApi.vue"
import KPAvatar from "@/components/UI/Input/KPAvatar.vue"
import { PageData } from "@/utils/data/systemData"
import mitt from "mitt"
import { ResultTable } from "@/config/requestType"
import { postJson } from "@/api/common"
import { removeEmptyAndNull } from "@/utils/json"
import { message } from "@/utils/message"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: string | Array<string> // 绑定的值
    label: string // 表单项的标签
    width?: string // 整个表单项的宽度，默认为 '17%'
    prop?: string // 表单验证的属性
    disabled?: boolean // 是否禁用
    span?: number // 宽度间隔 最大 24
    rules?: any // 表单验证规则
    maxTags?: number // 最多显示的标签数量
  }>(),
  {
    width: "100%",
    disabled: false,
    span: 24,
    maxTags: 1
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
// 新增：存储已选用户的完整信息（用于生成选项标签）
const options = ref<Array<{ value: string; label: string }>>([])
//分页每页显示条数集合
const pageSizes = ref([])
//左侧table内容
const dataListLeft = ref<ResultTable["data"]>({ list: [], total: 0, size: 100 })
//左侧多选选择值
const multiSelectLeftValue = ref<Array<any>>([])
//左侧等待框
const loadingLeft = ref<boolean>(false)
//右侧等待框
const loadingRight = ref<boolean>(false)
//右侧table内容
const dataListRight = ref<Array<any>>([])
//右侧多选选择值
const multiSelectRightValue = ref<Array<any>>([])
//是否显示角色下用户的模态框
const dialogVisible = ref<boolean>(false)
//用户选择框初始化等待框
const userSelectLoading = ref<boolean>(false)
//首次初始化定时器 防止重复请求
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
 * 左侧表格多选
 */
const multiSelectLeft = val => {
  multiSelectLeftValue.value = val
}

/**
 * 右侧表格多选
 */
const multiSelectRight = val => {
  multiSelectRightValue.value = val
}

/**
 * 移动右边到左边
 */
const handleLeftArrow = async () => {
  if (multiSelectRightValue.value.length == 0) {
    message("请先勾选要删除的人员", { type: "warning" })
    return
  }

  // 筛选出需要移动到左侧的项（排除已存在于左侧的，避免重复）
  const toMoveItems = multiSelectRightValue.value.filter(rightItem => !dataListLeft.value?.list.some(leftItem => leftItem.userId === rightItem.userId))

  // 添加到左侧列表
  if (dataListLeft.value?.list) {
    dataListLeft.value.list = [...dataListLeft.value.list, ...toMoveItems]
    // 更新左侧列表总数
    dataListLeft.value.total = dataListLeft.value.list.length
  }

  // 从右侧列表中删除已移动的项
  dataListRight.value = dataListRight.value.filter(rightItem => !toMoveItems.some(movedItem => movedItem.userId === rightItem.userId))

  // 清空右侧选中状态
  multiSelectRightValue.value = []
}

/**
 * 移动左边到右边
 */
const handleRightArrow = async () => {
  if (multiSelectLeftValue.value.length == 0) {
    message("请先勾选要添加的人员", { type: "warning" })
    return
  }

  //左侧移动到右侧
  const toAddItems = multiSelectLeftValue.value.filter(leftItem => !dataListRight.value.some(rightItem => rightItem.userId === leftItem.userId))
  dataListRight.value = [...dataListRight.value, ...toAddItems]

  // 从左侧数据中删除已移动的项
  if (dataListLeft.value?.list) {
    // 过滤掉左侧列表中已移动到右侧的项
    dataListLeft.value.list = dataListLeft.value.list.filter(leftItem => !toAddItems.some(movedItem => movedItem.userId === leftItem.userId))
    // 更新左侧列表的总条数（保持与实际数据一致）
    dataListLeft.value.total = dataListLeft.value.list.length
  }

  // 清空左侧选中状态
  multiSelectLeftValue.value = []
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
const handleClick = async (value: string | number) => {
  if (props.disabled) return
  dialogVisible.value = true

  // 如果外层选择的 和里面右边选择的不一致 进行校对
  if (props.modelValue.length != dataListRight.value.length) {
    loadingRight.value = true
    loadingLeft.value = true
    const body = await postJson("/api/user/page/list", {
      pageNum: 1,
      pageSize: 100,
      eqUserIds: props.modelValue as Array<string>
    })
    dataListRight.value = body.data.list ?? dataListRight.value

    loadingRight.value = false

    await queryList()
  } else {
    //如果一致 判断左边如果没有初始化数据就进行初始化 clearTimeout 放在和监听器重复执行  减少调用接口次数
    if (dataListLeft.value.list.length == 0) {
      clearTimeout(timer)
      await queryList()
    }
  }
}

const headerDialogSave = async (title, resolve) => {
  if (dataListRight.value.length === 0) {
    message("请至少选择一个用户", { type: "warning" })
    resolve()
    return
  }

  options.value = dataListRight.value.map(item => ({
    value: item.userId, // 确保value为string类型
    label: item.realName // 姓名作为显示标签
  }))
  const selectValues = options.value.map(opt => opt.value)

  // 更新选择器值并触发事件
  emit("update:modelValue", selectValues)
  emit("change", selectValues)

  // 关闭弹窗
  dialogVisible.value = false
  resolve()
}

/**
 * 初始化表格数据和选中数据
 * @param value
 */
const initTableData = async () => {
  userSelectLoading.value = true
  const body = await postJson("/api/user/page/list", {
    pageNum: 1,
    pageSize: 100,
    eqUserIds: props.modelValue as Array<string>
  })
  dataListRight.value = body.data.list ?? dataListRight.value

  options.value = dataListRight.value.map(item => ({
    value: item.userId, // 确保value为string类型
    label: item.realName // 姓名作为显示标签
  }))
  userSelectLoading.value = false

  //查询左边的
  queryParams.neUserIds = props.modelValue as Array<string>
  const { data } = await postJson("/api/user/page/list", removeEmptyAndNull(queryParams))
  dataListLeft.value = data ?? dataListLeft.value
}

eventBus.on("queryList", () => {
  queryList()
})

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: string | Array<string>): void
  (e: "change", value: string | Array<string>): void
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue // 直接返回string或string数组
  },
  set(value: string | Array<string>) {
    emit("update:modelValue", value)
  }
})

// 处理 change 事件
const handleChange = async (value: string | Array<string>) => {
  await initTableData()
  emit("change", value)
}

/**
 * 监听modelValue变化，处理回显
 */
watch(
  () => props.modelValue,
  async newValue => {
    if (newValue.length == 0) {
      timer = setTimeout(async () => {
        // 10秒后要执行的操作
        await queryList()
      }, 10000)
    } else {
      if (dataListRight.value.length != 0) return
      //查询右边的
      clearTimeout(timer)
      if (props.modelValue.length == 0) return
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
