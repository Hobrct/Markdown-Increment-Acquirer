import type { Token, VDOM } from './type';
import styles from './markdown.module.scss';

/**
 * 将token转换为vdom
 * @param token 词条
 * @returns 生成的DOM
 */
export const parser = (token: Token): VDOM => {
  let dom: VDOM | undefined;
  switch (token.type) {
    case 'heading':
      dom = {
        tag: 'div',
        props: { class: styles[`headingLevel-${token.depth}`] },
        children: token.tokens?.map((token) => parser(token)) ?? []
      };
      break;
    case 'list':
      if (token.ordered) {
        dom = {
          tag: 'ol',
          props: { class: [`markdown-ordered-list`] },
          children: token.items?.map((token: Token) => parser(token)) ?? []
        };
      } else {
        dom = {
          tag: 'ul',
          props: { class: [`markdown-unordered-list`] },
          children: token.items?.map((token: Token) => parser(token)) ?? []
        };
      }
      break;
    case 'list_item':
      dom = {
        tag: 'li',
        props: { class: styles.listItem },
        children: token.tokens?.map((token) => parser(token)) ?? []
      };
      break;
    case 'newline':
      dom = {
        tag: 'br',
        props: {},
        children: []
      };
      break;
    case 'paragraph':
      dom = {
        tag: 'div',
        props: { class: styles.paragraph },
        children: token.tokens?.map((token) => parser(token)) ?? []
      };
      break;
    case 'strong':
      dom = {
        tag: 'strong',
        props: {},
        children: token.tokens?.map((token) => parser(token)) ?? []
      };
      break;
    case 'text':
      dom = {
        tag: 'span',
        props: {},
        children: token.tokens ? (token.tokens.map((token) => parser(token)) ?? []) : [token.text]
      };
      break;
    default:
      dom = {
        tag: 'span',
        props: {},
        children: [token.raw]
      };
      break;
  }
  return dom as VDOM;
};
