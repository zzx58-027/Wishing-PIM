- anime.js > modifier
  - https://animejs.com/documentation/animation/tween-parameters/modifier
  - 可以用来处理动画的数值，比如四舍五入、取整等
  - 比如 `animeUtils.round(0)` 可以用来四舍五入到整数
  - 比如 `animeUtils.round(2)` 可以用来四舍五入到保留两位小数
- const $counter = animeUtils.$(".counter");
  - 获取 els 的工具, 有时会取不到对应成员, 在应用前需确认成员存在.
  - 确认使用的时机, 比如 vue3 的 onMounted 中使用等.
- 使用 anime.js 实现数值过渡动画, anime.js 支持对对象属性做补间动画
  - 定义一个对象 { value: 起始值 }. 用 anime 把 value 动画到目标值. 在 update 回调里更新 DOM 文本.
  - anime.js 的一个 核心机制: anime.js 只能对 可变的对象属性 做补间。
  - 字符串，不是可补间的属性，不能直接做补间。
- animate([vector2D, '.square'], {})
  - animate targets 可以同时接受 可变对象 和 选择器字符串.
- animejs 做宽度变化过渡动画, 回复状态需要在 animate 中状态设置, 这样 anime 才知道需要针对此属性做变化.
- 动画未完成就被取消/中断，后续再触发时表现异常
  - 主要原因:
    - 动画状态被覆盖
    - 没有手动清理 / 完成上一个动画
    - 动画实例未复用
    - 属性计算与 easing 的问题
  - 解决思路:
    - 开始新动画前先清理
    - 复用动画实例
    - 在 finished 后再触发
    - 显式设置起始值
  - 解决方法: 取消/中断动画前，先检查动画是否正在运行。如果是，先调用动画实例的 pause() 方法暂停动画，然后再调用 remove() 方法移除动画实例。
  - 代码示例:
    ```js
    const animation = anime({
      // 动画配置
    });
    // 取消/中断动画前，先检查动画是否正在运行
    if (animation.isRunning) {
      // 暂停动画
      animation.pause();
      // 移除动画实例
      animation.remove();
    }
    ```