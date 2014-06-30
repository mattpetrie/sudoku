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
    this.selectedNumber = null;
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
          cell.append(square.curValue).addClass('revealed');
        } else{
          cell.addClass('guessed');
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

  Board.prototype.updateCell = function(id, target){
    this.setCoord([id[0], id[1]], this.selectedNumber);
    $(target).html(this.selectedNumber);
    if(this.full() && this.won()){
      alert('You won!');
    }
  };

  Board.prototype.highlightCells = function(){
    $('div.cell.highlighted').removeClass('highlighted');
    for(var i = 0; i < this.grid.length; i++){
      for(var j = 0; j < this.grid[i].length; j++){
        if(this.getCoord([i,j]).curValue === this.selectedNumber){
          $('div').find('[data-id="' + i + j + '"]').addClass('highlighted');
        }
      }
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

  Board.prototype.selectButton = function(target){
    this.selectedNumber = parseInt($(target).val());
    this.highlightCells();
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

  $('button.number-button').click(function(event){
    S.selectButton(event.target);
    $('button.selected').removeClass('selected');
    $(event.target).addClass('selected');
  });

  $('#board-container').delegate('div.guessed', 'click', function(event){
    var id = $(event.target).data('id').toString();
    S.updateCell(id, event.target);
  });
});
