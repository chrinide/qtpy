#!/usr/bin/env python
#
# QTPy Bot valid move helper class
#
# John Driscoll

import cgi
from google.appengine.ext import db

class BotMovesMapped(db.Model):
  """ Stores a flag for each state where all valid moves have been played
  through """
  
  state = db.StringProperty()
  
  @staticmethod
  def has(state):
    """ returns True if state string found in valid moves mapped table,
    else False """
    
    from botmoves import BotMoves
    return bool(BotMoves.find_state(state, my=BotMovesMapped))
