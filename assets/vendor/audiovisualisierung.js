/*
 * Audiovisualization using the html canvas element.
 * ©2017, Dominik Hofacker
 * https://www.behance.net/dominikhofacker
 * Please consider supporting this project on behance:
 * https://www.behance.net/gallery/49260123/Web-Audio-Visualization
 */

var rafID = null;
var analyser = null;
var c = null;
var cDraw = null;
var ctx = null;
var ctxDraw = null;

var loader;
var filename;
var fileChosen = false;
var hasSetupUserMedia = false;
var start = false;

//handle different prefix of the audio context
var AudioContext = AudioContext || webkitAudioContext;
//create the context.
var context = new AudioContext();

//using requestAnimationFrame instead of timeout...
if (!window.requestAnimationFrame)
	window.requestAnimationFrame = window.webkitRequestAnimationFrame;

$(function () {
	"use strict";
    loader = new BufferLoader();
    initBinCanvas();	
});

// progress on transfers from the server to the client (downloads)

function playSample(url) {
	fileChosen = true;
    setupAudioNodes();
	
	var request = new XMLHttpRequest();
	
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

 	// When loaded decode the data
	request.onload = function() {
		onWindowResize();
		context.decodeAudioData(request.response, function(buffer) {
			sourceNode.buffer = buffer;
			sourceNode.start(0);
			start=true;
		});
	};
	request.send();
}


function initBinCanvas () {

	//add new canvas
	"use strict";
	c = document.getElementById("freq");
	c.width = window.innerWidth;
        c.height = window.innerHeight;
	//get context from canvas for drawing
	ctx = c.getContext("2d");
	
	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
	
	window.addEventListener( 'resize', onWindowResize, false );
	
	//create gradient for the bins
	var gradient = ctx.createLinearGradient(0, c.height - 300,0,window.innerHeight - 25);
	gradient.addColorStop(1,'#00f'); //black
	gradient.addColorStop(0.75,'#f00'); //red
	gradient.addColorStop(0.25,'#f00'); //yellow
	gradient.addColorStop(0,'#ffff00'); //white

	
	ctx.fillStyle = "#9c0001";
}

function onWindowResize(){
	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;
}

var audioBuffer;
var sourceNode;
function setupAudioNodes() {
	analyser = context.createAnalyser();
	sourceNode = context.createBufferSource();	
	sourceNode.connect(analyser);
	// sourceNode.connect(context.destination);// Muted!!!!!!!!!!!!!!!!
	rafID = window.requestAnimationFrame(updateVisualization);
}


function reset () {
	// console.log('pause animation');
	if (typeof sourceNode !== "undefined" && start == true) {
		sourceNode.stop(0);		
		start=false;
	}
}


function updateVisualization () {
        
	// get the average, bincount is fftsize / 2
	if (fileChosen || hasSetupUserMedia) {
		var array = new Uint8Array(analyser.frequencyBinCount);
		analyser.getByteFrequencyData(array);

		drawBars(array);
	}
       // setTextAnimation(array);
    

	rafID = window.requestAnimationFrame(updateVisualization);
}

function drawBars (array) {

	//just show bins with a value over the treshold
	var threshold = 0;
	// clear the current state
	ctx.clearRect(0, 0, c.width, c.height);
	//the max count of bins for the visualization
	var maxBinCount = array.length;
	//space between bins
	var space = 3;
        
	ctx.save();


	ctx.globalCompositeOperation='source-over';

	ctx.scale(0.5, 0.5);
	ctx.translate(window.innerWidth, window.innerHeight);
	ctx.fillStyle = "#fff";

	var bass = Math.floor(array[1]); //1Hz Frequenz 
	var radius = 0.45 * $(window).width() <= 450 ? -(bass * 0.25 + 0.45 * $(window).width()) : -(bass * 0.25 + 450);

	var bar_length_factor = 1;
	if ($(window).width() >= 785) {
		bar_length_factor = 1;
	}
	else if ($(window).width() < 785) {
		bar_length_factor = 1.5;
	}
	else if ($(window).width() < 500) {
		bar_length_factor = 20.0;
	}
	//go over each bin
	for ( var i = 0; i < maxBinCount; i++ ){
		
		var value = array[i];
		if (value >= threshold) {			
			//draw bin
			//ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
                        //ctx.fillRect(i * space, c.height, 2, -value);
                        ctx.fillRect(0, radius, $(window).width() <= 450 ? 2 : 3, -value / bar_length_factor);
                        ctx.rotate((180 / 128) * Math.PI/180);   
		}
	}  
        
	for ( var i = 0; i < maxBinCount; i++ ){

		var value = array[i];
		if (value >= threshold) {				

			//draw bin
			//ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
						//ctx.fillRect(i * space, c.height, 2, -value);
						ctx.rotate(-(180 / 128) * Math.PI/180);
						ctx.fillRect(0, radius, $(window).width() <= 450 ? 2 : 3, -value / bar_length_factor);
		}
	} 
        
	for ( var i = 0; i < maxBinCount; i++ ){

		var value = array[i];
		if (value >= threshold) {				

			//draw bin
			//ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
						//ctx.fillRect(i * space, c.height, 2, -value);
						ctx.rotate((180 / 128) * Math.PI/180);
						ctx.fillRect(0, radius, $(window).width() <= 450 ? 2 : 3, -value / bar_length_factor);
		}
	} 
    
	ctx.restore();
}

