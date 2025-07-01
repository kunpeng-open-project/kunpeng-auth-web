<template>
	<el-card v-if="paramsIsShow" shadow="hover" class="custom-card">
		<el-form :model="queryParams" :inline="true" class="demo-form-inline">
			<div class="form-left">
				<el-row :gutter="20">
					<slot :queryParams="queryParams"></slot>
				</el-row>
			</div>
			<div class="form-right">
				<el-button icon="Search" :loading="loading" type="primary" round @click="handleQuery">查 询</el-button>
				<el-button icon="Refresh" :loading="loading" round @click="resetQuery">重 置</el-button>
			</div>
		</el-form>
	</el-card>
</template>

<script lang="ts" setup name="KPTableQuery_旧版备份">
import { ref } from "vue";
import { Emitter } from 'mitt';
import { removeEmptyAndNull } from "@/utils/json";
import { toReactive } from "@vueuse/core";

// 接收父组件的值
const props = withDefaults(defineProps<{
	queryParams: any, // 查询参数
	eventBus: Emitter<any>, // 事件总线实例
	exclude?: string, // 重置的时候保留的字段 多个用英文逗号分隔
}>(), {
	exclude: null
});
// 接收父组件的值 变成普通数据
let { eventBus, exclude } = props;
// 接收父组件的值 变成 reactive 对象
const { queryParams } = toReactive(props);
// 搜索栏是否隐藏
const paramsIsShow = ref<boolean>(true);
// 加载状态
const loading = ref<boolean>(false);
/**
 * 查询
 */
const handleQuery = () => {
	loading.value = true
	eventBus.emit('queryList', removeEmptyAndNull(queryParams));
};


/**
 * 重置查询
 */
const resetQuery = () => {
	loading.value = true;
	let resetValue = { pageNum: 1, pageSize: queryParams.pageSize };
	
	if (exclude == null) {
		Object.keys(queryParams).map(key => delete queryParams[key]);
	} else {
		const excludeList = exclude.split(',').map(item => item.trim());
		for (const key in queryParams) {
			if (!excludeList.includes(key)) {
				delete queryParams[key];
			}
		}
	}
	
	Object.assign(queryParams, resetValue);
	eventBus.emit('queryList', queryParams);
};


/**
 * 生产者 对外授权
 */
// table 组件查询列表成功
eventBus.on('queryListSuccess', () => {
	loading.value = false;
});

// table 组件查询开始查询列表
eventBus.on('tableQueryList', () => {
	loading.value = true;
});

//修改搜索栏是否隐藏
eventBus.on('updateParamsIsShow', (isShow: boolean) => {
	paramsIsShow.value = isShow;
});

</script>

<style lang="scss" scoped>
.custom-card {
	margin-bottom: 10px;
}

.custom-card .form-left {
	float: left;
	width: calc(100% - 200px);
	margin-top: -6px;
	margin-bottom: -6px;
	height: 100%
}

.custom-card .form-right {
	float: right;
	margin-top: -5px;
	margin-bottom: -5px;
	width: 200px;
}

</style>
