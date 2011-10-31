#!/usr/bin/env python
#
# QTPy Bot class
#
# John Driscoll

class Bot:
  """ A learning bot the player competes with.
  
  Why machine learning instead of a predictive model?
   - There aren't any existing projects to work off of in the field of QTTT AI.
   - There is a paper describing optimal QTTT strategy, but it's over my head (http://arxiv.org/abs/1007.3601).
   
   The bot favors moves that don't result in a loss and tries to make sure
   unpopular paths get taken to increase its collection of outcomes.
   
  The BotMoves class contains the interface to the DB.
  """
  
  @staticmethod
  def noise_factor(): return 10 # Number of times to play the target move in a row before trying something else
  
  @staticmethod
  def play_move(state, difficulty):
    """ Plays move(s) based on the supplied game state and difficulty level
    
    Returns a std notation string of the move(s) played
    """
    
    # Get new move's weight
    from botmoves import BotMoves
    from move import Move, COLLAPSE
    last_move = state.moves[-1]
    weight = last_move.weight + (1 if last_move.type != COLLAPSE else 0)
    # Make sure every possible move is played at least once
    move = Bot.get_missing_move(state)
    if not move:
      # We've played every move at least once
      # Choose our best known move
      s = state.dumps()
      games = BotMoves.find_states(s)
      if difficulty == 0:
        # Learning mode: get highest probability of a draw
        games.order('-drawp').order('-winp').order('played')
        target = games.fetch(1)[0]
      elif difficulty == 1:
        # Challenge mode: get highest probability of a win
        games.order('-winp').order('-drawp').order('played')
        target = games.fetch(1)[0]
      # Don't neglect unpopular moves
      if target.played_in_sequence == Bot.noise_factor():
        target.played_in_sequence = 0
        target.put()
        # Soft sort to save DB exchanges
        states = [target]
        for game in games: states.append(game)
        states.sort(key=lambda state: state.played)
        target = states[0]
      # Orient move according to current state
      target_ply = BotMoves.plyable(target.state + '/' + target.move)
      move_ply = BotMoves.plyable(target.move)
      for key in BotMoves._valid_keys:
        k0 = ('-%s'%key) if key else None
        move = BotMoves.searchable(BotMoves.translate(move_ply, k0))
        if BotMoves.translate(target_ply, key) == BotMoves.plyable(s + '/' + move): break
          
    # Play determined move
    state.step(Move(2, weight, move[0], move[1]))
    # Perform another move if we just played a collapse
    if not state.outcome and len(move) == 2 and move[0] == '0':
      return "%s/%s"%(move, Bot.play_move(state, difficulty))
    return move
  
  @staticmethod
  def get_missing_move(state):
    """ Get first valid move for this state that isn't in the DB
    or None if all are present """
    
    from botmoves import BotMoves
    from botmovesmapped import BotMovesMapped
    from move import Move, COLLAPSE
    valid = state.get_valid_moves()
    s = state.dumps()
    last_move = state.moves[-1]
    weight = last_move.weight + (1 if last_move.type != COLLAPSE else 0)
    if not BotMovesMapped.has(s):
      # Check for collapse
      if state.cycle_squares:
        from state import State
        # Append another valid move to the move string
        all = []
        for move in valid:
          state.step(Move(2, weight, move[0], move[1]))
          if state.outcome: all.append(move)
          else:
            for a in state.get_valid_moves(): all.append('%s/%s'%(move,a))
          state.unstep()
        valid = all
      # Look for all found moves or any variations in the DB
      for move in valid:
        if not BotMoves.find_state(s, move):
          return move
    return None
  
  @staticmethod
  def learn(game):
    """ Record new outcome probabilities for all moves made in this game """
    
    # Get all the moves the bot has made in this game
    import state
    from botmoves import BotMoves
    from move import COLLAPSE
    states = []
    for i in range(len(game.moves)):
      if game.moves[i].player == 2:
        # Skip collapses and prepend them to the next turn
        if game.moves[i].sq1 == 0 and len(game.moves) > i + 1: continue
        prestate = i
        if i > 0 and game.moves[i-1].type == COLLAPSE:
          prestate -= 1
          move = '%s/%s'%(game.moves[i-1].dumps(), game.moves[i].dumps())
        else: 
          move = game.moves[i].dumps()
        # Get std notation for the board's state before the bot's move
        move_list = []
        for j in range(prestate):
          move_list.append(game.moves[j].dumps())
        states.append([ '/'.join(move_list), move ])
    # Update the DB with the outcome
    for state in states:
      BotMoves.update_state(state[0], state[1], game.outcome) # Update state & move outcome possibilities

















