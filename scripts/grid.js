//grid.js

function Grid (size = 4, state) {
  this.size = size
  this.cells = []
  this.init(size)

  //首先判断是否存在之前的进度
  //如果有之前的进度，则恢复
  if (state) {
    this.recover(state)
  }
}

//传入原始缓存的状态
Grid.prototype.recover = function ({ size, cells }) {
  //二维数组cells中存储量很多cell对象，每个cell包括原始的属性position和value
  //现在的网格大小等于原始网格大小
  this.size = size
  for (let row = 0; row < this.size; row++) {
    for (let column = 0; column < this.size; column++) {
      //遍历二维数组，如果某个cell不为null，则创建一个Tile节点
      const cell = cells[row][column]
      if (cell) {
        //创建新的Tile，设置位置和值都是cells数组中每一个原始Tile中的的position和value
        this.cells[row][column] = new Tile(cell.position, cell.value,cell.tilename)
      }
    }
  }
}

Grid.prototype.init = function (size) {
  for (let row = 0; row < size; row++) {
    this.cells.push([])
    for (let column = 0; column < size; column++) {
      this.cells[row].push(null)
    }
  }
}

Grid.prototype.add = function (tile) {
  this.cells[tile.row][tile.column] = tile
}

//获取所有可用方格的位置
Grid.prototype.availableCells = function () {
  const availableCells = []
  for (let row = 0; row < this.cells.length; row++) {
    for (let column = 0; column < this.cells[row].length; column++) {
      //如果当前网格为空,则放入availableCells
      if (!this.cells[row][column]) {
        availableCells.push({ row, column }) //将每一个元素的位置信息存入数组，包括行和列
      }
    }
  }
  //返回可用方格数组
  return availableCells
}

//随机获取某个可用方格的位置
Grid.prototype.randomAvailableCell = function () {
  //获取所有可用方格
  const cells = this.availableCells()
  if (cells.length > 0) {
    //Math.floor()向下取整防止取到4,Math.random()范围：0.0-1.0,返回的是cells中的某个元素的索引(内容包括一组{row,column})
    return cells[Math.floor(Math.random() * cells.length)]
  }
}

//获取某个位置的Tile
Grid.prototype.get = function (position) {
  if (this.outOfRange(position)) {
    return null
  }
  return this.cells[position.row][position.column]
}

//判断某个位置是否超出边界
Grid.prototype.outOfRange = function (position) {
  return (
    position.row < 0 ||
    position.row >= this.size ||
    position.column < 0 ||
    position.column >= this.size
  )
}

//删除Tile节点
Grid.prototype.remove = function (tile) {
  this.cells[tile.row][tile.column] = null
}

//序列化Grid
Grid.prototype.serialize = function () {
  const cellState = []

  //cellState是一个二维数组，分别存储整个Grid的信息
  for (let row = 0; row < this.size; row++) {
    cellState[row] = [] //每行创建一个数组
    for (let column = 0; column < this.size; column++) {
      //每一列Tile的序列化状态插入cellState的每一行数组中
      //如果该位置有Tile，则返回Tile序列化结果
      //如果该位置没有Tile，则存储null
      cellState[row].push(
        this.cells[row][column] ? this.cells[row][column].serialize() : null
      )
    }
  }
  return {
    //返回Grid的所有属性，包括大小和所有格子的状态，序列化完成
    size: this.size,
    cells: cellState
  }
}
