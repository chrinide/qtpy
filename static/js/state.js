/*
 * QTPy Game state class
 *
 * John Driscoll
 */

/* Global vars */

// Move types
CLASSIC = 1
SPOOKY = 2
COLLAPSE = 3

// Action types
START_SPOOKY = 1;
FINISH_SPOOKY = 2;
MEASURE = 3;

function State() {
  
  this.square = function(i) {
    // Return square where i is its 1-based index
    
    return this.squares[i-1];
  };
  
  this.update = function() {
    // Update state variables and find clickable squares
    
    this._findCycle();
    this.validMoves = this.getValidMoves();
    this.validSquares = [];
    this.outcome = this.getOutcome();
    if (this.outcome) {
      // remove remaining spooky marks
      for (var i = 0; i < 9; i ++)
        for (var j = 0; j < this.squares[i].marks.length; j++) {
          var mark = this.squares[i].marks[j];
          if (mark.type == SPOOKY)
            mark.destroy();
        }
      return;
    }
    
    // Assemble list of clickable squares
    // Is it the player's turn?
    if (!this.moves.length ||
          (this.moves.length && (last = this.moves[this.moves.length - 1]) &&
            (last.player == 2 && last.type != COLLAPSE) ||
            (last.player == 1 && last.type == COLLAPSE)))
      this.turn = 1;
    else this.turn = 2;
    var valid = [];
    if (this.cycleSquares) {
      // only cycle squares clickable
      var cy = this.cycleSquares;
      for (var i = 0; i < cy.length; i++)
        valid[cy[i]] = true;
      this.nextAction = MEASURE;
      if (this.turn == 1) qtpy.status.queue('Your turn (Make a measurement)');
    } else {
      // all valid move squares clickable
      var moves = this.validMoves;
      for (var i = 0; i < moves.length; i++) {
        valid[parseInt(moves[i][0])] = true;
        valid[parseInt(moves[i][1])] = true;
      }
      if (moves.length > 1) {
        this.nextAction = START_SPOOKY;
        if (this.turn == 1 && window.qtpy && qtpy.status) qtpy.status.queue('Your turn (1 of 2)');
      }
    }
    if (this.turn == 1) {
      this.validSquares = valid;
      this.botSquares = null;
    } else {
      this.botSquares = valid;
    }

  };
  
  this.step = function(m) {
    // Performs a move on the state
    
    // skip auto-completed moves served from the server
    if (this.moves.length) {
      var last = this.moves[this.moves.length - 1];
      if (last.sq1 == m.sq1 && last.sq2 == m.sq2 && last.autoCollapsed) return;
    }
    
    var self = this;
    if (m.type == CLASSIC) {
      // Put a single classic mark in a square
      var sq = this.square(m.sq1);
      // Last move made was a classic mark
      // We need to draw it
      ra.circle(sq.rect.attr('x') + sq.rect.attr('width') / 2, sq.rect.attr('y') + sq.rect.attr('height') / 2, 0)
        .attr({
          fill: qtpy.color(m.player),
          stroke: qtpy.color(m.player)
        }).animate({ r: 35 }, 500, 'bounce');
      sq.marks = [ new Mark(sq, CLASSIC, m.player, m.weight) ];
    } else if (m.type == SPOOKY) {
      // Put two spooky marks in the squares
      a = new Mark(this.square(m.sq1), SPOOKY, m.player, m.weight);
      b = new Mark(this.square(m.sq2), SPOOKY, m.player, m.weight, a);
      a.link = b;
      this.square(m.sq1).marks.push(a);
      this.square(m.sq2).marks.push(b);
      if (m.player == 2) {
        // Create bot's spookies
        this.square(m.sq1).startSpooky(2, this.weight);
        this.square(m.sq2).finishSpooky(2, this.square(m.sq1), this.weight);
      }
    } else if (m.type == COLLAPSE) {
      // Collapse a square
      this.square(m.sq2).collapse(this.cycleSquares.slice(0));
    }
    this.moves.push(m);
    this.weight++;
    this.update();
    
    if (!this.outcome) {
      
      // Get bot move
      if (m.player == 1 && m.type != COLLAPSE) {
        qtpy.status.queue('My turn (Thinking...)');
        function getMove(currentState) {
          safeTimeout($game, function() {
            $.post('/getmove', { state: currentState, difficulty: window.difficulty }, safeCallback($game, function(args) {
              bot = args[0];
              if (bot.length) {
                var moves = bot.split('/');
                function doMove(move) {
                  safeTimeout($game, function() { self.step(new Move(2, self.weight, parseInt(move[0]), parseInt(move[1]))); });
                }
                for (var i = 0; i < moves.length; i++) doMove(moves[i]);
              }
            }));
          }, 2); // use 2 delay in case we need to automate marks or moves
        }
        getMove(self.dumps());
      }
      
      // If the player has no marks in the cycle,
      // auto-collapse the lowest square number
      if (self.cycleSquares) {
        var diverse = false;
        for (var i = 1; i <= 9; i++)
          if (self.diverseSquares[i]) {
            diverse = true;
            break;
          }
        if (!diverse) {
          var cycle = self.cycleSquares.slice(0);
          cycle.sort();
          safeTimeout($game, function() { self.step(new Move(parseInt((!(m.player-1))+1), self.weight, 0, cycle[0], true)); });
          return;
        }
      }
      
      self.indicateValidSquares(function() {
        
        // Check for single-path moves and auto-complete them
        
        // Auto mark last move in game if that's the case
        if (self.validMoves.length == 1) {
          var x = parseInt(self.validMoves[0][0]);
          safeTimeout($game, function() { self.step(new Move(1, self.weight, x, x)); });
          return;
        }
        
        // Auto spooky if its the player's turn and there are only two remaining squares
        if (((m.player == 2 && m.type != COLLAPSE) ||
            (m.player == 1 && m.type == COLLAPSE)) &&
            !self.cycleSquares && self.validMoves.length == 2 &&
            self.validMoves[0][0] == self.validMoves[1][1] &&
            self.validMoves[0][1] == self.validMoves[1][0]) {
          var sq1 = parseInt(self.validMoves[0][0]),
              sq2 = parseInt(self.validMoves[0][1]);
          safeTimeout($game, function() {
            self.step(new Move(1, self.weight, sq1, sq2));
            self.square(sq1).startSpooky(1, self.weight);
            self.square(sq2).finishSpooky(1, self.square(sq1), self.weight);
          });
          return;
        }
        
      });
      
      // Allow user input
      for (var i = 0; i < 9; i++)
        this.squares[i].clicked = false;
      
      return;
    }
  
    // game over!
    
    // report outcome to server if player made last move
    if (self.moves[self.moves.length - 1].player == 1)
      $.post('/getmove', { state: self.dumps() });
    safeTimeout($game, function() {
      // shade in colored lines and report scores
      var lines = self.outcome[2],
          drawn = [];
      for (var i = 0; i < lines.length; i++)
        for (var j = 1; j < lines[i].length; j++) {
          if (drawn[lines[i][j]]) continue;
          self.square(lines[i][j]).rect.animate({ fill: qtpy.lightColor(lines[i][0]) }, 500);
          drawn[lines[i][j]] = true;
        }
      for (var i = 1; i <= 9; i++)
        if (!drawn[i])
          self.square(i).rect.animate({ fill: '#FFF' }, 500);
      var t,p,c;
      if (self.outcome[0] == self.outcome[1]) {
        t = 'No winner';
        c = '#000';
      } else {
        if (self.outcome[0] > self.outcome[1]) {
          p = [ 'You', 0, 1 ];
          c = '#00F';
        } else {
          p = [ 'I', 1, 0 ];
          c = '#F00';
        }
        function fr(fl) {
          if (fl == .5) return '&#189;';
          if (fl == 1.5) return '1&#189;';
          return fl.toString();
        }
        t = p[0] + ' win (' + fr(self.outcome[p[1]]) + ' to ' + fr(self.outcome[p[2]]) + ')';
      }
      // Show final score
      if ($(document.body).is('.mobileSafari')) {
        var flash = function() {
          qtpy.status.queue(t, c);
          safeTimeout($game, function() {
            qtpy.status.queue('Flip for new game');
            safeTimeout($game, flash, 3000);
          }, 3000);
        };
        flash();
      } else {
        // Reset game code
        safeTimeout($game, function() {
          $(document.body).dblclick(safeCallback($game, function() {
            if ($(document.body).is('.info')) return;
            qtpy.newGame();
          }));
        }, 500);
        $('<div id="capture">').prependTo(document.body); // dblclick on body capture target
        var flash = function() {
          qtpy.status.queue(t, c);
          safeTimeout($game, function() {
            qtpy.status.queue('Double-click for new game');
            safeTimeout($game, flash, 3000);
          }, 3000);
        };
        flash();
      }
    });
    
  };
  
  this.indicateValidSquares = function(cb) {
    // Indicate clickable squares and calls CB when done
    
    var count = 0, a = 0; //animation counter;
    function done() {
      if (++a == count && cb) cb();
    }
    
    if (this.cycleSquares) {
      
      // Gray out squares that aren't in the cycle
      var filled = [];
      for (var i = 0; i < 9; i++) {
        var found = false;
        for (var j = 0; j < this.cycleSquares.length; j++)
          if (this.cycleSquares[j] == i+1) {
            found = true;
            break;
          }
        if (!found) {
          filled[i+1] = true;
          count++;
          this.squares[i].rect.animate({ fill: '#666' }, 250, done);
        }
      }
      
      // Fill boxes with no diversity
      for (var i = 1; i <= 9; i++) {
        var sq = this.square(i), found = false;
        for (var j = 0; j < this.cycleSquares.length; j++) {
          if (this.cycleSquares[j] == i) {
            found = true;
            break;
          }
        }
        if (found && !this.diverseSquares[i]) {
          sq.marked = true; // so we dont animate classic mark in here later
          filled[sq.num] = true;
          count++;
          // draw player mark in square
          sq.rect.animate({ fill: '#CCC'  }, 250, done);
          function killMark(m, mark, x, y) {
            return safeCallback($game, function() { m.hide(); mark.attr({'cx': x, 'cy': y}); done(); });
          }
          function keepMark(m, mark, x, y) {
            return safeCallback($game, function() { m.toFront().attr({'cx': x, 'cy': y}); done(); });
          }
          var keep = false, found = false;
          // find color for square
          var player;
          for (var k = 0; k < sq.marks.length; k++) {
            for (var l = 0; l < this.cycleMarks.length; l++) {
              if (sq.marks[k] == this.cycleMarks[l]) {
                player = sq.marks[k].player;
                break;
              }
            }
          }
          var co = qtpy.color(player),
              x = sq.rect.attr('x') + sq.rect.attr('width') / 2,
              y = sq.rect.attr('y') + sq.rect.attr('height') / 2;
          for (var k = 0; k < sq.marks.length; k++) {
            keep = false;
            var mark = sq.marks[k].spooky;
            if (!mark) {
              if (sq.spooky) {
                sq.spooky.stop().hide();
                sq.spooky.orbit.hide();
              }
              continue;
            }
            if (sq.marks[k].player == player) {
              if (!found) {
                found = true;
                keep = true;
              }
            } else {
              continue;
            }
            count+=2;
            mark.stop().hide();
            var m = ra.circle(mark.attr('cx'), mark.attr('cy'), mark.attr('r')).attr({ fill: co, stroke: co });
            m
              .behindBoard()
              .animate({
                cx: x,
                cy: y,
                r: 35
              }, 250, 'bounce', keep ? keepMark(m, mark, x, y) : killMark(m, mark, x, y));
            mark.orbit.animate({ opacity: 0 }, 250, done);
            mark.animation = m;
            mark.hide();
          }
        }
      }
      
      // Collapse squares that are entangled
      
      function expand(mark) {
        // animation helper
        mark.animateCollapse();
        var sq = mark.square;
        for (var i = 0; i < sq.marks.length; i++)
          if (sq.marks[i] != mark)
            expand(sq.marks[i].link);
      }
      
      // find marks that are in cycle squares, but aren't part of the cycle
      for (var i = 0; i < this.cycleSquares.length; i++) {
        var sq = this.square(this.cycleSquares[i]);
        for (var j = 0; j < sq.marks.length; j++) {
          var mark = sq.marks[j],
              found = false;
          for (var k = 0; k < this.cycleMarks.length; k++)
            if (this.cycleMarks[k] == mark)
              found = true;
          if (!found)
            expand(mark.link);
        }
      }
      
      // Fill diverse squares white
      for (var i = 1; i <= 9; i++)
        if (!filled[i]) {
          count++;
          this.square(i).rect.animate({ fill: '#FFF' }, 250, done);
        }
      
    } else if (!this.cycleSquares) {
      
      // animate clickable squares
      count = 9;
      var col = this.validSquares;
      if (this.turn == 2) col = this.botSquares;
      for (var i = 1; i <= 9; i++) {
        if (col[i])
          this.square(i).rect.animate({ fill: '#FFF' }, 250, done);
        else
          this.square(i).rect.animate({ fill: '#CCC' }, 250, done);
      }
      
    }
  };
  
  this.getOutcome = function() {
    // Check if the game is over and return an array of the score: [ Player, Bot ]
    
    // Look for lines and calculate weights
    var self = this,
        g = [ [], [] ], // player scores
        l = []; // lines made
    function s(i) { return self.squares[i].marker(); }
    function w(i,j) { return self.squares[i*3+j].marks[0].weight; }
    function m(a,b,c) { return Math.max(Math.max(a,b),c); }
    function o(player, ax, ay, bx, by, cx, cy) { g[player-1].push(m(w(ax,ay),w(bx,by),w(cx,cy))); l.push([player,ax*3+ay+1,bx*3+by+1,cx*3+cy+1]); }
    var p = [ [ s(0), s(1), s(2) ], [ s(3), s(4), s(5) ], [ s(6), s(7), s(8) ] ];
    // if 3-in-a-row marked by same player: score line for player
    if (p[0][0] && p[0][0] == p[0][1] && p[0][0] == p[0][2]) o(p[0][0], 0,0, 0,1, 0,2);
    if (p[1][0] && p[1][0] == p[1][1] && p[1][0] == p[1][2]) o(p[1][0], 1,0, 1,1, 1,2);
    if (p[2][0] && p[2][0] == p[2][1] && p[2][0] == p[2][2]) o(p[2][0], 2,0, 2,1, 2,2);
    if (p[0][0] && p[0][0] == p[1][0] && p[0][0] == p[2][0]) o(p[0][0], 0,0, 1,0, 2,0);
    if (p[0][1] && p[0][1] == p[1][1] && p[0][1] == p[2][1]) o(p[0][1], 0,1, 1,1, 2,1);
    if (p[0][2] && p[0][2] == p[1][2] && p[0][2] == p[2][2]) o(p[0][2], 0,2, 1,2, 2,2);
    if (p[0][0] && p[0][0] == p[1][1] && p[0][0] == p[2][2]) o(p[0][0], 0,0, 1,1, 2,2);
    if (p[0][2] && p[0][2] == p[1][1] && p[0][2] == p[2][0]) o(p[0][2], 0,2, 1,1, 2,0);
    // Determine final scores
    if (g[0].length) {
      if (g[0].length == 1) {
        if (g[1].length) {
          if (g[0][0] < g[1][0]) return [ 1, .5, l ];
          return [ .5, 1, l ];
        }
        return [ 1, 0, l ];
      }
      if (g[0][0] == g[0][1]) return [ 2, 0, l ];
      return [ 1.5, 0, l ];
    } else if (g[1].length) return [ 0, 1, l ];
    // Check for cat's game
    empty = false;
    for (var i = 0; i < 9; i++)
      if (!self.squares[i].isClassic())
        empty = true;
    if (!empty) return [ 0, 0, l ];
    // Active game
    return null;
  };
  
  this.getValidMoves = function() {
    // If all squares are occupied by classic moves except one, that's the only valid move
    
    var empty = false,
        marked = 0,
        spookies = [];
    for (var i = 0; i < 9; i++) {
      if (!this.squares[i].marks.length) {
        empty = i+1;
        spookies.push(i);
      } else if (this.squares[i].marks[0].type == CLASSIC) {
        marked++;
      } else {
        spookies.push(i);
      }
    }
    if (marked == 8 && empty !== false)
      return [ empty.toString() + empty.toString() ];
    // If there are any cyclical squares open, the only valid move is to close the cycle
    valid = [];
    cycle = this.cycleSquares;
    if (cycle) {
      for (var i = 0; i < cycle.length; i++)
        valid.push('0' + cycle[i].toString());
      return valid;
    }
    // Else we need combos of all spooky squares
    spookies.sort();
    for (var i = 0; i < spookies.length; i++)
      for (var j = 0; j < spookies.length; j++)
        if (i != j) valid.push((spookies[i]+1).toString() + (spookies[j]+1).toString());
    return valid;
  };
  
  this._findCycle = function() {
    // Returns an array of integers representing all the squares in a cycle or None if there is no cycle
    for (var i = 0; i < 9; i++) {
      if (path = this.squares[i].findPath()) {
        this.cycleSquares = path[0];
        this.cycleMarks = path[1];
        // find diverse squares in cycle
        this.diverseSquares = [];
        for (var i = 0; i < this.cycleSquares.length; i++) {
          var sq = this.square(this.cycleSquares[i]),
              diverse = false,
              p = null,
              marks = this.cycleMarks.slice(0);
          for (var j = 0; j < sq.marks.length; j++) {
            var mark = sq.marks[j];
            for (var k = 0; k < marks.length; k++)
              if (marks[k] == mark) {
                if (p === null) p = mark.player;
                else if (p != mark.player) {
                  diverse = true;
                  break;
                }
                marks.splice(k,1);
              }
            if (diverse) break;
          }
          if (diverse) this.diverseSquares[sq.num] = true;
        }
        return;
      }
    }
    this.cycleSquares = null;
    this.cycleMarks = null;
    this.diverseSquares = null;
  };
  
  this.validMove = function(move) {
    // Returns true if move can be played on the current game state
    
    moves = this.validMoves;
    notation = move.dumps();
    for (var i = 0; i < moves.length; i++)
      if (moves[i] == notation) return true;
    return false;
  };
  
  this.dumps = function() {
    // Return the game state as a standard notation string
    
    var moves = [];
    for (var i = 0; i < this.moves.length; i++)
      moves.push(this.moves[i].dumps());
    return moves.join('/');
  };
  
  // init
    this.weight = 1;
    this.squares = [];
    this.moves = [];
    this.outcome = null;
    this.cycleSquares = null;
    this.cycleMarks = null;
    this.nextAction = START_SPOOKY;
    for (var i = 0; i < 9; i++) this.squares[i] = new Square(i+1);
    this.update();
}
  

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  