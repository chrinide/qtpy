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
 * QTPy Move class
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

