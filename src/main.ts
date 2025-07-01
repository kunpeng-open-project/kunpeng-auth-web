import App from "./App.vue";
import router from "./router";
import { setupStore } from "@/store";
import { getPlatformConfig } from "./config";
import { MotionPlugin } from "@vueuse/motion";
// import { useEcharts } from "@/plugins/echarts";
import { createApp, type Directive } from "vue";
import { useElementPlus } from "@/plugins/elementPlus";
import { injectResponsiveStorage } from "@/utils/responsive";

import Table from "@pureadmin/table";
// import PureDescriptions from "@pureadmin/descriptions";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入重置样式
import "./style/reset.scss";
// 导入公共样式
import "./style/index.scss";
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import "./style/tailwind.css";
import "element-plus/dist/index.css";
// 导入字体图标
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";

import "./assets/styles/ global.scss" // 引入全局样式

const app = createApp(App);

//图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


// 自定义指令
import * as directives from "@/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 全局注册@iconify/vue图标库
import {
  IconifyIconOffline,
  IconifyIconOnline,
  FontIcon
} from "./components/ReIcon";
app.component("IconifyIconOffline", IconifyIconOffline);
app.component("IconifyIconOnline", IconifyIconOnline);
app.component("FontIcon", FontIcon);

// 全局注册按钮级别权限组件
import { Auth } from "@/components/ReAuth";
import { Perms } from "@/components/RePerms";
app.component("Auth", Auth);
app.component("Perms", Perms);

// 全局注册vue-tippy
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import VueTippy from "vue-tippy";
app.use(VueTippy);

// 异步导入所有组件
const componentModules = import.meta.glob('@/components/UI/**/*.vue');
Object.entries(componentModules).map(async ([path, loadModule]) => {
  const componentName = path.split('/').pop().replace(/\.\w+$/, '');
  const component = await loadModule();
  app.component(componentName, component.default);
})

//导入自定义ui
// import KPTable from '@/components/UI/Table/KPTable.vue'
// import KPTableTree from '@/components/UI/Table/KPTableTree.vue'
// import KPTableQuery from '@/components/UI/Form/KPTableQuery.vue'
// import KPGroupForm from '@/components/UI/Form/KPGroupForm.vue'
// import KPInputText from '@/components/UI/Input/KPInputText.vue'
// import KPSelect from '@/components/UI/Input/KPSelect.vue'
// import KPTreeSelect from '@/components/UI/Input/KPTreeSelect.vue'
// import KPIconSelect from '@/components/UI/Input/KPIconSelect.vue'
// import KPRadio from '@/components/UI/Input/KPRadio.vue'
// import KPRadioButton from '@/components/UI/Input/KPRadioButton.vue'
// import KPDatePicker from '@/components/UI/Input/KPDatePicker.vue'
// import KPTag from '@/components/UI/Input/KPTag.vue'
// import KPDialogFormEdit from '@/components/UI/Dialog/KPDialogFormEdit.vue'
// import KPDialogDetails from '@/components/UI/Dialog/KPDialogDetails.vue'
// import KPDialogForm from '@/components/UI/Dialog/KPDialogForm.vue'
// import KPDialog from '@/components/UI/Dialog/KPDialog.vue'
// import KPTree from '@/components/UI/Tree/KPTree.vue'
// import KPCardTree from '@/components/UI/Tree/KPCardTree.vue'
// import KPDrawer from '@/components/UI/Drawer/KPDrawer.vue'
//
// app.component("KPTable", KPTable);
// app.component("KPTableTree", KPTableTree);
// app.component("KPTableQuery", KPTableQuery);
// app.component("KPGroupForm", KPGroupForm);
// app.component("KPInputText", KPInputText);
// app.component("KPSelect", KPSelect);
// app.component("KPTreeSelect", KPTreeSelect);
// app.component("KPIconSelect", KPIconSelect);
// app.component("KPRadio", KPRadio);
// app.component("KPRadioButton", KPRadioButton);
// app.component("KPDialogFormEdit", KPDialogFormEdit);
// app.component("KPDialogDetails", KPDialogDetails);
// app.component("KPDialogForm", KPDialogForm);
// app.component("KPDialog", KPDialog);
// app.component("KPDatePicker", KPDatePicker);
// app.component("KPTree", KPTree);
// app.component("KPCardTree", KPCardTree);
// app.component("KPDrawer", KPDrawer);
// app.component("KPTag", KPTag);

// 设置警告处理函数
app.config.warnHandler = (msg, instance, trace) => {
  // 检查警告信息是否包含特定的错误信息
  if (msg.includes('Invalid prop: type check failed for prop "modelValue"')) {
    // 忽略该警告
    return;
  }
  if (msg.includes('Invalid prop: type check failed for prop "closeOnPressEscape"')) {
    // 忽略该警告
    return;
  }


  // 其他警告信息，按照默认方式处理（例如输出到控制台）
  console.warn(msg, instance, trace);
};



getPlatformConfig(app).then(async config => {
  setupStore(app);
  app.use(router);
  await router.isReady();
  injectResponsiveStorage(app, config);
  app.use(MotionPlugin).use(useElementPlus).use(Table);
  // .use(PureDescriptions)
  // .use(useEcharts);
  app.mount("#app");
});
