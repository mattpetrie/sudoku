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
    for(var i = 0; i < 9; i++){
      for(var j = 0; j < 9; j++){
        var value = Math.floor((Math.random() * 9) + 1);
        var revealed = ((Math.floor(Math.random() * 2) + 1) > 1) ? true : false;
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
      this.setCoord([id[0], id[1]], value);
    } else {
      value = this.getCoord([id[0], id[1]]).curValue;
      $target.val(value);
    };
  };

  var Square = Sudoku.Square = function(curValue, winningValue, revealed){
    this.curValue = curValue;
    this.winningValue = winningValue;
    this.revealed = revealed;
  };

})();

$(document).ready(function(){
  var S = window.S = new Sudoku.Board();
  S.populate();
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
});