#!/usr/bin/env python
#
# QTPy Move class
#
# John Driscoll

CLASSIC = 1
SPOOKY = 2
COLLAPSE = 3

class Move:
  """ Notes a move in the game.
  
  Attributes:
    player: Player number
    weight: Turn number
    type: Classic, Spooky, or Collapse
    sq1: First square number
    sq2: Second square number
  """
  
  def __init__(self, player, weight, sq1, sq2):
    """ Init a Move object with its type and Marks collection """
    
    type = None
    sq1 = int(sq1)
    sq2 = int(sq2)
    # Classic move in last remaining square (eg 11, 22, 33)
    if sq1 and sq2 and sq1 == sq2: 
      type = CLASSIC
    # Spooky move (12, 23, 45)
    elif sq1 and sq2: 
      type = SPOOKY
    # Collapse move (01, 02, 03)
    elif sq1 == 0 and sq2:
      type = COLLAPSE
    if not type:
      raise Exception('Invalid move data')
    self.player = player
    self.weight = weight
    self.sq1 = int(sq1)
    self.sq2 = int(sq2)
    self.type = type
  
  def dumps(self):
    """ Return move as a standard notation string """
    
    return '%d%d'%(self.sq1, self.sq2)
