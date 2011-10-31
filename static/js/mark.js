/*
 * QTPy Mark class
 *
 * John Driscoll
 */

function Mark() {
  
  this.goClassic = function() {
    // Converts a spooky mark into a classic piece and causes entangled marks to collapse
    
    var marks = [],
        self = this;
    // back up other marks in this square
    for (var i = 0; i < this.square.marks.length; i++) {
      var mark = this.square.marks[i];
      if (mark != this) marks.push(mark);
    }
    // Put a classic mark in the square
    this.square.marks = [ new Mark(this.square, CLASSIC, this.player, this.weight) ];
    // Force entangled marks to turn their links into classic moves
    for (var i = 0; i < marks.length; i++) {
      var mark = marks[i];
      if (!mark.link.square.isClassic()) // Prevent reading over a cycle again
        mark.link.goClassic();
    }
    if (!this.classic) this.animateCollapse();
  };
  
  this.destroy = function() {
    // Destroy marks that will never be played
    
    if (this.spooky) {
      this.spooky.animate({ opacity: 0 }, 500, null, function() { this.hide(); });
      this.orbit.animate({ opacity: 0 }, 500, null, function() { this.hide(); });
      this.line.animate({ opacity: 0 }, 500, null, function() { this.hide(); });
    }
  };
  
  this.animateHide = function() {
    if (this.spooky) {
      this.spooky.stop();
      this.spooky.orbit.animate({ opacity: 0 }, 500, null, function() { this.hide(); });
      this.spooky.link.animate({ opacity: 0 }, 500, null, function() { this.hide(); });
    }
    if (this.link && this.link.spooky) {
      this.link.spooky.orbit.animate({ opacity: 0 }, 500, null, function() { this.hide(); });
      this.link.spooky.animate({ r: 0 }, 500, null, function() { this.hide(); });
    }
  };
  
  this.animateCollapse = function() {
    // Animate
    var fill = qtpy.color(this.player),
        stroke = fill,
        cx = this.square.rect.attr('x') + this.square.rect.attr('width') / 2,
        cy = this.square.rect.attr('y') + this.square.rect.attr('height') / 2,
        m = ra.circle(this.spooky ? this.spooky.attr('cx') : cx,
                      this.spooky ? this.spooky.attr('cy') : cy,
                      this.spooky ? this.spooky.attr('r') : 3).attr({
              fill: fill,
              stroke: stroke
            }).behindBoard();
    this.classic = true;
    // Don't animate squares that have 1 possible classical mark, because the classical mark is
    // already there
    this.animateHide();
    if (this.square.marked) {
      if (this.spooky) this.spooky.hide();
      return;
    }
    m.animate({
      cx: cx,
      cy: cy,
      r: 35
    }, 500, 'bounce', function() { this.stop() });
    // Create new circle for player mark (prevent animation conflict that causes orbiting classical)
    this.animation = m;
    var self = this;
    safeTimeout($game, function() {
      if (self.spooky)
        self.spooky.hide();
      self.animation.hide();
      self.animation.stop();
      ra.circle(cx, cy, 35).attr({
        fill: fill,
        stroke: stroke
      });
    }, 500);
    // Hide original spooky
    if (!this.square.marked && this.spooky)
      this.spooky.hide();
    else if (this.spooky) {
      // marked square
      this.spooky.link.animate({ opacity: 0 }, 500);
    }
    if (this.square.spooky) {
      // Don't even know how a spooky became attached to a square directly.
      this.square.spooky.stop().hide();
      this.square.spooky.orbit.hide();
    }
  };
  
  // init
    this.square = arguments[0];
    this.type = arguments[1] || CLASSIC;
    this.player = arguments[2] || 1;
    this.weight = arguments[3] || 1;
    this.link = arguments[4] || null;
}