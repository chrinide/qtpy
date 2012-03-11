/*
 * Copyright (C) 2010-2012 John Driscoll <johnoliverdriscoll@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * QTPy Status bar class
 */

function Status() {
    
    this.flash = function(msg, co) {
      // Flash a message then return to previous message
      
      if (this.flashing) return;
      this.flashing = true;
      var prev = [ this.el.html(), this.el.css('color') ];
      this.queue(msg, co, prev);
    };
    
    this.queue = function(msg, co, flash) {
      // Queue a message for animation
      
      var co = co || '#000',
          self = this,
          queueLength = self.msg.length + 1,
          showNextMessage = safeCallback($game, function() {
            // Was this the last message added to the queue?
            if (flash || self.msg.length == queueLength) {
              var m;
              if (flash) m = self.msg[0];
              else m = self.msg.pop();
              self.el.html(m[0]).css('color', m[1]).animate({ opacity: 1 }, 500);
              if (flash) {
                self.msg = self.msg.slice(1);
              } else {
                self.msg = [];
                self.snoozing = false;
              }
            }
            if (flash) {
              safeTimeout($game, function() {
                self.el.stop().animate({ opacity: 0 }, 500, null, safeCallback($game, function() {
                  self.flashing = false; // say goodbye to these
                  var m = self.msg.pop();
                  self.queue(m[0], m[1]);
                }));
              }, 1500);
            }
          });
      if (flash) {
        this.msg.push(flash);
        this.msg = [[ msg, co ]].concat(this.msg);
      } else {
        this.msg.push([ msg, co ]);
      }
      if (flash || (!this.snoozing && !this.flashing)) {
        this.snoozing = true;
        this.el.stop().animate({ opacity: 0 }, 500, null, showNextMessage);
        return;
      }
      if (!this.flashing)
        safeTimeout($game, showNextMessage, 500);
      
    };
    
  // init
    this.el = $('<div id="status">').appendTo($game);
    this.msg = [];
}