<template>
  <el-card v-if="paramsIsShow" shadow="hover" class="custom-card-single">
    <el-form :model="queryParams" :inline="true" class="demo-form-inline">
      <el-container class="container-style">
        <el-main>
          <el-row :gutter="24" class="slot">
            <slot :queryParams="queryParams" />
          </el-row>
        </el-main>
        <el-aside v-if="isButton" width="190px">
          <el-button icon="Search" :loading="loading" type="primary" round @click="handleQuery">查 询</el-button>
          <el-button icon="Refresh" :loading="loading" round @click="resetQuery">重 置</el-button>
        </el-aside>
      </el-container>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup name="KPTableQuery">
import { ref } from "vue"
import { Emitter } from "mitt"
import { removeEmptyAndNull } from "@/utils/kp/tool/json"
import { toReactive } from "@vueuse/core"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    queryParams: any // 查询参数
    eventBus: Emitter<any> // 事件总线实例
    exclude?: string // 重置的时候保留的字段 多个用英文逗号分隔
    isButton?: boolean // 是否显示功能按钮
  }>(),
  {
    exclude: null,
    isButton: true
  }
)
// 接收父组件的值 变成普通数据
let { eventBus, exclude } = props
// 接收父组件的值 变成 reactive 对象
const { queryParams } = toReactive(props)
// 搜索栏是否隐藏
const paramsIsShow = ref<boolean>(true)
// 加载状态
const loading = ref<boolean>(false)
/**
 * 查询
 */
const handleQuery = () => {
  loading.value = true
  queryParams.pageNum = 1
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

/**
 * 重置查询
 */
const resetQuery = () => {
  loading.value = true
  let resetValue = { pageNum: 1, pageSize: queryParams.pageSize }

  if (exclude == null) {
    Object.keys(queryParams).map(key => delete queryParams[key])
    // Object.keys(queryParams).forEach(key => (queryParams[key] = null))
  } else {
    const excludeList = exclude.split(",").map(item => item.trim())
    for (const key in queryParams) {
      if (!excludeList.includes(key)) {
        delete queryParams[key]
        // queryParams[key] = null
      }
    }
  }

  Object.assign(queryParams, resetValue)
  eventBus.emit("queryList", queryParams)
}

/**
 * 生产者 对外授权
 */
// table 组件查询列表成功
eventBus.on("queryListSuccess", () => {
  loading.value = false
})

// table 组件查询开始查询列表
eventBus.on("tableQueryList", () => {
  loading.value = true
})

//修改搜索栏是否隐藏
eventBus.on("updateParamsIsShow", (isShow: boolean) => {
  paramsIsShow.value = isShow
})
</script>

<style lang="scss" scoped>
.custom-card-single {
  margin-bottom: 10px;
  height: 60px;
}

.custom-card-single .container-style {
  margin-top: -7px;
}

.custom-card-single .slot {
  margin-top: -20px;
  margin-bottom: -6px;
  height: 35px;
  overflow: hidden;
  touch-action: none; /* 禁止移动端触摸滚动 */
}

.custom-card {
  margin-bottom: 10px;
}

.custom-card .container-style {
  margin-top: -7px;
}

.custom-card .slot {
  margin-top: -20px;
  margin-bottom: -6px;
  width: 100%;
}

.custom-card .buttons {
  text-align: center;
  margin-bottom: -10px;
}

:deep(.el-col-5) {
  width: 20%;
  max-width: 20%;
  flex: 0 0 20%;
}
</style>
