<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" :modal="true" center draggable :width="width" :destroy-on-close="true" close-on-press-escape="false" :show-close="false" :close-on-click-modal="false" :fullscreen="dialogFulls">
    <template #header>
      <el-row :gutter="20">
        <el-col :span="12" style="text-align: left">
          {{ dialogTitle }}
        </el-col>
        <el-col :span="12" style="text-align: right; margin-top: -10px">
          <el-button size="large" :title="dialogFulls ? '最小化' : '最大化'" text circle @click="dialogFulls = !dialogFulls">
            <IconifyIconOnline :icon="dialogFulls ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'" />
          </el-button>
          <el-button icon="Close" size="large" title="关闭" text circle style="margin-left: -8px" @click="dialogVisible = false" />
        </el-col>
      </el-row>
    </template>

    <!--		<el-scrollbar :max-height="dialogFulls?'calc(100vh - 130px)':'70vh'">-->
    <div style="margin-top: 12px" v-loading="dialogLoading">
      <el-card shadow="hover" class="custom-card" v-if="isBorder">
        <el-form :model="editParams" :rules="rules" :inline="true" class="demo-form-inline" :label-width="labelWidth">
          <el-row :gutter="30">
            <slot />
          </el-row>
        </el-form>
      </el-card>

      <el-form :model="editParams" ref="editRef" :rules="rules" :inline="true" class="demo-form-inline" :label-width="labelWidth" v-else>
        <el-row :gutter="30">
          <slot />
        </el-row>
      </el-form>
    </div>
    <!--		</el-scrollbar>-->

    <template #footer>
      <div :class="dialogFulls ? 'dialog-footer-full' : 'dialog-footer'">
        <el-button v-if="useType === OperateEnum.add || useType === OperateEnum.update || useType === OperateEnum.updateRow" type="primary" :loading="dialogLoading" @click="handleSave(editRef, null)">保 存</el-button>
        <el-button v-if="useType === OperateEnum.review" type="success" :loading="dialogLoading" @click="handleSave(editRef, 1)">同 意</el-button>
        <el-button v-if="useType === OperateEnum.review" type="warning" :loading="dialogLoading" @click="handleSave(editRef, 0)">拒 绝</el-button>
        <el-button @click="dialogVisible = false">关 闭</el-button>
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
import { removeEmptyAndNull } from "@/utils/json"
import { OperateEnum } from "@/utils/data/systemData"
import { serverPath } from "@/utils/serverPath"

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
  }>(),
  {
    width: "50%",
    isBorder: false,
    queryParams: () => ({ pageNum: 1, pageSize: 10 }),
    labelWidth: "100px",
    afterSaveOpenEditDialog: editParams => editParams, // 默认不做修改
    apiPath: serverPath.authentication
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
// 表单验证ref
const editRef = ref(null)

/**
 * 打开模态框
 * @param edit  操作类型
 * @param row 行内数据
 */
const openEditDialog = async (event: { edit: string; row: any }) => {
  const { edit, row } = event
  Object.keys(editParams).map(key => delete editParams[key])
  Object.assign(editParams, new props.dateStructure())
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
const handleSave = async (editRef, status: number) => {
  const isValid = await new Promise(resolve => {
    editRef.validate((valid, fields) => {
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
  /*border-top: 1px solid #e4e7ed;*/
  /*text-align: right;*/
}

:deep(.is-horizontal) {
  display: none !important;
}
</style>
