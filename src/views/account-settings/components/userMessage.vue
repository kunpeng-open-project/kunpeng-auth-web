<template>
	<div style="margin-left: 10%; width: 70%">
		<h3 class="my-8">个人信息</h3>
		<KPForm :form-params="ruleForm" v-loading="loading" ref="ruleFormRef" :rules="rules" :is-border="true">
			<KPAvatar v-model="ruleForm.avatar" label="头像" :size="100" icon="UserFilled" shape="circle" :src="ruleForm.avatarShow" :uploadable="true" :enable-thumbnail="true" :thumbnail-size="400"/>
			<KPInputText v-model="ruleForm.realName" label="真实姓名" disabled/>
			<KPInputText v-model="ruleForm.idCard" label="身份证号" disabled/>
			<KPInputText v-model="ruleForm.jobNumber" label="工号" disabled/>
			<KPInputText v-model="ruleForm.deptNames" label="部门" disabled/>
			<KPInputText v-model="ruleForm.postNames" label="岗位" disabled/>
			<KPInputText v-model="ruleForm.nickName" label="昵称" prop="nickName"/>
			<KPInputText v-model="ruleForm.phoneNumber" label="手机号" prop="phoneNumber"/>
			<KPRadio v-model="ruleForm.sex" label="性别" prop="sex" :options="UserSexEnum"/>
			<KPInputText v-model="ruleForm.email" label="邮箱" prop="email"/>
		</KPForm>
		
		
		<div class="mb-4" style="text-align: center;margin-top: 50px">
			<el-button type="primary" :loading="loading" @click="handleSave" round>更 新 信 息</el-button>
		</div>
	</div>

</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { UserSexEnum } from "@/utils/data/serviceData";
import { postJson } from "@/api/common";
import { useUserStoreHook } from "@/store/modules/user";
import KPAvatar from "@/components/UI/Input/KPAvatar.vue";
import { message } from "@/utils/message";
import KPForm from "@/components/UI/Form/KPForm.vue";
import { storageLocal } from "@pureadmin/utils";
import { userType } from "@/store/types";
import { userKey } from "@/utils/auth";
import Avatar from "@/assets/user.png";

//项目数据结构
class DeptData {
	userId: string = null;
	realName: string = null;
	idCard: string = null;
	jobNumber: string = null;
	nickName: string = null;
	email: string = null;
	phoneNumber: string = null;
	sex: number = 0;
	avatar: string = null;
	avatarShow: string = null;
	deptNames: string = null;
	postNames: string = null;
};

const emit = defineEmits(["refresh"]);
//模态框等待框
const loading = ref(false);
// //表单数据
const ruleForm = reactive(new DeptData());
const ruleFormRef = ref<InstanceType<typeof KPForm> | null>(null);
const rules = reactive({
	nickName: [
		{ required: true, message: "请输入昵称", trigger: "blur" }
	],
	phoneNumber: [
		{ required: true, message: "请输入手机号", trigger: "blur" }
	],
	sex: [
		{ required: true, message: "请选择性别", trigger: "blur" }
	]
});


onMounted(() => {
	init(2);
});

const init = async (num) => {
	const { data } = await postJson("/auth/user/feedback/details", { userId: useUserStoreHook().userId });
	Object.keys(ruleForm).map(key => delete ruleForm[key]);
	Object.assign(ruleForm, data);
	ruleForm.avatarShow = ruleForm.avatar == null? Avatar : ruleForm.avatarShow;
	
	if (num == 1) {
		const userInfo = storageLocal().getItem<userType>(userKey);
		userInfo.nickName = data.nickName;
		userInfo.phoneNumber = data.phoneNumber;
		userInfo.sex = data.sex;
		userInfo.email = data.email;
		userInfo.avatar = ruleForm.avatarShow;
		storageLocal().setItem(userKey, userInfo);
		emit("refresh");
	}
};

const handleSave = async () => {
	const isValid = await ruleFormRef.value.validateForm();
	if (!isValid) return;
	
	loading.value = true;
	const { success } = await postJson("/auth/user/update/message", ruleForm);
	if (!success) {
		loading.value = false;
		return;
	}
	
	loading.value = false;
	init(1);
	message("操作成功", { type: "success" });
};

</script>