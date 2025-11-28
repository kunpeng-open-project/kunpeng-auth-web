<template>
  <el-col :span="span">
    <el-form-item :style="{ width: width }" :label="label" :prop="prop" :rules="rules">
      <template v-if="tipBody" v-slot:label>
        <span>{{ label }}</span>
        <el-tooltip class="box-item" effect="dark" :content="tipBody" :placement="tipPlacement">
          <IconifyIconOnline icon="ep:question-filled" />
        </el-tooltip>
      </template>

      <el-upload v-model:file-list="fileList" :style="{ width: width }" :action="apiPath + uploadApi" :show-file-list="showFileList" :drag="drag" :accept="accept" :multiple="multiple" :limit="limit" :class="customClass" :auto-upload="true" :before-upload="beforeUpload" :on-exceed="handleExceed" :on-remove="handleRemove" :on-success="handleSuccess" :on-error="handleError">
        <!-- 拖拽上传区域 -->

        <div v-if="drag" class="upload-drag-area">
          <p><IconifyIconOnline icon="ri:upload-cloud-line" class="upload-icon" /></p>
          <div class="upload-text">
            <div>
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div v-if="tip" class="upload-tip">{{ tip }}</div>
          </div>
        </div>

        <!-- 文件列表模板 -->
        <template #file="{ file }">
          <div class="upload-file-item-wrapper">
            <!-- 第一层：文件信息 + 操作按钮 -->
            <div class="upload-file-item">
              <div class="file-info">
                <IconifyIconOnline :icon="getFileIcon(file)" class="file-icon" />
                <span class="file-name" :title="file.name">{{ file.name }}</span>
                <span class="file-size">({{ formatFileSize(file) }})</span>
              </div>
              <div class="file-actions">
                <el-button v-if="file.status === 'success' && showPreview" link type="primary" @click="handlePreview(file)">预览</el-button>
                <el-button v-if="file.status === 'success' && showDownload" link type="primary" @click="handleDownload(file)">下载</el-button>
                <el-button v-if="file.status === 'success'" link type="danger" @click="handleRemove(file, null)">删除</el-button>
              </div>
            </div>

            <!-- 第二层：进度条（仅上传中显示） -->
            <div class="progress-container">
              <el-progress v-if="file.status === 'uploading'" :show-text="false" :percentage="file.percentage / 1.02" style="width: 100%; margin-top: 20px" stroke-color="#409eff" trail-color="#f0f2f5" />

              <div v-if="file.status === 'uploading'" style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 12px">
                <!-- 左侧提示文字 -->
                <span style="color: #606266">
                  {{ file.percentage === 100 ? "服务器加速处理中..." : "正在上传..." }}
                </span>
                <!-- 右侧百分比文字（计算后显示，避免小数） -->
                <span style="color: #409eff; font-weight: 500">{{ Math.round(file.percentage / 1.02) }}%</span>
              </div>
            </div>
          </div>
        </template>
      </el-upload>
    </el-form-item>
  </el-col>

  <!-- 预览对话框 -->
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

<script lang="ts" setup name="KPUpload">
import { ref, watch } from "vue"
import type { UploadProps } from "element-plus"
import { ElMessage } from "element-plus"
import { serverPath } from "@/utils/serverPath"
import { postJson, postJsonBlob } from "@/api/common"
import KPDialog from "@/components/UI/Dialog/KPDialog.vue"
import { FileData } from "@/utils/kp/data/systemData"
import { formatFileSize, getFileIcon, isImage } from "@/utils/kp/tool/file"

const props = withDefaults(
  defineProps<{
    modelValue?: FileData[] | null // 绑定的文件列表
    multiple?: boolean // 是否支持多选
    limit?: number // 最大上传数量
    accept?: string // 接受的文件类型
    drag?: boolean // 是否开启拖拽上传
    showFileList?: boolean // 是否显示文件列表
    buttonText?: string // 按钮文字
    buttonType?: string // 按钮类型
    buttonSize?: "large" | "default" | "small" // 按钮尺寸
    tip?: string // 提示文字
    showPreview?: boolean // 是否显示预览
    showDownload?: boolean // 是否显示下载
    maxSize?: number // 文件大小限制（MB）
    customClass?: string // 自定义样式类
    // 表单相关属性
    label?: string // 表单项标签
    prop?: string // 表单验证属性
    rules?: any // 表单验证规则
    width?: string // 输入框的宽度，默认为 '100%'
    // 布局属性
    span?: number // 栅格布局的span值
    uploadApi?: string // 上传地址，默认为
    apiPath?: string // 请求的api地址
    tipBody?: string // 新增：输入框的提示信息
    tipPlacement?: "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "left-start" | "left-end" | "right" | "right-start" | "right-end"
  }>(),
  {
    apiPath: serverPath.authentication,
    uploadApi: "/minio/file/upload",
    multiple: false,
    limit: 9999,
    accept: "*",
    drag: true,
    showFileList: true,
    buttonText: "点击上传",
    buttonType: "primary",
    buttonSize: "default",
    showPreview: true,
    showDownload: true,
    maxSize: 10,
    customClass: "",
    label: "文件上传",
    span: 24,
    width: "100%",
    tipPlacement: "right"
  }
)

// 响应式变量（明确类型）
const fileList = ref<FileData[]>([])
// 预览模态框
const previewVisible = ref(false)
// 预览文件
const previewFile = ref<FileData | null>(null)
// 预览 url地址
const previewUrl = ref("")
// 是否初始化完成
const isInitialized = ref(false)
// 图片是否正在加载
const isImageLoading = ref(false)
// 图片是否加载失败
const isImageLoadError = ref(false)

/**
 * 当超出限制时，执行的钩子函数
 * @param files
 */
const handleExceed: UploadProps["onExceed"] = files => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

/**
 * 上传前校验
 * @param rawFile
 */
const beforeUpload: UploadProps["beforeUpload"] = rawFile => {
  // 文件大小验证
  if (props.maxSize && rawFile.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  // 文件类型验证
  if (props.accept && props.accept !== "*") {
    const acceptTypes = props.accept.split(",").map(type => type.trim())
    const fileExtension = "." + rawFile.name.split(".").pop()?.toLowerCase()
    const isValidType = acceptTypes.some(type => {
      if (type.startsWith(".")) {
        return fileExtension === type.toLowerCase()
      }
      if (type.includes("/")) {
        return rawFile.type === type
      }
      return false
    })

    if (!isValidType) {
      ElMessage.error(`只支持上传 ${props.accept} 格式的文件`)
      return false
    }
  }
  return true
}

/**
 * 文件列表移除文件时的钩子
 * @param file
 * @param files
 */
const handleRemove: UploadProps["onRemove"] = (file, files) => {
  const targetIndex = fileList.value.findIndex(item => item.uid === file.uid)
  if (targetIndex !== -1) fileList.value.splice(targetIndex, 1)
  isInitialized.value = true
  emit("update:modelValue", fileList.value)
}

/**
 * 文件上传成功时的钩子
 * @param response
 * @param file
 * @param files
 */
const handleSuccess: UploadProps["onSuccess"] = (response, file, files) => {
  const targetFile = fileList.value.find(item => item.uid === file.uid)
  const keepFields = { uid: targetFile.uid, status: targetFile.status, name: targetFile.name }
  Object.keys(targetFile).map(key => delete targetFile[key])
  Object.assign(targetFile, keepFields, response.data)
  isInitialized.value = true
  emit("update:modelValue", fileList.value)
}

/**
 * 	文件上传失败时的钩子
 * @param error
 * @param file
 * @param files
 */
const handleError: UploadProps["onError"] = (error, file, files) => {
  ElMessage.error(`上传失败`)
  console.log("上传失败 " + error)
}

/**
 * 预览文件
 */
const handlePreview = async (file: any) => {
  // previewFile.value = file
  // previewVisible.value = true
  //
  // if (!isImage(file)) return
  // let data = {
  //   fileName: file.fileName,
  //   filePath: file.filePath
  // }
  //
  // const body = await postJsonBlob("/minio/file/downLoad", data, props.apiPath)
  // previewUrl.value = URL.createObjectURL(body)
  // 1. 初始化状态和数据
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

// const handleDownload = async (file: any) => {
//   if (!file.filePath) {
//     ElMessage.warning("文件路径不存在")
//     return
//   }
//
//   let data = {
//     bucketName: file.filePath.substring(0, file.filePath.lastIndexOf("/")),
//     fileName: file.fileName,
//     filePath: file.filePath
//   }
//   const body = await postJsonBlob("/minio/file/downLoad", data, props.apiPath)
//   // 解决文件名中文乱码问题（使用 encodeURIComponent 编码）
//   const encodedFileName = encodeURIComponent(file.name)
//   // 创建临时 <a> 标签（浏览器下载依赖）
//   const downloadLink = document.createElement("a")
//   // 生成 Blob 临时 URL（指向流数据）
//   downloadLink.href = URL.createObjectURL(body)
//   // 设置下载文件名（filename* 支持中文编码）
//   downloadLink.setAttribute("download", encodedFileName)
//   //  隐藏 <a> 标签（不影响页面布局）
//   downloadLink.style.display = "none"
//
//   // . 触发下载：模拟点击 <a> 标签
//   document.body.appendChild(downloadLink)
//   downloadLink.click()
//
//   // 清理资源：避免内存泄漏
//   document.body.removeChild(downloadLink)
//   // 释放 Blob URL
//   URL.revokeObjectURL(downloadLink.href)
//
//   ElMessage.success(`文件 "${file.name}" 已开始下载`)
// }

/**
 * 监听预览对话框关闭，清理资源
 */
watch(
  () => previewVisible.value,
  isVisible => {
    if (!isVisible) {
      // 对话框关闭时，释放 Blob URL 资源，防止内存泄漏
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
        previewUrl.value = "" // 清空 URL，避免下次打开时短暂显示旧图
      }
      // 重置文件引用，避免内存泄漏
      previewFile.value = null
    }
  }
)

watch(
  () => props.modelValue,
  newVal => {
    if (newVal && newVal.length > 0 && !isInitialized.value) {
      //   // 同样补全 Upload 所需核心字段，避免渲染问题
      fileList.value = newVal.map(file => ({
        uid: file.uid,
        status: "success",
        name: file.fileName,
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        filePath: file.filePath
      }))
      isInitialized.value = true
      console.log(JSON.stringify(fileList.value))
    }
  },
  { immediate: true, deep: true } // immediate：初始化立即执行；deep：监听数组内对象变化
)

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: FileData[] | null): void
}>()
</script>

<style lang="scss" scoped>
.upload-drag-area {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50px;

  .upload-icon {
    font-size: 45px;
    color: #409eff;
    margin-bottom: 8px;
  }

  .upload-text {
    color: #909399;
    font-size: 15px;
    text-align: center;
    em {
      color: #409eff;
      font-style: normal;
      cursor: pointer;
      font-weight: 500;
    }
    .upload-tip {
      margin-top: 4px;
      font-size: 12px;
      color: #c0c4cc;
    }
  }
}

// 重构文件项外层容器：强制分层布局
.upload-file-item-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px; // 上下元素间距
  width: 100%;
}

// 文件信息+操作按钮容器
.upload-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  width: 100%;
}

.upload-file-item .file-info {
  display: flex;
  align-items: center;
  flex: 1;

  .file-icon {
    font-size: 20px;
    color: #409eff;
    margin-right: 8px;
  }

  .file-name {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-size {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
  }
}

.upload-file-item .file-actions {
  display: flex;
  gap: 8px;
}

// 进度条容器
.progress-container {
  width: 100%;
}

// 进度条动画优化
.el-progress-bar__inner {
  transition: width 0.3s ease-in-out;
}

// 预览对话框
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
</style>
