import { parser } from './parser';
import type { Token, VDOM } from './type';

// 创建元素的辅助函数，用于根据标签名创建DOM元素
function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

// 设置元素属性的辅助函数
function setElementProps(el: HTMLElement, props: { [key: string]: any }) {
  for (const key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      const value = props[key];
      if (key === 'style') {
        // 如果是样式属性，需要特殊处理，将样式字符串解析后设置
        if (typeof value === 'string') {
          el.style.cssText = value;
        } else {
          for (const styleKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, styleKey)) {
              el.style[styleKey as any] = value[styleKey];
            }
          }
        }
      } else if (key === 'class') {
        // 处理class属性
        if (Array.isArray(value)) {
          // 如果是类名数组，将每个类名添加到元素的classList中
          value.forEach((className) => {
            el.classList.add(className);
          });
        } else {
          // 如果是单个类名，直接设置className属性
          el.className = value;
        }
      } else {
        // 其他普通属性，直接设置
        el.setAttribute(key, value);
      }
    }
  }
}

// 递归渲染子节点的辅助函数
// function renderChildren(el: HTMLElement, children: (VDOM | string)[]) {
//   children.forEach((child) => {
//     if (typeof child === 'string') {
//       // 如果是文本节点，创建文本节点并添加到父元素
//       const textNode = document.createTextNode(child);
//       el.appendChild(textNode);
//     } else {
//       // 如果是VDOM，递归渲染该VDOM并将生成的DOM元素添加到父元素
//       const childEl = renderVDOM(child);
//       el.appendChild(childEl);
//     }
//   });
// }

// 主渲染函数
export function renderVDOM(VDOM: VDOM): HTMLElement | Text {
  if (VDOM.tag === '') {
    // 如果是文本节点，直接创建文本节点并返回
    return document.createTextNode(VDOM.text!);
  } else {
    // 根据虚拟节点的标签名创建真实DOM元素
    const el = createElement(VDOM.tag);
    // 设置元素的属性
    setElementProps(el, VDOM.props);
    // 渲染子节点并添加到创建的DOM元素中
    // renderChildren(el, VDOM.children);
    return el;
  }
}

/**
 * 将token渲染为dom
 * @param token 词条
 * @returns dom节点
 */
export function render(token: Token): HTMLElement | Text {
  return renderVDOM(parser(token));
}
