<template>
  <!-- 外层行容器：控制卡片横向排列 -->
  <el-row :gutter="gutter">
    <!-- 循环渲染卡片：栅格属性、间距、高度均由props控制 -->
    <el-col v-for="(card, index) in cardList" :key="index" :span="span" :xs="xs" :sm="sm" :md="md" :lg="lg" :xl="xl" style="margin-bottom: 10px">
      <el-card :shadow="cardShadow" :style="`height: ${cardHeight}; border-radius: ${borderRadius}`">
        <!-- 卡片标题+图标 -->
        <div class="cardTitle">
          {{ card.title }}
          <div class="icon-wrapper" :style="`background-color: ${card.iconBackgroundColor}`">
            <IconifyIconOnline :icon="card.icon" :style="`color: ${card.iconColor}`" />
          </div>
        </div>

        <!-- 卡片内容区：插槽传递卡片数据 -->
        <el-col :span="24" style="margin-top: -10px">
          <slot name="cardContent" :card="card" :index="index" />
        </el-col>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang="ts" setup name="KPInfoCard">
// 2. 按要求格式定义props + 默认值（与搜索组件风格一致）
import { CardItem } from "@/utils/data/systemData"

const props = withDefaults(
  defineProps<{
    cardList: CardItem[] // 核心配置：卡片数据数组（必传，无默认值）
    gutter?: number // 卡片之间间距
    span?: number // 栅格布局占比（可选，默认6）
    xs?: number | string // 超小屏幕占比
    sm?: number | string // 小屏幕占比
    md?: number | string // 中屏幕占比
    lg?: number | string // 大屏幕占比
    xl?: number | string // 超大屏幕占比
    borderRadius?: string // 卡片圆角

    // 卡片容器配置
    cardHeight?: string // 卡片高度
    cardShadow?: "always" | "hover" | "never" // 卡片阴影
  }>(),
  {
    gutter: 25,
    // span: 5,
    borderRadius: "5px",
    colMarginBottom: "20px",
    cardShadow: "hover"
  }
)
</script>

<style lang="scss" scoped>
// 统一字体风格，与搜索组件保持一致
.cardTitle {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 540;
  font-family: "Arial", sans-serif;

  // 字体渐变效果，与搜索组件相同
  background: linear-gradient(to bottom, rgb(128, 128, 128), black);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
}

// 图标外层包裹容器样式，实现圆形背景
.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-col-5 {
  width: 20%;
  max-width: 20%;
  flex: 0 0 20%;
}
</style>
