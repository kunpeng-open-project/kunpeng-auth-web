<template>
	<el-table v-loading="loading" :data="tableList.list" :style="tableHeaderStyles" :size="tableSize" :height="isControlHeight ? tableHeight : undefined" @sort-change="sortChangeOrderBy" @selection-change="multiSelect" fit>
		<template v-if="checkbox">
			<el-table-column align="center" type="selection" width="55"/>
		</template>
		<el-table-column
				v-for="column in tableColumn"
				:key="column.prop"
				:prop="column.prop"
				:label="column.label"
				:width="column.width"
				align="center"
				:sortable="column.sort === undefined? false :'custom'"
				:sort-orders="['ascending', 'descending']"
				:show-overflow-tooltip="true">
			<template #default="{ row }">
				<slot :name="column.prop" :row="row">
					<template v-if="column.type ==='avatar'">
						<el-avatar :size="40" :src="row[column.prop]"/>
					</template>
					<template v-else>
						<template v-if="column.prefixIcon">
							<div style="display: inline-flex; align-items: center;">
								<IconifyIconOnline v-if="row.icon != null" :icon="getIcon(row, column)" class="mr-2"/>
								{{ row[column.prop] }}
							</div>
						</template>
						
						<template v-else>
							{{ column.render? column.render[row[column.prop]] : row[column.prop] }}
						</template>
					</template>
				
				</slot>
			</template>
		</el-table-column>
		
		<el-table-column label="操作" align="center" :width="actionWidth" v-if="$slots.actions">
			<template #default="{ row }">
				<div class="action-buttons">
					<slot name="actions" :row="row"></slot>
				</div>
			</template>
		</el-table-column>
	</el-table>
	
	<div v-if="isPage">
		<el-pagination class="pagination" v-model:page-size="tableList.size" size="small" layout="total, sizes, prev, pager, next, jumper" :total="tableList.total" :page-sizes="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]" @current-change="handlePaginationChange" @size-change="handlePaginationSize"/>
	</div>

</template>

<script lang="ts" setup name="KPTableShow">
import { useLayout } from "@/layout/hooks/useLayout";
import { computed, onMounted, ref, toRefs } from "vue";
import { getTableList } from "@/api/table";
import { Result, ResultTable } from "@/config/requestType";
import { TableColumn } from "@/utils/data/systemData";
import { removeEmptyAndNull } from "@/utils/json";

type TableSize = "" | "large" | "default" | "small";

//接收父组件的值
const props = withDefaults(defineProps<{
	listApi: string, // 获取列表的地
	checkbox?: boolean, // 是否有复选框
	tableColumn: Array<TableColumn>, // 表格列的定义
	actionWidth?: string, // 操作列的宽度，默认为 'auto'
	queryParams?: any, // 查询参数
	kpTableQueryHeight?: string, // 表格高度，默认值
	initList?: boolean, // 是否初始化列表数据
	isControlHeight?: boolean, // 是否控制高度
}>(), {
	checkbox: false,
	actionWidth: "auto",
	kpTableQueryHeight: "70px",
	queryParams: () => Object.freeze({}), // 返回冻结的空对象
	initList: true,
	isControlHeight: true,
});

// 接收父组件的值 变成响应式 数据  tableColumn table列的定义说明
const { tableColumn } = toRefs(props);
// 接收父组件的值 变成普通数据
let {
	listApi,
	queryParams,
	kpTableQueryHeight,
} = props;
//table列表数据
const tableList = ref<ResultTable["data"] | Result["data"]>({ list: [], total: 0, size: 100 });
//table 等待框
const loading = ref(false);
//搜索栏是否隐藏
const paramsIsShow = ref(true);
//表格大小
const tableSize = ref<TableSize>("default");
//多选选择值
const multiSelectValue = ref<Array<any>>([]);
//是否有分页
const isPage = ref(false);


onMounted(() => {
	if (!props.initList) return;
	queryList(removeEmptyAndNull(queryParams));
});


/**
 * 查询列表
 * @param queryParams 入参
 */
const queryList = async (queryParams: any) => {
	loading.value = true;
	const { data } = await getTableList(listApi, queryParams);
	if (data.list) {
		tableList.value = data ?? tableList.value;
		isPage.value = true;
	} else {
		tableList.value.list = data ?? tableList.value.list;
		isPage.value = false;
	}
	loading.value = false;
};


/**
 * 页码跳转
 * @param currentPage
 */
const handlePaginationChange = async (currentPage: number) => {
	queryParams.pageNum = currentPage;
	await queryList(removeEmptyAndNull(queryParams));
};

/**
 * 设置每页显示多少条数据
 * @param pageSize
 */
const handlePaginationSize = async (pageSize: number) => {
	queryParams.pageSize = pageSize;
	await queryList(removeEmptyAndNull(queryParams));
};

/**
 * 排序
 * @param column
 */
const sortChangeOrderBy = async (column) => {
	if (column.order == null) return;
	let order = column.order == "ascending"? " asc" : " desc";
	queryParams.orderBy = column.prop + order;
	await queryList(removeEmptyAndNull(queryParams));
};

/**
 * 多选的值
 * @param val
 */
const multiSelect = (val) => {
	multiSelectValue.value = val;
};


/**
 * 获取动态图标
 * @param row 行数据
 * @param column 列定义
 */
const getIcon = (row: any, column: TableColumn) => {
	return row[column.prefixIcon];
};


/**
 * 允许父组件看到的数据
 */
defineExpose({ multiSelectValue, queryList, tableList })


const { layoutTheme } = useLayout();
/**
 * 计算属性，根据 layoutTheme.value.theme 的值返回对应的样式对象
 */
const tableHeaderStyles = computed(() => {
	switch (layoutTheme.value.theme) {
		case 'light'://浅色
			return {
				'--header-bg-color': '#F5F7FA',
				'--header-text-color': '#303133'
			};
			break;
		case 'dark': //深色
			break;
		case 'system': //自动
			break;
	}
});

/**
 * 计算表格的最终高度
 */
const tableHeight = computed(() => {
	if (paramsIsShow.value) {
		return `calc(100vh - 260px - ${kpTableQueryHeight})`;
	} else {
		return 'calc(100vh - 260px)';
	}
});

</script>

<style lang="scss" scoped>
.el-table {
	--el-table-border-color: #ffffff;
	--el-table-border: 1px solid #ebeef5;
}
:deep(.el-table__header th) {
	background-color: var(--header-bg-color);
	color: var(--header-text-color);
}

.switchStatus {
	--el-switch-on-color: #13ce66;
	--el-switch-off-color: #ff4949;
}

.action-buttons {
	display: flex;
	flex-wrap: nowrap; // 防止换行
	white-space: nowrap; // 防止内容换行
	overflow: visible; // 确保内容不被隐藏
}

.pagination {
	float: right;
	padding-bottom: 22px
}

.operate_button {
	width: 28px;
	height: 28px
}
</style>