<template>
  <el-form-item :label="label" :prop="prop" :rules="rules" v-if="label">
    <div class="avatar-container" @mouseenter="showOverlay = uploadable" @mouseleave="showOverlay = false">
      <el-avatar v-model="localValue" :size="size" :icon="icon" :shape="shape" :alt="alt" :fit="fit" :src="localSrc" :src-set="srcSet" @error="handleError" @click="handleClick" />

      <div v-if="showOverlay" class="avatar-overlay" :class="shape">
        <el-button v-if="uploadable" plain type="primary" class="upload-button" @click.stop="triggerUpload">
          <IconifyIconOnline icon="ri:upload-line" />
          <span class="ml-2">更新头像</span>
        </el-button>
      </div>
    </div>

    <!-- 修改后的上传组件 -->
    <el-upload ref="uploadRef" accept="image/*" action="#" :limit="1" :auto-upload="false" :show-file-list="false" :on-change="onChange">
      <!-- 添加一个隐藏的上传按钮 -->
      <template #trigger>
        <el-button style="display: none"></el-button>
      </template>
    </el-upload>
  </el-form-item>

  <el-avatar v-else v-model="localValue" :size="size" :icon="icon" :shape="shape" :alt="alt" :fit="fit" :src="localSrc" :src-set="srcSet" @error="handleError" @click="handleClick" />

  <el-dialog v-model="isShow" width="40%" title="编辑头像" destroy-on-close :closeOnClickModal="false" :before-close="handleClose" :fullscreen="deviceDetection()">
    <ReCropperPreview ref="cropRef" :imgSrc="imgSrc" @cropper="onCropper" />
    <template #footer>
      <div class="dialog-footer">
        <el-button bg text @click="handleClose">取消</el-button>
        <el-button bg text type="primary" @click="handleSubmitImage">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="KPAvatar">
import { computed, defineEmits, defineProps, ref, watch } from "vue"
import { createFormData, deviceDetection } from "@pureadmin/utils"
import ReCropperPreview from "@/components/ReCropperPreview"
import { uploadFile } from "@/api/system"
import { message } from "@/utils/message"
import { minioUrl } from "@/utils/serverPath"

// 接收父组件的值
const props = withDefaults(
  defineProps<{
    modelValue?: string // 绑定的值
    label?: string // 表单项的标签
    size?: number | "large" | "default" | "small" // 头像大小
    shape?: "circle" | "square" // 头像形状 Avatar 形状
    icon?: string // 没有图片时显示的图标
    src?: string // 图片源
    srcSet?: string // 图片源集合
    alt?: string // 替代文本
    fit?: "fill" | "contain" | "cover" | "none" | "scale-down" // 图片适应方式
    prop?: string // 表单验证的属性
    rules?: any // 表单验证规则
    uploadable?: boolean // 是否启用上传功能，默认为 false
    enableThumbnail?: boolean // 新增：是否启用缩略图生成
    thumbnailSize?: number // 新增：缩略图尺寸（仅enableThumbnail为true时生效）
  }>(),
  {
    size: "default",
    shape: "square",
    uploadable: false,
    enableThumbnail: false, // 默认不启用
    thumbnailSize: 100 // 默认100px
  }
)
// 本地维护的图片地址（替代直接使用 props.src）
const localSrc = ref(props.src || "")
// 状态管理
const uploadRef = ref(null)
const showOverlay = ref(false)
//文件名称
const fileName = ref("")
//头像地址
const imgSrc = ref("")
//是否打开模态框
const isShow = ref(false)
const cropRef = ref()
//固定写法
const cropperBlob = ref()
const onCropper = ({ blob }) => (cropperBlob.value = blob)

// 修改后的上传触发方法
const triggerUpload = () => {
  if (!props.uploadable) return
  // 使用原生DOM方法触发文件选择对话框
  const uploadInput = uploadRef.value.$el.querySelector('input[type="file"]')
  if (uploadInput) {
    uploadInput.click()
  }
}

/**
 * 文件变化处理函数：当用户选择文件后触发
 * @param uploadFile
 */
const onChange = uploadFile => {
  // 从上传文件对象中获取文件名，并保存到响应式变量fileName中
  fileName.value = uploadFile.name
  // 创建FileReader实例，用于将文件内容读取为DataURL格式
  const reader = new FileReader()
  // 定义文件加载完成后的回调函数
  reader.onload = e => {
    // 将文件内容（Base64字符串）赋值给响应式变量imgSrc
    imgSrc.value = e.target.result as string
    // 打开编辑模态框
    isShow.value = true
  }
  // 启动异步读取操作，将文件内容转换为DataURL格式
  // uploadFile.raw是原始文件对象，包含文件的二进制内容
  reader.readAsDataURL(uploadFile.raw)
}

/**
 * 关闭编辑头像模态框
 */
const handleClose = () => {
  cropRef.value.hidePopover()
  uploadRef.value.clearFiles()
  isShow.value = false
}

/**
 * 上传图片
 */
const handleSubmitImage = async () => {
  let formData = createFormData({
    files: new File([cropperBlob.value], fileName.value)
  })

  if (props.enableThumbnail) {
    try {
      const blob = await generateThumbnail(cropperBlob.value, props.thumbnailSize)
      formData = createFormData({
        files: new File([blob], fileName.value)
      })
    } catch (ex) {}
  }

  const body = await uploadFile(formData).then()
  if (!body.success) {
    message("上传失败！" + body.message, { type: "error" })
    return
  }
  localSrc.value = minioUrl + "/temporary-upload-file/" + body.data.filePath
  // 新增：通过 emit 更新 v-model 的值
  emit("update:modelValue", body.data.filePath) // 或者 filePath，根据您需要存储的格式
  handleClose()
}

/**
 * 生成缩略图
 * @param originalBlob
 * @param width
 */
const generateThumbnail = async (originalBlob: Blob, width: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // 1. 创建Image对象来加载原始图片
    const img = new Image()

    // 2. 创建Object URL作为图片源
    const objectUrl = URL.createObjectURL(originalBlob)

    img.onload = () => {
      // 3. 检查原始图片是否已经小于等于目标宽度
      // if (img.width <= width) {
      // 	URL.revokeObjectURL(objectUrl);
      // 	resolve(originalBlob); // 直接返回原图
      // 	return;
      // }

      // 4. 计算等比例高度
      const height = (img.height / img.width) * width

      // 5. 创建Canvas进行绘制
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("无法获取Canvas上下文"))
        return
      }

      // 6. 绘制缩略图
      ctx.drawImage(img, 0, 0, width, height)

      // 7. 转换为Blob
      canvas.toBlob(
        blob => {
          // 8. 释放Object URL
          URL.revokeObjectURL(objectUrl)

          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("生成缩略图失败"))
          }
        },
        "image/jpeg", // 默认输出JPEG格式
        0.8 // 默认质量80%
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("图片加载失败"))
    }

    img.src = objectUrl
  })
}

// 监听 props.src 的变化，同步到本地状态
watch(
  () => props.src,
  newVal => {
    localSrc.value = newVal || ""
  },
  { immediate: true } // 初始化时立即执行
)

// 处理错误事件
const handleError = (e: Event) => {
  emit("error", e)
}

// 处理点击事件
const handleClick = (e: MouseEvent) => {
  emit("click", e)
}

// 定义 emit 事件
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "error", Event: Event): void
  (e: "click", MouseEvent: MouseEvent): void
  (e: "upload-success", url: string): void
}>()

// 使用计算属性实现双向绑定
const localValue = computed({
  get() {
    return props.modelValue
  },
  set(value: string) {
    emit("update:modelValue", value)
  }
})
</script>

<style lang="scss" scoped>
.avatar-container {
  position: relative;
  display: inline-block;
  margin-left: 15px;

  // 确保容器尺寸与头像一致
  .el-avatar {
    display: block; // 移除行内元素间隙
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;

    // 添加调试边框，帮助定位问题
    // border: 1px solid red;

    .upload-button {
      background-color: rgba(255, 255, 255, 0.2);
      border-color: #fff;
      color: #fff;

      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
  }

  &:hover .avatar-overlay {
    opacity: 1;
  }

  .circle {
    border-radius: 50%;
    overflow: hidden; // 确保圆形遮罩层不溢出
  }

  .square {
    border-radius: 4px;
    overflow: hidden; // 确保方形遮罩层不溢出
  }
}
</style>