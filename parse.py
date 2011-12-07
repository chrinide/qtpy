#!/usr/bin/env python
#
# QTPy Parse class
#
# John Driscoll

class Parse:
  """ Parses games of qttt in standard notation """
  
  @staticmethod
  def moves(notation):
    """ Parse standard notation move list to an array of Move objects """
    
    from move import Move
    list = notation.split('/') # get each move
    moves = []  # This will be the collection of Move objects
    player = 0  # Which player's turn
    weight = 1  # Turn number
    for m in list:
      move = Move(player + 1, weight, int(m[0]), int(m[1]))
      if m[0] == '0':
        # A collapse:
        # Next move should be the player's square markings unless
        # this is the last move in the game
        # Don't switch player or increment weight
        pass
      else:
        # Next player's turn
        player = int(not player)
        weight += 1
      moves.append(move)
    return moves
