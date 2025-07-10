<template>
    <el-container style="height: 100%">
        <el-aside style="width: 250px">
            <el-menu default-active="message" class="pure-account-settings-menu">
                <el-menu-item class="hover:!transition-all hover:!duration-200 hover:!text-base !h-[50px]" @click="router.go(-1)">
                    <div class="flex items-center">
                        <IconifyIconOnline icon="ep:arrow-left-bold" />
                        <span class="ml-2">返回</span>
                    </div>
                </el-menu-item>
                <div class="flex items-center ml-8 mt-4 mb-4">
					<KPAvatar :src="userInfo.avatar" :size="48" shape="circle" />
                    <div class="ml-4 flex flex-col max-w-[130px]">
                        <ReText class="font-bold !self-baseline">
                            {{ userInfo.nickName }}
                        </ReText>
                        <ReText class="!self-baseline" type="info">
                            {{ userInfo.jobNumber }}
                        </ReText>
                    </div>
                </div>
               <el-menu-item index="message" @click="menuIndex = 'message'">
                    <div class="flex items-center z-10">
                        <el-icon>
                            <IconifyIconOnline icon="ep:user" />
                        </el-icon>
                        <span>个人信息</span>
                    </div>
                </el-menu-item>
                <el-menu-item index="password" @click="menuIndex = 'password'">
                    <div class="flex items-center z-10">
                        <el-icon>
                            <IconifyIconOnline icon="ri:lock-password-line" />
                        </el-icon>
                        <span>修改密码</span>
                    </div>
                </el-menu-item>
                <el-menu-item index="record" @click="menuIndex = 'record'">
                    <div class="flex items-center z-10">
                        <el-icon>
                            <IconifyIconOnline icon="ri:bank-card-line" />
                        </el-icon>
                        <span>登录日志</span>
                    </div>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <div v-if="menuIndex == 'message'">
                <userMessage @refresh="onLoadPage" />
            </div>
            <div v-if="menuIndex == 'password'">
                <updatePassword @refresh="onLoadPage" />
            </div>
            <div v-if="menuIndex == 'record'">
                <loginRecord @refresh="onLoadPage" />
            </div>
        </el-main>
    </el-container>
</template>


<script setup lang="ts">
import userMessage from "./components/userMessage.vue";
import updatePassword from "./components/updatePassword.vue";
import loginRecord from "./components/loginRecord.vue";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { storageLocal } from "@pureadmin/utils";
import { userType } from "@/store/types";
import { userKey } from "@/utils/auth";
import Avatar from "@/assets/user.png";
import { ReText } from "@/components/ReText";
import KPAvatar from "@/components/UI/Input/KPAvatar.vue";


const router = useRouter();
const userInfo = ref<any>({});
const menuIndex = ref<string>("message");

onMounted(() => {
    queryUserMessage();
});

const queryUserMessage = async () => {
	userInfo.value = storageLocal().getItem<userType>(userKey);
	userInfo.value.avatar = userInfo.value.avatar == null ? Avatar : userInfo.value.avatar;
};
const onLoadPage = () => {
    router.go(0);
};

</script>

<style scoped>
.pure-account-settings-menu {
    background-color: transparent;
    height: 100%;
    
    .el-menu-item {
        height: 50px !important;
        color: #666666;
        background-color: transparent !important;
        transition: color 0.2s;
        
        &:hover {
            color: #000 !important;
        }
        
        &.is-active {
            color: #fff !important;
            
            &:hover {
                color: #fff !important;
            }
            
            &::before {
                position: absolute;
                inset: 0 8px;
                margin: 4px 0;
                clear: both;
                content: "";
                background: var(--el-color-primary);
                border-radius: 3px;
                color: #fff;
            }
        }
    }
}

body[layout] {
    .el-menu--vertical .is-active {
        color: #fff !important;
        transition: color 0.2s;
        
        &:hover {
            color: #fff !important;
        }
    }
}
</style>