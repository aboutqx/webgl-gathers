var Promise = require('bluebird');

var images=["image-slider-1.jpg","image-slider-2.jpg","image-slider-3.jpg","image-slider-4.jpg","image-slider-5.jpg"];
var createTexture = require("gl-texture2d");
var createTransition = require("glsl-transition");

var GlslTransitions = require("glsl-transitions").sort(function (a, b) {
  return a.stars - b.stars;
});
omitArray(GlslTransitions,['name','name'],['Blur','Circle Crop']);

var transition;
var time=1000;
var transitionIndex=0;

Promise.all(images.map(loadImage)).then(function start(values){
	var canvas = document.getElementById("target");
  	canvas.width = 960;
  	canvas.height = 420;


	var gl = canvas.getContext("webgl");
    if (!gl) throw new Error("webgl context is not supported.");
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	var textures=[];
	values.forEach(function(v,i){
		textures.push(createTexture(gl, v))
	})

	var nextBtn=document.querySelector('.right-arrow');
	var prevBtn=document.querySelector('.left-arrow');
	
	var imageIndex=0;
	try{
		transition = createTransition(gl, GlslTransitions[transitionIndex].glsl);
	}catch(e){
		throw new Error('webgl error');
	}
	transition.render(1, textures[imageIndex], textures[imageIndex], GlslTransitions[transitionIndex].uniforms);

	var nPromise,pPromise;
	nextBtn.addEventListener('click',function(e){
		if(!nPromise||nPromise.isFulfilled()){
			nPromise= new Promise(function(resolve,reject){
				makeTransi(resolve,reject,'add');
			}).catch(function(){
				throw new Error("webgl error")
			})
			return nPromise;
		}
	})
	prevBtn.addEventListener('click',function(e){
		if(!pPromise||pPromise.isFulfilled()){
			pPromise=new Promise(function(resolve,reject){
				makeTransi(resolve,reject,'decrease');
			}).catch(function(){
				throw new Error("webgl error")
			})
			return pPromise;
		}
	})
	function makeTransi(resolve,reject,flag){

		try{
			transition = createTransition(gl, GlslTransitions[transitionIndex].glsl);
		}catch(e){
			reject(e);
		}

		for(var i=0;i<101;i++){
			(function(){
				var pos=i;
				setTimeout(function(){
					if(flag=='add'){
						var tmp=imageIndex==images.length-1?0:imageIndex+1
					}else if(flag=='decrease'){
						var tmp=imageIndex==0?images.length-1:imageIndex-1
					}		
					transition.render(pos/100, textures[imageIndex], textures[tmp], GlslTransitions[transitionIndex].uniforms);				
					if(pos==100) {
						resolve('suc')
						if(flag=='add'){
							if(imageIndex==images.length-1) imageIndex=0;
							else imageIndex++;
						}else if(flag=='decrease'){
							if(imageIndex==0) imageIndex=images.length-1;
							else imageIndex--;
						}
						document.getElementById('image-index').innerHTML=imageIndex+1;
					}
				},pos*time/100)
			})();
		}
	}
})

window.onload=function(){
	var range=document.getElementById('time');
	range.addEventListener('change',function(){
		time=this.value;
		document.getElementById('time-dept').innerHTML='Time:'+(this.value)+'ms';
	})

	var nameDiv=document.getElementById('transi-name');
	GlslTransitions.forEach(function(v,i){
		var tmp="<option>"+v.name+"</option>";
		nameDiv.insertAdjacentHTML('afterbegin',tmp);
	})
	nameDiv.children[nameDiv.children.length-1].selected=true;

	nameDiv.addEventListener('change',function(e) {

		for(var i=0;i<nameDiv.children.length;i++){
			if(nameDiv.children[i].selected==true){
				transitionIndex=has(GlslTransitions,'name',nameDiv.children[i].innerHTML);
				break;
			}
		}
	})
}
function has(arr, key, value) { //array with object child  has key-value
    if (!arr||!arr.length) return -1;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][key] == value) return i;
    }
    return -1;
}
function omitArray(array,keys,values){//omit key-value object in array

	keys.forEach(function(v,i){
		var index=has(array,v,values[i])
		if(index==-1){
			
		}else {
			array.splice(index,1)
		}
	})
	return array;
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