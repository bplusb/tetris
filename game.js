
// a[y][x];
function Block(shapeSet) {
  var colors = ["yellow", "blue", "red", "green"];
  var c = colors[ parseInt(Math.random()*colors.length) ];
  this.shapeSet = Array(shapeSet.length);
  for (var i = 0; i < shapeSet.length; i ++) {
    this.shapeSet[i] = Array(shapeSet[i].length);
    for (var j = 0; j < shapeSet[i].length; j ++) {
      this.shapeSet[i][j] = Array(shapeSet[i][j].length);
      for (var k = 0; k < shapeSet[i][j].length; k ++) {
        if (shapeSet[i][j][k] == '0') {
          this.shapeSet[i][j][k] = 'white';
        }
        else {
          this.shapeSet[i][j][k] = c;
        }
      }
    }
  }


  this.state = 0;
  this.x = 0;
  this.y = 0;
  this.width = shapeSet[0][0].length;
  this.height = shapeSet[0].length;
  this.base = [0,0];
  this.RIGHT = 1;
  this.LEFT = 2;
  this.UP = 3;
  this.DOWN = 4;

  this.turn = function (d) {
    var map = game.map;
    game.unpaintBlock(this);
    var ok = true;
    if (d == this.RIGHT) {
      this.x ++;
      if (!this.validInMap(map)) {
        this.x --;
        ok = false;
      }
    } else if (d == this.LEFT) {
      this.x --;
      if (!this.validInMap(map)) {
        this.x ++;
        ok = false;
      }
    } else if (d == this.UP) {
      this.state = (this.state + 1)%this.shapeSet.length;
      if (!this.validInMap(map)) {
        this.state = (this.state-1+this.shapeSet.length)%this.shapeSet.length;
        ok = false;
      }
    } else if (d == this.DOWN) {
      this.y ++;
      if (!this.validInMap(map)) {
        this.y --;
        ok = false;
      }
    }
    //console.log(this.x, this.y);
    game.paintBlock(this);
    return ok;
  };
  this.validInMap = function (map) {
    for (var x = 0; x < this.width; ++ x) {
      for (var y = 0; y < this.height; ++ y) {
        if (this.shapeSet[this.state][y][x] != 'white') {
          var nx = this.x + x, ny = this.y + y;
          if (nx<0||ny<0||nx>=map[0].length||ny>=map.length||map[ny][nx]!='white')
            return false;
        }
      }
    }
    return true;
  };
  this.addToMap = function (map) {
    for (var x = 0; x < this.width; ++ x) {
      for (var y = 0; y < this.height; ++ y) {
        if (this.shapeSet[this.state][y][x] != 'white') {
          var nx = this.x + x, ny = this.y + y;
          if (nx>=0&&ny>=0&&nx<map[0].length&&ny<map.length) {
            map[ny][nx] = this.shapeSet[this.state][y][x];
          }
        }
      }
    }
  };
};

var game = {
  map: [],
  width: 10,
  height: 20,
  deadHeight: 4,
  pix: 30,
  start: false,
  block: null,
  canvas: null,
  context: null,
  timeInterval: 600,

  getBlock: function () {
    var r = parseInt(Math.random()*BLOCKS.length);
    game.block = new Block(BLOCKS[r]);
    game.block.base = [0, 0];
    game.block.x = 3;
    game.block.y = 0;
    game.paintBlock(game.block);
  },
  goDown: function () {
    if (!game.start) {
      return;
    }
    if (!game.block.turn(game.block.DOWN)) {
      game.block.addToMap(game.map);
      //game.paintBlock(game.block);
      game.checkWin();
      if (game.start) {
        game.getBlock();
      }
    }
    if (game.start) {
      setTimeout(game.goDown, game.timeInterval);
    }
  },
  generateBlankLine: function () {
    var ret = [];
    for (var i = 0; i < game.width; i++) {
      ret.push('white');
    }
    return ret;
  },
  isNotBlankLine: function (line) {
    for (var i = 0; i < line.length; i++) {
      if (line[i] != 'white')
        return true;
    }
    return false;
  },
  isNotFullLine: function (line) {
    for (var i = 0; i < line.length; i++) {
      if (line[i] == 'white')
        return true;
    }
    return false;
  },
  checkWin: function () {
    game.map = game.map.filter(game.isNotFullLine);
    var diff = game.height - game.map.length;
    console.log(diff, game.map)
    while ( diff-- ) {
      game.map.unshift(game.generateBlankLine());
    }
    for (var x = 0; x < game.width; x++) {
      for (var y = 0; y < game.height; y++) {
          game.paintNode([x, y], game.map[y][x]);
      }
    }
    for (var y = 0; y < game.deadHeight; ++ y) {
      if (game.isNotBlankLine(game.map[y])) {
        game.start = false;
      }
    }
  },
  paintFrame: function () {
    game.canvas = document.getElementById("canvas");
    game.context = game.canvas.getContext("2d");
    var canvas = game.canvas, context = game.context;
    var pix = game.pix, height = game.height, width = game.width;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(0, pix*height);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.moveTo(pix*width, 0);
    context.lineTo(pix*width, pix*height);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(pix*width, 0);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.moveTo(0, pix*height);
    context.lineTo(pix*width, pix*height);
    context.closePath();
    context.stroke();

    context.beginPath();
    context.moveTo(0, pix*game.deadHeight);
    context.lineTo(pix*width, pix*game.deadHeight);
    context.closePath();
    context.stroke();

    window.addEventListener('keydown', function(e) {
      var keyID = e.keyCode ? e.keyCode :e.which;
      if(keyID === 38 || keyID === 87)  { // up arrow and W
        game.block.turn(game.block.UP);
      }
      if(keyID === 39 || keyID === 68)  { // right arrow and D
        game.block.turn(game.block.RIGHT);
      }
      if(keyID === 40 || keyID === 83)  { // down arrow and S
        game.block.turn(game.block.DOWN);
      }
      if(keyID === 37 || keyID === 65)  { // left arrow and A
        game.block.turn(game.block.LEFT);
      }
      if(keyID === 80)  {
        game.init();
      }
    }, true);
  },
  eraseAll: function() {
    var width = game.width, height = game.height, pix = game.pix;
    game.context.fillStyle="white";
    game.context.fillRect(2, 2, width*pix-4, height*pix-4);

    var context = game.context;
    context.beginPath();
    context.moveTo(0, pix*game.deadHeight);
    context.lineTo(pix*width, pix*game.deadHeight);
    context.closePath();
    context.stroke();
  },
  paintBlock: function (b) {
    for (var x = 0; x < b.width; ++ x) {
      for (var y = 0; y < b.height; ++ y) {
        if (b.shapeSet[b.state][y][x] != 'white') {
          game.paintNode ([b.x+x,b.y+y], b.shapeSet[b.state][y][x], b.base);
        }
      }
    }
  },
  unpaintBlock: function (b) {
    for (var x = 0; x < b.width; ++ x) {
      for (var y = 0; y < b.height; ++ y) {
        if (b.shapeSet[b.state][y][x] != 'white') {
          game.paintNode ([b.x+x,b.y+y], 'white', b.base);
        }
      }
    }
  },
  paintNode: function (a, color, base) {
    if (!base) {
      base = [0,0];
    }
    var width = game.width, height = game.height, pix = game.pix;
    game.context.fillStyle=color;
    game.context.fillRect(base[0]+a[0]*pix+2, base[1]+a[1]*pix+2, pix-4, pix-4);
  },
  init: function () {
    if (game.start) {
      return;
    }
    game.eraseAll();
    game.map = [];
    for (var i = 0; i < game.height; ++ i) {
      game.map.push(game.generateBlankLine());
    }
    game.getBlock();
    setTimeout(game.goDown, game.timeInterval);
    game.start=true;
  }
}

var BLOCKS = [
  [["11","11"]],
  [["0000","1111","0000","0000"],["0100","0100","0100","0100"]],
  [["010","011","010"],["000","111","010"],["010","110","010"],["010","111","000"]],
  [["010","110","100"],["110","011","000"]],
  [["010","011","001"],["011","110","000"]],
  [["010","010","011"],["000","111","100"],["110","010","010"],["001","111","000"]],
  [["010","010","110"],["100","111","000"],["011","010","010"],["000","111","001"]],
];
