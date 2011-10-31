/*
 * QTPy Game code
 *
 * John Driscoll
 *
 * Required:
 * state.js
 * status.js
 * square.js
 * move.js
 * mark.js
 * jquery.js
 * raphael.js
 */

jQuery(document).ready(function() {
  
  (function($) {
    
    /* Handles initial setup and rendering of the game board and the global qtpy object */
    
    // sniff for mobile platform
    if (navigator.userAgent.match(/iPod|iPad|iPhone/i) && navigator.userAgent.match(/AppleWebKit/)) {
      $(document.body).addClass('mobileSafari');
      // detect fullscreen
      if (navigator.standalone)
        $(document.body).addClass('standalone');
    }
    
    // Declare some animation helper functions
    
    window.safeTimeout = function() {
      // Creates a timeout function that dies after the game is redrawn
      
      var ar = arguments,
          a = ar[0], // element
          b = ar[1], // function
          c = ar[2]; // delay
      setTimeout(function() {
        if ($game[0] === a[0]) b();
      }, c || 0);
    };
    
    window.safeCallback = function() {
      // Creates a callback function that does nothing after the game is redrawn
      
      var ar = arguments,
          a = ar[0], // element
          b = ar[1]; // function
      return function() { if ($game[0] === a[0]) b(arguments); };
    };
    
    function newGame() {
      // Clear drawn objects and create new game state
      
      $(document.body).unbind('dblclick'); // unbind dblclick for new game
      $('#capture').remove();
      window.qtpy = {};
      hideInfo();
      initCanvas();
      drawTitle();
      window.qtpy = $.extend(qtpy, {
        
        status: new Status(),
        state: new State(),
        newGame: arguments.callee,
        mobileSafari: $(document.body).is('.mobileSafari'),
        click: handleClick,
        color: function(player) {
          if (player == 1) return '#00F';
          return '#F00';
        },
        lightColor: function(player) {
          if (player == 1) return '#DDF';
          return '#FDD';
        }
        
      });
      drawBoard();
      $game.mouseup(qtpy.click);
      qtpy.status.queue('Your turn (1 of 2)'); 
    }
    
    // Create global raphael canvas
    function initCanvas() {
      qtpy.boardOffset = $(document.body).is('.mobileSafari:not(.standalone)') ? 98 : 78;
      if (window.ra) ra.clear();
      if (window.$game) $game.remove();
      window.$game = $('<div id="game">').appendTo(document.body);
      // prevent iphone scrolling
      window.ra = Raphael('game', 320, 418);
    }
    
    function drawTitle() {
      // Draw animated QTPy title and icons
      
      if (window.ti) ti.clear();
      $('#title').remove();
      var $ti = $('<div id="title">').appendTo($game).css({
        position: 'absolute',
        top: 0
      });
      window.ti = Raphael('title', 320, 50);
      // T
      ti.path('M140.701,14.627v1.728c0,1.536-0.672,2.4-2.4,2.4s-2.4-0.864-2.4-2.4V9.826h23.714v6.528c0,1.536-0.672,2.4-2.4,2.4 s-2.4-0.864-2.4-2.4v-1.728h-4.656v30.146c0,1.536-0.672,2.4-2.4,2.4c-1.728,0-2.4-0.864-2.4-2.4V14.627H140.701z').attr('fill', 'black');
      // P
      ti.path('M175.261,44.773c0,1.536-0.673,2.4-2.4,2.4s-2.4-0.864-2.4-2.4V9.826h15.938c2.208,0,3.792,0.336,5.521,1.969 c2.064,1.92,2.256,3.696,2.256,6.288v6.528c0,2.448-0.191,4.177-1.968,6.145c-1.872,2.112-3.841,2.305-6.433,2.305h-10.513V44.773z M175.261,28.26h10.657c2.832,0,3.455-0.72,3.455-3.456v-6.721c0-2.736-0.623-3.456-3.455-3.456h-10.657V28.26z').attr('fill', 'black');
      // y
      ti.path('M216.143,28.331V25.69c0-1.584,0.336-3.168,2.305-3.168s2.305,1.584,2.305,3.168v1.872c0,1.152-0.096,1.921-0.576,2.929 l-6.589,15.282c-1.008,2.16-1.537,2.4-3.648,2.4h-3.553c-1.344,0-3.168-0.288-3.168-2.305c0-1.968,1.633-2.304,3.168-2.304h3.168		l1.818-4.643h-0.24c-1.92,0-2.016-0.864-2.734-2.448l-2.275-4.928c-0.623-1.392-1.104-2.448-1.104-3.792V25.69		c0-1.584,0.336-3.168,2.305-3.168c1.967,0,2.305,1.584,2.305,3.168v2.641l2.801,5.983h1.008L216.143,28.331z').attr('fill', 'black');
      var colors = [ '#000', '#666', '#999' ],
          which = [ 0, 1, 2 ];
      // circles 1 & 2
      c1 = ti.circle(112.154, 34.117, 3).attr({ fill: colors[which[0]], stroke: colors[which[0]] });
      c2 = ti.circle(117.965, 36.849, 3).attr({ fill: colors[which[1]], stroke: colors[which[1]] });
      // Q
      ti.path('M111.47,45.493c-1.344,1.152-2.448,1.681-4.32,1.681c-1.632,0-3.12-0.624-4.224-1.824		c-1.344-1.488-1.584-2.784-1.584-4.705V28.068c0-3.505,1.248-5.713,3.84-7.921l9.793-8.353c1.248-1.104,2.352-1.969,4.081-1.969		c3.648,0,6,2.688,6,6.24v12.722c0,3.696-0.96,5.809-3.792,8.257L111.47,45.493z M117.711,33.876		c2.208-1.823,2.544-2.496,2.544-5.376V16.547c0-0.768,0.096-1.92-0.96-1.92c-0.576,0-0.912,0.479-1.344,0.815l-9.648,8.354		c-1.632,1.392-2.16,2.304-2.16,4.464v12.434c0,0.768-0.048,1.68,1.056,1.68c0.528,0,1.056-0.384,1.44-0.72L117.711,33.876z').attr('fill', 'black');
      // circle 3
      c3 = ti.circle(119.809, 42.999, 3).attr({ fill: colors[which[2]], stroke: colors[which[2]] });
      // circle paths
      o1 = ti.path('M112.154,34.117c-0.328-0.562-1.116-1.712-0.855-2.413c0.281-0.756,1.913,0.544,2.207,0.77c1.652,1.262,3.104,2.806,4.459,4.376').attr({ 'stroke-width': 0, stroke: 'transparent' });
      o2 = ti.path('M117.965,36.849c1.354,1.571,2.666,3.236,3.67,5.056c0.223,0.403,1.087,1.79,0.582,2.226c-0.561,0.483-2.022-0.822-2.407-1.132').attr({ 'stroke-width': 0, stroke: 'transparent' });
      o3 = ti.path('M119.809,42.999c-2.984-2.396-5.726-5.578-7.655-8.882').attr({ 'stroke-width': 0, stroke: 'transparent' });
      // start title animation
      function animateTitle() {
        // The title is a series of three animations for each ball
        // each ball is animated 1/3 of the way around the Q, starting from the same place
        // and ending at the same place each time
        // The colors are switched to give the illusion of orbiting
        var a = 0; // animations completed counter
        // cycle colors
        if (--which[0] < 0) which[0] = 2;
        if (--which[1] < 0) which[1] = 2;
        if (--which[2] < 0) which[2] = 2;
        c1.attr({ cx: 112.154, cy: 34.117, fill: colors[which[0]], stroke: colors[which[0]] });
        c2.attr({ cx: 117.965, cy: 36.849, fill: colors[which[1]], stroke: colors[which[1]] });
        c3.attr({ cx: 119.809, cy: 42.999, fill: colors[which[2]], stroke: colors[which[2]] });
        // Animate each circle
        // Wait until all three have finished to start the animation over again
        var callback = safeCallback($game, function() { if (++a == 3) safeTimeout($game, animateTitle); });
        c1.animateAlong(o1, 1000, false, callback);
        c2.animateAlong(o2, 1000, false, callback);
        c3.animateAlong(o3, 1000, false, callback);
      }
      animateTitle();
      // icons
      // newgame
      ra.path('M271.738,15.103c-0.961,1.609-2.719,2.687-4.727,2.687c-3.037,0-5.5-2.462-5.5-5.5s2.463-5.5,5.5-5.5c2.856,0,5.206,2.18,5.475,4.968');
      ra.path('M270.695,11.653l2.222,1.019l1.021-2.22L270.695,11.653z');
      // difficulty
      $game.difficultyIcons = [
        [ ra.path('M292.023,10.749l1.064-1.065l-1.064-1.065V10.749z').hide(),
          ra.path('M292.023,15.96l1.064-1.064l-1.064-1.065V15.96z').hide(),
          ra.path('M282.332,14.896h9.691').hide(),
          ra.path('M282.332,9.684h9.691').hide() ],
        [ ra.path('M292.023,10.749l1.064-1.065l-1.064-1.065V10.749z').hide(),
          ra.path('M292.023,15.96l1.064-1.064l-1.064-1.065V15.96z').hide(),
          ra.path('M282.332,9.684h2.361c2.881,0,2.33,5.211,5.211,5.211h2.119').hide(),
          ra.path('M282.332,14.896h2.361c2.881,0,2.33-5.211,5.211-5.211h2.119').hide() ] ];
      // info
      $game.infoIcon = [
        ra.path('M307.71,6.79c3.038,0,5.5,2.462,5.5,5.5s-2.462,5.5-5.5,5.5s-5.5-2.462-5.5-5.5S304.672,6.79,307.71,6.79z'),
        ra.path('M308.161,14.492h0.646c0.288,0,0.596,0.063,0.596,0.432c0,0.378-0.343,0.432-0.596,0.432h-2.195c-0.252,0-0.595-0.054-0.595-0.432c0-0.369,0.307-0.432,0.595-0.432h0.685v-3.124h-0.685c-0.252,0-0.595-0.054-0.595-0.432c0-0.369,0.307-0.432,0.595-0.432h0.909c0.494,0,0.64,0.09,0.64,0.603V14.492z').attr({ fill: '#000', 'stroke-width': 0, stroke: 'transparent' }),
        ra.path('M306.855,8.757c0-0.306,0.171-0.405,0.404-0.405h0.495c0.234,0,0.405,0.099,0.405,0.405v0.414c0,0.306-0.171,0.405-0.405,0.405h-0.495c-0.233,0-0.404-0.099-0.404-0.405V8.757z').attr({ fill: '#000', 'stroke-width': 0, stroke: 'transparent' })
      ];
      $('<a id="info" class="icon" title="About" href="javascript:;" onclick="return false;" onmousedown="return false;" onmouseup="return false;" target="__blank__"></a>')
        .appendTo($game)
        .click(toggleInfo);
      $('<a id="difficulty" class="icon" title="Difficulty" href="javascript:;" onclick="return false;" onmousedown="return false;" onmouseup="return false;"></a>')
        .appendTo($game)
        .click(function() { hideInfo(); toggleDifficulty() });
      $('<a id="newgame" class="icon" title="New game" href="javascript:;" onclick="return false;" onmousedown="return false;" onmouseup="return false;"></a>')
        .appendTo($game)
        .click(function() {
          if ($(document.body).is('.mobileSafari')) window.scrollTo(0,1);
          newGame();
          return false;
        });
      if (difficulty == 0) learnMode();
      else challengeMode();
    }
    
    function noTouchMove() {
      // disable iPhone scrolling
      if ($(document.body).is('.mobileSafari')) {
        document.body.ontouchmove = function(e) { window.scrollTo(0, 1); e.preventDefault(); return false; };
        $(document.body).click(function() { window.scrollTo(0, 1); });
      }
    }
    function touchMove() {
      if ($(document.body).is('.mobileSafari')) {
        document.body.ontouchmove = function() {};
        $(document.body).unbind('click');
      }
    }
    
    function drawBoard() {
      // Draw the board lines
      
      var z = [ 1, 107, 213, 319 ],
          t = qtpy.boardOffset;
      for (var i = 0; i < 4; i++)
        ra.path('M ' + z[0] + ',' + (t+z[i]) + ' L ' + z[3] + ',' + (t+z[i]));
      for (var i = 0; i < 4; i++)
        ra.path('M ' + z[i] + ',' + (t+z[0]) + ' L ' + z[i] + ',' + (t+z[3]));
    }
    
    function learnMode() {
      // Change difficulty mode to Learn
      
      for (var i = 0; i < 4; i++) $game.difficultyIcons[1][i].hide();
      for (var i = 0; i < 4; i++) $game.difficultyIcons[0][i].show();
      localStorage.setItem('difficulty', difficulty = 0);
    }
    
    function challengeMode() {
      // Change difficulty mode to Challenge
      
      for (var i = 0; i < 4; i++) $game.difficultyIcons[0][i].hide();
      for (var i = 0; i < 4; i++) $game.difficultyIcons[1][i].show();
      localStorage.setItem('difficulty', difficulty = 1);
    }
    
    function toggleDifficulty() {
      if (parseInt(localStorage.getItem('difficulty'))) {
        learnMode();
        qtpy.status.flash('Learning mode');
      } else {
        challengeMode();
        qtpy.status.flash('Challenge mode');
      }
    }
    
    function showInfo() {
      if ($(document.body).is('.mobileSafari')) window.scrollTo(0,1);
      $(document.body).addClass('info');
      touchMove();
      // highlight icon
      $game.infoIcon[0].attr('fill', '#000');
      $game.infoIcon[1].attr('fill', '#FFF');
      $game.infoIcon[2].attr('fill', '#FFF');
      // Load images
      var $marks = $('#rulesMarks'),
          $cycle = $('#rulesCycle'),
          $diverse = $('#rulesDiverse'),
          $entangled = $('#rulesEntangled'),
          $win = $('#rulesWin');
      function hasImg(el) {
        if (el.children('img').length) return true;
      }
      function insImg(el, url, title) {
        el.append('<img src="' + url + '" title="' + title + '">');
      }
      if (!hasImg($marks)) insImg($marks, 'rules-marks.png', 'Spooky marks');
      if (!hasImg($cycle)) insImg($cycle, 'rules-cycle.png', 'Cycle squares');
      if (!hasImg($diverse)) insImg($diverse, 'rules-diverse.png', 'Cycle squares without mark diversity');
      if (!hasImg($entangled)) insImg($entangled, 'rules-entangled.png', 'Entangled marks');
      if (!hasImg($win)) insImg($win, 'rules-win.png', 'Tic-tac-toe');
    }
    
    function hideInfo() {
      $(document.body).removeClass('info');
      noTouchMove();
      if ($(document.body).is('.mobileSafari'))
        window.scrollTo(0,1);
      // highlight icon
      if (window.$game) {
        $game.infoIcon[0].attr('fill', '#FFF');
        $game.infoIcon[1].attr('fill', '#000');
        $game.infoIcon[2].attr('fill', '#000');
      }
    }
    
    function toggleInfo() {
      if ($(document.body).is('.info')) {
        hideInfo();
      } else {
        showInfo();
      }
    }
    
    function handleClick(e) {
      if ($(document.body).is('.info')) return;
      // click interpreter
      var gy = $game.position().top - (qtpy.mobileSafari ? 0 :  230),
          gx = $game.position().left - (qtpy.mobileSafari ? 0 :  160),
          x = e.pageX - gx,
          y = e.pageY - gy,
          row,
          col;
      if (x < 107) col = 0;
      else if (x < 213) col = 1;
      else col = 2;
      if (y < qtpy.boardOffset || y > qtpy.boardOffset + 320) return;
      if (y < qtpy.boardOffset + 106) row = 0;
      else if (y < qtpy.boardOffset + 213) row = 1;
      else row = 2;
      qtpy.state.squares[row*3+col].click();
    }
    
    // Start off in learning mode
    localStorage.setItem('difficulty', localStorage.getItem('difficulty') || 0);
    difficulty = parseInt(localStorage.getItem('difficulty'));
    
    // Start the game
    newGame();
    
    msg = qtpy.status.msg[0];
    qtpy.status.flash('by John Driscoll');
    qtpy.status.queue(msg[0], msg[1]);
    
  })(jQuery);
});

// All content loaded callback
 windowOnLoad = window.onload;
 window.onload = function() {
  if (windowOnLoad) windowOnLoad();
  if ($(document.body).is('.mobileSafari')) {
    setTimeout(function() { window.scrollTo(0,1) }, 1); // hide toolbar in mobilesafari
    // shake for new game on iphone
    function updateOrientation() {
      // window callback
      switch(window.orientation) {
      case 90:
      case -90:
        qtpy.newGame();
        showFlipIndicator();
        break;
      case 0:
        hideFlipIndicator();
        setTimeout(function() { window.scrollTo(0,1) }, 1);
      }
    }
    function hideFlipIndicator() {
      $('#flipIndicator').remove();
      $(document.body).removeClass('landscape');
    }
    function showFlipIndicator() {
      $(document.body).addClass('landscape');
      $('<div id="flipIndicator">Flip to play</div>').appendTo($game);
      window.scrollTo(0,1);
    }
    window.onorientationchange = updateOrientation;
    if (window.orientation != 0)
      showFlipIndicator();
  }
}
 
/* Raphael extensions */

Raphael.el.behindBoard = function() {
  // move an element behind the board lines and over the squares
  this.insertAfter(qtpy.state.squares[8].rect);
  return this;
};

Raphael.fn.circlePath = function(x , y, r, rot) {
  // Create a circle path
  // Thanks to Toby Hede for this: http://stackoverflow.com/questions/2627436/svg-animation-along-path-with-raphael
  var s;
  if (!rot)
    s = "M" + x + "," + (y-r) + "A"+r+","+r+",0,1,1,"+(x-0.1)+","+(y-r);
  else
    s = "M" + x + "," + (y+r) + "A"+r+","+r+",0,1,1,"+(x+0.1)+","+(y+r);
  return window.ra.path(s);
};




















