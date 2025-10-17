<template>
  <div class="main">
    <KPTableQuery :event-bus="mitt()" :query-params="queryParams" :is-button="false">
      <KPSwitch v-model="queryParams.openDynamicServer" active-text="开启" inactive-text="未开启" label="是否开启动态监控" :span="18" @click="handleSwitchStatus" />
      <KPSelectApi v-model="queryParams.serverName" label="服务器" api="/api/nacos/register/select" defaultValue="authentication" :span="6" @change="handleChange" @firstDefaultChange="handleChange" />
    </KPTableQuery>

    <el-row v-loading="loading" :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="my-card">
          <p class="card-header">主机信息</p>

          <div style="height: 376px">
            <div class="left-right-layout">
              <div class="left-layout">
                <IconifyIconOnline icon="fa-solid:server" class="icon" />
                OS
              </div>
              <div class="right-layout">{{ (service.sys?.osName || "") + " / " + (service.sys?.osArch || "") }}</div>
            </div>

            <div class="left-right-layout">
              <div class="left-layout">
                <IconifyIconOnline icon="ri:cpu-line" class="icon" />
                CUP
              </div>
              <div class="right-layout">{{ service.cpu?.all || "" }}</div>
            </div>
            <el-progress :percentage="Number((service.cpu?.all || '').replace('%', '')) || 0" color="#10B981" :show-text="false" />
            <span class="foot-layout">{{ service.cpu?.cpuNum || "" }}</span>

            <div class="left-right-layout">
              <div class="left-layout">
                <IconifyIconOnline icon="fa-solid:memory" class="icon" />
                系统内存
              </div>
              <div class="right-layout">{{ service.mem?.usedRate || "" }}</div>
            </div>
            <el-progress :percentage="Number((service.mem?.usedRate || '').replace('%', '')) || 0" color="#3B82F6" :show-text="false" />
            <span class="foot-layout">({{ (service.mem?.used || "") + " / " + (service.mem?.total || "") }})</span>

            <div class="left-right-layout">
              <div class="left-layout">
                <IconifyIconOnline icon="ri:list-settings-line" class="icon" />
                JVM内存
              </div>
              <div class="right-layout">{{ service.jvm?.usedRate || "" }}</div>
            </div>
            <el-progress :percentage="Number((service.jvm?.usedRate || '').replace('%', '')) || 0" color="#60A5FA" :show-text="false" />
            <span class="foot-layout">({{ (service.jvm?.used || "") + " / " + (service.jvm?.total || "") }})</span>

            <div class="left-right-layout">
              <div class="right-layout">java名称</div>
              <div class="right-layout">{{ service.jvm?.javaName }}</div>
            </div>

            <div class="left-right-layout">
              <div class="right-layout">java版本</div>
              <div class="right-layout">{{ service.jvm?.javaVersion }}</div>
            </div>

            <div class="left-right-layout">
              <div class="left-layout">
                <IconifyIconOnline icon="ri:timer-line" class="icon" />
                应用启动时间
              </div>
              <div class="right-layout">{{ service.jvm?.javaStartTime }}</div>
            </div>

            <div class="left-right-layout">
              <div class="left-layout">应用运行时间</div>
              <div class="right-layout">{{ service.jvm?.javaRunTime }}</div>
            </div>

            <div class="left-right-layout">
              <div class="left-layout">
                <IconifyIconOnline icon="fa-solid:folder-open" class="icon" />
                安装路径
              </div>
              <div class="right-layout">{{ service.jvm?.javaPath }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover" class="my-card">
              <p class="card-header">服务器信息</p>

              <div class="stat-container">
                <div class="stat-item">
                  <p class="stat-label">服务器名称</p>
                  <p class="stat-value">{{ service.sys?.computerName }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">服务器IP</p>
                  <p class="stat-value">{{ service.sys?.computerIp }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">操作系统</p>
                  <p class="stat-value">{{ service.sys?.osName }}</p>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover" class="my-card">
              <p class="card-header">jvm内存</p>

              <div class="stat-container">
                <div class="stat-item">
                  <p class="stat-label">总内存</p>
                  <p class="stat-value">{{ service.jvm?.total }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">已用内存</p>
                  <p class="stat-value">{{ service.jvm?.used }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">使用率</p>
                  <p class="stat-value">{{ service.jvm?.usedRate }}</p>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover" class="my-card">
              <p class="card-header">CPU</p>

              <div class="stat-container">
                <div class="stat-item">
                  <p class="stat-label">核心数</p>
                  <p class="stat-value">{{ service.cpu?.cpuNum }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">总使用率</p>
                  <p class="stat-value">{{ service.cpu?.all }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">系统使用率</p>
                  <p class="stat-value">{{ service.cpu?.sys }}</p>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover" class="my-card">
              <p class="card-header">系统内存</p>

              <div class="stat-container">
                <div class="stat-item">
                  <p class="stat-label">总内存</p>
                  <p class="stat-value">{{ service.mem?.total }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">已用内存</p>
                  <p class="stat-value">{{ service.mem?.used }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">使用率</p>
                  <p class="stat-value">{{ service.mem?.usedRate }}</p>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover" class="my-card">
              <p class="card-header">磁盘吞吐量</p>

              <div class="stat-container">
                <div class="stat-item">
                  <p class="stat-label">读取/秒</p>
                  <p class="stat-value">{{ service.diskIo?.totalReadRate }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">写入/秒</p>
                  <p class="stat-value">{{ service.diskIo?.totalWriteRate }}</p>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card shadow="hover" class="my-card">
              <p class="card-header">网络</p>

              <div class="stat-container">
                <div class="stat-item">
                  <p class="stat-label">上行速率/秒</p>
                  <p class="stat-value">{{ service.netIo?.totalDownRate }}</p>
                </div>
                <div class="stat-item">
                  <p class="stat-label">下行速率/秒</p>
                  <p class="stat-value">{{ service.netIo?.totalUpRate }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <el-col :span="24">
        <el-card shadow="hover" class="my-card">
          <p class="card-header">磁盘信息</p>

          <el-table :data="service.sysFiles" :header-cell-style="{ 'text-align': 'center' }" :cell-style="{ 'text-align': 'center' }">
            <el-table-column prop="dirName" label="盘符路径" />
            <el-table-column prop="sysTypeName" label="盘符类型" />
            <el-table-column prop="typeName" label="文件类型" />
            <el-table-column prop="total" label="总大小" />
            <el-table-column prop="free" label="剩余大小" />
            <el-table-column prop="used" label="已经使用量" />
            <el-table-column prop="usage" label="资源的使用率" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, ref } from "vue"

import mitt from "mitt"
import { postJson } from "@/api/common"
import { serverPath } from "@/utils/serverPath"
import { message } from "@/utils/message"

const queryParams = reactive({
  serverName: null as string | null,
  openDynamicServer: null as boolean | null
})

// 服务信息
const service = ref<any>({})
// 加载等待框
const loading = ref(false)
// 定时器引用：轮询定时器（3秒查一次）、自动停止定时器（5分钟后关闭）
let pollTimer: NodeJS.Timeout | null = null

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})

const handleChange = async (value: string | number) => {
  loading.value = true
  await queryService(value)
  loading.value = false
}

const queryService = async (value: string | number) => {
  postJson("/open/server/system/message", {}, serverPath.gateway + value)
    .then(data => {
      service.value = data.data ?? {}
    })
    .catch(async () => {
      message("请求网关地址失败！已切换到鉴权系统查询模式，该模式下仅支持统计鉴权系统数据。网关地址：" + serverPath.gateway, { type: "warning" })
      let { data } = await postJson("/open/server/system/message", {})
      service.value = data ?? {}
    })
}

/**
 * 处理服务监控开关状态切换
 */
const handleSwitchStatus = async () => {
  if (queryParams.openDynamicServer) {
    await queryService(queryParams.serverName)
    pollTimer = setInterval(async () => {
      await queryService(queryParams.serverName)
    }, 3000)
  } else {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center; // 关键：让标题文字和开关垂直居中对齐
  justify-content: space-between; // 左右布局（替代原 left-right-layout）
  height: 1px;
  margin-bottom: 20px;
  font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
  font-size: 13px;
  font-weight: 550;
}

.left-right-layout {
  display: flex;
  justify-content: space-between;
  padding-top: 14px;

  .left-layout {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: #909595;
  }

  .right-layout {
    font-size: 12px;
    color: #1f2937;
  }

  .icon {
    font-size: 15px;
    color: #3b82f6;
  }
}

.foot-layout {
  font-size: 12px;
  color: #89898c;
}

.stat-container {
  display: flex;
  align-items: center; /* 垂直居中（若内容高度不一致时生效） */
  justify-content: space-around; /* 项之间均匀分布，也可用 space-between */
  width: 100%; /* 占满父容器宽度 */

  /* padding: 16px 0; !* 上下内边距，增加呼吸感 *! */

  /*  background-color: #fff; !* 背景色，按需调整 *! */

  /* border-radius: 8px; !* 可选：圆角 *! */

  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); !* 可选：阴影 *! */
  height: 70px;
  overflow: hidden;

  .stat-item {
    padding: 0 8px;
    text-align: center; /* 内部文字居中 */
  }

  .stat-label {
    margin-bottom: 10px; /* 标签与值之间的间距 */
    font-size: 13px;
    color: #909595; /* 浅色调，按需调整 */
  }

  .stat-value {
    margin: 0;
    overflow: hidden; /* 新增，超出部分隐藏 */
    font-size: 14px;
    font-weight: 500;
    color: #2e2d2f;
    text-overflow: ellipsis; /* 新增，超出部分显示省略号 */
    white-space: nowrap; /* 新增，禁止文本换行 */
  }
}

.my-card {
  margin-bottom: 20px;
}
</style>
