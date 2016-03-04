/**
 * @author Russell Toris - russell.toris@gmail.com
 */

/**
 * A Viewer can be used to stream a single MJPEG topic into a canvas.
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
 *   * topic - the topic to stream, like '/wide_stereo/left/image_color'
 *   * overlay (optional) - a canvas to overlay after the image is drawn
 *   * refreshRate (optional) - a refresh rate in Hz
 *   * interval (optional) - an interval time in milliseconds
 */
MJPEGCANVAS.Viewer = function(options) {
  var that = this;
  options = options || {};
  var divID = options.divID;
  this.width = options.width;
  this.height = options.height;
  this.host = options.host;
  this.port = options.port || 8080;
  this.quality = options.quality;
  this.refreshRate = options.refreshRate || 10;
  this.interval = options.interval || 30;
  this.invert = options.invert || false;

  var topic = options.topic;
  var overlay = options.overlay;

  // create no image initially
  this.image = new Image();

  // used if there was an error loading the stream
  var errorIcon = new MJPEGCANVAS.ErrorIcon();

  // create the canvas to render to
  this.canvas = document.createElement('canvas');
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  this.canvas.style.background = '#aaaaaa';
  document.getElementById(divID).appendChild(this.canvas);
  var context = this.canvas.getContext('2d');

  var drawInterval = Math.max(1 / this.refreshRate * 1000, this.interval);
  /**
   * A function to draw the image onto the canvas.
   */
  function draw() {
    // clear the canvas
    that.canvas.width = that.canvas.width;

    // check if we have a valid image
    if (that.image.width * that.image.height > 0) {
      context.drawImage(that.image, 0, 0, that.width, that.height);
    } else {
      // center the error icon
      context.drawImage(errorIcon.image, (that.width - (that.width / 2)) / 2,
          (that.height - (that.height / 2)) / 2, that.width / 2, that.height / 2);
      that.emit('warning', 'Invalid stream.');
    }

    // check for an overlay
    if (overlay) {
      context.drawImage(overlay, 0, 0);
    }

    // silly firefox...
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      var aux = that.image.src.split('?killcache=');
      that.image.src = aux[0] + '?killcache=' + Math.random(42);
    }
  }

  // grab the initial stream
  this.changeStream(topic);

  // call draw with the given interval or rate
  setInterval(draw, drawInterval);
};
MJPEGCANVAS.Viewer.prototype.__proto__ = EventEmitter2.prototype;

/**
 * Change the stream of this canvas to the given topic.
 *
 * @param topic - the topic to stream, like '/wide_stereo/left/image_color'
 */
MJPEGCANVAS.Viewer.prototype.changeStream = function(topic) {
  this.image = new Image();
  // create the image to hold the stream
  var src = 'http://' + this.host + ':' + this.port + '/stream?topic=' + topic;
  // add various options
  src += '&width=' + this.width;
  src += '&height=' + this.height;
  if (this.quality > 0) {
    src += '&quality=' + this.quality;
  }
  if (this.invert) {
    src += '&invert=' + this.invert;
  }
  this.image.src = src;
  // emit an event for the change
  this.emit('change', topic);
};
