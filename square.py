#!/usr/bin/env python
#
# QTPy Square class
#
# John Driscoll

class Square:
  """ A square on the board
  
  Attributes:
    state: The game state this square belongs to
    num: The square number in grid
    marks: An array of mark objects in the square
  """
  
  def __init__(self, state, num, marks=None):
    self.state = state
    self.num = num
    self.marks = marks or []
    self.early = None
    self.spookies = None
  
  def find_path(self, target=None, ignore=None):
    """ Find a route to a square. If no square argument supplied, find
    path to self
    Returns array of square #s if route is found
    Returns None otherwise
    """
    
    import move
    if not target: target = self
    if not ignore: ignore = []
    for mark in self.marks:
      if mark in ignore: continue
      if mark.type == move.SPOOKY:
        if mark.link.square == target: # Path found!
          return [ [ self.num ], [ mark, mark.link ] ]
        else:
          # Search down path of linked squares
          ignore.append(mark);
          ignore.append(mark.link)
          path = mark.link.square.find_path(target, ignore)
          if path != None:
            # Cycle was found down the line
            # Append this square number as part of the path
            path[0].append(self.num)
            path[1].append(mark)
            return path
    return None
  
  def is_classic(self):
    """ Returns True if square contains classical move """
    
    import move
    if not len(self.marks): return False
    if self.marks[0].type == move.CLASSIC: return True
    return False
  
  def marker(self):
    """ Returns the player number of the square if it's marked, else None """
    
    import move
    if not len(self.marks): return None
    if self.marks[0].type == move.CLASSIC: return self.marks[0].player
    return None
  
  def expand(self):
    """ Uncollapse the square """
    
    self.marks = self._spookies
    self.early.go_spooky()
  
  def collapse(self):
    """ Collapse earlier mark in self and all entangled squares """
    
    # Get lowest square in cycle and its earlier mark
    cycle = self.state.cycle_squares
    cycle.sort()
    early = None
    for mark in self.state.square(cycle[0]).marks:
      if mark.link.square.num in cycle:
        if early == None: early = mark
        elif mark.weight < early.weight:
          early = mark
          break
    if self.num == cycle[0]:
      self.early = early
    else:
      self.early = early.link
    self.early.go_classic()




























