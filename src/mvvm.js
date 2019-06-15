// 观察者(发布订阅) 观察者 被观察者
class Dep{
  constructor(){
    this.subs = [] // 存放所有的watcher
  }
  addSub(watcher){ // 添加watcher的方法
    this.subs.push(watcher)
  }
  // 发布
  notify(){
    this.subs.forEach(watcher => watcher.update())
  }
}

class Watcher{
  constructor(vm, expr, cb){
    this.vm = vm
    this.expr = expr
    this.cb = cb
    // 默认先存放一个之前的值
    this.oldValue = this.get()
  }
  get(){ // vm.$data.school vm.$data.school.name
    Dep.target = this; // 把自己放到this上
    let value = CompileUtil.getVal(this.vm, this.expr)
    Dep.target = null
    return value
  }
  update(){ // 更新操作 数据变化后 会调用观察者的update方法
    let newVal = CompileUtil.getVal(this.vm, this.expr)
    if(newVal !== this.oldValue){
      this.cb(newVal)
    }
  }
}
// vm.$watch(vm, 'people', () => {

// })


class Observer{ // 实现数据劫持
  constructor(data){
    this.observer(data)
  }
  observer(data){
    // 如果是对象才观察
    if(data && typeof data == 'object'){
      // 如果是对象
      for(let key in data){
        this.defineReactive(data, key, data[key])
      }
    }
  }
  defineReactive(obj, key, value){
    this.observer(value) // people: [watcher, watcher] b: [watcher]
    let dep = new Dep() // 给每一个属性都加上一个具有发布和订阅的功能
    Object.defineProperty(obj,key,{
      get(){
        // 创建watcher时 会取到对应的内容，并且把watcher放到了全局上
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set:(newVal) => {// {people:{name: '2zz'}} people={}
        if(newVal != value){
          this.observer(newVal)
          value = newVal
          dep.notify();
        }
      }
    })
  }
}

// 基类 调度
class Compiler{
  constructor(el, vm){
    // 判断el属性是否是一个元素
    // 不是元素就获取
    this.el = this.isElementNode(el) ? el : document.querySelector(el)
    // 吧当前节点中的元素 获取到 存放到内存中
    this.vm = vm
    let fragment = this.node2fragment(this.el)

    // 把节点中的内容进行替换
    // 用数据编译模板
    this.compile(fragment)


    // 再把内容塞到页面中
    this.el.appendChild(fragment)
  }
  isDirective(attrName) {
    return attrName.startsWith('v-');
  }
  // 编译元素的
  compileElement(node) {
    let attributes = node.attributes; // 类数组
    [...attributes].forEach(attr => {
      let {name, value:expr} = attr; // v-model = "people.msg"
      // 判断是否是v-xxx这种形式的指令
      if(this.isDirective(name)){
        let [,directive] = name.split('-')// v-model v-html
        // 需要调用不同的指令来处理
        CompileUtil[directive](node, expr,this.vm);
      }
    })
  }
  // 编译文本的
  compileText(node) {
    // 判断当前文本节点中内容是否包含mustach {{xxx}}
    let content = node.textContent
    // 使用正则匹配到所有文本
    if(/\{\{(.+?)\}\}/.test(content)){
      // 文本节点
      CompileUtil['text'](node, content, this.vm); //content: {{a}} {{b}}
    }
  }
  // 核心的编译方法
  // 编译内存中的dom节点
  compile(node) {
    let childNodes = node.childNodes;
    // childNodes是类数组 用es6展开运算符变成数组
    [...childNodes].forEach(child => {
      if(this.isElementNode(child)){
        this.compileElement(child)
        // 如果是元素的话 需要把自己传进去 在去遍历子节点
        this.compile(child)
      } else {
        this.compileText(child)
      }
    })
  }
  // 把节点移动到内存中
  node2fragment(node){
    // 创建一个文档碎片
    let fragment = document.createDocumentFragment()
    let firstChild;
    while(firstChild = node.firstChild){
      // appendChild具有移动性
      fragment.appendChild(firstChild)
    }
    return fragment
  }
  // 是不是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }

}
CompileUtil = {
  // 根据表达式取到对应的数据
  getVal(vm, expr){ // vm.$data 'people.name' [people,name]
    return expr.split('.').reduce((data, current)=>{
      return data[current]
    }, vm.$data)

  },
  // 解析v-model这个指令
  model(node, expr, vm){// node是节点 expr是表达式 vm是当前实例
    // 给输入框赋予value属性
    let fn = this.updater['modelUpdater']
    new Watcher(vm, expr, (newVal)=>{ // 给输入框加一个观察者 稍后数据更新 会触发此方法 会拿新值给输入框赋值
      fn(node, newVal)
    })
    node.addEventListener('input', (e) => {
      let value = e.target.value // 获取用户当前输入的值
    })
    let value = this.getVal(vm,expr) // 3zz
    fn(node, value)
  },
  html(){

  },
  getContentValue(vm, expr){
    // 遍历表达式 将内容重新替换成一个完整的内容
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getVal(vm, args[1])
    })
  },
  text(node, expr, vm){ // expr => {{a}} {{b}} {{c}}
    let fn = this.updater['textUpdater'];
    let content = expr.replace(/\{\{(.+?)\}\}/g, (...args)=> {
      // 给表达式每个{{}}都加上观察者
      new Watcher(vm, args[1], (newVal) => {
        fn(this.getContentValue(vm, expr)); // 返回了一个全的字符串
      })
      return this.getVal(vm, args[1]);
    });
    fn(node, content)
  },
  updater: {
    // 把数据插入到节点中
    modelUpdater(node, value){
      node.value = value
    },
    htmlUpdater(){

    },
    // 处理文本节点
    textUpdater(node, value){
      node.textContent = value
    }
  }
}

class Vue{
  constructor(options) {
    this.$el = options.el
    this.$data = options.data
    if(this.$el){
      // 把数据全部转化成用 Object.defineProperty来定义
      new Observer(this.$data)
      console.log(this.$data)
      new Compiler(this.$el, this)
    }
  }
}