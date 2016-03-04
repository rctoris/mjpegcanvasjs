/**
 * @author Russell Toris - russell.toris@gmail.com
 */

/**
 * A MultiStreamViewer can be used to stream multiple MJPEG topics into a canvas.
 *
 * Emits the following events:
 *   * 'warning' - emitted if the given topic is unavailable
 *   * 'change' - emitted with the topic name that the canvas was changed to
 *
 * @constructor
 * @param options - possible keys include:
 *   * divID - the ID of the HTML div to place the canvas in
 *   * width - the width of the canvas
 *   * height - the height of the canvas
 *   * host - the hostname of the MJPEG server
 *   * port (optional) - the port to connect to
 *   * quality (optional) - the quality of the stream (from 1-100)
 *   * topics - an array of topics to stream
 *   * labels (optional) - an array of labels associated with each topic
 *   * defaultStream (optional) - the index of the default stream to use
 */
MJPEGCANVAS.MultiStreamViewer = function(options) {
  var that = this;
  options = options || {};
  var divID = options.divID;
  var width = options.width;
  var height = options.height;
  var host = options.host;
  var port = options.port || 8080;
  var quality = options.quality;
  var topics = options.topics;
  var labels = options.labels;
  var defaultStream = options.defaultStream || 0;
  var currentTopic = topics[defaultStream];

  // create an overlay canvas for the button
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');

  // menu div
  var menu = document.createElement('div');
  menu.style.display = 'none';
  document.getElementsByTagName('body')[0].appendChild(menu);

  // button for the error
  var buttonHeight = height / 8;
  var buttonPadding = 10;
  var button = new MJPEGCANVAS.Button({
    text : 'Edit',
    height : buttonHeight
  });
  var buttonWidth = button.width;

  // use a regular viewer internally
  var viewer = new MJPEGCANVAS.Viewer({
    divID : divID,
    width : width,
    height : height,
    host : host,
    port : port,
    quality : quality,
    topic : currentTopic,
    overlay : canvas
  });

  // catch the events
  viewer.on('warning', function(warning) {
    that.emit('warning', warning);
  });
  viewer.on('change', function(topic) {
    currentTopic = topic;
    that.emit('change', topic);
  });

  /**
   * Clear the button from the overlay canvas.
   */
  function clearButton() {
    if (buttonTimer) {
      window.clearInterval(buttonTimer);
      // clear the button
      canvas.width = canvas.width;
      hasButton = false;
    }
  }

  /**
   * Fades the stream by putting an overlay on it.
   */
  function fadeImage() {
    canvas.width = canvas.width;
    // create the white box
    context.globalAlpha = 0.44;
    context.beginPath();
    context.rect(0, 0, width, height);
    context.fillStyle = '#fefefe';
    context.fill();
    context.globalAlpha = 1;
  }

  // add the event listener
  var buttonTimer = null;
  var menuOpen = false;
  var hasButton = false;
  viewer.canvas.addEventListener('mousemove', function(e) {
    clearButton();

    if (!menuOpen) {
      hasButton = true;
      // add the button
      button.redraw();
      context.drawImage(button.canvas, buttonPadding, height - (buttonHeight + buttonPadding));

      // display the button for 3 seconds
      buttonTimer = setInterval(function() {
        // clear the overlay canvas
        clearButton();
      }, 3000);
    } else {
      fadeImage();
    }
  }, false);

  // add the click listener
  viewer.canvas.addEventListener('click', function(e) {
    // check if the button is there
    if (hasButton) {
      // determine the click position
      var offsetLeft = 0;
      var offsetTop = 0;
      var element = viewer.canvas;
      while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
        offsetLeft += element.offsetLeft - element.scrollLeft;
        offsetTop += element.offsetTop - element.scrollTop;
        element = element.offsetParent;
      }

      var x = e.pageX - offsetLeft;
      var y = e.pageY - offsetTop;

      // check if we are in the 'edit' button
      if (x < (buttonWidth + buttonPadding) && x > buttonPadding
          && y > (height - (buttonHeight + buttonPadding)) && y < height - buttonPadding) {
        menuOpen = true;
        clearButton();

        // create the menu
        var heading = document.createElement('span');
        heading.innerHTML = '<h2>Camera Streams</h2><hr /><br />';
        menu.appendChild(heading);
        var form = document.createElement('form');
        var streamLabel = document.createElement('label');
        streamLabel.setAttribute('for', 'stream');
        streamLabel.innerHTML = 'Stream: ';
        form.appendChild(streamLabel);
        var streamMenu = document.createElement('select');
        streamMenu.setAttribute('name', 'stream');
        // add each option
        for ( var i = 0; i < topics.length; i++) {
          var option = document.createElement('option');
          // check if this is the selected option
          if (topics[i] === currentTopic) {
            option.setAttribute('selected', 'selected');
          }
          option.setAttribute('value', topics[i]);
          // check for a label
          if (labels) {
            option.innerHTML = labels[i];
          } else {
            option.innerHTML += topics[i];
          }
          streamMenu.appendChild(option);
        }
        form.appendChild(streamMenu);
        menu.appendChild(form);
        menu.appendChild(document.createElement('br'));
        var close = document.createElement('button');
        close.innerHTML = 'Close';
        menu.appendChild(close);

        // display the menu
        menu.style.position = 'absolute';
        menu.style.top = offsetTop + 'px';
        menu.style.left = offsetLeft + 'px';
        menu.style.width = width + 'px';
        menu.style.display = 'block';

        streamMenu.addEventListener('click', function() {
          var topic = streamMenu.options[streamMenu.selectedIndex].value;
          // make sure it is a new stream
          if (topic !== currentTopic) {
            viewer.changeStream(topic);
          }
        }, false);

        // handle the interactions
        close.addEventListener('click', function(e) {
          // close the menu
          menu.innerHTML = '';
          menu.style.display = 'none';
          menuOpen = false;
          canvas.width = canvas.width;
        }, false);
      }
    }
  }, false);
};
MJPEGCANVAS.MultiStreamViewer.prototype.__proto__ = EventEmitter2.prototype;
