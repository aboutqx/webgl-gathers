import WebGLImageFilter from './WebGLImageFilter';
import AssetsLoader from 'assets-loader';

const assets = [
    { id: 'source7', url: './textures/p7.jpg' },
    { id: 'source6',url: './textures/p6.jpg'},
    { id: 'source5',url: './textures/p5.jpg'},
    { id: 'source4',url: './textures/p4.jpg'},
    { id: 'source3',url: './textures/p3.jpg'},
    { id: 'source2',url: './textures/p2.jpg'},
    { id: 'source1',url: './textures/p1.jpg'},
    { id: 'noise256', url: './textures/noise256.png' }
];

window.getAsset = function(id) { return window.assets.find((a) => a.id === id).file; }

const effects = [
    'normal','brightness', 'saturation', 'desaturate', 'contrast', 'negative', 'hue',
     'desaturateLuminance', 'sepia', 'brownie', 'vintagePinhole', 'kodachrome', 
     'technicolor', 'polaroid', 'shiftToBGR','detectEdges', 'sobelX', 'sobelY', 
     'sharpen', 'emboss', 'triangleBlur','1977', 'Brannan', 'Gotham', 'Hefe', 
     'Inkwell', 'Lord Kelvin', 'Nashville', 'X-PRO II', 'grayFocus', 'cartoon', 
     'notebookDrawing','bondFilter','bloom'
];
const presets = [
    { name: 'brightness', args: [1.5] },
    { name: 'saturation', args: [1.5] },
    { name: 'contrast', args: [1.5] },
    { name: 'hue', args: [180] },
    { name: 'triangleBlur', args: [30] },
];
let container = document.getElementById('container'),
    canvas = document.querySelector('canvas'),
    file = document.querySelector('#change-target');

effects.map((effect) => {
    let div = document.createElement('div');
    div.className = 'effect';
    div.innerHTML = effect;
    container.appendChild(div);
})

if (document.body) {
    _init();
} else {
    window.addEventListener('DOMContentLoaded', _init);
}

function _init() {
    if (assets.length > 0) {

        let loader = new AssetsLoader({
                assets: assets
            }).on('error', function(error) {
                console.error(error);
            }).on('progress', function(p) {


            }).on('complete', _onImageLoaded)
            .start();

    } else {
        _onImageLoaded()
    }
}


let img, filter;

function _onImageLoaded(o) {
    window.assets = o;
    img = getAsset('source3');

    canvas.width = img.width;
    canvas.height = img.height;
    try {
        filter = new WebGLImageFilter();
    } catch (err) { console.error(err) }

    filter.setImageData(img)

    container.addEventListener('click', (e) => {

        if (e.target.className == 'effect') {
            container.querySelector('.active') && (container.querySelector('.active').className = 'effect');
            e.target.className = 'effect active';
            let effect = e.target.innerHTML;
            filter.reset();

            if (has(presets, 'name', effect)!= -1){
                filter.addFilter(effect, presets[has(presets, 'name', effect)].args[0]);
            } else if (['1977', 'Brannan', 'Hefe', 'Lord Kelvin', 'Nashville', 'X-PRO II', 'Gotham'].indexOf(effect) != -1) {
                filter.addFilter('instagramFilter', effect);
                if (effect == 'Gotham') filter.addFilter('Inkwell');
            } else if (effect !== 'normal') {
                filter.addFilter(effect);
            }

            let filteredImage = filter.render(img);
        }

    })

    //for dubug
    document.querySelector('.effect:nth-child(32)').click()
    animation();
}

file.addEventListener('change', (e) => {
    let t = e.target.files[0];
    if (!t) return;
    if (isImg(t.name)) {
        let reader = new FileReader();
        reader.addEventListener('load', (event) => {
            img = new Image();
            img.src = event.target.result;
            img.onload = ()=>{
                document.querySelector('.effect:last-child').click()
            }
        }, false);
        reader.readAsDataURL(t);
    } else if (isVideo(t.name)) {

        document.querySelector('#target-video') && document.body.removeChild(document.querySelector('#target-video'))
        let video = document.createElement('video');
        video.setAttribute('id', 'target-video')
        video.setAttribute('controls', true)
        video.setAttribute('autoplay', true)
        video.setAttribute('loop', true)
        video.style.display = 'none';

        let reader = new FileReader();
        reader.addEventListener('load',(event) => {
            video.src = event.target.result;
            document.body.appendChild(video)
        }, false);
        reader.readAsDataURL(t);
        video.addEventListener('loadeddata', () => {
            img = video
        })
    }
})

let then = 0,id;

function animation(now) {
    now *= 0.001;
    id = requestAnimationFrame(animation)

    try{
    	filter.render(img)
    }catch(e){
    	cancelAnimationFrame(id)
    }
}

function isImg(name) {
    let allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'],
        isValidFile;
    let t = name.split('.').pop().toLowerCase()
    for (let index in allowedExtension) {
        if (t === allowedExtension[index]) {
            isValidFile = true;
            break;
        }
    }
    return isValidFile;
}

function isVideo(name) {
    let allowedExtension = ['mp4', 'webm', 'ogg'],
        isValidFile;
    let t = name.split('.').pop().toLowerCase()
    for (let index in allowedExtension) {
        if (t === allowedExtension[index]) {
            isValidFile = true;
            break;
        }
    }
    return isValidFile;
}

function has(arr, key, value) { //array child object has key-value
    if (!arr || !arr.length) return -1;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] == value) return i;
    }
    return -1;
}
