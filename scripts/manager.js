//manager.js
//manager:游戏控制器
function Manager (size = 4, aim = 2048) {
  this.size = size //不传参数时默认的size
  this.aim = aim
  this.render = new Render() //默认初始化一个render，一个grid作为其属性，便于多次调用
  //新增storage属性，用于存储历史记录
  this.storage = new Storage()
  let self = this //把this先用self保存，之后使用，这里的self指向Manager
  this.listener = new Listener({
    //监听回调函数
    //在listener里传入一个对象，它的属性为move，是一个function
    move: function (direction) {
      //回调函数由Listener调用，因此this是指向Listener对象的
      //当Listener触发键盘事件以后，回调给Manager
      self.listenerFn(direction) //调用listenerFn方法
    },
    start: function () {
      self.start()
    }
  })

  this.defaultStart() //在manager中调用start方法初始化游戏
}

Manager.prototype.newName = function (tile) {
  switch (tile.value) {
    case 2:
      return 'CSS'
    case 4:
      return 'JS'
    case 8:
      return 'Vue2'
    case 16:
      return 'Vue3'
    case 32:
      return 'Ajax'
    case 64:
      return 'ES6'
    case 128:
      return 'TS'
    case 256:
      return 'Spring'
    case 512:
      return 'SSM'
    case 1024:
      return '前端工程师'
  }
}

//完善恢复网格的逻辑
Manager.prototype.defaultStart = function () {
  const state = this.storage.getCellState()
  //从本地缓存中获取历史最高分
  let bestScore = this.storage.getBestScore()
  //如果不存在历史最高分，初始化最高分为0
  if (!bestScore) {
    bestScore = 0
  }
  //如果存在历史最高分，当前最高分就是历史最高分
  this.bestScore = bestScore
  //如果存在缓存则恢复
  if (state) {
    this.score = state.score
    this.status = 'DOING'
    this.grid = new Grid(this.size, state.grid)
    this._render()
  } else {
    //不存在缓存直接调用start()初始化
    this.start()
  }
}

Manager.prototype.start = function () {
  this.score = 0
  this.status = 'DOING'
  this.grid = new Grid(this.size)
  for (let i = 0; i < 2; i++) {
    this.addRandomTile()
  }
  this._render()
}

Manager.prototype._render = function () {
  //每次渲染网格前先存储数据，再渲染网格
  this.storage.setCellState({ score: this.score, grid: this.grid })
  //如果当前成绩大于历史最高分，则更新历史最高分为当前成绩，并将新的最高分存储到本地
  if (this.score > this.bestScore) {
    this.bestScore = this.score
    this.storage.setBestScore(this.bestScore)
  }
  this.render.render(this.grid, {
    score: this.score,
    status: this.status,
    bestScore: this.bestScore
  })
}

// 随机添加一个节点
Manager.prototype.addRandomTile = function () {
  //利用随机空闲位置创建节点
  const position = this.grid.randomAvailableCell()
  //首先判断是否存在空闲位置
  if (position) {
    //随机获取一个空闲方格位置
    const position = this.grid.randomAvailableCell()
    //90%概率为2，10%为4
    const value = Math.random() < 0.9 ? 2 : 4
    const tilename = value < 4 ? 'HTML' : 'CSS'
    //添加到grid中
    this.grid.add(new Tile(position, value,tilename))
  }
}

//从正常的左上到右下遍历顺序
Manager.prototype.getPath = function (direction) {
  //这里的direction是包括一个{row，column}对
  let rowPath = [] //行的遍历路径下标:0-3   rowPath=[0,1,2,3]
  let columnPath = [] //列的遍历路径下标:0-3   columnPath=[0,1,2,3]
  for (let i = 0; i < this.size; i++) {
    //Manager默认的size属性即为网格的行列大小
    rowPath.push(i)
    columnPath.push(i)
  }

  //当方向为向右时，遍历方向应该从右到左；当方向为向下时，遍历方向应该从下到上
  //向右的时候
  if (direction.column === 1) {
    columnPath = columnPath.reverse()
  }
  //向下的时候
  if (direction.row === 1) {
    rowPath = rowPath.reverse()
  }

  return { rowPath, columnPath }
}

//寻找移动方向目标位置
Manager.prototype.getNearestAvailableAim = function (aim, direction) {
  //位置 + 方向向量的计算公式
  function addVector (position, direction) {
    return {
      row: position.row + direction.row,
      column: position.column + direction.column
    }
  }
  aim = addVector(aim, direction)
  next = this.grid.get(aim)

  //当下一个元素中已有Tile(next元素存在)或者目标位置超出游戏边界，跳出循环
  while (!this.grid.outOfRange(aim) && !next) {
    aim = addVector(aim, direction)
    next = this.grid.get(aim)
  }

  // 这时候的aim总是多计算了一步，还原一下
  aim = {
    row: aim.row - direction.row,
    column: aim.column - direction.column
  }

  return {
    aim,
    next
  }
}

//监听
Manager.prototype.listenerFn = function (direction) {
  //定义一个变量，判断是否引起移动
  let moved = false

  const { rowPath, columnPath } = this.getPath(direction) //获取遍历的路径
  for (let i = 0; i < rowPath.length; i++) {
    for (let j = 0; j < columnPath.length; j++) {
      const position = { row: rowPath[i], column: columnPath[j] }
      const tile = this.grid.get(position)
      //当此位置有Tile时才进行移动
      if (tile) {
        //移动前，首先获取目标移动位置
        const { aim, next } = this.getNearestAvailableAim(position, direction)
        //合并：next中已经存在tile并且next的值等于当前tile的值
        if (next && next.value === tile.value) {
          // 合并位置是next的位置，合并的value是tile.value * 2
          let merged = new Tile(
            {
              row: next.row,
              column: next.column
            },
            (value = tile.value * 2),
            (tilename = this.newName(tile))
          )

          this.score += merged.value
          //删除原来网格中的Tile元素
          this.grid.remove(tile)
          //将合并后的节点插入到网格中
          this.grid.add(merged)
          //判断游戏是否获胜
          if (merged.value === this.aim) {
            this.status = 'WIN'
          }

          merged.mergedTiles = [tile, next]
          tile.updatePosition({ row: next.row, column: next.column })
          moved = true
        } else {
          //否则就只进行移动
          this.moveTile(tile, aim)
          moved = true
        }
      }
    }
  }

  //移动以后：1.再随机生成一个Tile
  //         2.重新渲染网格对象
  if (moved) {
    this.addRandomTile()
    if (this.checkFailure()) {
      this.status = 'FAILURE'
    }
    this._render()
  }
}

Manager.prototype.moveTile = function (tile, aim) {
  //先将Tile原始位置的数据删除（置空）
  this.grid.cells[tile.row][tile.column] = null
  //根据目标位置aim更新Tile的位置属性
  tile.updatePosition(aim)
  //将tile对象存到新的目标位置
  this.grid.cells[aim.row][aim.column] = tile
}

//判断游戏是否失败
Manager.prototype.checkFailure = function () {
  const emptyCells = this.grid.availableCells()
  if (emptyCells.length > 0) {
    return false
  }
  for (let row = 0; row < this.grid.size; row++) {
    for (let column = 0; column < this.grid.size; column++) {
      let now = this.grid.get({ row, column })
      //根据4个方向，判断临近的Tile值的value是否相同
      let directions = [
        { row: 0, column: 1 },
        { row: 0, column: -1 },
        { row: 1, column: 0 },
        { row: -1, column: 0 }
      ]

      for (let i = 0; i < directions.length; i++) {
        //遍历方向数组中的每一个方向，计算出相邻的Tile的位置即为next的位置
        const direction = directions[i]
        const next = this.grid.get({
          row: row + direction.row,
          column: column + direction.column
        })
        //next存在，判断value是否相同
        if (next && next.value === now.value) {
          //有相同的，则游戏尚未结束
          return false
        }
      }
    }
  }
  return true
}

// 根据方向，确定遍历的顺序
Manager.prototype.getPaths = function (direction) {
  let rowPath = []
  let columnPath = []
  for (let i = 0; i < this.size; i++) {
    rowPath.push(i)
    columnPath.push(i)
  }

  // 向右的时候
  if (direction.column === 1) {
    columnPath = columnPath.reverse()
  }

  // 向下的时候
  if (direction.row === 1) {
    rowPath = rowPath.reverse()
  }
  return {
    rowPath,
    columnPath
  }
}

// 寻找移动方向目标位置
Manager.prototype.getNearestAvaibleAim = function (aim, direction) {
  // 位置 + 方向向量的计算公式
  function addVector (position, direction) {
    return {
      row: position.row + direction.row,
      column: position.column + direction.column
    }
  }
  aim = addVector(aim, direction)

  // 获取grid中某个位置的元素
  let next = this.grid.get(aim)

  // 如果next元素存在（也就是此目标位置已经有Tile），或者是超出游戏边界，则跳出循环。目的：就是找到最后一个空白且不超过边界的方格
  while (!this.grid.outOfRange(aim) && !next) {
    aim = addVector(aim, direction)
    next = this.grid.get(aim)
  }

  // 这时候的aim总是多计算了一步，因此我们还原一下
  aim = {
    row: aim.row - direction.row,
    column: aim.column - direction.column
  }

  return {
    aim,
    next
  }
}

// 判断游戏是否失败
Manager.prototype.checkFailure = function () {
  // 获取空白的Cell
  const emptyCells = this.grid.availableCells()
  // 如果存在空白，则游戏肯定没有失败
  if (emptyCells.length > 0) {
    return false
  }

  for (let row = 0; row < this.grid.size; row++) {
    for (let column = 0; column < this.grid.size; column++) {
      let now = this.grid.get({ row, column })

      // 根据4个方向，判断临近的Tile的Value值是否相同
      let directions = [
        { row: 0, column: 1 },
        { row: 0, column: -1 },
        { row: 1, column: 0 },
        { row: -1, column: 0 }
      ]
      for (let i = 0; i < directions.length; i++) {
        const direction = directions[i]
        const next = this.grid.get({
          row: row + direction.row,
          column: column + direction.column
        })
        // 判断Value是否相同
        if (next && next.value === now.value) {
          return false
        }
      }
    }
  }
  return true
}
