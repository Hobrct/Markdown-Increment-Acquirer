/* eslint-disable no-use-before-define */
export type MarkedToken =
  | Tokens.Space
  | Tokens.Heading
  | Tokens.List
  | Tokens.ListItem
  | Tokens.Paragraph
  | Tokens.Text
  | Tokens.Strong;

export type Token = MarkedToken | Tokens.Generic;

export namespace Tokens {
  export interface Space {
    type: 'space';
    raw: string;
  }

  export interface Heading {
    type: 'heading';
    raw: string;
    depth: number;
    text: string;
    tokens: Token[];
  }

  export interface List {
    type: 'list';
    raw: string;
    ordered: boolean;
    start: number | '';
    loose: boolean;
    items: ListItem[];
  }

  export interface ListItem {
    type: 'list_item';
    raw: string;
    task: boolean;
    checked?: boolean | undefined;
    loose: boolean;
    text: string;
    tokens: Token[];
  }

  export interface Paragraph {
    type: 'paragraph';
    raw: string;
    pre?: boolean | undefined;
    text: string;
    tokens: Token[];
  }

  export interface Text {
    type: 'text';
    raw: string;
    text: string;
    tokens?: Token[];
  }

  export interface Strong {
    type: 'strong';
    raw: string;
    text: string;
    tokens: Token[];
  }

  export interface Generic {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
    type: string;
    raw: string;
    tokens?: Token[] | undefined;
  }
}

export type TokensList = Token[];

export type TokenDOM = Token & {
  DOM: HTMLElement | Text | null;
};

// 要改
export type TokenComparsion = {
  differencs: 'nothing' | 'modified' | 'new'; // 无改变、已修改、新增
  old: TokenDOM | null;
  new: Token | TokenDOM | null;
  children?: TokenComparsion[]; // 修改的节点才会有子节点
};

// 新增字段的信息
export type AddedTextInfo = {
  content: string;
  container: HTMLElement;
  immediate?: boolean;
};

// 打印任务
export type PrintTask = AddedTextInfo & {
  immediate: boolean;
};

// 定义虚拟节点（VDOM）接口
export interface VDOM {
  // 节点的标签名，比如 'div'、'span' 等
  tag: string;

  // 节点的属性，以对象形式存储，例如 { class: 'container', style: 'color: red;' }
  props: {
    [key: string]: any;
  };

  // 子节点，可以是一个VDOM数组，表示当前节点的多个子节点；也可以是一个字符串，表示文本节点内容
  children: (VDOM | string)[];

  // 可选的唯一标识，用于在一些场景下（比如Diff算法中）方便识别节点
  key?: string;

  // 节点的文本内容，如果是文本节点，该属性存储文本内容；如果是元素节点，通常为空字符串（除非有特殊情况，比如在元素内部有直接的文本内容，像 <div>Hello</div> 这种情况的文本 'Hello' 也可以存储在这里）
  text?: string;
}
