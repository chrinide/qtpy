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


# QTPy Bot valid move helper class

import elixir

class BotMovesMapped(elixir.Entity):
  """ Stores a flag for each state where all valid moves have been played
  through """
  
  state = elixir.Field(elixir.String(), primary_key=True)
  
  @staticmethod
  def has(state):
    """ returns True if state string found in valid moves mapped table,
    else False """
    
    from botmoves import BotMoves
    return bool(BotMoves.find_state(state, my=BotMovesMapped))
