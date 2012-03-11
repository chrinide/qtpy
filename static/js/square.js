/*
 * Copyright (C) 2010-2012 John Driscoll <johnoliverdriscoll@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * QTPy Square class
 */

function Square(num) {
  
  this.findPath = function() {
    /* Find a route to a square. If no square argument supplied, find path to self
    Returns array of square #s if route is found
    Returns None otherwise
    */
    
    var target = arguments[0] || this,
        ignore = arguments[1] || [];
    for (var i = 0; i < this.marks.length; i++) {
      var mark = this.marks[i],
          goNext = false;
      for (var j = 0; j < ignore.length; j++)
        if (ignore[j] == mark) {
          goNext = true;
          break;
        }
      if (goNext) continue;
      if (mark.type == SPOOKY) {
        if (mark.link.square == target) {// Path found!
          return [ [ self.num ], [ mark, mark.link ] ];
        } else {
          // Search down path of linked squares
          ignore.push(mark);
          ignore.push(mark.link);
          var path = mark.link.square.findPath(target, ignore);
          if (path !== null) {
            // Cycle was found down the line
            // Append this square number as part of the path
            path[0].push(self.num);
            path[1].push(mark);
            path[1].push(mark.link);
            return path;
          }
        }
      }
    }
    return null;
  };
  
  this.isClassic = function() {
    // Returns true if square contains classical move
    
    if (!self.marks.length) return false;
    if (self.marks[0].type == CLASSIC) return true;
    return false;
  };
  
  this.marker = function() {
    // Returns the player number of the square if it's marked, else null
    
    if (!self.marks.length) return null;
    if (self.marks[0].type == CLASSIC) return self.marks[0].player;
    return null;
  };
  
  this.collapse = function(cycle) {
    // Collapse self and all entangled squares
    
    var early = null;
    cycle.sort();
    for (var i = 0, marks = qtpy.state.square(cycle[0]).marks; i < marks.length; i++) {
      var mark = marks[i];
      for (var j = 0; j < cycle.length; j++) {
        if (mark.link.square.num == cycle[j]) {
          if (early === null) early = mark;
          else if (mark.weight < early.weight) { early = mark; break; }
        }
      }
    }
    if (this.num == cycle[0])
      early.goClassic();
    else
      early.link.goClassic();
  };
  
  this.newSpooky = function(player, weight, rot) {
  
    // Creates a new spooky mark in the square
    
    if (this.marked) return;
    
    var self = this,
        o = this.rect,
        x = o.attr('x'),
        y = o.attr('y'),
        w = o.attr('width'),
        h = o.attr('height'),
        cr = weight * 5 - (weight * weight / 20),
        co = qtpy.color(player);
    
    var p = ra.circlePath(x + w/2, y + h/2, cr, rot)
      .attr({
        fill: null,
        stroke: qtpy.lightColor(player),
        cx: x + w/2,
        cy: y + h/2,
        r: cr
      })
      .behindBoard();
    var spooky = ra.circle()
      .attr({
        fill: co,
        stroke: co,
        r: 3,
        cx: x + w/2,
        cy: y + h/2 + (rot ? cr : -cr)
      });
    spooky.orbit = p;
    
    var dur = weight * weight * 750 + 250;
    
    function orbit() {
      spooky.animateAlong(spooky.orbit, dur, false, safeCallback($game, function() {
        if (spooky.classic || self.marked) return;
        if (qtpy.state.outcome) { spooky.hide(); spooky.orbit.hide(); spooky.link.hide(); }
        if (!rot)
          spooky.attr({ cx: x + w/2, cy: y + h/2 - cr });
        else
          spooky.attr({ cx: x + w/2, cy: y + h/2 + cr });
        safeTimeout($game, orbit);
      }));
    }
    orbit();
    return spooky;
  };
  
  this.startSpooky = function() {
    // Put player mark in square for start of spooky link
    
    var player = arguments[0],
        weight = arguments[1] || qtpy.state.weight;
    this.spooky = this.newSpooky(player, weight);
    qtpy.state.spookySquare = this;
  };
  
  this.finishSpooky = function() {
    // Put player mark in square for end of move
    
    if (this.marked) return;
    
    var player = arguments[0],
        fromSquare = arguments[1],
        weight = arguments[2] || qtpy.state.weight,
        start = fromSquare.spooky,
        end = this.newSpooky(player, weight, true),
        m1 = fromSquare.marks[fromSquare.marks.length - 1],
        m2 = this.marks[this.marks.length - 1],
        link = ra.path().attr('stroke', qtpy.lightColor(player)).behindBoard();
    
    start.link = link;
    end.link = link;
    
    // add spooky vars to new marks
    
    m1.spooky = start;
    m1.orbit = start.orbit;
    m1.line = start.link
    m2.spooky = end;
    m2.orbit = end.orbit;
    m2.line = end.link;
    delete fromSquare.spooky;
    
    // Link marks with path
    function adjustLine() {
      link.attr('path', 'M' + start.attr('cx') + ',' + start.attr('cy') + 'L' + end.attr('cx') + ',' + end.attr('cy'));
    }
    
    start.onAnimation(adjustLine);
    end.onAnimation(adjustLine);
    
  };
  
  this.click = function() {
    // handle user clicks
    
    if (this.clicked || !qtpy.state.validSquares[this.num]) return;
    
    switch(qtpy.state.nextAction) {
    
    case START_SPOOKY:
      this.startSpooky(1);
      qtpy.state.nextAction = FINISH_SPOOKY;
      qtpy.status.queue('Your turn (2 of 2)');
      break;
      
    case FINISH_SPOOKY:
      if (this.spooky) // first spooky marker is already in this square
        return;
      
      // Apply move
      var a = qtpy.state.spookySquare.num,
          b = this.num;
      if (a > b) {
        var t = a;
        a = b;
        b = t;
      }
      qtpy.state.step(new Move(1, qtpy.state.weight, a, b));
      this.finishSpooky(1, qtpy.state.spookySquare, qtpy.state.weight - 1);
      break;
      
    case MEASURE:
      // Measure a square and (hopefully) put mark in it
      // Do I have diverse markings?
      if (!qtpy.state.diverseSquares[this.num]) return;
      // Get the two standard notation options
      var early = null,
          cycle = qtpy.state.cycleSquares.slice(0);
      cycle.sort();
      var sq = qtpy.state.square(cycle[0]),
          early = null;
      for (var i = 0; i < sq.marks.length; i++) {
        var mark = sq.marks[i];
        for (var j = 0; j < cycle.length; j++)
          if (mark.link.square.num == cycle[j])
            if (early === null || mark.weight < early.weight)
              early = mark;
      }
      // Do a test collapse on the 1st mark and see if it puts the player's
      // mark in the clicked square
      var squares = [];
      function expand(mark) {
        squares[mark.square.num] = mark.player;
        for (var i = 0; i < mark.square.marks.length; i++) {
          var m = mark.square.marks[i];
          if (m == mark || squares[m.link.square.num]) continue;
          expand(m.link);
        }
      }
      expand(early);
      if (squares[this.num] == 1)
        safeTimeout($game, function() { qtpy.state.step(new Move(1, early.weight, 0, early.square.num)) });
      else
        safeTimeout($game, function() { qtpy.state.step(new Move(1, early.weight, 0, early.link.square.num)) });
      break;
    
    default: return;
    }
    
    // Choice accepted
    self.validSquares = []; // disable user clicking
    this.clicked = true;
  };
  
  // init
    this.num = num;
    this.marks = [];
    this.rect = ra.rect().attr({ width: 104, height: 104, 'stroke-width': 0, stroke: 'transparent', fill: '#FFF' });
    if (num >= 3 && num <= 6) this.rect.attr('height', 105);
    // create hotspot
    switch (num) {
    case 1: this.rect.attr({ x: 2, y: 2 + qtpy.boardOffset }); break;
    case 2: this.rect.attr({ x: 108, y: 2 + qtpy.boardOffset }); break;
    case 3: this.rect.attr({ x: 214, y: 2 + qtpy.boardOffset }); break;
    case 4: this.rect.attr({ x: 2, y: 107 + qtpy.boardOffset }); break;
    case 5: this.rect.attr({ x: 108, y: 107 + qtpy.boardOffset }); break;
    case 6: this.rect.attr({ x: 214, y: 107 + qtpy.boardOffset }); break;
    case 7: this.rect.attr({ x: 2, y: 214 + qtpy.boardOffset }); break;
    case 8: this.rect.attr({ x: 108, y: 214 + qtpy.boardOffset }); break;
    case 9: this.rect.attr({ x: 214, y: 214 + qtpy.boardOffset }); break;
    }
    
    var self = this;
}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  