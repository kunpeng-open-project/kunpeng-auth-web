import dayjs from "dayjs"

/**
 * 获取当前星期
 * @param isChinese  是否是中文 true  中文
 */
export function queryWeekChinese(isChinese: boolean) {
  if (isChinese) return translateWeekday(dayjs().format("dddd"))
  return dayjs().format("dddd")
}

/**
 * 获取当前时间
 * @param format 格式化
 */
export function now(format?: string) {
  if (format) {
    return dayjs().format(format)
  } else {
    return dayjs().format("YYYY-MM-DD HH:mm:ss")
  }
}

/**
 * 获取当前月的月初日期
 */
export function monthStart() {
  return dayjs().startOf("month").format("YYYY-MM-DD")
}

/**
 * 获取当前月的月末日期
 */
export function monthEnd() {
  return dayjs().endOf("month").format("YYYY-MM-DD")
}

/**
 * 获取指定月份的第一天
 * @param {string} yearMonth - 指定年月，格式为'YYYY-MM'（如'2024-06'）
 * @returns {string} 该月份第一天，格式为'YYYY-MM-DD'
 */
export function getMonthFirstDay(yearMonth) {
  return dayjs(yearMonth).startOf("month").format("YYYY-MM-DD")
}

/**
 * 获取指定月份的最后一天
 * @param {string} yearMonth - 指定年月，格式为'YYYY-MM'（如'2024-06'）
 * @returns {string} 该月份最后一天，格式为'YYYY-MM-DD'
 */
export function getMonthLastDay(yearMonth) {
  return dayjs(yearMonth).endOf("month").format("YYYY-MM-DD")
}

/**
 * 转换成中文
 * @param weekday
 */
const translateWeekday = weekday => {
  const mapping = {
    Sunday: "周日",
    Monday: "周一",
    Tuesday: "周二",
    Wednesday: "周三",
    Thursday: "周四",
    Friday: "周五",
    Saturday: "周六"
  }
  return mapping[weekday] || weekday
}

/**
 * 将指定月份按周拆分，每周只包含当月的日期
 * @param year 年份 (如: 2025)
 * @param month 月份 (1-12)
 * @returns 每周数据，格式: { weekNumber: number, start: Date, end: Date, label: string }
 */
export function splitMonthIntoWeeks(year: number, month: number) {
  // 验证输入参数
  if (month < 1 || month > 12) {
    throw new Error("月份必须在1到12之间")
  }

  const weeks: Array<{ title: string; start: string; end: string }> = []

  // 获取月份的第一天和最后一天
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)

  // 获取第一周的开始日期（周一）
  let currentDate = new Date(firstDayOfMonth)
  const firstDayWeekday = firstDayOfMonth.getDay()

  // 将周日(0)转换为7，周一为1，以此类推
  const normalizedFirstDayWeekday = firstDayWeekday === 0 ? 7 : firstDayWeekday

  // 调整到本周的周一
  currentDate.setDate(currentDate.getDate() - (normalizedFirstDayWeekday - 1))

  // 中文数字映射
  const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六']

  // 循环直到处理完整个月份
  while (currentDate <= lastDayOfMonth || currentDate.getMonth() === month - 1) {
    const weekStart = new Date(currentDate)
    const weekEnd = new Date(currentDate)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // 调整开始日期，确保不早于月份的第一天
    const adjustedStart = weekStart < firstDayOfMonth ? new Date(firstDayOfMonth) : new Date(weekStart)

    // 调整结束日期，确保不晚于月份的最后一天
    const adjustedEnd = weekEnd > lastDayOfMonth ? new Date(lastDayOfMonth) : new Date(weekEnd)

    // 格式化日期为 YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const y = date.getFullYear()
      const m = (date.getMonth() + 1).toString().padStart(2, "0")
      const d = date.getDate().toString().padStart(2, "0")
      return `${y}-${m}-${d}`
    }

    // 添加周标题（第几周）
    weeks.push({
      title: `第${chineseNumbers[weeks.length]}周`,
      start: formatDate(adjustedStart),
      end: formatDate(adjustedEnd)
    })

    // 移动到下一周
    currentDate.setDate(currentDate.getDate() + 7)

    // 如果已经超出月份范围且不在当前月份，则退出循环
    if (currentDate > lastDayOfMonth && currentDate.getMonth() !== month - 1) {
      break
    }
  }

  return weeks
}
