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
 *  Version: September 27, 2012
 *
 *********************************************************************/

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

  // current streaming topic
  var _stream = null;
  var _img = null;

  // grab the canvas
  var _canvas = document.getElementById(mjpegCanvas.canvasID);
  var _context = _canvas.getContext('2d');

  var _createImage = function() {
    // create the image to hold the stream
    _img = new Image();
    var _src = 'http://' + mjpegCanvas.host + ':' + mjpegCanvas.port
        + '/stream?topic=' + _stream;
    // check for various options
    if (mjpegCanvas.width > 0) {
      _src += '?width=' + mjpegCanvas.width;
    }
    if (mjpegCanvas.width > 0) {
      _src += '?height=' + mjpegCanvas.height;
    }
    if (mjpegCanvas.quality > 0) {
      _src += '?quality=' + mjpegCanvas.quality;
    }
    _img.src = _src;
  };

  // check if the topics is a list or single topic
  if (mjpegCanvas.topic instanceof Array) {
    // check the labels
    if (!(mjpegCanvas.label && mjpegCanvas.label instanceof Array && mjpegCanvas.label.length == mjpegCanvas.topic.length)) {
      mjpegCanvas.label = null;
    }

    // start the stream with the first topic
    _stream = mjpegCanvas.topic[mjpegCanvas.defaultStream];

    // button options
    _context.globalAlpha = 0.66;
    var _buttonMargin = 10;
    var _buttonPadding = 5;
    var _buttonHeight = 25;
    var _buttonWidth = 55;
    var _buttonColor = 'black';
    var _buttonStrokeSize = 5;
    var _buttonStrokeColor = 'blue';
    var _editFont = '16pt Verdana';
    var _editColor = 'white';

    // menu div
    var _menu = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(_menu);
    _menu.style.display = 'none';

    // create the mouseovers
    var _mouseEnter = false;
    var _menuOpen = false;
    _canvas.addEventListener('mouseenter', function(e) {
      _mouseEnter = true;
    }, false);
    _canvas.addEventListener('mouseleave', function(e) {
      _mouseEnter = false;
    }, false);
    _canvas
        .addEventListener(
            'click',
            function(e) {
              // create a unique ID
              var id = (new Date()).getTime();

              var offsetLeft = 0;
              var offsetTop = 0;
              var element = _canvas;
              while (element && !isNaN(element.offsetLeft)
                  && !isNaN(element.offsetTop)) {
                offsetLeft += element.offsetLeft - element.scrollLeft;
                offsetTop += element.offsetTop - element.scrollTop;
                element = element.offsetParent;
              }

              var x = e.pageX - offsetLeft;
              var y = e.pageY - offsetTop;
              var height = _canvas.getAttribute('height');
              var width = _canvas.getAttribute('width');

              // check if we are in the 'edit' button
              if (x < (_buttonWidth + _buttonMargin) && x > _buttonMargin
                  && y > (height - (_buttonHeight + _buttonMargin))
                  && y < height - _buttonMargin) {
                _menuOpen = true;

                // create the menu
                var html = '<h2>Camera Streams</h2><hr /><br /><form><label for="stream">Stream</label><select name="stream" id="stream-'
                    + id + '" required>';
                for ( var i = 0; i < mjpegCanvas.topic.length; i++) {
                  // check if this is the selected option
                  var selected = '';
                  if (mjpegCanvas.topic[i] === _stream) {
                    var selected = 'selected="selected"';
                  }
                  html += '<option value="' + mjpegCanvas.topic[i] + '" '
                      + selected + '>';
                  // check for a label
                  if (mjpegCanvas.label) {
                    html += mjpegCanvas.label[i];
                  } else {
                    html += mjpegCanvas.topic[i];
                  }
                  html += '</option>';
                }
                html += '</select></form><br /><button id="button-' + id
                    + '">Close</button>';

                // display the menu
                _menu.innerHTML = html;
                _menu.style.position = 'absolute';
                _menu.style.top = offsetTop + 'px';
                _menu.style.left = offsetLeft + 'px';
                _menu.style.width = width + 'px';
                _menu.style.display = 'block';

                // dropdown change listener
                var select = document.getElementById('stream-' + id);
                select.addEventListener('click', function() {
                  var stream = select.options[select.selectedIndex].value;
                  // make sure it is a new
                  // stream
                  if (stream !== _stream) {
                    _stream = stream;
                    _img = null;
                    _createImage();
                  }
                }, false);

                // create the event listener for the close
                var button = document.getElementById('button-' + id);
                button.addEventListener('click', function(e) {
                  // close the menu
                  _menuOpen = false;
                  _menu.style.display = 'none';
                }, false);
              }
            }, false);
  } else {
    _stream = mjpegCanvas.topic;
  }

  // a function to draw the image onto the canvas
  function draw(_img) {
    // grab the current sizes of the canvas
    var width = _canvas.getAttribute('width');
    var height = _canvas.getAttribute('height');

    // grab the drawing context and draw the image
    if (_img) {
      _context.drawImage(_img, 0, 0, width, height);
    } else {
      _context.clearRect(0, 0, width, height);
    }

    if (_mouseEnter && !_menuOpen) {
      // create the "swap" button
      _context.globalAlpha = 0.66;
      _context.beginPath();
      _context.rect(_buttonMargin, height - (_buttonHeight + _buttonMargin),
          _buttonWidth, _buttonHeight);
      _context.fillStyle = _buttonColor;
      _context.fill();
      _context.lineWidth = _buttonStrokeSize;
      _context.strokeStyle = _buttonStrokeColor;
      _context.stroke();

      // draw the text on the button
      _context.font = _editFont;
      _context.fillStyle = _editColor;
      _context.fillText('Edit', _buttonMargin + _buttonPadding, height
          - (_buttonMargin + _buttonPadding));
    }

    if (_menuOpen) {
      // create the white box
      _context.globalAlpha = 0.66;
      _context.beginPath();
      _context.rect(0, 0, width, height);
      _context.fillStyle = 'white';
      _context.fill();
    }
    _context.globalAlpha = 1;
  }

  // grab the initial stream
  _createImage();

  // redraw the image every 100 ms
  setInterval(function() {
    draw(_img);
  }, 100);
};
