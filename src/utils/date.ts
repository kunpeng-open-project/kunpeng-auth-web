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
