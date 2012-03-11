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


# QTPy Parse class

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
