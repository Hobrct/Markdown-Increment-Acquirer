# Markdown增量获取器

## 项目背景

aigc生成内容时使用了markdown作为标记语言，以增加文本的可读性。在前端中需要使用markdown解析器将其解析为DOM结构。由于aigc生成的内容不是一次性生成，而是一段一段生成的。为了用户体验，在展示输出时使用了SSE将输出内容实时发送给前端，再由前端展示出来。

**现有的展示方案**大部分使用了全量渲染的形式，即将传来的所有内容渲染为DOM，通过设置的innerHTML进行展示。在chrome中，这样会将现有dom删除并创建新的dom替代，这样会存在性能上的问题；以及你需要对传来的数据进行一些处理时，例如传来一个Latex公式，你就需要用Latex渲染库渲染出来。在粗暴的设置容器的innerHTML后就不得不重新渲染，你并且为了匹配Latex公式，你就不得不markdown解析器写一个插件，让markdown解析去匹配。

**Markdown增量获取器**在获取到增量内容时，会将markdown解析器生成的新token与旧token进行比较，对现有dom进行更新（增加、删除与修改，修改只限于文字上的新增）返回新增文字以及对应容器，这样就能够通过设置textContent来进行文字上的追加，而不是更新整个DOM，以实现最小化DOM操作。而且，新增内容的渲染是由你控制的，你就可以将Latex解析器写在你的打字机内部（或者其他输出内容的类），而不是markdown插件。

## 实现原理

1. 通过对比新旧Token来获取内容的变化
2. 根据变化内容操作DOM
3. 输出一个队列，里面是新增的文字与对应容器。

## 使用方式

```javascript
// 获取id为'container'的DOM元素，并将其赋值给变量container
const container = document.getElementById('container');

// 创建增量获取器的实例
const mdIncrementAcquirer = markdown(container);

// 调用pushData方法，将返回值赋值给printTasks变量
let printTasks = markdown.pushData('attached message');

// 遍历printTasks数组中的每个printTask对象
for (let printTask of printTasks) {
    // 将printTask对象中的content属性的值追加到其container属性所指向的DOM元素的textContent属性上
    // 这样就实现了将printTask中的内容添加到对应的容器元素内显示出来的效果
    printTask.container.textContent += printTask.content;
}


## TODO
- 目前只能解析marked.js的token，其他库需要支持。
- DOM生成没写完，目前只有标题、加粗、列表，需要匹配更多markdown的样式。
- 项目结构以及Readme需要优化，需要更详细的描述实现原理。
- 上传到npm中。
