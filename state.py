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


# QTPy State class

class State:
  """ Game state model. Handles move list, validating moves and determining
  game outcomes.
  
  Attributes:
    squares: Array of Square objects that represent the board
    moves: Array of moves made
    outcome: None if game is not over, else an array of:
            [0] Player's final score
            [1] Bot's final score
    cycle_squares: Integer array of square numbers forming a cycle or None
    cycle_marks: Array of Mark objects forming a cycle or None
  """
  
  outcome = None
  cycle_squares = None
  cycle_marks = None
  
  def __init__(self, moves):
    """ Creates a game state based on the supplied move list
    
    moves: a string of a game state in standard notation
    """
    
    from square import Square
    self.squares = []
    for i in range(9): self.squares.append(Square(self, i+1))
    from parse import Parse
    moves = Parse.moves(moves)
    self.moves = []
    for move in moves: # Play through supplied moves
      self.step(move)
  
  def square(self, i):
    """ Return square i from self.squares array where i is the square number
    in standard notation """
    
    return self.squares[i-1]
  
  def unstep(self):
    """ Undoes the last move played """
    
    import move
    m = self.moves.pop()
    if m.type == move.CLASSIC:
      sq = self.square(m.sq1)
      sq.marks = sq._spookies
    elif m.type == move.SPOOKY:
      self.square(m.sq1).marks.pop()
      self.square(m.sq2).marks.pop()
    elif m.type == move.COLLAPSE:
      self.square(m.sq2).expand()
    self._find_cycle()
    self.outcome = None
  
  def step(self, m):
    """ Performs a move on the state """
    
    if self.outcome != None:
      raise Exception('Game outcome has already been determined')
    import move
    from mark import Mark
    if not self.valid_move(m):
      raise Exception('Invalid move "%s" in game "%s". Valid moves: %s'%
                      (m.dumps(), self.dumps(),
                       ', '.join(self.get_valid_moves())))
    if m.type == move.CLASSIC:
      # Put a single classic mark in a square
      sq = self.square(m.sq1)
      sq._spookies = []
      for mark in sq.marks:
        sq._spookies.append(mark)
      sq.marks = [ Mark(sq, player=m.player, weight=m.weight) ]
    elif m.type == move.SPOOKY:
      # Put two spooky marks in the squares
      a = Mark(self.square(m.sq1), type=move.SPOOKY,
               player=m.player, weight=m.weight)
      b = Mark(self.square(m.sq2), type=move.SPOOKY,
               player=m.player, weight=m.weight, link=a)
      a.link = b
      self.square(m.sq1).marks.append(a)
      self.square(m.sq2).marks.append(b)
    elif m.type == move.COLLAPSE:
      # Expand a square
      self.square(m.sq2).collapse()
    self.moves.append(m)
    self._find_cycle() # Find cyclic marks
    self.outcome = self.get_outcome()
  
  def get_outcome(self):
    """ Check if the game is over and return an array of the
    score [ Player, Bot ] or None """
    
    # Look for lines and calculate weights
    import math
    g = [ [], [] ]
    def s(i): return self.squares[i].marker()
    def w(i,j): return self.squares[i*3+j].marks[0].weight
    def m(a,b,c): return max(max(a,b),c)
    def o(player, weight): g[player-1].append(weight)
    p = [ [ s(0), s(1), s(2) ], [ s(3), s(4), s(5) ], [ s(6), s(7), s(8) ] ]
    # if 3-in-a-row marked by same player: score line for player
    if p[0][0] and p[0][0] == p[0][1] and p[0][0] == p[0][2]:
      o(p[0][0], m(w(0,0), w(0,1), w(0,2)))
    if p[1][0] and p[1][0] == p[1][1] and p[1][0] == p[1][2]:
      o(p[1][0], m(w(1,0), w(1,1), w(1,2)))
    if p[2][0] and p[2][0] == p[2][1] and p[2][0] == p[2][2]:
      o(p[2][0], m(w(2,0), w(2,1), w(2,2)))
    if p[0][0] and p[0][0] == p[1][0] and p[0][0] == p[2][0]:
      o(p[0][0], m(w(0,0), w(1,0), w(2,0)))
    if p[0][1] and p[0][1] == p[1][1] and p[0][1] == p[2][1]:
      o(p[0][1], m(w(0,1), w(1,1), w(2,1)))
    if p[0][2] and p[0][2] == p[1][2] and p[0][2] == p[2][2]:
      o(p[0][2], m(w(0,2), w(1,2), w(2,2)))
    if p[0][0] and p[0][0] == p[1][1] and p[0][0] == p[2][2]:
      o(p[0][0], m(w(0,0), w(1,1), w(2,2)))
    if p[0][2] and p[0][2] == p[1][1] and p[0][2] == p[2][0]:
      o(p[0][2], m(w(0,2), w(1,1), w(2,0)))
    # Determine final scores
    if len(g[0]):
      if len(g[0]) == 1:
        if len(g[1]):
          if g[0][0] < g[1][0]: return [ 1, .5 ]
          return [ .5, 1 ]
        return [ 1, 0 ]
      if g[0][0] == g[0][1]: return [ 2, 0 ]
      return [ 1.5, 0 ]
    elif len(g[1]): return [ 0, 1 ]
    # Check for cat's game
    empty = False
    for i in range(9):
      if not self.squares[i].is_classic():
        empty = True
    if not empty: return [ 0, 0 ]
    # Active game
    return None
  
  def valid_move(self, move):
    """ Determines if move can be played on the current game state """
    
    moves = self.get_valid_moves()
    notation = move.dumps()
    for m in moves:
      if m == notation: return True
    return False
  
  def get_valid_moves(self):
    """ Returns an array of all the legal moves in standard notation """
    
    import move
    # If all squares are occupied by classic moves except one, that's
    # the only valid move
    empty = None
    marked = 0
    spookies = []
    for i in range(9):
      if not len(self.squares[i].marks):
        empty = i+1
        spookies.append(i)
      elif self.squares[i].marks[0].type == move.CLASSIC:
        marked += 1
      else:
        spookies.append(i)
    if marked == 8 and empty:
      return [ '%d%d'%(empty,empty) ]
    # If there are any cyclical squares open, the only valid move is to
    # close the cycle
    valid = []
    cycle = self.cycle_squares
    if cycle:
      cycle.sort()
      # If all the marks in the cycle belong to the same player, use the
      # lowest square number in the cycle as the only valid move
      p = None
      diverse = False
      for mark in self.cycle_marks:
        if p == None: p = mark.player
        elif p != mark.player:
          diverse = True
          break
      if not diverse:
        return [ '0%d'%cycle[0] ]
      # Get the lowest square number in the cycle and its earlier linked
      # square
      early = None
      for mark in self.square(cycle[0]).marks:
        if mark.link.square.num in cycle:
          if early == None or mark.weight < early.weight: early = mark
      valid = [ '0%d'%cycle[0], '0%d'%early.link.square.num ]
      return valid
    # Else we need combos of all spooky squares
    spookies.sort()
    for a in spookies:
      for b in spookies:
        if a < b: valid.append('%d%d'%(a+1,b+1))
    return valid
  
  def _find_cycle(self):
    """ Returns an array of integers representing all the squares in a
    cycle or None if there is no cycle """
    
    for i in range(9):
      path = self.squares[i].find_path()
      if path:
        self.cycle_squares = path[0]
        self.cycle_marks = path[1]
        return
    self.cycle_squares = None
    self.cycle_marks = None
  
  def dumps(self):
    """ Returns game as standard notation string """
    
    out = []
    for move in self.moves: out.append(move.dumps())
    return '/'.join(out)
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
