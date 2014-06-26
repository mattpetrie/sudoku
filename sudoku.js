(function(){
  var Sudoku = this.Sudoku = (this.Sudoku || {});

  var DIGITS = Sudoku.DIGITS = "123456789";

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
    return this.grid[arr[0]][arr[1]] = val;
  };

  Board.prototype.getCoord = function(arr){
    return this.grid[arr[0]][arr[1]];
  };

  Board.prototype.render = function(el){
    for(var i = 0; i < this.grid.length; i++){
      $(el).append('<div class="row"></div>');
      var row = $(el).find('.row').last();
      for(var j = 0; j < 9; j++){
        row.append('<div class="cell" data-id="' + i + j +'"></div>');
        var square = this.getCoord([i,j]);
        var cell = $('div').find('[data-id="' + i + j + '"]');
        if(square.value == "undefined"){
          square = " ";
        }
        if(square.revealed){
          cell.append('<p>' + square.value + '</p>').addClass('revealed');
        } else{
          cell.append('<p></p>').addClass('guessed');
        }
      };
    };
  };

  // temporary board generator function just to populate with numbers
  Board.prototype.populate = function(){
    for(var i = 0; i < 9; i++){
      for(var j = 0; j < 9; j++){
         var value = Math.floor((Math.random() * 9) + 1);
         var revealed = ((Math.floor(Math.random() * 2) + 1) > 1) ? true : false;
         this.setCoord([i,j], new Square(value, revealed));
      };
    };
  };

  var Square = Sudoku.Square = function(value, revealed){
    this.value = value;
    this.revealed = revealed;
  };

})();

$(document).ready(function(){
  var S = window.S = new Sudoku.Board();
  S.populate();
  var $el = $('#board-container');
  S.render($el);
});