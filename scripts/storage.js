//storage.js
//历史最高分
const BestScoreKey = '2048BestScore'
//方格状态和分数
const CellStateKey = '2048CellState'

function Storage () {}
//实现本地存储，方格状态和分数
Storage.prototype.setCellState = function ({ score, grid }) {
  //localStorage.setItem(key,value)：将value存储到key字段
  window.localStorage.setItem(
    //键：方格状态常量
    CellStateKey,
    //值：序列化后的JSON字符串
    //stringify()用于把JavaScript对象转化为JSON字符串
    JSON.stringify({
      score,
      grid: grid.serialize()
    })
  )
}

//获取缓存中的方格状态
Storage.prototype.getCellState = function () {
  //localStorage.getItem(key):获取指定key本地存储的值，根据传入的键获取本地存储的CellStateKey字符串的值
  const cellState = window.localStorage.getItem(CellStateKey)
  //JSON.parse()用于把JSON字符串转化为JavaScript对象
  //如果存在本地的缓存，则返回一个网格对象，包括所有方格的状态,否则返回null
  return cellState ? JSON.parse(cellState) : null
}

//存储历史最高分
Storage.prototype.setBestScore = function (bestScore) {
  //将值(最高分)bestScore存入到对应的键BestScoreKey中
  window.localStorage.setItem(BestScoreKey, bestScore)
}

//根据键BestScoreKey获取历史最高分
Storage.prototype.getBestScore = function () {
  return window.localStorage.getItem(BestScoreKey)
}
