<template>
  <el-dialog v-model="dialogVisible" class="kp-dialog-form-edit" :modal="true" center draggable :width="width" :destroy-on-close="true" :close-on-press-escape="false" :show-close="false" :close-on-click-modal="false" :fullscreen="dialogFulls" :top="top">
    <template #header>
      <div class="dialog-header">
        <div class="header-buttons">
          <el-button size="large" :title="dialogFulls ? '最小化' : '最大化'" text @click="dialogFulls = !dialogFulls">
            <IconifyIconOnline :icon="dialogFulls ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'" />
          </el-button>
          <el-button icon="Close" size="large" title="关闭" text @click="dialogVisible = false" />
        </div>
        <el-tabs v-model="activeTab" type="border-card" class="tabs" @tab-click="handleTabClick">
          <el-tab-pane v-for="(tab, index) in tabs" :key="index" :label="tab.label" :name="`tab${index}`" :data-type="tab.type" :disabled="tab.disabled" />
        </el-tabs>
      </div>
    </template>
    <el-scrollbar :max-height="dialogFulls ? 'calc(100vh - 130px)' : '70vh'">
      <div v-loading="dialogLoading">
        <div v-for="(tab, index) in visibleTabs" :key="index">
          <el-timeline>
            <el-timeline-item v-for="list in tabList.list" :key="list.identification" :timestamp="list.createDate" placement="top">
              <el-card shadow="hover" style="width: 98%">
                <template #header>
                  <div class="card-header">
                    <el-tag :type="list.operateType === '新增' || list.operateType === '批量新增' ? 'primary' : 'success'">{{ list.operateType }}</el-tag>
                    <div class="header-text">{{ list.operateType + tab.label }}</div>
                  </div>
                </template>

                <div v-if="tabType === 'default' && ['修改', '批量修改'].includes(list.operateType)" class="change-content">
                  <div v-for="(item, index) in list.changeBody.split('|')" :key="index">
                    <template v-if="item.includes('由') && item.includes('修改为')">
                      <span class="change-label">{{ item.split("由")[0] }}由</span>
                      <span class="change-old">{{ item.split("由")[1].split("修改为")[0] }}</span>
                      <span class="change-label">修改为</span>
                      <span class="change-new">{{ item.split("修改为")[1] }}</span>
                    </template>
                    <template v-else>
                      {{ item }}
                    </template>
                  </div>
                </div>

                <div v-if="tabType === 'image' && list.operateType === '批量新增'" class="image-list">
                  <div v-for="img in JSON.parse(list.changeBody)" :key="img.url" class="image-item">
                    <el-image class="image" :src="img.url" :preview-src-list="[img.url]" fit="fill" loading="lazy" lazy>
                      <template #loading>
                        <div class="image-loading">加载中...</div>
                      </template>
                      <template #error>
                        <div class="image-error">加载失败</div>
                      </template>
                    </el-image>
                    <div class="image-name">{{ img.fileName }}</div>
                  </div>
                </div>

                <div v-if="tabType === 'image' && list.operateType === '先删后增'">
                  <!-- 已删除图片区域 -->
                  <div class="delete-title">
                    <IconifyIconOnline icon="ri:delete-bin-line" class="delete-icon" />
                    <span>已删除图片</span>
                  </div>
                  <div class="image-list">
                    <div v-for="img in parseDeleteAddData(list.changeBody).deletedImgs" :key="img.archiveFileId" class="image-item">
                      <!-- 删除图片：加灰色遮罩和删除图标 -->
                      <div class="delete-image-container">
                        <el-image class="image" :src="img.url" :preview-src-list="[img.url]" fit="fill" loading="lazy">
                          <template #loading>
                            <div class="image-loading">加载中...</div>
                          </template>
                          <template #error>
                            <div class="image-error">加载失败</div>
                          </template>
                        </el-image>
                        <!-- 删除遮罩层 -->
                        <div class="delete-mask">
                          <IconifyIconOnline icon="ri:delete-fill" class="mask-delete-icon" />
                        </div>
                      </div>
                      <div class="image-name">{{ img.fileName }}</div>
                    </div>
                  </div>

                  <!-- 新增图片区域（和批量新增样式一致） -->
                  <div class="add-title">
                    <IconifyIconOnline icon="ri:add-line" class="add-icon" />
                    <span>新增图片</span>
                  </div>
                  <div class="image-list">
                    <div v-for="img in parseDeleteAddData(list.changeBody).addedImgs" :key="img.archiveFileId" class="image-item">
                      <el-image class="image" :src="img.url" :preview-src-list="[img.url]" fit="fill" loading="lazy">
                        <template #loading>
                          <div class="image-loading">加载中...</div>
                        </template>
                        <template #error>
                          <div class="image-error">加载失败</div>
                        </template>
                      </el-image>
                      <div class="image-name">{{ img.fileName }}</div>
                    </div>
                  </div>
                </div>

                <div v-if="tabType === 'file' && list.operateType === '批量新增'" class="file-list">
                  <div v-for="file in JSON.parse(list.changeBody)" :key="file.filePath" class="upload-file-item-wrapper">
                    <!-- 第一层：文件信息 + 操作按钮 -->
                    <div class="upload-file-item">
                      <div class="file-info">
                        <IconifyIconOnline :icon="getFileIcon(file)" class="file-icon" />
                        <span class="file-name" :title="file.fileName">{{ file.fileName }}</span>
                        <span class="file-size">({{ formatFileSize(file) }})</span>
                      </div>
                      <div class="file-actions">
                        <el-button link type="primary" @click="handlePreview(file)">预览</el-button>
                        <el-button link type="primary" @click="handleDownload(file)">下载</el-button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="tabType === 'file' && list.operateType === '先删后增'">
                  <!-- 已删除文件区域 -->
                  <div class="delete-title">
                    <IconifyIconOnline icon="ri:delete-bin-line" class="delete-icon" />
                    <span>已删除文件</span>
                  </div>
                  <div class="file-list">
                    <div v-for="file in parseDeleteAddData(list.changeBody).deletedImgs" :key="file.filePath" class="upload-file-item-wrapper">
                      <div class="upload-file-item">
                        <!-- 移除delete-file-item类名 -->
                        <div class="file-info">
                          <IconifyIconOnline :icon="getFileIcon(file)" class="file-icon" />
                          <span class="file-name" :title="file.fileName">{{ file.fileName }}</span>
                          <span class="file-size">({{ formatFileSize(file) }})</span>
                          <IconifyIconOnline icon="ri:delete-fill" class="deleted-icon" />
                        </div>
                        <!-- 添加删除文件的操作按钮 -->
                        <div class="file-actions">
                          <el-button link type="primary" @click="handlePreview(file)">预览</el-button>
                          <el-button link type="primary" @click="handleDownload(file)">下载</el-button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 新增文件区域 -->
                  <div class="add-title">
                    <IconifyIconOnline icon="ri:add-line" class="add-icon" />
                    <span>新增文件</span>
                  </div>
                  <div class="file-list">
                    <div v-for="file in parseDeleteAddData(list.changeBody).addedImgs" :key="file.filePath" class="upload-file-item-wrapper">
                      <div class="upload-file-item">
                        <div class="file-info">
                          <IconifyIconOnline :icon="getFileIcon(file)" class="file-icon" />
                          <span class="file-name" :title="file.fileName">{{ file.fileName }}</span>
                          <span class="file-size">({{ formatFileSize(file) }})</span>
                        </div>
                        <div class="file-actions">
                          <el-button link type="primary" @click="handlePreview(file)">预览</el-button>
                          <el-button link type="primary" @click="handleDownload(file)">下载</el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="operation-info">
                  <div class="info-item">
                    <span class="info-label">操作人用户名：</span>
                    <span class="info-value">{{ list.createUserName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">操作人手机号：</span>
                    <span class="info-value">{{ list.phone }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">操作人工号：</span>
                    <span class="info-value">{{ list.serial }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">操作人IP：</span>
                    <span class="info-value">{{ list.clinetIp }}</span>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-scrollbar>

    <template #footer>
      <el-pagination class="pagination" :current-page="queryParams.pageNum" :page-size="queryParams.pageSize" size="small" layout="total, sizes, prev, pager, next" :total="tabList.total" :page-sizes="pageSizes" @current-change="handlePaginationChange" @size-change="handlePaginationSize" />
    </template>
  </el-dialog>

  <!-- 文件预览对话框 -->
  <KPDialog v-model="previewVisible" :title="previewFile?.fileName ? previewFile?.fileName : ''" :is-save="false" width="65%" top="7vh">
    <div class="preview-content">
      <!-- 图片预览区域 -->
      <div v-if="isImage(previewFile)" class="preview-image-container">
        <!-- 加载中 -->
        <div v-if="isImageLoading" class="preview-loading">
          <IconifyIconOnline icon="ri:loader-3-line" class="loading-icon" />
          <p>图片加载中...</p>
        </div>
        <!-- 加载失败 -->
        <div v-else-if="isImageLoadError" class="preview-load-error">
          <IconifyIconOnline icon="ri:error-warning-line" class="error-icon" />
          <p>图片加载失败</p>
          <el-button type="text" @click="handlePreview(previewFile)">点击重试</el-button>
        </div>
        <!-- 加载成功 -->
        <img v-else :src="previewUrl" :alt="previewFile?.name" />
      </div>

      <!-- 非图片文件预览区域 -->
      <div v-else class="preview-placeholder">
        <IconifyIconOnline icon="ri:file-line" class="preview-icon" />
        <p>该文件不支持在线预览</p>
        <el-button type="primary" @click="handleDownload(previewFile)">下载文件</el-button>
      </div>
    </div>
  </KPDialog>
</template>

<script lang="ts" setup name="KPDialogRecord">
import { computed, reactive, ref } from "vue"
import { Emitter } from "mitt"
import { serverPath } from "@/utils/serverPath"
import { ElMessage } from "element-plus"
import { postJson, postJsonBlob } from "@/api/common"
import { ResultTable } from "@/config/requestType"
import { formatFileSize, getFileIcon, isImage } from "@/utils/kp/tool/file"
import { FileData, PageData } from "@/utils/kp/data/systemData"
import { removeEmptyAndNull } from "@/utils/kp/tool/json"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    eventBus: Emitter<any> // 事件总线实例
    modelValue: boolean // 通过 v-model 传递的值
    tableKey: string //tableList  主键的key
    top?: string // top 对话框距离顶部的距离
    width?: string // 对话框宽度
    apiPath?: string // 请求的api地址
    tabs: Array<{
      label: string // 选项卡标题
      disabled?: boolean // 是否禁用
      type?: "default" | "image" | "file" // 每个Tab独立的验证规则 默认 default
    }>
  }>(),
  {
    width: "80%",
    apiPath: serverPath.authentication,
    tabs: () => [],
    top: "11vh"
  }
)

// 接收父组件的值 变成普通数据
let { eventBus, tableKey } = props
//模态框是否全屏
const dialogFulls = ref<boolean>(false)
//模态框等待框
const dialogLoading = ref<boolean>(false)
//tabs相关状态
const activeTab = ref("")
// 当前打开页面的类型 默认为default
const tabType = ref<string>("default")
// 当前页面数据
const tabList = ref<ResultTable["data"]>({ list: [], total: 0, size: 100 })
//当前操作的数据
const rowData = ref<any>()
// 预览模态框
const previewVisible = ref(false)
// 预览文件
const previewFile = ref<FileData | null>(null)
// 图片是否正在加载
const isImageLoading = ref(false)
// 图片是否加载失败
const isImageLoadError = ref(false)
// 预览 url地址
const previewUrl = ref("")
// 请求参数
const queryParams = reactive({
  ...new PageData(),
  name: null as string,
  code: null as string,
  businessType: null as string,
  identification: null as string,
  orderBy: "create_date desc",
  pageSize: 50
})
//分页每页显示条数集合
const pageSizes = ref([])

/**
 * 打开模态框
 * @param edit  操作类型
 * @param row 行内数据
 */
const openRecordDialog = async (row: any) => {
  setPageSizes()
  rowData.value = row
  initTabs()
  dialogVisible.value = true
}

/**
 * 初始化Tabs 默认打开第一个选项卡
 */
const initTabs = () => {
  if (props.tabs && props.tabs.length > 0) {
    activeTab.value = `tab${0}` // 初始激活第一个tab（name为tab0）
    handleTabClick({
      props: {
        name: `tab0`, // 匹配tab的name属性
        label: props.tabs[0].label // 可选：传递标签文本
      }
    })
  }
}

/**
 * 查下列表
 */
const queryList = async () => {
  dialogLoading.value = true
  const { data } = await postJson("/auth/object/change/log/page/list", removeEmptyAndNull(queryParams), props.apiPath)
  tabList.value = data ?? tabList.value
  dialogLoading.value = false
}

/**
 * 收到点击tabs 进行选项卡切换
 * @param tab
 */
const handleTabClick = async tab => {
  const tabIndex = Number(tab.props.name.replace("tab", ""))
  tabType.value = props.tabs[tabIndex].type || "default"
  queryParams.businessType = tab.props.label
  queryParams.identification = rowData.value[tableKey]
  await queryList()
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
 * 解析先删后增的changeBody数据
 * @param changeBody 后端返回的changeBody字符串
 * @returns { deletedImgs: 已删除图片数组, addedImgs: 新增图片数组 }
 */
const parseDeleteAddData = (changeBody: string) => {
  // 用"|"分割删除数据和新增数据
  const [deleteStr, addStr] = changeBody.split("|")
  // 提取删除数据的JSON部分（去掉"删除的数据 "前缀）
  const deletedJson = deleteStr?.replace("删除的数据", "") || "[]"
  // 提取新增数据的JSON部分（去掉"新增的数据 "前缀）
  const addedJson = addStr?.replace("新增的数据", "") || "[]"

  try {
    // 解析为JSON数组
    const deletedImgs = JSON.parse(deletedJson)
    const addedImgs = JSON.parse(addedJson)
    return { deletedImgs, addedImgs }
  } catch (error) {
    console.error("解析先删后增数据失败:", error)
    return { deletedImgs: [], addedImgs: [] }
  }
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
 * 预览文件
 */
const handlePreview = async (file: any) => {
  previewFile.value = file
  previewVisible.value = true
  isImageLoading.value = true // 开始加载
  isImageLoadError.value = false // 重置错误状态

  // 如果不是图片，直接结束加载状态
  if (!isImage(file)) {
    isImageLoading.value = false
    return
  }

  try {
    // 2. 发起请求获取图片 Blob 对象
    let data = {
      fileName: file.fileName,
      filePath: file.filePath
    }
    const blob = await postJsonBlob("/minio/file/downLoad", data, props.apiPath)

    // 3. 请求成功后，创建 URL 并赋值
    // 这一步是同步的，所以紧接着就会触发视图更新
    previewUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    // 4. 如果请求失败（网络错误、服务器错误等），捕获异常
    console.error("获取图片失败:", error)
    isImageLoadError.value = true // 标记为加载失败
    ElMessage.error("预览图片失败，请检查网络或文件是否存在。")
  } finally {
    // 5. 无论成功或失败，都结束加载状态
    isImageLoading.value = false
  }
}

/**
 * 下载文件
 */
const handleDownload = async (file: any) => {
  if (!file.filePath) {
    ElMessage.warning("文件路径不存在")
    return
  }

  let data = {
    fileName: file.fileName,
    filePath: file.filePath
  }
  const body = await postJson("/minio/file/temporary/url", data, props.apiPath)
  if (!body.success) {
    ElMessage.error("获取下载路径异常！")
    return
  }

  // 创建临时 <a> 标签（浏览器下载依赖）
  const downloadLink = document.createElement("a")
  // 4. 创建 <a> 标签直接指向下载 URL
  downloadLink.href = body.data
  // 指定下载文件名（可选，浏览器会优先用 URL 中的文件名）
  downloadLink.download = file.fileName
  //  隐藏 <a> 标签（不影响页面布局）
  downloadLink.style.display = "none"

  // . 触发下载：模拟点击 <a> 标签
  document.body.appendChild(downloadLink)
  downloadLink.click()

  // 清理资源：避免内存泄漏
  document.body.removeChild(downloadLink)
  ElMessage.success(`文件 "${file.name}" 已开始下载`)
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

// 在 script 中添加计算属性
const visibleTabs = computed(() => {
  return props.tabs.filter((tab, index) => activeTab.value === `tab${index}`)
})

// 定义 emits
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

/**
 * 生产者 对外授权
 */

eventBus.on("openRecordDialog", openRecordDialog)
</script>

<style lang="scss" scoped>
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

:deep(.el-card__header) {
  height: 44px; /* 设置自定义高度 */
  line-height: 44px; /* 可选，保持文字垂直居中 */
  padding: 0 20px; /* 可选，调整内边距 */
}
.card-header {
  display: flex; // 使用flex布局
  align-items: center; // 垂直居中对齐
  gap: 8px; // 两个元素之间的间距
}

.header-text {
  font-weight: 500; // 可以适当加粗文字
  color: #333; // 文字颜色
}

.operation-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr); // 分为两列，平均分配宽度
  gap: 12px 20px; // 行间距12px，列间距20px
  padding: 10px 0; // 上下内边距

  .info-item {
    display: flex;
    align-items: center;
    line-height: 1.6; // 优化行高

    .info-label {
      color: #606266; // 标签灰色，区分内容
      min-width: 90px; // 标签固定宽度，对齐更整齐
    }

    .info-value {
      color: #303133; // 内容深色，更醒目
      word-break: break-all; // 长内容自动换行
    }
  }
}

// 响应式处理：在小屏幕下自动切换为单列
@media (max-width: 768px) {
  .operation-info {
    grid-template-columns: 1fr;
  }
}

.change-content {
  margin-bottom: 12px;
  line-height: 1.8;

  div {
    padding: 4px 0;
    border-bottom: 1px dashed #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .change-label {
    color: #606266; // 标签文字颜色
  }

  .change-old {
    color: #f56c6c; // 旧值红色
    font-weight: 500;
    margin: 0 4px;
  }

  .change-new {
    color: #409eff; // 新值蓝色
    font-weight: 500;
    margin: 0 4px;
  }
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px; // 图片之间的间距
  padding: 16px 0;

  .image-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 120px; // 和图片宽度对应
  }

  .image {
    width: 100px;
    height: 100px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer; // 鼠标悬浮变指针，提示可点击预览
  }

  .image-loading,
  .image-error {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
    background-color: #fafafa;
  }

  .image-name {
    margin-top: 8px;
    font-size: 12px;
    color: #606266;
    white-space: nowrap; // 不换行
    overflow: hidden; // 溢出隐藏
    text-overflow: ellipsis; // 溢出显示省略号
    width: 100%;
    text-align: center;
  }
}

.delete-title,
.add-title {
  display: flex; /* 使用flex布局使图标和文字对齐 */
  align-items: center; /* 垂直居中对齐 */
  gap: 8px; /* 图标和文字之间的间距 */
  margin: 16px 0 8px; /* 上下间距，突出区域感 */
  font-weight: 600; /* 加粗文字 */
  font-size: 14px; /* 适当增大字号 */
}

.delete-title {
  color: #f56c6c; /* 红色突出已删除 */
}

.add-title {
  color: #409eff; /* 蓝色突出新增 */
}

.delete-icon,
.add-icon {
  font-size: 16px; /* 图标稍大于文字 */
}

.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 0;
  margin-bottom: 12px;

  .upload-file-item-wrapper {
    width: 200px;
  }

  .upload-file-item {
    display: flex;
    flex-direction: column;
    background-color: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); // 与图片阴影一致
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // hover效果与图片保持一致
    }
  }
  .file-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
  }

  .file-icon {
    font-size: 32px; // 图标大小适配文件展示
    margin-bottom: 8px;
    color: #409eff; // 统一文件图标颜色
  }

  .file-name {
    font-size: 12px;
    color: #606266;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    margin-bottom: 4px;
  }

  .file-size {
    font-size: 11px;
    color: #909399; // 尺寸信息浅色显示
  }

  // 已删除文件样式（与删除图片保持视觉统一）
  .deleted-icon {
    color: #f56c6c;
    margin-left: 4px;
    font-size: 14px;
  }

  // 文件操作按钮样式
  .file-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px dashed #eee; // 分隔线与图片区域保持一致

    :deep(.el-button--link) {
      font-size: 12px;
      padding: 0;
      height: auto;
      line-height: 1;
    }
  }
}

.preview-content {
  text-align: center;
  padding: 20px;

  img {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
    border-radius: 4px;
  }

  .preview-placeholder {
    .preview-icon {
      font-size: 64px;
      color: #c0c4cc;
      margin-bottom: 16px;
    }

    p {
      color: #909399;
      margin-bottom: 16px;
    }
  }
}

// 图片预览容器
.preview-image-container {
  text-align: center;
  padding: 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border-radius: 4px;

  img {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
    border-radius: 4px;
  }
}

// 加载中样式
.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #606266;

  .loading-icon {
    font-size: 48px;
    color: #409eff;
    margin-bottom: 16px;
    animation: spin 1.5s linear infinite;
  }

  p {
    font-size: 14px;
  }
}

// 加载失败样式
.preview-load-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #606266;

  .error-icon {
    font-size: 48px;
    color: #e6a23c;
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    margin-bottom: 16px;
  }
}

// 旋转动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
