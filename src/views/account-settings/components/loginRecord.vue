<template>
	<div style="margin-left: 10%; width: 80%">
		<h3 class="my-8">登录记录</h3>
		<KPTableShow list-api="/auth/login/record/oneself/list" :query-params="queryParams" :table-column="tableColumn" kp-table-query-height="200px"/>
	</div>
</template>
<script setup lang="ts">
import { reactive } from "vue";
import { projectCode } from "@/utils/serverPath"
import { TableColumn } from "@/utils/data/systemData";

/**
 * 搜索内容
 */
const queryParams = reactive({
	projectCode: projectCode,
	pageNum: 1,
	pageSize: 15,
	orderBy: null as string | null
});


/**
 * table 列表 定义显示列
 */
let tableColumn: TableColumn[] = [
	{ prop: 'userName', label: '用户账号' },
	{ prop: 'loginResult', label: '登录结果', sort: true },
	{ prop: 'loginType', label: '登录类型', sort: true, render: { 1: "账号登录", 2: "授权登录", 3: "免密登录", 4: "泛微单点登录" } },
	{ prop: 'userPlatForm', label: '用户代理平台', sort: true },
	{ prop: 'userReferer', label: '用户操作来源', sort: true },
	{ prop: 'userAgent', label: '登录浏览器信息', sort: true },
	{ prop: 'loginIp', label: '登录IP', sort: true },
	{ prop: 'createDate', label: '登录时间', sort: true }
];

</script>