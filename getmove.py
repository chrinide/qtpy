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


# QTPy Move server

import web

class GetMoveHandler:
  """ getmove request handler """
  
  def POST(self):
    """ Handle request to get a bot's move """
    
    # Make sure responses aren't cached by client
    web.header('Content-Type', 'text/plain')
    web.header('Cache-Control', 'no-cache, no-store, no-transform')
    web.header('Expires', '0')
    web.header('Pragma', 'no-cache')
    
    if web.input()['state']:
      from state import State
      from move import COLLAPSE
      # Load the state of the game
      game = State(web.input()['state'])
      last_move = game.moves[-1]
      response = ""
      from bot import Bot
      # Is it the bot's turn?
      if not game.outcome and last_move and     \
            last_move.player == 1 and           \
            last_move.type != COLLAPSE:
        # if response = self.debug(game): return response
        response = Bot.play_move(game, int(web.input()['difficulty']))
      # Is the game over?
      if game.outcome: Bot.learn(game)
      return response
  
  def debug(self, game):
    """ Plays moves in a predetermined game for testing purposes """
    
    #import logging
    #from state import State
    #logging.debug(State.get_valid_moves(game))
    #s = "15/59/59/05/36/36/03/78/78"
    #s = "37/37/07/14"
    s = "15/59/19"
    s = s.split('/')
    if len(game.moves) >= len(s): return False
    m = s[len(game.moves)]
    if m[0] == '0' and len(s) >= len(game.moves) + 2:
      m += '/' + s[len(game.moves)+1]
    return m
