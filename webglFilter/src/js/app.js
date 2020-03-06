import FilterApp from './FilterApp'
import load from 'load-asset'
import Filter from './Filter'
import '../scss/main.scss'
import Emitter from './Emitter'
import * as Util from 'libs/forDom.js'


const urlPre = './textures/'
const assets = {
  'p7': 'p7.jpg',
  'p6': 'p6.jpg',
  'p5': 'p5.jpg',
  'p4': 'p4.jpg',
  'p3': 'p3.jpg',
  'p2': 'p2.jpg',
  'p1': 'p1.jpg',
  'noise256': 'noise256.png',
  'pants': 'pants.jpg',
  'shirt': 'shirt.jpg',
  'TajMahal': 'TajMahal.jpg'
}
for (let k in assets) {
  assets[k] = urlPre + assets[k]
}
let scale
if (Util.isMobile()) {
  scale = .7
} else {
  scale = .25
}

const buttonWrapper = document.querySelector('.button-wrapper')
const canvas = document.querySelector('canvas')
const file = document.getElementById('change-target')
const imgWrapper = document.querySelector('.img-wrapper')
const effects = [
  // 'brightness', 'saturation', 'desaturate', 'contrast', 'negative', 'hue',
  //  'desaturateLuminance', 'sepia', 'brownie', 'vintagePinhole', 'kodachrome',
  //  'technicolor', 'polaroid', 'shiftToBGR','detectEdges',
  //  'sharpen', 'emboss', 'triangleBlur','1977', 'Brannan', 'Gotham', 'Hefe',
  //  'Inkwell', 'Lord Kelvin', 'Nashville', 'X-PRO II',
  'normal'
]
//arguments
const presets = [{
    'brightness': [1.5]
  },
  {
    'saturation': [1.5]
  },
  {
    'contrast': [1.5]
  },
  {
    'hue': [180]
  },
  {
    'triangleBlur': [30]
  }
]

class App {
  imgs = []
  layers = [{
    shaders: [],
    buffers: []
  }]

  filterApp = null

  constructor() {

  }

  async init() {
    effects.concat(Object.keys(Filter))
      .filter((v) => {
        return v !== 'Filter'
      })
      .map((effect) => {
        let div = document.createElement('div')
        buttonWrapper.appendChild(div)
        div.outerHTML = `<button class="effect ${effect}">${effect}</button>`
      })

    if (Object.keys(assets).length > 0) {
      window.getAssets = await load.any(assets, (e) => {
        // console.log(e.progress)
        if (e.error) console.error(e.error);
      })
      this._onImageLoaded()
    }
  }

  _onImageLoaded(o) {

    this.imgs.push(getAssets.pants)

    /* append will trigger reflow, img width value get from .width will be reneded value,in this its flexd,
    not original */

    this.filterApp = new FilterApp(this.imgs[0])

    buttonWrapper.addEventListener('click', (e) => {
      if (e.target.classList.contains('effect')) {
        Util.toggle(buttonWrapper, e.target, 'active')
        const effect = e.target.innerHTML
        this.filterApp.reset()
        file.value = null

        if (presets.includes(effect)) {
          this.filterApp.addFilter(effect, presets[effect][0])
        } else if (['1977', 'Brannan', 'Hefe', 'Lord Kelvin', 'Nashville', 'X-PRO II', 'Gotham'].includes(effect)) {
          this.filterApp.addFilter('instagramFilter', effect)
          if (effect === 'Gotham') this.filterApp.addFilter('Inkwell')
        } else if(effect !== 'normal') {
          this.filterApp.addFilter(effect)
        }

        this.filterApp.render()

        this.updateImg()
      }
    })

    this._animation()
  }

  updateImg() {
    imgWrapper.innerHTML = ''
    this.filterApp.textures.map((v) => {
      let t = v.img

      t.style['width'] = `${screen.width * scale}px`
      Emitter.emit('canvasResize', {
        width: screen.width * scale,
        height: t.height * screen.width * scale / t.width
      })
      imgWrapper.appendChild(t)
    })
  }

  _animation(now) {
    now *= 0.001
    const id = requestAnimationFrame(this._animation.bind(this))

    try {
      this.filterApp.render()
    } catch (e) {
      console.error(e)
      cancelAnimationFrame(id)
    }
  }
}

let app = new App()
app.init().then(
  () => {
    //for dubug
    document.querySelector('.GaussianBlur').click()
  }
)


file.addEventListener('change', (e) => {

  let t = e.target.files[0]
  if (!t) return
  if (isType(t.name, 'img')) {

    readFile(t, (event) => {
      let img = new Image()
      img.src = event.target.result
      img.onload = () => {
        Emitter.emit('updateSource', {
          img
        })
        app.updateImg()
      }

    })
  } else if (isType(t.name, 'video')) {

    const video = append(document.body,
      `<video id="target-Video" controls autoplay loop style="display:none"></video>`,
      'once'
    )

    readFile(t, (event) => {
      video.src = event.target.result
    })
    video.addEventListener('loadeddata', () => {
      app.imgs[0] = video
    })
  }
})

function readFile(file, loadCall) {
  let reader = new FileReader()
  reader.addEventListener('load', (event) => {
    loadCall(event)
  })
  reader.readAsDataURL(file)
}

function isType(name, type) {
  let allowedExtension
  if (type === 'img') allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp']
  else if (type === 'video') allowedExtension = ['mp4', 'webm', 'ogg']
  else return false
  let isValidFile
  let t = name.split('.').pop().toLowerCase()
  for (let index in allowedExtension) {
    if (t === allowedExtension[index]) {
      isValidFile = true
      break
    }
  }
  return isValidFile
}
