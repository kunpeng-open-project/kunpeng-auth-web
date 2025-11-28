<template>
  <div class="main">
    <el-row :gutter="30">
      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6" style="margin-bottom: 20px">
        <el-card style="height: 145px">
          <p class="cardTitle">
            用户信息
            <IconifyIconOnline icon="fa-solid:user-alt" :style="cardStyle()" />
          </p>

          <el-row>
            <el-col :span="12">
              <!-- 修复：昵称是字符串，使用文本展示而非统计组件 -->
              <div class="statistic-custom">
                <div class="statistic-label">昵称</div>
                <div class="statistic-value">{{ nickName }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <el-statistic style="color: red" title="工号" :value="jobNumber" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6" style="margin-bottom: 20px">
        <el-card style="height: 145px">
          <p class="cardTitle">
            当前时间
            <IconifyIconOnline icon="ep:timer" style="color: #41b6ff; float: right; font-size: 24px" />
          </p>
          <!-- 修复：当前时间和星期都是字符串，使用文本展示 -->
          <div class="statistic-custom">
            <div class="statistic-value">{{ formattedTime }}</div>
            <div class="statistic-label">{{ currentWeekday }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6" v-for="item in loginViveNumber" :key="item.projectName" style="margin-bottom: 20px">
        <el-card style="height: 145px">
          <p class="cardTitle">
            {{ item.projectName }}
            <IconifyIconOnline icon="fa-solid:users" :style="cardStyle()" />
          </p>
          <el-row>
            <el-col :span="12">
              <el-statistic style="color: red" title="今日登录用户" :value="item.todayLoginNumber" />
            </el-col>
            <el-col :span="12">
              <el-statistic title="活跃用户" :value="item.activeLoginNumber" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="30">
      <el-col :xs="24" :sm="24" :md="12" :lg="18" :xl="18">
        <el-card style="margin-bottom: 20px">
          <template #header>
            <div class="card-header">
              <span>用户登录次数统计</span>
            </div>
          </template>
          <div id="userLoginChart" style="height: 400px" v-loading="loginRecordStatisticsLoading" />
        </el-card>

        <el-card style="margin-bottom: 20px">
          <template #header>
            <div class="card-header">
              <span>接口调用次数</span>
            </div>
          </template>
          <div id="interfaceChart" style="height: 400px" v-loading="interfaceCallStatisticsLoading" />
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
        <el-card style="margin-bottom: 20px">
          <template #header>
            <div class="card-header">
              <span>登录记录</span>
            </div>
          </template>
          <el-scrollbar height="400px" v-loading="loginRecordLoading">
            <el-timeline>
              <el-timeline-item v-for="(item, index) in loginViveRecord" :key="index" :color="item.color" :hollow="item.hollow" :timestamp="item.loginDate">
                {{ item.body }}
              </el-timeline-item>
            </el-timeline>
          </el-scrollbar>
        </el-card>

        <el-card style="margin-bottom: 20px">
          <template #header>
            <div class="card-header">
              <span>注意事项</span>
            </div>
          </template>

          <div style="height: 170px" class="bodyExplain">
            <p>显示器：推荐分辨率1920*1080及以上（建议使用推荐百分百）</p>
            <p>浏览器：推荐使用谷歌、火狐、Edge等主流浏览器</p>
            <p>如果您觉得框架不错，打赏一点，开源不易</p>
          </div>
        </el-card>

        <el-card style="margin-bottom: 20px">
          <template #header>
            <div class="card-header">
              <span>技术支持</span>
            </div>
          </template>
          <div style="height: 108px" class="bodyExplain">
            <p>作者：李鹏</p>
            <p>Q Q：920297199</p>
            <p>邮箱：920297199@qq.com</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import { postJson } from "@/api/common"
import { now, queryWeekChinese } from "@/utils/kp/tool/date"
import { generateRandomColor } from "@/utils/kp/tool/color"
import { storageLocal } from "@/store/utils"
import { userKey } from "@/utils/auth"
import { barChartByGroups, barChartBySingle } from "@/utils/kp/tool/echarts"

// 当前时间
const formattedTime = ref(now())
// 当前星期
const currentWeekday = ref<string>(queryWeekChinese(true))
// 日期定时器
let timer: ReturnType<typeof setInterval> | null = null
// 登录数量记录
const loginViveNumber = ref<Array<{ projectName: string; todayLoginNumber: number; activeLoginNumber: number }>>([
  {
    projectName: "鉴权系统",
    todayLoginNumber: 0,
    activeLoginNumber: 0
  },
  {
    projectName: "周汇通",
    todayLoginNumber: 0,
    activeLoginNumber: 0
  }
])

// 修复：获取用户信息时增加类型校验
const userInfo = storageLocal().getItem(userKey) || {}
const nickName = ref(userInfo.nickName || "未知用户")
const jobNumber = ref(Number(userInfo.jobNumber) || 0) // 确保工号为数字类型

// 加载状态
const loginRecordStatisticsLoading = ref(true)
const interfaceCallStatisticsLoading = ref(true)
const loginRecordLoading = ref(true)
// 登录记录
const loginViveRecord = ref<Array<any>>([])

onMounted(async () => {
  loginNumber()
  loginRecordStatistics()
  interfaceCallStatistics()
  loginRecord()

  // 设置定时器，每秒更新时间
  timer = setInterval(() => {
    formattedTime.value = now()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

/**
 * 查询登录数量
 */
const loginNumber = async () => {
  const loginNumber = await postJson("/auth/welcome/login/number", ["authentication", "weekFlow"])
  if (!loginNumber.success) return
  loginViveNumber.value = loginNumber.data

  loginViveNumber.value.forEach((item: any) => {
    // 修复：确保数字类型正确
    item.todayLoginNumber = Number(item.todayLoginNumber) || 0
    item.activeLoginNumber = Number(item.activeLoginNumber) || 0

    if (item.todayLoginNumber > 0) {
      let loginNumber = item.todayLoginNumber
      item.todayLoginNumber = 0
      let loginNumberInterval = setInterval(
        () => {
          item.todayLoginNumber += 1
          if (item.todayLoginNumber >= loginNumber) clearInterval(loginNumberInterval)
        },
        loginNumber / 200 > 1 ? loginNumber / 200 : 200 / loginNumber
      )
    }

    if (item.activeLoginNumber > 0) {
      let activeNumber = item.activeLoginNumber
      item.activeLoginNumber = 0
      let activeLoginNumberInterval = setInterval(
        () => {
          item.activeLoginNumber += 1
          if (item.activeLoginNumber >= activeNumber) clearInterval(activeLoginNumberInterval)
        },
        activeNumber / 80 > 1 ? activeNumber / 80 : 80 / activeNumber
      )
    }
  })
}

/**
 * 查询用户登录次数统计
 */
const loginRecordStatistics = async () => {
  loginRecordStatisticsLoading.value = true
  const loginRecordStatistics = await postJson("/auth/welcome/login/record/statistics", {})
  if (!loginRecordStatistics.success) return
  let xdate: Array<string> = []
  let ydate: Array<number> = []
  loginRecordStatistics.data.forEach((item: any) => {
    xdate.push(item.createDate)
    ydate.push(Number(item.number) || 0) // 确保为数字
  })
  loginRecordStatisticsLoading.value = false
  barChartBySingle("userLoginChart", "#62CBFC", "人数", xdate, ydate, 300)
}

class barChartByGroupsSeries {
  name: string = ""
  type: string = "bar"
  data: any = null
  markPoint: any = {
    data: [
      { type: "max", name: "Max" },
      { type: "min", name: "Min" }
    ]
  }
  markLine: any = {
    data: [{ type: "average", name: "Avg" }]
  }
}

/**
 * 接口调用次数
 */
const interfaceCallStatistics = async () => {
  interfaceCallStatisticsLoading.value = true
  const interfaceCallStatistics = await postJson("/auth/welcome/interface/call/statistics", {})
  if (!interfaceCallStatistics.success) return
  let series: any[] = []
  let xdata: any[] = []
  interfaceCallStatistics.data.forEach((item: any) => {
    let datas: any = new barChartByGroupsSeries()
    xdata = item.callTime
    datas.name = item.projectName
    datas.data = item.number.map((n: any) => Number(n) || 0) // 确保为数字数组
    series.push(datas)
  })
  const colors = ["#62CBFC", "#F5967A", "#26CE83", "#7847E5", "#E09C51"]
  interfaceCallStatisticsLoading.value = false
  barChartByGroups("interfaceChart", colors, "次", xdata, series)
}

/**
 * 查询登录记录
 */
const loginRecord = async () => {
  loginRecordLoading.value = true
  const loginRecord = await postJson("/auth/welcome/login/record", {})
  if (!loginRecord.success) return
  loginViveRecord.value = loginRecord.data
  loginViveRecord.value.forEach((item: any) => {
    item.color = generateRandomColor()
    item.hollow = true
  })
  loginRecordLoading.value = false
}

const cardStyle = () => {
  return {
    color: generateRandomColor(),
    float: "right",
    "font-size": "24px"
  }
}
</script>

<style lang="scss" scoped>
.cardTitle {
  color: #303133;
  font-size: 20px;
  font-weight: 540;
  font-family: "Arial", sans-serif;

  background: linear-gradient(to bottom, rgb(128, 128, 128), black);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
}

.cardBody {
  text-align: center;
  margin-top: 5px;
  font-size: 22px;
  background: linear-gradient(to bottom, #837e29, #303133);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
}

.bodyExplain {
  background: linear-gradient(to bottom, #123133, black);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  font-size: 15px;
  line-height: 30px;
}

// 新增：自定义统计样式，保持与原组件一致的视觉效果
.statistic-custom {
  text-align: center;
  padding: 10px 0;

  .statistic-label {
    font-size: 16px;
    margin-bottom: 10px;
    background: linear-gradient(to bottom, #837e29, #303133);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }

  .statistic-value {
    font-size: 20px;
    background: linear-gradient(to bottom, #837e29, #303133);
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }
}

:deep(.el-statistic__head) {
  font-size: 16px;
  margin-top: 10px;
  text-align: center;
  background: linear-gradient(to bottom, #837e29, #303133);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
}

:deep(.el-statistic__content) {
  font-size: 20px;
  margin-top: 10px;
  text-align: center;
  background: linear-gradient(to bottom, #837e29, #303133);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
}

.t_detail {
  :deep(.el-descriptions__label) {
    width: 160px;
    float: left;
  }

  :deep(.el-descriptions__cell) {
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    border: none;
    border-bottom: #ebeef5 1px solid;
  }
}
</style>
