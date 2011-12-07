#!/usr/bin/env python
#
# QTPy Main App code
#
# John Driscoll

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

class GetMoveHandler(webapp.RequestHandler):
  """ getmove request handler """
  
  def post(self):
    """ Handle request to get a bot's move """
    
    # Make sure responses aren't cached by client
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.headers['Cache-Control'] = \
        'no-cache, no-store, no-transform'
    self.response.headers['Expires'] = '0'
    self.response.headers['Pragma'] = 'no-cache'
    
    if self.request.get('state'):
      from state import State
      from move import COLLAPSE
      # Load the state of the game
      game = State(self.request.get('state')) 
      last_move = game.moves[-1]
      from bot import Bot
      # Is it the bot's turn?
      if not game.outcome and last_move and     \
            last_move.player == 1 and           \
            last_move.type != COLLAPSE:
        #if self.debug(game): return
        # Send move notation to player
        self.response.out.write( \
          Bot.play_move(game, int(self.request.get('difficulty'))))
      # Is the game over?
      if game.outcome: Bot.learn(game)
  
  def debug(self,game):
    """ Plays moves in a predetermined game for testing purposes """
    
    import logging
    from state import State
    logging.debug(State.get_valid_moves(game))
    #s = "15/59/59/05/36/36/03/78/78"
    #s = "37/37/07/14"
    s = "15/59/19"
    s = s.split('/')
    if len(game.moves) >= len(s): return False
    m = s[len(game.moves)]
    if m[0] == '0' and len(s) >= len(game.moves) + 2:
      m += '/' + s[len(game.moves)+1]
    self.response.out.write(m)
    return True

def main():
  application = webapp.WSGIApplication([('/getmove', GetMoveHandler)])
  util.run_wsgi_app(application)

if __name__ == '__main__':
    main()
