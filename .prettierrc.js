// @ts-check

/** @type {import("prettier").Config} */
export default {
  // 在对象字面量中大括号内添加空格
  bracketSpacing: true,
  // 使用双引号而不是单引号
  singleQuote: false,
  // 在箭头函数参数只有一个时省略括号
  arrowParens: "avoid",
  // 不使用尾随逗号
  trailingComma: "none",
  // 确保对象解构时括号内元素前后有空格
  // 虽然 bracketSpacing 已经有此效果，但明确写出可增强可读性
  // 这里主要是强调对对象解构格式的要求
  semi: false, // 可以根据需要决定是否使用分号结尾
  printWidth: 80, // 每行代码的最大宽度
  tabWidth: 2, // 缩进的空格数
  useTabs: false, // 使用空格而不是制表符进行缩进
};
