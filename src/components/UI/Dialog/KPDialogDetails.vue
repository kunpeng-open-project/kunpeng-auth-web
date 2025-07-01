<template>
	<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			:modal="true"
			center draggable
			:width="width"
			:destroy-on-close="true"
			close-on-press-escape="false"
			:show-close="false"
			:close-on-click-modal="false"
			:fullscreen="dialogFulls"
			:top="top"
	>
		
		<template #header>
			<el-row :gutter="20">
				<el-col :span="12" style="text-align: left">
					{{ dialogTitle }}
				</el-col>
				<el-col :span="12" style="text-align: right; margin-top: -10px">
					<el-button size="large" :title="dialogFulls ? '最小化' : '最大化'" text circle @click="handleFulls">
						<IconifyIconOnline :icon="dialogFulls ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'"/>
					</el-button>
					<el-button icon="Close" size="large" title="关闭" text circle style="margin-left: -8px" @click="dialogVisible = false"/>
				</el-col>
			</el-row>
		</template>
		<el-scrollbar :max-height="dialogFulls?'calc(100vh - 130px)':'70vh'">
			<div class="dialog-body" v-loading="dialogLoading">
				<el-descriptions :column="column" :border="border" class="t_detail" :style="{'--label-width': labelWidth}">
					<el-descriptions-item label-align="right" :label-width="labelWidth" v-for="(item, index) in detailsColumn" :key="index" :label="item.label" :span="item.span?item.span:1">
						<!--
												<template #label v-if="item.ability">
													<div class="cell-item">
														<el-button v-if="item.ability.includes('copy')" size="large" title="复制" link circle @click="handleCopy(detailsMessage[item.prop])" type="primary">
															<IconifyIconOnline icon="ri:file-copy-2-line" style="font-size: 20px" />
														</el-button>
														<el-button v-if="item.ability.includes('formatJson')" size="large"  :title="formattedFieldTitles[item.prop]"  link circle type="success" @click="handleFormatJson(item.prop)">
															<IconifyIconOnline :icon="parameterFormat?'ri:information-line':'ri:format-clear'" style="font-size: 20px" />
														</el-button>
														{{ item.label }}
													</div>
												</template>
												-->
						<KPButton v-if="item.ability && item.ability.includes('formatJson')" :content="formattedFieldTitles[item.prop]" type="success" :icon="formattedFieldTitles[item.prop]==='格式化'?'ri:code-box-fill':'ri:code-box-line'" link @click="handleFormatJson(item.prop)"/>
						<KPButton v-if="item.ability && item.ability.includes('copy')" content="复制" icon="ri:file-copy-2-line" link @click="handleCopy(detailsMessage[item.prop])"/>
						
						<pre v-if="item.ability && item.ability.includes('formatJson') && formattedFieldTitles[item.prop]==='取消格式化'">{{ item.render? item.render[detailsMessage[item.prop]] : item.isList? (detailsMessage[item.prop] && detailsMessage[item.prop].length > 0? detailsMessage[item.prop].join(', ') : '') + '&nbsp;&nbsp;' + (item.suffix? item.suffix : '') : (detailsMessage[item.prop]? detailsMessage[item.prop] : '') + '&nbsp;&nbsp;' + (item.suffix? item.suffix : '') }}</pre>
						<div v-else>
							{{
								item.render?
										item.render[detailsMessage[item.prop]] :
										item.isList?
												(detailsMessage[item.prop] && detailsMessage[item.prop].length > 0? detailsMessage[item.prop].join(', ') : '') + '&nbsp;&nbsp;' + (item.suffix? item.suffix : '') :
												(detailsMessage[item.prop]? detailsMessage[item.prop] : '') + '&nbsp;&nbsp;' + (item.suffix? item.suffix : '')
							}}
						</div>
					</el-descriptions-item>
				</el-descriptions>
			</div>
		</el-scrollbar>
		
		
		<template #footer>
			<div :class="dialogFulls ? 'dialog-footer-full':'dialog-footer'">
				<el-button @click="dialogVisible = false">关 闭</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup name="KPDialogDetails">
import { computed, ref } from "vue";
import { queryTableDetails } from "@/api/table";
import { Emitter } from "mitt";
import { DetailsColumn } from "@/utils/data/systemData";
import { message } from "@/utils/message";


// 接收父组件的值
const props = withDefaults(defineProps<{
	eventBus: Emitter<any>, // 事件总线实例
	modelValue: boolean, // 通过 v-model 传递的值
	title: string, // 对话框标题
	tableKey: string, //tableList  主键的key
	detailsApi: string, //详情接口地址
	width?: string, // 对话框宽度  用允许用%
	labelWidth?: string, //文本框说明文字宽度 用允许用px
	detailsColumn: Array<DetailsColumn>, //详情数据列
	column?: number, //详情数据列的列数
	border?: boolean, //详情数据列的边框
	top?: string // top 对话框距离顶部的距离
}>(), {
	border: true,
	column: 2,
	labelWidth: "100px",
	width: "50%",
	top: "15vh",
});

// 接收父组件的值 变成普通数据
let {
	eventBus,
	detailsApi,
	tableKey,
	column,
} = props;

//接收父组件的值 变成 ref数据
const dialogTitle = ref<string>(props.title);
// 定义 emits
const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
}>();

//模态框是否全屏
const dialogFulls = ref<boolean>(false);
//模态框等待框
const dialogLoading = ref<boolean>(false);
//查询后台接口详情内容
const detailsMessage = ref<any>({});
//入参格式化
const formattedFieldTitles = ref<Array<any>>([]);
// 详情数据列宽度
// alert( parseInt(props.labelWidth.replace("px", "")))
// alert()
// alert((document.documentElement.clientWidth * (parseInt(props.width.replace("%", "")) / 100))  - parseInt(props.labelWidth.replace("px", "")))
// const descriptionsWidth = ref<string>((document.documentElement.clientWidth * (parseInt(props.width.replace("%", "")) / 100) / column - parseInt(props.labelWidth.replace("px", "")) + "px");
// const descriptionsWidth = ref<string>((document.documentElement.clientWidth * (parseInt(props.width.replace("%", "")) / 100))/ column - parseInt(props.labelWidth.replace("px", "")) + "px");
/**
 * 模态框最大化 或者最小化
 */
const handleFulls = () => {
	dialogFulls.value = !dialogFulls.value;
	// if (dialogFulls.value) {
	// 	descriptionsWidth.value = document.documentElement.clientWidth / column - parseInt(props.labelWidth.replace("px", "")) + "px";
	// } else {
	// 	descriptionsWidth.value = (document.documentElement.clientWidth * (parseInt(props.width.replace("%", ""))) / 100) / column - parseInt(props.labelWidth.replace("px", "")) + "px";
	// }
};

/**
 * 复制
 * @param title
 */
const handleCopy = async (title: string) => {
	try {
		await navigator.clipboard.writeText(title);
		message("复制成功！", { type: "success" });
	} catch (err) {
		const textArea = document.createElement('textarea');
		textArea.value = title;
		textArea.style.position = 'fixed';
		textArea.style.opacity = '0';
		document.body.appendChild(textArea);
		// 选中文本并执行复制命令
		textArea.select();
		const success = document.execCommand('copy');
		document.body.removeChild(textArea);
		if (success) {
			message("复制成功！", { type: "success" });
		} else {
			message("复制失败！", { type: "error" });
		}
	}
};

/**
 * 格式化json
 * @param lable
 */
const handleFormatJson = async (lable: string) => {
	if (formattedFieldTitles.value[lable] === "格式化") {
		detailsMessage.value[lable] = JSON.stringify(JSON.parse(detailsMessage.value[lable]), null, 4);
		formattedFieldTitles.value[lable] = "取消格式化";
	} else {
		detailsMessage.value[lable] = JSON.stringify(JSON.parse(detailsMessage.value[lable]));
		formattedFieldTitles.value[lable] = "格式化";
	}
};

/**
 * 生产者 对外授权
 */
eventBus.on('openDetailsDialog', async (row: any) => {
	dialogVisible.value = true;
	dialogLoading.value = true;
	Object.keys(detailsMessage.value).map(key => delete detailsMessage.value[key]);
	
	const body = await queryTableDetails(detailsApi, { [tableKey]: row[tableKey] });
	if (body.success) detailsMessage.value = body.data;
	
	props.detailsColumn.forEach(item => {
		formattedFieldTitles.value[item.prop] = "格式化";
	});
	dialogLoading.value = false;
});

// 使用计算属性实现双向绑定
const dialogVisible = computed({
	get() {
		if (props.modelValue) {
			dialogFulls.value = false;
			// descriptionsWidth.value = (document.documentElement.clientWidth * (parseInt(props.width.replace("%", ""))) / 100) / column - parseInt(props.labelWidth.replace("px", "")) + "px";
		}
		return props.modelValue;
	},
	set(newValue: boolean) {
		emit('update:modelValue', newValue);
	}
});

</script>

<style lang="scss" scoped>
.dialog-footer-full {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: white;
	padding: 10px;
	/*border-top: 1px solid #e4e7ed;*/
	/*text-align: right;*/
}

:deep(.is-horizontal) {
	display: none !important;
}

.t_detail {
	:deep(.el-descriptions__label) {
		width: var(--label-width) !important;
		flex: 0 0 var(--label-width) !important;
	}
	
	/*
	:deep(.el-descriptions__label) {
		font-weight: bold;
		width: 160px;
	}
	
	:deep(.el-descriptions__column) {
		flex-basis: calc(100% / 4); !* 假设你有三列 *!
		color: red;
	}
	*/
	:deep(.el-descriptions__table) {
		table-layout: fixed;
	}
	
	:deep(.el-descriptions__cell) {
		word-break: break-all;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>