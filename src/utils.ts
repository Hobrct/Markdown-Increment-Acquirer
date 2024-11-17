/**
 * 判断一个字符串是否是另一个字符串的开头
 * @param start 子串
 * @param string 字符串
 * @returns 判断结果
 */
export const isStartWith = (start: string, string: string) => {
  if (start === string) {
    return true;
  }
  if (start.length > string.length) {
    return false;
  }
  for (let i = 0; i < start.length; i++) {
    if (start[i] !== string[i]) {
      return false;
    }
  }
  return true;
};

/**
 * 返回子词条列表，尝试读取tokens属性，若不存在则读取
 * items(列表的子词条)，若都不存在代表没有子词条，返回空数组。
 * @param token 词条
 * @returns 子词条
 */
export const getSubToken = (token: any) => {
  return token.tokens ?? token.items ?? [];
};

/**
 * 从给定的字符串 `str` 中提取出位于指定子字符串 `subStr` 之后的内容。
 *
 * @param subStr 要查找的子字符串，用于确定从原始字符串 `str` 的哪个位置开始提取后续内容。
 * @param str 原始字符串，从中提取出位于 `subStr` 之后的部分作为返回结果。
 * @returns 返回从原始字符串 `str` 中截取的位于子字符串 `subStr` 之后的部分内容，即附加文本。
 */
export const getAttachedText = (subStr: string | null, str: string) => {
  return str.slice(subStr?.length ?? 0);
};
