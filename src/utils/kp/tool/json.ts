/**
 * 李鹏
 * 去除json里面的空值和null
 * @param obj
 */
export const removeEmptyAndNull = (obj: any): any => {
  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.filter(item => item !== null && item !== "").map(item => removeEmptyAndNull(item))
    } else {
      const newObj: any = {}
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key]
          if (value !== null && value !== "") {
            newObj[key] = removeEmptyAndNull(value)
          }
        }
      }
      return newObj
    }
  }
  return obj
}

/**
 * 过滤 JSON 对象，只保留指定的键
 * @param obj - 要过滤的对象
 * @param keys - 要保留的键数组
 * @returns 只包含指定键的新对象
 */
export const josnFilterKeys = (obj: any, keys: string[]): any => {
  if (typeof obj !== "object" || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => josnFilterKeys(item, keys))
  }

  const newObj: any = {}
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = josnFilterKeys(obj[key], keys)
    }
  }
  return newObj
}
