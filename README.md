# 昆鹏前端管理系统

基于 Vue-Pure-Admin 精简版开发的企业级管理系统前端框架，深度整合后端微服务架构，提供高效、稳定的前端解决方案。

## 框架介绍

本前端项目基于 [vue-pure-admin 精简版](https://github.com/pure-admin/vue-pure-admin) 构建，保留核心功能的同时针对昆鹏微服务框架进行深度优化，实现前后端一体化解决方案。框架特点：

- 轻量级架构：全局引入 Element-Plus 情况下打包大小低于 2.3MB
- 高性能体验：开启 brotli 压缩和 CDN 模式后，加载大小低于 350KB
- 深度整合：与昆鹏微服务框架无缝对接，支持统一认证、权限控制
- 持续同步：永久同步 vue-pure-admin 完整版核心代码，确保功能迭代

## 组件概述

昆鹏前端管理系统在 Vue-Pure-Admin 精简版基础上，针对企业级应用场景开发了一系列自定义 UI 组件。这些组件位于 `src/components/UI/` 目录下，主要包含数据展示、表单操作、业务流程等类型，旨在提升开发效率并统一前端交互体验。

### 组件核心价值

昆鹏前端自定义组件的核心作用在于**构建低代码开发体系**，通过将企业级应用中高频使用的页面模块与交互逻辑封装为标准化组件，实现**「配置即开发」的高效模式**。具体优势如下：

#### 🌟 **零编码快速开发**

- **页面组件化封装**：将列表页、表单页、详情页等常用页面类型抽象为可复用组件，开发者无需手写HTML结构与样式，直接通过配置生成完整页面。
- **接口零编码对接**：内置后端接口自动请求逻辑，只需在组件中配置API地址（如`/api/user/list`），即可完成数据加载、分页、排序等操作，彻底省去接口调用代码编写。

#### 🚀 **效率提升与标准化**

- **减少90%重复代码**：以表格组件为例，传统开发需编写HTML结构、JS交互、CSS样式约500行代码，使用`KpTable`仅需10行配置即可实现同等功能。
- **统一交互体验**：所有组件遵循一致的设计规范与操作逻辑（如表单验证提示、表格筛选方式），避免团队协作中的风格混乱。

## 技术栈

- **前端框架**：Vue 3.2.x
- **状态管理**：Pinia
- **UI 组件**：Element-Plus
- **路由管理**：Vue Router 4.x
- **工具库**：@pureadmin/utils
- **构建工具**：Vite 4.x
- **CSS 方案**：Tailwind CSS + CSS Modules

## 功能特性

- **认证体系**：JWT 登录认证、Token 自动刷新、多端状态保持
- **权限控制**：基于 RBAC 的菜单权限、按钮权限、数据权限控制
- **布局方案**：响应式布局、多主题切换、自定义布局配置
- **数据可视化**：集成 ECharts 图表库，支持各类数据展示
- **文件处理**：支持 Excel 导入导出、图片预览上传、文件管理
- **日志系统**：操作日志记录、异常日志捕获、接口调用统计

## 配套资源

### 后端框架

- [昆鹏微服务框架](http://www.kunpengtool.cn/kunPengBack/001_%E4%BB%8B%E7%BB%8D.html)：基于 SpringCloud 生态的全栈微服务解决方案
- 后端文档：[昆鹏框架文档中心](http://kunpengtool.cn)

### 官方资源

- **Vue-Pure-Admin 官网**：[https://pure-admin.cn](https://pure-admin.cn)
- **精简版仓库**：[https://github.com/pure-admin/vue-pure-admin](https://github.com/pure-admin/vue-pure-admin)
- **工具库文档**：[https://pure-admin-utils.netlify.app](https://pure-admin-utils.netlify.app)

### 视频教程

- [UI 设计讲解](https://www.bilibili.com/video/BV17g411T7rq)
- [快速开发教程](https://www.bilibili.com/video/BV1kg411v7QT)
