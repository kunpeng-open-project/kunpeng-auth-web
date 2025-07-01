import type {VNode} from "vue";
import {isFunction} from "@pureadmin/utils";
import {ElMessage, ElMessageBox, type MessageHandler} from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";


type messageStyle = "el" | "antd";
type messageTypes = "info" | "success" | "warning" | "error";

interface MessageParams {
  /** 消息类型，可选 `info` 、`success` 、`warning` 、`error` ，默认 `info` */
  type?: messageTypes;
  /** 自定义图标，该属性会覆盖 `type` 的图标 */
  icon?: any;
  /** 是否将 `message` 属性作为 `HTML` 片段处理，默认 `false` */
  dangerouslyUseHTMLString?: boolean;
  /** 消息风格，可选 `el` 、`antd` ，默认 `antd` */
  customClass?: messageStyle;
  /** 显示时间，单位为毫秒。设为 `0` 则不会自动关闭，`element-plus` 默认是 `3000` ，平台改成默认 `2000` */
  duration?: number;
  /** 是否显示关闭按钮，默认值 `false` */
  showClose?: boolean;
  /** 文字是否居中，默认值 `false` */
  center?: boolean;
  /** `Message` 距离窗口顶部的偏移量，默认 `20` */
  offset?: number;
  /** 设置组件的根元素，默认 `document.body` */
  appendTo?: string | HTMLElement;
  /** 合并内容相同的消息，不支持 `VNode` 类型的消息，默认值 `false` */
  grouping?: boolean;
  /** 关闭时的回调函数, 参数为被关闭的 `message` 实例 */
  onClose?: Function | null;
}

/** 用法非常简单，参考 src/views/components/message/index.vue 文件 */

/**
 * `Message` 消息提示函数
 */
const message = (
  message: string | VNode | (() => VNode),
  params?: MessageParams
): MessageHandler => {
  if (!params) {
    return ElMessage({
      message,
      customClass: "pure-message"
    });
  } else {
    const {
      icon,
      type = "info",
      dangerouslyUseHTMLString = false,
      customClass = "antd",
      duration = 5000,
      showClose = false,
      center = false,
      offset = 20,
      appendTo = document.body,
      grouping = false,
      onClose
    } = params;

    return ElMessage({
      message,
      type,
      icon,
      dangerouslyUseHTMLString,
      duration,
      showClose,
      center,
      offset,
      appendTo,
      grouping,
      // 全局搜 pure-message 即可知道该类的样式位置
      customClass: customClass === "antd" ? "pure-message" : "",
      onClose: () => (isFunction(onClose) ? onClose() : null)
    });
  }
};


let senMessage: string = "";
const messageNum = (mes: string | VNode | (() => VNode),params?: MessageParams) => {
  if (senMessage!==mes.toString()){
      message(mes, params);
      senMessage = mes.toString();
    setTimeout(() => {
      senMessage = "";
    }, 2000); // 2秒后重置
  }
};
export function selectMessageBox(message: string, title: string = '提示'){
  return ElMessageBox.confirm( message, title, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
  );
  // return this.$confirm(message, '提示', {
  //   confirmButtonText: '确定',
  //   cancelButtonText: '取消',
  //   type: 'warning'
  // }).then(() => {
  //   return true;
  // })
}


/**
 * 判断选内容 true 表示 不可以继续执行
 * @param bodyLength 数据选择长度
 * @param number 1 表示只能选一条 2（>1） 表示只能选多条
 * @returns {Promise<boolean>|boolean}
 */
export function numberMessageBox(bodyLength, number){
  if (bodyLength == 0){
    message("请选择要操作的数据", { type: "warning" });
    return true;
  }


  //选择一条
  if (number == 1 && bodyLength != 1){
    message("只能选择一条数据进行操作", { type: "error" });
    return true;
  }
  return false;
}


/**
 * 关闭所有 `Message` 消息提示函数
 */
const closeAllMessage = (): void => ElMessage.closeAll();

export { message, closeAllMessage, messageNum };
