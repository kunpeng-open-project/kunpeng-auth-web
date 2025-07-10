<template>
	<div style="margin-left: 10%; width: 70%">
		<h3 class="my-8">修改密码</h3>
		<KPForm :form-params="ruleForm" v-loading="loading" ref="ruleFormRef" :rules="rules" :is-border="true">
			<KPInputText v-model="ruleForm.oldPassword" label="旧密码" prop="oldPassword"/>
			<KPInputText v-model="ruleForm.newPassword" label="新密码" prop="newPassword"/>
			<KPInputText v-model="ruleForm.okPassword" label="确认密码" prop="okPassword"/>
		</KPForm>
		
		<div class="mb-4" style="text-align: center;margin-top: 50px">
			<el-button type="primary" :loading="loading" @click="handleSave" round>更 新 信 息</el-button>
		</div>
	</div>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
import { message } from "@/utils/message";
import { useUserStoreHook } from "@/store/modules/user";
import { postJson } from "@/api/common";
import KPForm from "@/components/UI/Form/KPForm.vue";

//项目数据结构
class DeptData {
	userId: string = null;
	oldPassword: string = null;
	newPassword: string = null;
	okPassword: string = null;
};

//模态框等待框
const loading = ref(false);
//表单数据
const ruleForm = reactive(new DeptData());

const ruleFormRef = ref<InstanceType<typeof KPForm> | null>(null);

const rules = reactive({
	oldPassword: [
		{ required: true, message: "请输入老密码", trigger: "blur" }
	],
	newPassword: [
		{ required: true, message: "请输入新密码", trigger: "blur" }
	],
	okPassword: [
		{ required: true, message: "请输入确认密码", trigger: "blur" }
	]
});
const handleSave = async () => {
	const isValid = await ruleFormRef.value.validateForm();
	if (!isValid) return;
	
	loading.value = true;
	ruleForm.userId = useUserStoreHook().userId;
	const { success } = await postJson("/auth/user/update/password", ruleForm);
	if (!success) {
		loading.value = false;
		return;
	}
	
	loading.value = false;
	
	Object.keys(ruleForm).map(key => delete ruleForm[key]);
	useUserStoreHook().logOut();
	message("密码修改成功，请重新登录", { type: "success" });
};

</script>