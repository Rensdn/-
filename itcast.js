(function(global) {
	var document = global.document,
		arr = [],
		slice = arr.slice,
		push = arr.push;


	var init,
		itcast = function(selector, context) {
			return new itcast.fn.init(selector, context);
		};

	itcast.fn = itcast.prototype = {
		constructor: itcast,
		length: 0, // 保持itcast对象 在任何条件下都是 伪数组对象
		splice: arr.splice,
		// push: arr.push,
		// slice: arr.slice,
		// concat: arr.concat,
		// sort: arr.sort,
		toArray: function() {
			return slice.call(this);
		},
		get: function(index) {
			// 如果 index 为null 或undefined值，就将所有元素以数组形式返回。
			if (index == null) {
				return slice.call(this);
			}
			// 根据索引值 获取对应的dom元素
			return this[index >= 0 ? index - 0 : index - 0 + this.length];
		},
		eq: function(index) {
			return itcast(this.get(index));
		},
		first: function() {
			return itcast(this.get(0));
		},
		last: function() {
			return itcast(this.get(-1));
		},
		each: function(callback) {
			return itcast.each(this, callback);
		},
		map: function(callback) {
			return itcast(itcast.map(this, function(elem, i) {
				return callback.call(elem, elem, i);
			}));
		}
	};

	init = itcast.fn.init = function(selector, context) {
		// 处理null undefined ''
		if (!selector) {
			return this;
		}
		// 处理字符串类型
		if (itcast.isString(selector)) {
			// html字符串
			if (itcast.isHTML(selector)) {
				// 创建dom
				// var doms = itcast.parseHTML(selector);
				// 以伪数组形成存储在this上
				push.apply(this, itcast.parseHTML(selector));
			} else { // 选择器
				// var doms = select(selector, context);
				push.apply(this, select(selector, context));
			}
		}
		// 处理Dom对象
		else if (itcast.isDOM(selector)) {
			// Array.prototype.push.call(this, selector);
			this[0] = selector;
			this.length = 1;
		}
		// 处理DOM数组或者伪数组对象
		else if (itcast.isArrayLike(selector)) {
			push.apply(this, selector);
		}
		// 处理函数
		else if (typeof selector === 'function') {
			// 首先判断dom树是否加载完毕，
			// 如果已加载完毕，就直接执行该函数
			if (itcast.isReady) {
				selector();
			} else { // 如果没有加载完毕，就将该函数注册到DOMContentLoaded这个事件上
				document.addEventListener('DOMContentLoaded', function() {
					itcast.isReady = true;
					selector();
				});
			}
		}
	};

	init.prototype = itcast.fn;
	// 提供可扩展的接口
	itcast.extend = itcast.fn.extend = function(source) {
		// 枚举 source对象上所有属性
		for (var k in source) {
			// 添加到调用者身上
			this[k] = source[k];
		}
	};
	// 工具类
	// 类型判断方法
	itcast.extend({
		isString: function(obj) {
			return typeof obj === 'string';
		},
		// 判断是否为html字符串
		isHTML: function(obj) {
			return (obj + '').charAt(0) === '<' && // 以 '<' 开头
				(obj + '').charAt((obj + '').length - 1) === '>' && // 以 '>' 结尾
				(obj + '').length >= 3; // 最小长度 为 3
		},
		// 判断是否为元素节点
		isDOM: function(obj) {
			return 'nodeType' in obj && obj.nodeType === 1;
		},
		// 判断是否为全局window对象
		isWindow: function(obj) {
			return !!obj && obj.window === obj;
		},
		// 判断是否为数组或伪数组对象
		isArrayLike: function(obj) {
			// 如果obj不为null或undefined，并且具有length属性，就获取其length值
			// 否则 length为 bool值。
			var length = !!obj && 'length' in obj && obj.length,
				type = itcast.type(obj); // 存储obj的类型

			// 过滤函数和window对象
			if (type === 'function' || itcast.isWindow(obj)) {
				return false;
			}

			return type === 'array' || length === 0 ||
				typeof length === 'number' && length > 0 && (length - 1) in obj;
		}
	});
	itcast.extend({
		isReady: false,
		each: function(obj, callback) {
			var i = 0,
				l = obj.length;

			for (; i < l; i++) {
				if (callback.call(obj[i], obj[i], i) === false) {
					break;
				}
			}
			// 返回遍历的对象
			return obj;
		},
		map: function(arr, callback, args) {
			// 临时存储 callback执行后的返回值
			var value;
			// 定义新数组
			var ret = [];
			var i = 0,
				l = arr.length;

			for (; i < l; i++) {
				// 获取callback执行后的结果
				value = callback(arr[i], i, args);
				// 判断是否 为null 或者 undefined值
				// 如果不为上述值，就将其追加到ret数组内。
				if (value != null) {
					ret.push(value);
				}
			}
			// 返回新数组对象
			// 同时将多维数组转换成一维数组
			return Array.prototype.concat.apply([], ret);
		},
		// 将html字符串 转化成 html元素
		parseHTML: function(html) {
			// 存储所有创建出来的元素节点
			var ret = [];
			// 动态创建一个div，使用其innerHML属性，来将html字符串转换成元素
			var div = document.createElement('div');
			div.innerHTML = html;
			// 遍历div所有子节点
			for (var i = 0, l = div.childNodes.length; i < l; i++) {
				// 如果类型为 元素节点，就是要创建的元素节点
				// 就追加到ret内。
				if (div.childNodes[i].nodeType === 1) {
					ret.push(div.childNodes[i]);
				}
			}
			// 返回结果
			return ret;
		},
		type: function(obj) {
			if (obj == null) {
				return obj + '';
			}
			return typeof obj === 'object' ?
				Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() :
				typeof obj;
		}
	});

	// DOM操作模块
	itcast.fn.extend({
		appendTo: function(target) {
			// 缓存this指向的对象
			var self = this,
					node, // 临时存储要被追加的源节点
					ret = []; // 存储所有被追加的节点
			// 统一类型
			target = itcast(target);

			// 遍历target
			target.each(function(telem, i) {
				// 遍历源节点
				self.each(function(selem) {
					// 如果i === 0，表示当前telem为第一个目标元素，不需要拷贝源节点selem
					// 否则要拷贝。
					// 将上面得到源节点，追加到目标元素上，telem
					node = i === 0 ? selem : selem.cloneNode(true);
					/*node = selem;
					if( i > 0){
						node = selem.cloneNode(true);
						// ret.push(node);
					}*/
					ret.push(node);
					telem.appendChild(node);
				});
			});
			// 实现链式编程
			// arr.push.apply(this, ret);
			// return this;
			return itcast(ret);
		},
		append: function(source) {
			// 如果source为普通字符串类型
			// 用该变量临时存储一下
			var text;
			// 是字符串类型，但不是html字符串
			// 就认为是普通字符串
			// 如果 source为普通字符串，就将其转换成文本节点，追加到目标DOM元素上
			if(itcast.isString(source) && !itcast.isHTML(source)){
				// 将source赋值给text保存起来
				text = source;
				// 将source赋值为 itcast对象（空）
				// 统一source类型， 为itcast对象
				source = itcast();
				// 把字符串转换文本节点并且 存储在 source上
				source[0] = document.createTextNode(text);
				// 同时设置其伪数组长度为1
				source.length = 1;
			} else {
				// 将其他source类型统一为itcast对象
				source = itcast(source);
			}
			// 使用已封装好的appendTo方法，将source上的元素追加到 this目标元素上
			source.appendTo(this);
			// 实现链式编程
			return this;
		},
		prependTo: function(target) {
			var firstChild, // 缓存目标元素的第一个子节点
					self = this,
					node,
					ret = [];
			// 统一target类型为itcast对象
			target = itcast(target);
			// 遍历target
			target.each(function(telem, i) {
				// 缓存目标元素的第一个子节点
				firstChild = telem.firstChild;
				// 遍历self上所有源节点
				self.each(function(selem) {
					node = i === 0 ? selem : selem.cloneNode(true);
					ret.push(node);
					// 在目标元素的第一子节点前 添加子节点
					telem.insertBefore(node, firstChild);
				});
			});
			// 实现链式编程
			return itcast(ret);
		}
	});

	// 选择器引擎
	// 通过select函数 来查询dom元素
	var select = function(selector, context) {
		// 存储所有获取到的dom元素
		var ret = [];
		// 判断是否指定了context
		if (context) {
			// context 是 dom对象
			// 使用context调用querySelectorAll 获取dom元素
			// 将其转换成真数组返回
			if (context.nodeType === 1) {
				return Array.prototype.slice.call(context.querySelectorAll(selector));
			}
			// context 是 dom数组或伪数组
			// 遍历context，使用当前遍历到的元素调用querySelectorAll 获取dom元素
			// 得到结果doms，要将其所有dom元素 追加到 ret数组内，
			else if (context instanceof Array ||
				(typeof context === 'object' && 'length' in context)) {
				for (var i = 0, l = context.length; i < l; i++) {
					var doms = context[i].querySelectorAll(selector);
					for (var j = 0, k = doms.length; j < k; j++) {
						ret.push(doms[j]);
					}
				}
			}
			// context 为 字符串即选择器
			else {
				return Array.prototype.slice.call(
					document.querySelectorAll(context + ' ' + selector));
			}
			return ret;
		}
		// 如果context没有传入实参
		// 通过document调用querySelectorAll来直接获取dom元素
		else {
			return Array.prototype.slice.call(document.querySelectorAll(selector));
		}
	};

	global.$ = global.itcast = itcast;
	// 注册DOM树加载完毕的时间
	// 用来更新itcast.isReady值
	document.addEventListener('DOMContentLoaded', function() {
		itcast.isReady = true;
	});
}(window));