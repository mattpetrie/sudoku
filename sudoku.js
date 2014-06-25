(function(){
  var Sudoku = this.Sudoku = (this.Sudoku || {});

  var Board = Sudoku.Board = function(){
    this.grid = this.generateGrid();
  };

  Board.prototype.generateGrid = function(){
    var grid = new Array(9);
    for(var i = 0; i < grid.length; i++){
      grid[i] = new Array(9);
    };
    return grid;
  };

  Board.prototype.setCoord = function(arr, val){
    this.grid[arr[0]][arr[1]] = val;
  };
})();

$(document).ready(function(){
  var S = window.S = new Sudoku.Board();
  console.log(S.grid);
});