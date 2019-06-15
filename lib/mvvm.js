"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// 基类 调度
var Compiler =
/*#__PURE__*/
function () {
  function Compiler(el, vm) {
    _classCallCheck(this, Compiler);

    // 判断el属性是否是一个元素
    // 不是元素就获取
    this.el = this.isElementNode(el) ? el : document.querySelector(el); // 吧当前节点中的元素 获取到 存放到内存中

    this.vm = vm;
    var fragment = this.node2fragment(this.el); // 把节点中的内容进行替换
    // 用数据编译模板

    this.compile(fragment); // 再把内容塞到页面中

    this.el.appendChild(fragment);
    console.log(fragment);
  } // 编译内存中的dom节点


  _createClass(Compiler, [{
    key: "compile",
    value: function compile(node) {
      var childNodes = node.childNodes; // childNodes是类数组 用es6展开运算符变成数组

      _toConsumableArray(childNodes).forEach(function (child) {
        console.log(child);
      });
    } // 把节点移动到内存中

  }, {
    key: "node2fragment",
    value: function node2fragment(node) {
      // 创建一个文档碎片
      var fragment = document.createDocumentFragment();
      var firstChild;

      while (firstChild = node.firstChild) {
        // appendChild具有移动性
        fragment.appendChild(firstChild);
      }

      return fragment;
    } // 是不是元素节点

  }, {
    key: "isElementNode",
    value: function isElementNode(node) {
      return node.nodeType === 1;
    }
  }]);

  return Compiler;
}();

var Vue = function Vue(options) {
  _classCallCheck(this, Vue);

  this.$el = options.el;
  this.$data = options.data;

  if (this.$el) {
    new Compiler(this.$el, this);
  }
};