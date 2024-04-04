//listener.js
//游戏监听器
function Listener ({ move: moveFn, start: startFn }) {
  //moveFn：move的别名，给Listener添加一个回调函数名为moveFn
  //给window对象添加一个键盘监听事件
  window.addEventListener('keyup', function (e) {
    switch (e.code) {
      case 'ArrowLeft':
        moveFn({ row: 0, column: -1 }) //括号中'向左'对应的即为回调函数中的参数direction，传递一个moveFn到Listener
        break
      case 'ArrowUp':
        moveFn({ row: -1, column: 0 })
        break
      case 'ArrowDown':
        moveFn({ row: 1, column: 0 })
        break
      case 'ArrowRight':
        moveFn({ row: 0, column: 1 })
        break
    }
  })

  const buttons = document.querySelectorAll('button')
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      startFn()
    })
  }
}
