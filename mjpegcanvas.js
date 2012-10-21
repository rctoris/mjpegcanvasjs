/**
 * Author: Russell Toris Version: October 19, 2012
 * 
 * Converted to AMD by Jihoon Lee Version: Oct 05, 2012
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([ 'eventemitter2' ], factory);
  } else {
    root.MjpegCanvas = factory(root.EventEmitter2);
  }
}
    (
        this,
        function(EventEmitter2) {
          var MjpegCanvas = function(options) {
            var mjpegCanvas = this;
            options = options || {};
            mjpegCanvas.host = options.host;
            mjpegCanvas.port = options.port || 8080;
            mjpegCanvas.topic = options.topic;
            mjpegCanvas.label = options.label;
            mjpegCanvas.defaultStream = options.defaultStream || 0;
            mjpegCanvas.quality = options.quality;
            mjpegCanvas.canvasID = options.canvasID;
            mjpegCanvas.width = options.width;
            mjpegCanvas.height = options.height;
            mjpegCanvas.showMenus = options.showMenus;

            // current streaming topic
            var curStream = null;
            var img = null;

            // used if there was an error loading the stream
            var errorIcon = new Image();
            errorIcon.src = "data:image/png;base64,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";
            // used to stop redrawing the icon over and over again
            var errorDrawn = false;

            // grab the canvas
            var canvas = document.getElementById(mjpegCanvas.canvasID);
            var context = canvas.getContext('2d');

            var createImage = function() {
              // create the image to hold the stream
              img = new Image();
              var src = 'http://' + mjpegCanvas.host + ':' + mjpegCanvas.port
                  + '/stream?topic=' + curStream;
              // check for various options
              if (mjpegCanvas.width > 0) {
                src += '?width=' + mjpegCanvas.width;
              }
              if (mjpegCanvas.width > 0) {
                src += '?height=' + mjpegCanvas.height;
              }
              if (mjpegCanvas.quality > 0) {
                src += '?quality=' + mjpegCanvas.quality;
              }
              img.src = src;
            };

            // check if the topics is a list or single topic
            if (mjpegCanvas.topic instanceof Array) {
              // check the labels
              if (!(mjpegCanvas.label && mjpegCanvas.label instanceof Array && mjpegCanvas.label.length == mjpegCanvas.topic.length)) {
                mjpegCanvas.label = null;
              }

              // start the stream with the first topic
              curStream = mjpegCanvas.topic[mjpegCanvas.defaultStream];

              // button options
              context.globalAlpha = 0.66;
              var buttonMargin = 10;
              var buttonPadding = 5;
              var buttonHeight = 25;
              var buttonWidth = 55;
              var buttonColor = 'black';
              var buttonStrokeSize = 5;
              var buttonStrokeColor = 'blue';
              var editFont = '16pt Verdana';
              var editColor = 'white';

              // menu div
              var menu = document.createElement('div');
              document.getElementsByTagName('body')[0].appendChild(menu);
              menu.style.display = 'none';

              // create the mouseovers
              var mouseEnter = false;
              var menuOpen = false;
              canvas.addEventListener('mouseenter', function(e) {
                mouseEnter = true;
              }, false);
              canvas.addEventListener('mouseleave', function(e) {
                mouseEnter = false;
              }, false);
              canvas
                  .addEventListener(
                      'click',
                      function(e) {
                        // create a unique ID
                        var id = (new Date()).getTime();

                        var offsetLeft = 0;
                        var offsetTop = 0;
                        var element = canvas;
                        while (element && !isNaN(element.offsetLeft)
                            && !isNaN(element.offsetTop)) {
                          offsetLeft += element.offsetLeft - element.scrollLeft;
                          offsetTop += element.offsetTop - element.scrollTop;
                          element = element.offsetParent;
                        }

                        var x = e.pageX - offsetLeft;
                        var y = e.pageY - offsetTop;
                        var height = canvas.getAttribute('height');
                        var width = canvas.getAttribute('width');

                        // check if we are in the 'edit' button
                        if (x < (buttonWidth + buttonMargin)
                            && x > buttonMargin
                            && y > (height - (buttonHeight + buttonMargin))
                            && y < height - buttonMargin) {
                          menuOpen = true;

                          // create the menu
                          var html = '<h2>Camera Streams</h2><hr /><br /><form><label for="stream">Stream</label><select name="stream" id="stream-'
                              + id + '" required>';
                          for ( var i = 0; i < mjpegCanvas.topic.length; i++) {
                            // check if this is the selected option
                            var selected = '';
                            if (mjpegCanvas.topic[i] === curStream) {
                              var selected = 'selected="selected"';
                            }
                            html += '<option value="' + mjpegCanvas.topic[i]
                                + '" ' + selected + '>';
                            // check for a label
                            if (mjpegCanvas.label) {
                              html += mjpegCanvas.label[i];
                            } else {
                              html += mjpegCanvas.topic[i];
                            }
                            html += '</option>';
                          }
                          html += '</select></form><br /><button id="button-'
                              + id + '">Close</button>';

                          // display the menu
                          menu.innerHTML = html;
                          menu.style.position = 'absolute';
                          menu.style.top = offsetTop + 'px';
                          menu.style.left = offsetLeft + 'px';
                          menu.style.width = width + 'px';
                          menu.style.display = 'block';

                          // dropdown change listener
                          var select = document.getElementById('stream-' + id);
                          select
                              .addEventListener(
                                  'click',
                                  function() {
                                    var stream = select.options[select.selectedIndex].value;
                                    // make sure it is a new stream
                                    if (stream !== curStream) {
                                      curStream = stream;
                                      img = null;
                                      createImage();
                                      // emit an event for the change
                                      mjpegCanvas.emit('change', stream);
                                    }
                                  }, false);

                          // create the event listener for the close
                          var button = document.getElementById('button-' + id);
                          button.addEventListener('click', function(e) {
                            // close the menu
                            menuOpen = false;
                            menu.style.display = 'none';
                          }, false);
                        }
                      }, false);
            } else {
              curStream = mjpegCanvas.topic;
            }

            // a function to draw the image onto the canvas
            function draw(img) {
              // grab the current sizes of the canvas
              var width = canvas.getAttribute('width');
              var height = canvas.getAttribute('height');

              // grab the drawing context and draw the image
              if (img) {
                // check if we have a valid image
                if (img.width > 0 && img.height > 0) {
                  context.drawImage(img, 0, 0, width, height);
                  errorDrawn = false;
                } else if (!errorDrawn) {
                  // center the error icon
                  context.drawImage(errorIcon, (width - (width / 2)) / 2,
                      (height - (height / 2)) / 2, width / 2, height / 2);
                  errorDrawn = true;
                  mjpegCanvas.emit('error', 'Invalid stream');
                }
              } else {
                context.clearRect(0, 0, width, height);
              }

              if ((mouseEnter || mjpegCanvas.showMenus) && !menuOpen) {
                // create the "swap" button
                context.globalAlpha = 0.66;
                context.beginPath();
                context.rect(buttonMargin, height
                    - (buttonHeight + buttonMargin), buttonWidth, buttonHeight);
                context.fillStyle = buttonColor;
                context.fill();
                context.lineWidth = buttonStrokeSize;
                context.strokeStyle = buttonStrokeColor;
                context.stroke();

                // draw the text on the button
                context.font = editFont;
                context.fillStyle = editColor;
                context.fillText('Edit', buttonMargin + buttonPadding, height
                    - (buttonMargin + buttonPadding));
              }

              if (menuOpen) {
                // create the white box
                context.globalAlpha = 0.66;
                context.beginPath();
                context.rect(0, 0, width, height);
                context.fillStyle = 'white';
                context.fill();
              }
              context.globalAlpha = 1;
            }

            // grab the initial stream
            createImage();

            // redraw the image every 100 ms
            var drawInt = setInterval(function() {
              draw(img);
            }, 100);

            mjpegCanvas.destroy = function() {
              window.clearInterval(drawInt);
            };
          };
          MjpegCanvas.prototype.__proto__ = EventEmitter2.prototype;
          return MjpegCanvas;
        }));
