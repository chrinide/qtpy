#!/usr/bin/env python
#
# QTPy Mark class
#
# John Driscoll

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
  
  def __init__(self, square, type=move.CLASSIC, player=1, weight=1, link=None):
    self.square = square
    self.type = type
    self.player = player
    self.weight = weight
    self.link = link
  
  def go_classic(self):
    """ Converts a spooky mark into a classic piece and causes entangled marks to collapse """
    
    marks = []
    self.square._spookies = []
    for mark in self.square.marks: # back up other marks in this square
      self.square._spookies.append(mark)
      if mark != self: marks.append(mark)
    # Put a classic mark in the square
    self.square.marks = [ Mark(self.square, type=move.CLASSIC, player=self.player, weight=self.weight) ]
    # Force entangled marks to turn their links into classic moves
    for mark in marks:
      if not mark.link.square.is_classic(): # Prevent reading over a cycle again
        mark.link.go_classic()
  
  def go_spooky(self):
    """ Replace classic piece with spooky and uncollapses squares to the entangled state """
    
    self.square.marks = self.square._spookies
    for mark in self.square.marks:
      if mark.link.square.is_classic():
        mark.link.go_spooky()
















