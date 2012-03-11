#!/usr/bin/env python
#
# Copyright (C) 2010-2012 John Driscoll <johnoliverdriscoll@gmail.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


# QTPy Mark class

import move

class Mark:
  """ Represents a player's mark on the game board
  
  Attributes:
    type: Spooky or Classic
    square: Square this mark resides in
    link: If this is a spooky mark, this is the other mark on the board
    player: Player number 1 or 2
    weight: The mark's weight (turn number)
  """
  
  def __init__(self,
               square,
               type=move.CLASSIC,
               player=1,
               weight=1,
               link=None):
    self.square = square
    self.type = type
    self.player = player
    self.weight = weight
    self.link = link
  
  def go_classic(self):
    """ Converts a spooky mark into a classic piece and causes entangled
    marks to collapse """
    
    marks = []
    self.square._spookies = []
    for mark in self.square.marks: # back up other marks in this square
      self.square._spookies.append(mark)
      if mark != self: marks.append(mark)
    # Put a classic mark in the square
    self.square.marks = [ Mark(self.square, type=move.CLASSIC,
                               player=self.player, weight=self.weight) ]
    # Force entangled marks to turn their links into classic moves
    for mark in marks:
      # Prevent reading over a cycle again
      if not mark.link.square.is_classic():
        mark.link.go_classic()
  
  def go_spooky(self):
    """ Replace classic piece with spooky and uncollapses squares to the
    entangled state """
    
    self.square.marks = self.square._spookies
    for mark in self.square.marks:
      if mark.link.square.is_classic():
        mark.link.go_spooky()
















