//tile.js
function Tile (position, value, tilename) {
  this.row = position.row
  this.column = position.column
  this.value = value
  this.tilename = tilename
  //新增prePosition属性
  this.prePostition = null
  //存储merged两个Tile
  this.mergedTiles = null
}


//更新Tile的位置
Tile.prototype.updatePosition = function (position) {
  //更新的时候，先将当前位置，保存为prePosition
  this.prePostition = { row: this.row, column: this.column }

  this.row = position.row
  this.column = position.column
}

//序列化Tile
Tile.prototype.serialize = function () {
  return {
    position: {
      row: this.row,
      column: this.column
    },
    value: this.value,
    tilename: this.tilename
  }
}
