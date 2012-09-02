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
 *  Version: September 2, 2012
 *
 *********************************************************************/

var MjpegCanvas = function(options) {
	var mjpegCanvas = this;
	options = options || {};
	mjpegCanvas.host = options.host;
	mjpegCanvas.port = options.port || 8080;
	mjpegCanvas.topic = options.topic;
	mjpegCanvas.quality = options.quality;
	mjpegCanvas.canvasID = options.canvasID;
	mjpegCanvas.width = options.width;
	mjpegCanvas.height = options.height;

	// grab the canvas
	mjpegCanvas.canvas = $('#' + mjpegCanvas.canvasID);

	// create the image to hold the stream
	var _img = new Image();
	var _src = 'http://' + mjpegCanvas.host + ':' + mjpegCanvas.port + '/stream?topic='
			+ mjpegCanvas.topic;
	// check for various options
	if (mjpegCanvas.width > 0) {
		_src += '?width=' + mjpegCanvas.width;
	}
	if (mjpegCanvas.width > 0) {
		_src += '?height=' + mjpegCanvas.height;
	}
	if (mjpegCanvas.quality > 0) {
		_src += '?height=' + mjpegCanvas.quality;
	}
	_img.src = _src;

	// a function to draw the image onto the canvas
	function draw(_img) {
		// grab the current sizes of the canvas
		var width = mjpegCanvas.canvas.attr('width');
		var height = mjpegCanvas.canvas.attr('height');

		// grab the drawing context and draw the image
		var context = mjpegCanvas.canvas[0].getContext('2d');
		context.drawImage(_img, 0, 0, width, height);
	}

	// redraw the image every 100 ms
	setInterval(function() {
		draw(_img);
	}, 100);
};
