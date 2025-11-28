<template>
  <el-col :span="span">
    <el-form-item v-loading="loading" :label="label" :style="{ width: width }" :prop="prop" :rules="rules">
      <template v-if="tipBody" v-slot:label>
        <span>{{ label }}</span>
        <el-tooltip class="box-item" effect="dark" :content="tipBody" :placement="tipPlacement">
          <IconifyIconOnline icon="ep:question-filled" />
        </el-tooltip>
      </template>

      <el-select v-model="localValue" :placeholder="'请选择' + label" clearable :multiple="multiple" :disabled="disabled" :empty-values="[null, undefined]" :value-on-clear="null" filterable @change="handleChange">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
  </el-col>
</template>

<script lang="ts" setup name="KPSelectApi">
import { computed, onMounted, ref } from "vue"
import { postJson } from "@/api/common"
import { serverPath } from "@/utils/serverPath"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue: string | number | Array<string> | null // 绑定的值
    label: string // 表单项的标签
    width?: string // 整个表单项的宽度，默认为 '17%'
    prop?: string // 表单验证的属性
    multiple?: boolean // 是否多选
    disabled?: boolean // 是否禁用
    span?: number // 宽度间隔 最大 24
    rules?: any // 表单验证规则
    api: string // 查询下拉框值的api请求地址
    apiParams?: any
    defaultValue?: string | number // 设置默认值
    defaultLabel?: string | number // 设置默认值lable
    defaultNumber?: number //设置地几个为默认值 从 1 开始
    apiPath?: string // 请求的api地址
    tipBody?: string // 新增：输入框的提示信息
    tipPlacement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end"
  }>(),
  {
    width: "100%",
    disabled: false,
    span: 24,
    apiParams: () => ({}),
    apiPath: serverPath.authentication,
    tipPlacement: "right"
  }
)

//下拉选项
const options = ref<{ value: string | number; label: string }[]>([])
//等待框
const loading = ref(false)

onMounted(() => {
  loading.value = true
  postJson(props.api, props.apiParams, props.apiPath)
    .then(body => {
      options.value = body.data
      loading.value = false

      if (props.defaultNumber) {
        firstDefaultChange(options.value[props.defaultNumber - 1].value) // 触发方法
        emit("update:modelValue", options.value[props.defaultNumber - 1].value)
      }
      if (props.defaultValue) {
        options.value.forEach(item => {
          if (item.value == props.defaultValue) {
            firstDefaultChange(item.value) // 触发方法
            emit("update:modelValue", item.value)
          }
        })
      }
      if (props.defaultLabel) {
        options.value.forEach(item => {
          if (item.label == props.defaultLabel) {
            firstDefaultChange(item.value) // 触发方法
            emit("update:modelValue", item.value)
          }
        })
      }
    })
    .catch(error => {
      loading.value = false
    })
})

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | Array<string> | null): void
  (e: "change", value: string | number | Array<string> | null): void
  (e: "firstDefaultChange", value: string | number | Array<string> | null): void // 新增：默认值设置事件
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string | number | Array<string> | null) {
    emit("update:modelValue", value)
  }
})

// 处理 change 事件
const handleChange = (value: string | number | Array<string> | null) => {
  emit("change", value)
}

// 处理 触发默认值设置事件的方法
const firstDefaultChange = (value: string | number | Array<string> | null) => {
  emit("firstDefaultChange", value) // 触发自定义事件
}
</script>

<style lang="scss" scoped></style>
