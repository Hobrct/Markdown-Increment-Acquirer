import { marked } from '@/assets/marked/marked';

import type {
  AddedTextInfo,
  PrintTask,
  Token,
  TokenComparsion,
  TokenDOM,
  TokensList
} from './type';
import { getAttachedText, getSubToken, isStartWith } from './utils';
import { render } from './render';

/**
 * 打字机插件，用于支持markdown
 * 传入字符，输出字符及所在容器。
 */
class Markdown {
  container: HTMLElement | undefined;
  tokens: TokenDOM[];
  content: string;
  constructor() {
    this.container; // 容器
    this.tokens = []; // 词条
    this.content = ''; // 文字
  }

  /**
   * 设置容器
   * @param container 容器
   */
  setContainer(container: HTMLElement) {
    this.container = container;
  }

  /**
   * 将数据传入markdown解析器，解析为DOM，并返回每个容器的打印任务。
   * @param msg 传入markdown解析器的数据
   * @param immediate 是否立即显示
   */
  pushData(msg: string, immediate: boolean): PrintTask[] {
    console.log('markdown插件: pushData=====>', msg);
    this.content += msg;
    // 词条化
    const newToken = this.tokenlize();
    console.log('markdown插件: 新生成词条=====>', newToken);
    // 将新生成的词条与当前词条进行比较
    const comparsion = this.tokenCompare(newToken, this.tokens);
    console.log('markdown插件: 比较结果=====>', comparsion);
    // 处理对比结果
    const addedTextInfo = this.parseComparsion(comparsion).map((value) => {
      return { ...value, immediate: value.immediate ? value.immediate : immediate };
    });
    console.log('markdown插件: 生成任务队列=====>', addedTextInfo);
    return addedTextInfo;
  }

  /**
   * 词条化
   */
  tokenlize() {
    return marked.lexer(this.content);
  }

  /**
   * 返回新旧词条的对比结果, 为新增节点绑定DOM
   * @param newTokens 新词条
   * @param oldTokens 旧词条
   * @param parentDOM 父节点
   * @returns 对比结果
   */
  tokenCompare(newTokens: TokensList, oldTokens: TokenDOM[], parentDOM: HTMLElement | null = null) {
    // 处理新增token的情况, 为新增token绑定DOM
    const handleNewToken = (newToken: Token) => {
      let modifiedComparsion: TokenComparsion | null = null;
      const newDOM = render(newToken);
      // const newTokenWithDOM = { ...newToken, DOM: newDOM };
      (newToken as TokenDOM).DOM = newDOM;
      // 添加到父节点的DOM
      if (parentDOM === null) {
        this.container?.appendChild(newDOM);
      } else {
        parentDOM?.appendChild(newDOM);
      }
      modifiedComparsion = {
        differencs: 'new',
        old: null,
        new: newToken,
        children: this.tokenCompare(getSubToken(newToken), [], newDOM as HTMLElement)
      };
      return modifiedComparsion;
    };
    let newIndex = 0;
    let oldIndex = 0;
    const tokenComparsion: TokenComparsion[] = [];
    const removedToken: TokenDOM[] = [];
    while (newIndex < newTokens.length && oldIndex < oldTokens.length) {
      const newToken = newTokens[newIndex];
      const oldToken = oldTokens[oldIndex];
      // 通过判断raw来判断是否相等
      if (newToken.raw === oldToken.raw) {
        tokenComparsion.push({
          differencs: 'nothing',
          old: oldToken,
          new: newToken
        });
        newIndex++;
        oldIndex++;
      } else if (
        oldToken.type === newToken.type &&
        (isStartWith(oldToken.raw, newToken.raw) || isStartWith(newToken.raw, oldToken.raw))
      ) {
        // 新token为旧token的追加
        // TODO: 处理减少的情况
        let modifiedComparsion: TokenComparsion | null = null;
        (newToken as TokenDOM).DOM = oldToken.DOM;
        modifiedComparsion = {
          differencs: 'modified',
          old: oldToken,
          new: newToken,
          children: this.tokenCompare(
            getSubToken(newToken),
            getSubToken(oldToken),
            oldToken.DOM as HTMLElement
          )
        };
        tokenComparsion.push(modifiedComparsion);
        newIndex++;
        oldIndex++;
      } else {
        // 都不匹配，判断为原token删除，新词条添加。
        removedToken.push(oldToken);
        // 新token为旧token的追加
        let modifiedComparsion: TokenComparsion | null = null;
        // 添加DOM
        modifiedComparsion = handleNewToken(newToken);
        tokenComparsion.push(modifiedComparsion);
        newIndex++;
        oldIndex++;
      }
    }
    // 剩下全为新增词条
    if (newIndex < newTokens.length) {
      const newComparsion = newTokens.slice(newIndex).map((value) => {
        let modifiedComparsion: TokenComparsion | null = null;
        modifiedComparsion = handleNewToken(value);
        return modifiedComparsion;
      });
      tokenComparsion.push(...newComparsion);
    }
    // 旧词条没遍历完代表删除了
    if (oldIndex < oldTokens.length) {
      removedToken.push(...oldTokens.slice(oldIndex));
    }
    // 删除已移除的DOM
    this.removeDOM(removedToken);
    return tokenComparsion;
  }

  /**
   * 卸载被标记为移除的词条的DOM
   * @param removedTokens 标记为移除的词条
   */
  removeDOM(removedTokens: TokenDOM[]) {
    for (const token of removedTokens) {
      token.DOM?.remove();
    }
  }

  /**
   * 处理对比结果, 新增类型的词条绑定DOM
   * @param tokenComparsions 词条对比结果
   * @returns 新增词条信息
   */
  parseComparsion(tokenComparsions: TokenComparsion[]) {
    // 处理后的新Token
    const newTokens: TokenDOM[] = [];
    // 新增词条信息
    const addedTextInfo: AddedTextInfo[] = [];
    // 遍历比较结果
    for (const tokenComparsion of tokenComparsions) {
      const newToken = tokenComparsion.new;
      const oldToken = tokenComparsion.old;
      // 比较类型为修改
      if (tokenComparsion.differencs === 'modified') {
        // 获取新增词条信息
        addedTextInfo.push(...this.getAddedTextInfo(tokenComparsion));
        // 绑定原有DOM
        newTokens.push({
          ...(newToken as Token),
          DOM: oldToken?.DOM as HTMLElement
        });
        // 比较类型为新增
      } else if (tokenComparsion.differencs === 'new') {
        // 获取新增词条信息
        addedTextInfo.push(...this.getAddedTextInfo(tokenComparsion));
        // 为新增token绑定DOM
        newTokens.push(newToken as TokenDOM);
        // 没变化，直接添加到newToken
      } else if (tokenComparsion.differencs === 'nothing') {
        newTokens.push(newToken as TokenDOM);
      }
    }
    this.tokens = newTokens;
    return addedTextInfo;
  }
  /**
   * 获取新加入字段及其容器。
   * @param tokenComparsion 比较结果
   * @param [newDOM=null] 新增类型的容器，不是新增则不需要
   */
  getAddedTextInfo(tokenComparsion: TokenComparsion) {
    const addedTextInfo: AddedTextInfo[] = [];
    // 需要处理的比较类型
    const newType = ['modified', 'new'];
    // 传入的类型检验
    if (!newType.includes(tokenComparsion.differencs)) {
      console.trace();
      throw 'markdown插件: parseModified方法使用错误!';
      return [];
    }
    // 没有子节点，代表已遍历到最底层修改
    if (tokenComparsion.children?.length === 0) {
      const newToken = tokenComparsion.new;
      const oldToken = tokenComparsion.old;
      if (isStartWith(oldToken?.raw || '', newToken?.raw || '')) {
        // 处理添加文字的情况
        addedTextInfo.push({
          content: getAttachedText(
            (tokenComparsion.old as any)?.text || '',
            (tokenComparsion.new as any)?.text || ''
          ),
          container:
            tokenComparsion.differencs === 'new'
              ? ((tokenComparsion.new as TokenDOM)?.DOM as HTMLElement)
              : (tokenComparsion.old?.DOM as HTMLElement)
        });
        return addedTextInfo;
      } else {
        // 处理减少文字的情况
        const newDOM = render(newToken as Token);
        const oldDOM = oldToken?.DOM;
        oldDOM?.parentElement?.replaceChild(newDOM, oldDOM);
        // 删了换个新的
        oldToken?.DOM?.remove();
        addedTextInfo.push({
          content: (tokenComparsion.new as any)?.text || '',
          container: newDOM as HTMLElement,
          immediate: true
        });
      }
    }
    // 递归先序遍历
    tokenComparsion.children?.forEach((value) => {
      if (newType.includes(value.differencs)) {
        addedTextInfo.push(...this.getAddedTextInfo(value));
      }
    });
    return addedTextInfo;
  }

  /**
   * 打印结束的回调函数
   * TODO: 没用上
   * @param addedTextInfo 打印完的任务
   */
  onTaskPrintOver(addedTextInfo: AddedTextInfo) {
    console.log('markdown插件打印结束回调=====>', addedTextInfo);
  }
}

export const markdown = () => {
  return new Markdown();
};
