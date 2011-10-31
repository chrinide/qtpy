/*
 * QTPy Move class
 *
 * John Driscoll
 */

function Move(player, weight, sq1, sq2, autoCollapse) {
  
  this.dumps = function() {
    // Return move as a standard notation string
    
    return this.sq1.toString() + this.sq2.toString();
  }
  
  // init
    this.player = player;
    this.weight = weight;
    this.sq1 = parseInt(sq1);
    this.sq2 = parseInt(sq2);
    if (sq1 && sq2 && sq1 == sq2) // Classic move in last remaining square (eg 11, 22, 33)
      this.type = CLASSIC;
    else if (sq1 && sq2) // Spooky move (12, 23, 45)
      this.type = SPOOKY;
    else if (sq1 == 0 && sq2) // Collapse move (01, 02, 03)
      this.type = COLLAPSE;
    if (autoCollapse) this.autoCollapsed = true;
}

