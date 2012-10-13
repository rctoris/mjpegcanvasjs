/*********************************************************************
 *
 * Software License Agreement (BSD License)
 *
 *  Copyright (c) 2012, Worcester Polytechnic Institute
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials provided
 *     with the distribution.
 *   * Neither the name of the Worcester Polytechnic Institute nor the 
 *     names of its contributors may be used to endorse or promote 
 *     products derived from this software without specific prior 
 *     written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 *  FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 *  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 *  BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 *  CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 *  LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 *  ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 *
 *   Author: Russell Toris
 *  Version: October 9, 2012
 *
 *   AMDfied by Jihoon
 *   Version : Oct 05, 2012
 *
 *********************************************************************/

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.MjpegCanvas = factory();
  }
}
    (
        this,
        function() {
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
                context.drawImage(img, 0, 0, width, height);
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
            setInterval(function() {
              draw(img);
            }, 100);
          };
          MjpegCanvas.prototype.__proto__ = EventEmitter2.prototype;
          return MjpegCanvas;
        }));
