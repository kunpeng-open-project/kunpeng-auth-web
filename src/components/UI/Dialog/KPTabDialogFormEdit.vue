<template>
  <el-dialog v-model="dialogVisible" class="kp-dialog-form-edit" :title="dialogTitle" :modal="true" center draggable :width="width" :destroy-on-close="true" :close-on-press-escape="false" :show-close="false" :close-on-click-modal="false" :fullscreen="dialogFulls" :top="top">
    <template #header>
      <div class="dialog-header">
        <div class="header-buttons">
          <el-button size="large" :title="dialogFulls ? '最小化' : '最大化'" text @click="dialogFulls = !dialogFulls">
            <IconifyIconOnline :icon="dialogFulls ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'" />
          </el-button>
          <el-button icon="Close" size="large" title="关闭" text @click="dialogVisible = false" />
        </div>
        <el-tabs v-model="activeTab" type="border-card" class="tabs" :before-leave="formVerify" @tab-click="handleTabClick">
          <el-tab-pane v-for="(tab, index) in tabs" :key="index" :label="tab.label" :name="tab.name" :disabled="tab.disabled" />
        </el-tabs>
        <!--        <div class="header-title">
          {{ dialogTitle }}
        </div>-->
      </div>
    </template>
    <el-scrollbar :max-height="dialogFulls ? 'calc(100vh - 130px)' : '70vh'">
      <div v-loading="dialogLoading" style="margin-top: 12px">
        <el-card v-if="isBorder" shadow="hover" class="custom-card">
          <el-form ref="editRefs" :model="editParams" :rules="getTabRules(activeTab)" :inline="true" class="demo-form-inline" :label-width="labelWidth">
            <el-row :gutter="30">
              <slot :name="activeTab" :tab="props.tabs.find(tab => tab.name === activeTab)" :activeTab="activeTab" />
            </el-row>
          </el-form>
        </el-card>

        <el-form v-else ref="editRefs" :model="editParams" :rules="getTabRules(activeTab)" :inline="true" class="demo-form-inline" :label-width="labelWidth">
          <el-row :gutter="30">
            <slot :name="activeTab" :tab="props.tabs.find(tab => tab.name === activeTab)" :activeTab="activeTab" />
          </el-row>
        </el-form>
      </div>
    </el-scrollbar>

    <template #footer>
      <div :class="dialogFulls ? 'dialog-footer-full' : 'dialog-footer'">
        <el-button v-if="activeTabIndex > 0" type="success" :disabled="activeTabIndex === 0" @click="goToTab(-1)">上一步</el-button>
        <!-- 保存按钮：根据showSaveBtn控制显示 -->
        <el-button v-if="showSaveBtn && (useType === OperateEnum.add || useType === OperateEnum.update || useType === OperateEnum.updateRow)" type="primary" :loading="dialogLoading" @click="handleSave(null)">保 存</el-button>
        <!-- 同意按钮：根据showSaveBtn控制显示 -->
        <el-button v-if="showSaveBtn && useType === OperateEnum.review" type="success" :loading="dialogLoading" @click="handleSave(1)">同 意</el-button>
        <!-- 拒绝按钮：根据showSaveBtn控制显示 -->
        <el-button v-if="showSaveBtn && useType === OperateEnum.review" type="warning" :loading="dialogLoading" @click="handleSave(0)">拒 绝</el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
        <el-button v-if="activeTabIndex < tabs.length - 1" :loading="dialogLoading" type="success" @click="goToTab(1)">下一步</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="KPDialogFormEdit">
import { computed, ref, watch } from "vue"
import { toReactive } from "@vueuse/core"
import { addTableData, queryTableDetails, reviewTableData, updateTableData } from "@/api/table"
import { message, numberMessageBox } from "@/utils/message"
import { Emitter } from "mitt"
import { removeEmptyAndNull } from "@/utils/kp/tool/json"
import { OperateEnum } from "@/utils/kp/data/systemData"
import { serverPath } from "@/utils/serverPath"
import { ElForm } from "element-plus" // 新增：导入表单类型

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    eventBus: Emitter<any> // 事件总线实例
    modelValue: boolean // 通过 v-model 传递的值
    title: string // 对话框标题
    editParams: any //表单对象
    tableKey?: string //tableList  主键的key
    saveApi?: string //保存接口地址
    updateApi?: string //修改接口地址
    detailsApi?: string //详情接口地址
    reviewApi?: string //审批接口地址
    width?: string // 对话框宽度
    labelWidth?: string //文本框说明文字宽度
    isBorder?: boolean //是否加边框
    dateStructure: any //数据结构
    rules?: any // 表单验证规则
    queryParams?: any // 查询参数  如果有其他查询条件 就传入这个
    afterSaveOpenEditDialog?: (editParams: any) => any | Promise<any> // 打开模态框修改功能后修改editParams默认值
    apiPath?: string // 请求的api地址
    tabs: Array<{
      // 新增：Tabs配置
      name: string //与选项卡绑定值 value 对应的标识符，表示选项卡别名。默认值是tab面板的序列号，如第一个 tab 是 0
      label: string // 选项卡标题
      disabled?: boolean // 是否禁用
      rules?: any // 每个Tab独立的验证规则
    }>
    saveBtnPosition?: "all" | "last" // 按钮位置  all 每tab页都有 last 最后一页有
    top?: string // top 对话框距离顶部的距离
  }>(),
  {
    width: "55%",
    isBorder: false,
    queryParams: () => ({ pageNum: 1, pageSize: 10 }),
    labelWidth: "100px",
    afterSaveOpenEditDialog: editParams => editParams, // 默认不做修改
    apiPath: serverPath.authentication,
    tabs: () => [],
    saveBtnPosition: "last",
    top: "15vh"
  }
)

// 接收父组件的值 变成普通数据
let { eventBus, saveApi, updateApi, detailsApi, reviewApi, tableKey } = props
// 接收父组件的值 变成 reactive 对象
const { editParams } = toReactive(props)
//接收父组件的值 变成 ref数据
const dialogTitle = ref<string>(props.title)
// 定义 emits
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()
//模态框是否全屏
const dialogFulls = ref<boolean>(false)
//模态框等待框
const dialogLoading = ref<boolean>(false)
//操作类型
const useType = ref<string>()
//table 选中的值
let multiSelectValue = []
//主键的值
let ketValue: string = ""
// 多表单验证ref（用于Tabs）
const editRefs = ref<InstanceType<typeof ElForm> | null>(null)
//tabs相关状态
const activeTab = ref("")
//当前的tab 下标
const activeTabIndex = ref(0)
// 标记：是否通过上一步 下一步 跳转
const skipVerify = ref(false)

/**
 * 打开模态框
 * @param edit  操作类型
 * @param row 行内数据
 */
const openEditDialog = async (event: { edit: string; row: any }) => {
  const { edit, row } = event
  Object.keys(editParams).map(key => delete editParams[key])
  Object.assign(editParams, new props.dateStructure())

  initTabs()

  switch (edit) {
    case OperateEnum.add:
      dialogTitle.value = "新增" + props.title
      useType.value = OperateEnum.add

      props.afterSaveOpenEditDialog(editParams)
      // const modifiedParams = props.afterSaveOpenEditDialog(editParams);
      // alert(modifiedParams)
      // if (modifiedParams !== editParams) {
      // 	// 如果返回了新对象，替换原对象
      // 	Object.assign(editParams, modifiedParams);
      // }

      break
    case OperateEnum.update:
      dialogTitle.value = "修改" + props.title
      if (numberMessageBox(multiSelectValue.length, 1)) return
      ketValue = multiSelectValue[0][tableKey]
      useType.value = OperateEnum.update
      break
    case OperateEnum.updateRow:
      dialogTitle.value = "修改" + props.title
      ketValue = row[tableKey]
      useType.value = OperateEnum.update
      break
    case OperateEnum.reviewRow:
      dialogTitle.value = "审批" + props.title
      ketValue = row[tableKey]
      useType.value = OperateEnum.review
      break
    case OperateEnum.review:
      dialogTitle.value = "审批" + props.title
      if (numberMessageBox(multiSelectValue.length, 1)) return
      ketValue = multiSelectValue[0][tableKey]
      useType.value = OperateEnum.review
      break
  }
  dialogVisible.value = true
}

/**
 * 保存数据
 */
const handleSave = async (status: number) => {
  // // 如果要验证所有tab，需要收集所有tab的验证结果
  // let allValid = true
  //
  // // 遍历所有tab进行验证
  // for (const tab of props.tabs) {
  //   // 这里需要为每个tab创建独立的ref，比如 editRefs.value[tab.name]
  //   const formRef = editRefs.value[tab.name]
  //   if (formRef) {
  //     const isValid = await new Promise(resolve => {
  //       formRef.validate((valid, fields) => {
  //         resolve(valid)
  //       })
  //     })
  //
  //     if (!isValid) {
  //       allValid = false
  //       // 可以在这里切换到有错误的tab
  //       activeTab.value = tab.name
  //       break
  //     }
  //   }
  // }
  //
  // if (!allValid) {
  //   message("请检查表单填写是否正确", { type: "error" })
  //   return
  // }

  const isValid = await new Promise(resolve => {
    editRefs.value.validate((valid, fields) => {
      resolve(valid)
    })
  })

  if (!isValid) return

  dialogLoading.value = true
  switch (useType.value) {
    case OperateEnum.add:
      if (!saveApi) {
        message("请在 KPDialogFormEdit 标签中配置saveApi或save-api属性", { type: "error" })
        dialogLoading.value = false
        return
      }

      const addBody = await addTableData(props.apiPath, saveApi, removeEmptyAndNull(editParams))
      if (addBody.success) {
        dialogVisible.value = false
        eventBus.emit("queryList", removeEmptyAndNull(props.queryParams))
        message("操作成功", { type: "success" })
      }
      break
    case OperateEnum.update:
      if (!updateApi) {
        message("请在 KPDialogFormEdit 标签中配置updateApi或update-api属性", { type: "error" })
        dialogLoading.value = false
        return
      }
      const updateBody = await updateTableData(props.apiPath, updateApi, removeEmptyAndNull(editParams))
      if (updateBody.success) {
        dialogVisible.value = false
        eventBus.emit("queryList", removeEmptyAndNull(props.queryParams))
        message("操作成功", { type: "success" })
      }
      break
    case OperateEnum.review:
      if (!reviewApi) {
        message("请在 KPDialogFormEdit 标签中配置reviewApi或review-api属性", { type: "error" })
        dialogLoading.value = false
        return
      }
      // let id = editParams[tableKey]
      // delete editParams[tableKey]
      editParams.ids = [editParams[tableKey]]
      editParams.status = status

      const reviewBody = await reviewTableData(props.apiPath, reviewApi, removeEmptyAndNull(editParams))
      if (reviewBody.success) {
        dialogVisible.value = false
        eventBus.emit("queryList", removeEmptyAndNull(props.queryParams))
        message("操作成功", { type: "success" })
      }
      break
  }
  dialogLoading.value = false
}

/**
 * 初始化Tabs 默认打开第一个选项卡
 */
const initTabs = () => {
  if (props.tabs && props.tabs.length > 0) {
    activeTab.value = props.tabs[0].name
    activeTabIndex.value = 0
  }
}

/**
 * 获取当前Tab的验证规则
 * @param tabName
 */
const getTabRules = (tabName: string) => {
  if (!props.tabs || props.tabs.length === 0) return props.rules

  const tab = props.tabs.find(t => t.name === tabName)
  return tab && tab.rules ? tab.rules : {}
}

/**
 * 切换 Tab
 * @param status
 */
const goToTab = async (status: number) => {
  if (!props.tabs) return
  const isVerified = await formVerify()
  if (!isVerified) return
  skipVerify.value = true

  switch (status) {
    case 1: //下一步
      activeTab.value = props.tabs[activeTabIndex.value + 1].name
      activeTabIndex.value += 1
      break
    case -1: //上一步
      activeTab.value = props.tabs[activeTabIndex.value - 1].name
      activeTabIndex.value -= 1
      break
  }
}

/**
 * 收到点击tabs 进行选项卡切换
 * @param tab
 */
const handleTabClick = async tab => {
  const isVerified = await formVerify()
  if (!isVerified) return
  activeTabIndex.value = props.tabs.findIndex(item => item.name === tab.props.name)
}

/**
 * 校验是否验真通过 true 表示通过
 */
const formVerify = async () => {
  if (skipVerify.value) {
    skipVerify.value = false
    return true
  }
  const isValid = await new Promise(resolve => {
    editRefs.value.validate((valid, fields) => {
      resolve(valid)
    })
  })
  if (!isValid) return false
  return true
}

// 使用计算属性实现双向绑定
const dialogVisible = computed({
  get() {
    if (props.modelValue) dialogFulls.value = false
    return props.modelValue
  },
  set(newValue: boolean) {
    emit("update:modelValue", newValue)
  }
})

// 判断当前页是否显示保存按钮
const showSaveBtn = computed(() => {
  if (![OperateEnum.add, OperateEnum.update, OperateEnum.updateRow, OperateEnum.review].includes(useType.value)) {
    return false
  }
  // 每页都显示
  if (props.saveBtnPosition === "all") return true
  // 仅最后一页显示：当前索引等于tabs最后一项索引
  if (props.saveBtnPosition === "last") {
    return activeTabIndex.value === props.tabs.length - 1
  }
  return true
})

/**
 * 修改数据时  先查询最新数据进行回显
 */
watch(
  () => props.modelValue,
  async newValue => {
    if (!newValue) return

    if (useType.value === OperateEnum.update || useType.value === OperateEnum.review) {
      if (!detailsApi) {
        message("请在 KPDialogFormEdit 标签中配置detailsApi或details-api属性", { type: "error" })
        dialogLoading.value = false
        return
      }

      if (!tableKey) {
        message("请在 KPDialogFormEdit 标签中配置tableKey或table-key属性", { type: "error" })
        dialogLoading.value = false
        return
      }

      dialogLoading.value = true

      const body = await queryTableDetails(props.apiPath, detailsApi, { [tableKey]: ketValue })
      // if (body.success) Object.assign(editParams, body.data);
      if (body.success) for (let key in editParams) editParams[key] = body.data[key]
      dialogLoading.value = false
    }
  }
)

/**
 * 生产者 对外授权
 */

eventBus.on("openEditDialog", openEditDialog)

/**
 * 接收表格选择内容
 */
eventBus.on("receiveMultiSelectValue", (value: any) => {
  multiSelectValue = value
})
</script>

<style lang="scss" scoped>
.dialog-footer-full {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 10px;
}

:deep(.is-horizontal) {
  display: none !important;
}

.dialog-header {
  position: relative;
  padding: 0;
  margin: 0;
}

.header-buttons {
  position: absolute;
  top: 3px;
  right: -8px;
  z-index: 1000;

  :deep(.el-button) {
    transition: all 0.3s ease;
    margin-left: 4px;

    &:hover {
      background-color: #f5f7fa !important;
      color: #204f7f !important;
      transform: scale(1.1);
    }

    &:active {
      background-color: #e0e0e0 !important;
      transform: scale(0.95);
    }

    &:focus {
      outline: none;
    }
  }

  :deep(.el-button--large) {
    width: 10px;
    height: 32px;
    font-size: 16px;
    margin-right: -5px;
  }

  :deep(.el-button--text) {
    border: none;
  }
}

.header-title {
  text-align: left;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: bold;
  padding-left: 4px;
  color: #303133;
}

.tabs {
  margin: -16px -16px 0 -16px !important;
  border-radius: 0 !important;
  width: calc(100% + 32px) !important;

  :deep(.el-tabs__header) {
    margin: 0 !important;
    border-bottom: 1px solid #e4e7ed !important;
  }

  :deep(.el-tabs__nav) {
    border: none !important;
  }

  :deep(.el-tabs__item) {
    border: none !important;
    border-bottom: 3px solid transparent !important;
    transition: all 0.3s ease;

    &:hover {
      color: #409eff;
    }

    &.is-active {
      color: #409eff;
      background-color: white !important;
      border-bottom: 3px solid #409eff !important;
    }
  }

  :deep(.el-tabs__content) {
    display: none !important;
  }
  :deep(.el-tabs__content) {
    padding: 16px;
  }
}
</style>
