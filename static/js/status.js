/*
 * QTPy Status bar class
 *
 * John Driscoll
 */

function Status() {
    
    this.flash = function(msg, co) {
      // Flash a message then return to previous message
      
      if (this.flashing) return;
      this.flashing = true;
      var prev = [ this.el.html(), this.el.css('color') ];
      this.queue(msg, co, prev);
      var self = this;
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