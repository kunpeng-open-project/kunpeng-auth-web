<template>
  <el-card shadow="hover" class="custom-card" v-if="isBorder">
    <el-form :model="formParams" ref="formRef" :rules="rules" :inline="true" class="demo-form-inline" :label-width="labelWidth">
      <el-row :gutter="30">
        <slot />
      </el-row>
    </el-form>
  </el-card>

  <el-form :model="formParams" ref="formRef" :rules="rules" :inline="true" class="demo-form-inline" :label-width="labelWidth" v-else>
    <el-row :gutter="30">
      <slot />
    </el-row>
  </el-form>
</template>

<script lang="ts" setup name="KPForm">
import { ref } from "vue"

// 定义组件接收的参数
const props = withDefaults(
  defineProps<{
    formParams: any // 表单数据对象
    rules?: any // 表单验证规则
    labelWidth?: string // 表单项标签宽度
    isBorder?: boolean // 是否显示边框卡片
  }>(),
  {
    labelWidth: "100px", // 默认标签宽度
    isBorder: false // 默认不显示边框
  }
)

// 表单验证引用（对外暴露）
const formRef = ref(null)

// 封装表单验证方法，返回Promise
// const validateForm = async (): Promise<boolean> => {
// 	return new Promise((resolve) => {
// 		formRef.value?.validate((valid) => {
// 			resolve(valid);
// 		});
// 	});
// };

const validateForm = async (): Promise<boolean> => {
  return new Promise(resolve => {
    // 关键修复：使用formRef.value而不是formRef
    formRef.value?.validate(valid => {
      resolve(valid)
    })
  })
}

// 暴露方法给父组件
defineExpose({
  validateForm
})
</script>

<style lang="scss" scoped>
// 继承原组件的样式设置
:deep(.is-horizontal) {
  display: none !important;
}

// 可自定义卡片样式（如需扩展）
.custom-card {
  margin: 0;
  border-radius: 4px;
}
</style>