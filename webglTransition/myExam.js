var Promise = require('bluebird');

var images=["./image-slider-2.jpg","./image-slider-3.jpg"];
var createTexture = require("gl-texture2d");
var createTransition = require("glsl-transition");

var GlslTransitions = require("glsl-transitions").sort(function (a, b) {
  return b.stars - a.stars;
});

var transition, from, to;
var time=1000;

Promise.all(images.map(loadImage)).spread(function start(fromImage,toImage){
	var canvas = document.getElementById("target");
  	canvas.width = 960;
  	canvas.height = 420;


	var gl = canvas.getContext("webgl");
    if (!gl) throw new Error("webgl context is not supported.");
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	to = createTexture(gl, fromImage);
	from = createTexture(gl, toImage);
	
	function loop(transitionIndex, from, to){
		//console.log(GlslTransitions[transitionIndex].name);
		if(GlslTransitions[transitionIndex].name=='Blur'||GlslTransitions[transitionIndex].name=='Circle Crop') transitionIndex++;
		
		return new Promise(function(resolve,reject){
			try{
				transition = createTransition(gl, GlslTransitions[transitionIndex].glsl);
			}catch(e){
				reject(e);
			}
			for(var i=0;i<101;i++){
				(function(){
					var pos=i;
					setTimeout(function(){				
						transition.render(pos/100, from, to, GlslTransitions[transitionIndex].uniforms);				
						if(pos==100) resolve('suc')
					},pos*time/100)
				})();
			}
			var nameDiv=document.getElementById('transi-name');
			nameDiv.innerHTML=GlslTransitions[transitionIndex].name;
		}).delay(500).then(function(){
			return loop(transitionIndex+1 < GlslTransitions.length ? transitionIndex+1 : 0, to, from);
		}).catch(function(){
			throw new Error('compile shader error')
		})
	}
	loop(0,from,to);

})
window.onload=function(){
	var range=document.getElementById('time');
	range.addEventListener('change',function(){
		time=this.value;
		document.getElementById('time-dept').innerHTML='Time:'+(this.value)+'ms';
	})
}

function loadImage(src){
	return new Promise(function(resolve,reject){
		var img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function (e) { resolve(img); };
        img.onabort = img.onerror = reject;
        img.src = src;
	})

}