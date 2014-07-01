(function(){
  var Sudoku = this.Sudoku = (this.Sudoku || {});

  var DIGITS = Sudoku.DIGITS = "123456789";

  var Board = Sudoku.Board = function(difficulty){
    this.grid = this._generateGrid();
    this.populate(difficulty);
    this.selectedNumber = null;
    this.deleteMode = false;
    this.conflictMode = false;
    this.answerMode = false;
    this.noteMode = false;
  };

  Board.prototype.addNote = function(id, target){
    if(!this.selectedNumber){
      return;
    }
    var square = this.grid[id[0]][id[1]];
    if(square.notes[this.selectedNumber]){
      delete square.notes[this.selectedNumber]
    } else {
      square.notes[this.selectedNumber] = true;
    }
    $(target).html(Object.keys(square.notes).join(' '));
  };

  Board.prototype.findConflicts = function(){
    $('.conflict').removeClass('conflict');
    this._findRowConflicts();
    this._findColumnConflicts();
    this._findGroupConflicts();
  };

  Board.prototype.flagConflicts = function(valueMap){
    var conflicts =  []
    _.each(Object.keys(valueMap), function(key){
      if(key !== "" && valueMap[key].length > 1){
        conflicts = conflicts.concat(valueMap[key]);
      }
    });
    _.each(conflicts, function(conflict){
      return $('#board-container').find('[data-id="' + conflict[0] + conflict[1] + '"]').addClass('conflict');
    });
  };

  Board.prototype.flagWrongAnswers = function(){
    var flatBoard = _.flatten(this.grid);
    _.each(flatBoard, function(square){
      if(square.curValue !== "" && square.curValue !== square.winningValue){
        var pos = square.pos;
        return $('#board-container').find('[data-id="' + pos[0] + pos[1] + '"]').removeClass('highlighted').addClass('incorrect');
      }
    });
  };

  Board.prototype.full = function() {
    var flatBoard = _.flatten(this.grid);
    var allValues = _.map(flatBoard, function(square){
      return square.curValue;
    });
    return allValues.indexOf("") === -1;
  };

  Board.prototype.groups = function(){
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
    return groups;
  };

  Board.prototype.highlightCells = function(){
    $('div.cell.highlighted').removeClass('highlighted');
    for(var i = 0; i < this.grid.length; i++){
      for(var j = 0; j < this.grid[i].length; j++){
        if(this.grid[i][j].curValue === this.selectedNumber){
          $('#board-container').find('[data-id="' + i + j + '"]').addClass('highlighted');
        }
      }
    }
  };

  Board.prototype.populate = function(idx){
    var value, revealed, pos;
    var board = window.BOARDS[idx];
    var x = 0;
    for(var i = 0; i < 9; i++){
      for(var j = 0; j < 9; j++){
        value = board[1][x];
        revealed = board[0][x] === 0 ? false : true;
        pos = [i,j]; 
        if(revealed){
          this.setCoord([i,j], new Square(value, value, revealed, pos));
        } else{
          this.setCoord([i,j], new Square("", value, revealed, pos));
        }
        x++;
      }
    }
  };

  Board.prototype.render = function(el){
    for(var i = 0; i < this.grid.length; i++){
      $(el).append('<div class="row"></div>');
      var row = $(el).find('.row').last();
      for(var j = 0; j < 9; j++){
        row.append('<div class="cell" data-id="' + i + j + '"><div class="cell-inner"></div></div>');
        var square = this.grid[i][j];
        var cell = $('div').find('[data-id="' + i + j + '"]');
        if(square.revealed){
          cell.addClass('revealed').find('.cell-inner').append(square.curValue);
        } else{
          cell.addClass('guessed').prepend('<div class="notes"></div>');
        }
      }
    }
  };

  Board.prototype.setCoord = function(arr, val){
    if(typeof this.grid[arr[0]][arr[1]] == "object"){
      this.grid[arr[0]][arr[1]].curValue = val;
    } else {
      this.grid[arr[0]][arr[1]] = val;
    }
  };

  Board.prototype.selectButton = function(target){
    if(this.deleteMode){
      this.toggleDeleteMode();
    }
    this.selectedNumber = parseInt($(target).val());
    this.highlightCells();
  };


  Board.prototype.toggleAnswerMode = function(){
    this.answerMode ? this.answerMode = false : this.answerMode = true;
    if(this.answerMode){
      this.flagWrongAnswers();
    } else {
      $('div.cell').removeClass('incorrect');
      this.highlightCells();
    }
  };

  Board.prototype.toggleConflictMode = function(){
    this.conflictMode ? this.conflictMode = false : this.conflictMode = true;
    if(this.conflictMode){
      this.findConflicts();
    } else {
      $('div.cell').removeClass('conflict');
    }
  };

  Board.prototype.toggleDeleteMode = function(){
    this.selectedNumber = null;
    this.deleteMode ? this.deleteMode = false : this.deleteMode = true;
  };

  Board.prototype.toggleNoteMode = function(){
    if(this.noteMode){
      this.noteMode = false;
      $('.notes').removeClass('forward');
    } else {
      this.noteMode = true
      $('.notes').addClass('forward');
    }
  };

  Board.prototype.updateCell = function(id, target){
    if(this.deleteMode){
      this.setCoord([id[0], id[1]], '');
      $(target).html("").parent()
        .removeClass('highlighted')
        .removeClass('incorrect')
        .prepend('<div class="notes"></div');
    } else if(this.selectedNumber){
      this.setCoord([id[0], id[1]], this.selectedNumber);
      $(target).html(this.selectedNumber)
        .parent().addClass('highlighted')
        .find('.notes').remove();
    }

    if(this.answerMode){
      this.flagWrongAnswers();
    }

    if(this.conflictMode){
      this.findConflicts();
    }

    if(this.won()){
      $('#win').fadeIn();
    }
  };

  Board.prototype.won = function(){
    return this.full() && this.checkRows() && this.checkColumns() && this.checkGroups();
  };

  Board.prototype._check = function(array){
    for(var i = 0; i < array.length; i++){
      if(_.find(array[i], function(square){
        return square.curValue !== square.winningValue;
      })){
        return false;
      }
    };
    return true;
  };

  Board.prototype._checkRows = function(){
    return this.check(this.grid);
  };

  Board.prototype._checkColumns = function(){
    var transposedGrid = _.zip.apply(_, this.grid);
    return this.check(transposedGrid);
  };

  Board.prototype._checkGroups = function(){
    return this.check(this.groups());
  };

  Board.prototype._findRowConflicts = function(){
    var valueMaps = this._mapValues(this.grid);
    _.each(valueMaps, function(valueMap){
      this.flagConflicts(valueMap);
    }, this);
  };

  Board.prototype._findColumnConflicts = function(){
    var transposedGrid = _.zip.apply(_, this.grid)
    var valueMaps = this._mapValues(transposedGrid);
    _.each(valueMaps, function(valueMap){
      this.flagConflicts(valueMap);
    }, this);
  };

  Board.prototype._findGroupConflicts = function(){
    var valueMaps = this._mapValues(this.groups());
    _.each(valueMaps, function(valueMap){
      this.flagConflicts(valueMap);
    }, this);
  };

  Board.prototype._generateGrid = function(){
    var grid = new Array(9);
    for(var i = 0; i < grid.length; i++){
      grid[i] = new Array(9);
    }
    return grid;
  };

  Board.prototype._mapValues = function(grid){
    var valueMap, value;
    var valueMaps = [];
    for(var i = 0; i < grid.length; i++){
      valueMap = {};
      for(var j = 0; j < grid.length; j++){
        value = grid[i][j].curValue;
        if(valueMap[value]){
          valueMap[value].push(grid[i][j].pos);
        } else {
          valueMap[value] = [grid[i][j].pos];
        }
      }
      valueMaps.push(valueMap);
    }
    return valueMaps;
  };

  var Square = Sudoku.Square = function(curValue, winningValue, revealed, pos){
    this.curValue = curValue;
    this.winningValue = winningValue;
    this.revealed = revealed;
    this.pos = pos;
    this.notes = {};
  };

})();

$(document).ready(function(){
  $('.menu-buttons').click(function(event){
    var difficulty = $(event.target).val();
    var S = window.S = new Sudoku.Board(difficulty);
    var $el = $('#board-container');
    $('#menu').hide();
    $('#main-container').show();
    S.render($el);
  });

  $('button#notes-button').click(function(event){
    $(event.target).toggleClass('selected');
    $('button#delete-button').removeClass('selected');
    S.toggleNoteMode();
  });

  $('button.number-button').click(function(event){
    S.selectButton(event.target);
    $('button.number-button').removeClass('selected');
    $('button#delete-button').removeClass('selected');
    $(event.target).addClass('selected');
  });

  $('button#conflict-button').click(function(event){
    $(event.target).toggleClass('selected');
    S.toggleConflictMode();
  });

  $('button#answer-button').click(function(event){
    $(event.target).toggleClass('selected');
    S.toggleAnswerMode();
  });

  $('button#delete-button').click(function(event){
    $(event.target).toggleClass('selected');
    $('button.number-button').removeClass('selected');
    $('button#notes-button').removeClass('selected');
    S.noteMode = false;
    $('.notes').removeClass('forward');
    S.toggleDeleteMode();
  });

  $('#board-container').delegate('div.guessed div.cell-inner', 'click', function(event){
    var id = $(event.target).parent().data('id').toString();
    S.updateCell(id, event.target);
  }).delegate('div.notes', 'click', function(event){
      event.stopPropagation();
      var id = $(event.target).parent().data('id').toString();
      S.addNote(id, event.target);
    });
});
