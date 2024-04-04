//render.js
function Render () {
  this.tileContainer = document.querySelector('.tile-container') //初始化时创建了tileContainer，只用取一次tile-container，便于多次使用
  this.scoreContainer = document.querySelector('.now .value')
  this.statusContainer = document.querySelector('.status')
  this.bestScoreContainer = document.querySelector('.best .value')
}

//封装render：用于渲染整个网格grid。作用：只要将新的Grid传入，它就能根据约定完成渲染
Render.prototype.render = function (grid, { score, status, bestScore }) {
  //在此之前先清空所有的Tile
  this.empty()
  this.renderScore(score)
  this.renderBestScore(bestScore)
  this.renderStatus(status)
  for (let row = 0; row < grid.size; row++) {
    for (let column = 0; column < grid.size; column++) {
      //如果一个网格中有tile，即不为空
      if (grid.cells[row][column]) {
        this.renderTile(grid.cells[row][column])
      }
    }
  }
}

//渲染历史最高分
Render.prototype.renderBestScore = function (bestScore) {
  this.bestScoreContainer.innerHTML = bestScore
}

Render.prototype.renderScore = function (score) {
  this.scoreContainer.innerHTML = score
}

//渲染模态框：传入游戏状态，根据状态设置模态框内容
Render.prototype.renderStatus = function (status) {
  if (status === 'DOING') {
    this.statusContainer.style.display = 'none'
    return
  }
  this.statusContainer.style.display = 'flex'
  this.statusContainer.querySelector('.content').innerHTML =
    status === 'WIN' ? 'You Win!' : 'Game Over!'
  this.statusContainer.querySelector('button').innerHTML =
    status === 'WIN' ? 'Play Again' : 'Try Again'
}

Render.prototype.empty = function () {
  this.tileContainer.innerHTML = ' '
}

//渲染单个tile
Render.prototype.renderTile = function (tile) {
  //创建一个tile-inner
  const tileInner = document.createElement('div')
  tileInner.setAttribute('class', 'tile-inner')
  tileInner.innerHTML = tile.tilename

  //创建一个tile
  const tileDom = document.createElement('div')
  let classList = [
    'tile',
    `tile-${tile.value}`,
    `tile-position-${tile.row + 1}-${tile.column + 1}` //classList[2]
  ]
  if (tile.prePosition) {
    //先设置之前的位置
    classList[2] = `tile-position-${tile.prePosition.row + 1}-${
      tile.prePosition.column + 1
    }`
    //延迟设置当前的位置,延迟时间16ms
    setTimeout(function () {
      classList[2] = `tile-position-${tile.row + 1}-${tile.column + 1}`
      tileDom.setAttribute('class', classList.join(' '))
    }, 16)
  } else if (tile.mergedTiles) {
    //向mergedTile的类数组里添加merged类名
    classList.push('tile-merged')
    //如果有mergedTiles，则渲染mergedTile的两个Tile
    tileDom.setAttribute('class', classList.join(' '))
    /*
    for (let i = 0; i < tile.mergedTiles.length; i++) {
      this.renderTile(tile.mergedTiles[i])
    }
    */
  } else {
    //新节点添加动效
    classList.push('new-tile')
  }

  tileDom.setAttribute('class', classList.join(' '))
  //join()方法用于将数组元素放入一个字符串，传入空格表示用空格分隔，默认是逗号分隔，此字符串即为一个tileDom的所有类名
  tileDom.appendChild(tileInner) //将控制放缩属性的tileInner作为tile方格的子元素，tileDom用于控制整个tile的移动属性
  //将tileDom依次插入tileContainer容器的元素末尾
  this.tileContainer.appendChild(tileDom)
}
