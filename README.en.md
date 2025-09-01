# Kunpeng Frontend Management System

An enterprise-level management system frontend framework developed based on Vue-Pure-Admin lightweight version, deeply integrated with backend microservice architecture to provide efficient and stable frontend solutions.

## Framework Introduction

This frontend project is built based on the [vue-pure-admin lightweight version](https://github.com/pure-admin/vue-pure-admin). While retaining core functions, it undergoes deep optimization for the Kunpeng microservice framework to achieve front-end and back-end integrated solutions. Framework features:

- Lightweight architecture: Package size is less than 2.3MB when globally introducing Element-Plus
- High-performance experience: Loading size is less than 350KB after enabling brotli compression and CDN mode
- Deep integration: Seamless docking with the Kunpeng microservice framework, supporting unified authentication and permission control
- Continuous synchronization: Permanently synchronizes the core code of the vue-pure-admin full version to ensure functional iteration

## Component Overview

The Kunpeng frontend management system develops a series of custom UI components for enterprise-level application scenarios based on the Vue-Pure-Admin lightweight version. These components are located in the `src/components/UI/` directory, mainly including data display, form operations, business processes, etc., aiming to improve development efficiency and unify the frontend interaction experience.

### Core Value of Components

The core role of Kunpeng frontend custom components lies in **building a low-code development system**, which achieves an efficient mode of **"configuration is development"** by encapsulating frequently used page modules and interaction logic in enterprise-level applications into standardized components. Specific advantages are as follows:

#### 🌟 **Zero-Code Rapid Development**

- **Page componentization encapsulation**: Abstracts commonly used page types such as list pages, form pages, and detail pages into reusable components. Developers can generate complete pages through configuration without writing HTML structures and styles.
- **Zero-code interface docking**: Built-in automatic request logic for backend interfaces. Just configure the API address (such as `/api/user/list`) in the component to complete data loading, pagination, sorting, etc., completely eliminating the need to write interface calling code.

#### 🚀 **Efficiency Improvement and Standardization**

- **90% reduction in repetitive code**: Taking the table component as an example, traditional development requires about 500 lines of code for HTML structure, JS interaction, and CSS styles, while using `KpTable` only requires 10 lines of configuration to achieve the same function.
- **Unified interaction experience**: All components follow consistent design specifications and operation logic (such as form validation prompts, table filtering methods), avoiding style confusion in team collaboration.

## Technology Stack

- **Frontend Framework**: Vue 3.2.x
- **State Management**: Pinia
- **UI Components**: Element-Plus
- **Routing Management**: Vue Router 4.x
- **Tool Library**: @pureadmin/utils
- **Building Tool**: Vite 4.x
- **CSS Solution**: Tailwind CSS + CSS Modules

## Functional Features

- **Authentication System**: JWT login authentication, Token automatic refresh, multi-terminal state maintenance
- **Permission Control**: Menu permissions, button permissions, data permission control based on RBAC
- **Layout Scheme**: Responsive layout, multi-theme switching, custom layout configuration
- **Data Visualization**: Integrated ECharts chart library, supporting various data displays
- **File Processing**: Support for Excel import/export, image preview upload, file management
- **Logging System**: Operation log recording, exception log capture, interface call statistics

## Supporting Resources

### Backend Framework

- [Kunpeng Microservice Framework](http://kpopen.cn/kunPengBack/001_%E4%BB%8B%E7%BB%8D.html): A full-stack microservice solution based on the SpringCloud ecosystem
- Backend Documentation: [Kunpeng Framework Documentation Center](http://kpopen.cn)

### Official Resources

- **Vue-Pure-Admin Official Website**: [https://pure-admin.cn](https://pure-admin.cn)
- **Lightweight Version Repository**: [https://github.com/pure-admin/vue-pure-admin](https://github.com/pure-admin/vue-pure-admin)
- **Tool Library Documentation**: [https://pure-admin-utils.netlify.app](https://pure-admin-utils.netlify.app)

### Video Tutorials

- [UI Design Explanation](https://www.bilibili.com/video/BV17g411T7rq)
- [Rapid Development Tutorial](https://www.bilibili.com/video/BV1kg411v7QT)