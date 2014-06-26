(function(){
  var Sudoku = this.Sudoku = (this.Sudoku || {});

  var DIGITS = Sudoku.DIGITS = "123456789";

  var MASTERROWS = Sudoku.MASTERROWS = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];

var SHOWN = Sudoku.SHOWN = [
  [1,1,0,0,1,0,0,0,0],
  [1,0,0,1,1,1,0,0,0],
  [0,1,1,0,0,0,0,1,0],
  [1,0,0,0,1,0,0,0,1],
  [1,0,0,1,0,1,0,0,1],
  [1,0,0,0,1,0,0,0,1],
  [0,1,0,0,0,0,1,1,0],
  [0,0,0,1,1,1,0,0,1],
  [0,0,0,0,1,0,0,1,1]
];

  var Board = Sudoku.Board = function(){
    this.grid = this.generateGrid();
    this.populate();
    this.inputSquares = this.findInputSquares();
  };

  Board.prototype.generateGrid = function(){
    var grid = new Array(9);
    for(var i = 0; i < grid.length; i++){
      grid[i] = new Array(9);
    };
    return grid;
  };

  Board.prototype.findInputSquares = function(){
    return _.filter((_.flatten(this.grid)), function(square){
      return square.revealed == 0;
    });
  }

  Board.prototype.setCoord = function(arr, val){
    if(typeof this.grid[arr[0]][arr[1]] == "object"){
      this.grid[arr[0]][arr[1]].curValue = val;
    } else {
      this.grid[arr[0]][arr[1]] = val;
    }
  };

  Board.prototype.getCoord = function(arr){
    return this.grid[arr[0]][arr[1]];
  };

  Board.prototype.render = function(el){
    for(var i = 0; i < this.grid.length; i++){
      $(el).append('<div class="row"></div>');
      var row = $(el).find('.row').last();
      for(var j = 0; j < 9; j++){
        row.append('<div class="cell" data-id="' + i + j + '"></div>');
        var square = this.getCoord([i,j]);
        var cell = $('div').find('[data-id="' + i + j + '"]');
        if(square.revealed){
          cell.append('<input type="text" maxlength="1" readonly value="' + square.curValue + '"/>').addClass('revealed');
        } else{
          cell.append('<input type="text" maxlength="1">').addClass('guessed');
        }
      };
    };
  };

  // temporary board generator function just to populate with numbers
  Board.prototype.populate = function(){
    var masterBoard = [];
    for(var i = 0; i < 9; i++){
      masterBoard.push(_.zip(MASTERROWS[i], SHOWN[i]));
    };

    for(var i = 0; i < 9; i++){
      for(var j = 0; j < 9; j++){
        var value = masterBoard[i][j][0];
        var revealed = masterBoard[i][j][1];
        if(revealed){
          this.setCoord([i,j], new Square(value, value, revealed));
        } else{
          this.setCoord([i,j], new Square("", value, revealed));
        };
      };
    };
  };

  Board.prototype.updateCell = function(id, value, $target){
    if(DIGITS.indexOf(value) >= 0){
      this.setCoord([id[0], id[1]], parseInt(value));
    } else {
      value = this.getCoord([id[0], id[1]]).curValue;
      $target.val(value);
    };
    if(this.full() && this.won()){
      alert('You won!');
    }
  };

  Board.prototype.full = function() {
    var flatBoard = _.flatten(this.grid);
    var allValues = _.map(flatBoard, function(square){
      return square.curValue;
    });
    return allValues.indexOf("") === -1;
  }

  Board.prototype.check = function(array){
    for(var i = 0; i < array.length; i++){
      if(_.find(array[i], function(square){
        return square.curValue !== square.winningValue;
      })){
        return false;
      }
    };
    return true;
  };

  Board.prototype.checkRows = function(){
    return this.check(this.grid);
  };

  Board.prototype.checkColumns = function(){
    var transposedGrid = _.zip.apply(_, this.grid);
    return this.check(transposedGrid);
  };

  Board.prototype.checkGroups = function(){
    var groups = [];
    for(var i = 0; i <= 6; i += 3){
      var rows = this.grid.slice(i, i+3);
      for(var j = 0; j <= 6; j += 3){
        var group = [];
        _.each(rows, function(row){
          group = group.concat(row.slice(j, j+3));
        });
        groups.push(group);
      };
    };
    return this.check(groups);
  };

  Board.prototype.won = function(){
    return this.checkRows() && this.checkColumns() && this.checkGroups();
  };

  var Square = Sudoku.Square = function(curValue, winningValue, revealed){
    this.curValue = curValue;
    this.winningValue = winningValue;
    this.revealed = revealed;
  };

})();

$(document).ready(function(){
  var S = window.S = new Sudoku.Board();
  var $el = $('#board-container');
  S.render($el);

  $('div.guessed').focus(function(event){
    var data = $(event.target).data('id');
    editCell(event.target);
  });

  $('div.guessed').delegate('input', 'blur', function(event){
    event.preventDefault();
    var $target = $(event.target);
    var id = $target.parent().data('id').toString();
    var value = $target.val();
    S.updateCell(id, value, $target);
  });

  $(document).keydown(function(e){
    var $focus = $(':focus');
    
    if(!$focus.is('.cell input')){
      return;
    } else {
      var id = $focus.parent().data('id');
    };

    if (e.keyCode == 37) { 
      $('div').find('[data-id="' + id + '"]').prev().find('input').focus();
      return false;
    }
    if (e.keyCode == 38) { 
      if(id > 10){
        id = (parseInt(id) - 10).toString();
        id = id < 10 ? ("0" + id) : id;
      }
      $('div').find('[data-id="' + id + '"]').find('input').focus();
      return false;
    }
    if (e.keyCode == 39) { 
      $('div').find('[data-id="' + id + '"]').next().find('input').focus();
      return false;
    }
    if (e.keyCode == 40) { 
      if(id < 80){
        id = (parseInt(id) + 10).toString();
      }
      $('div').find('[data-id="' + id + '"]').find('input').focus();
      return false;
    }

  });
});
