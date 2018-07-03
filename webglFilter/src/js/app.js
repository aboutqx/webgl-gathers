import FilterApp from './FilterApp'
import load from 'load-asset'
import Filter from './Filter'
import '../scss/main.scss'
import Emitter from './Emitter'
// import React from 'react'
// import styled from 'styled-components'

const urlPre = '/webglFilter/src/textures/'
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


const canvasWrapper = document.querySelector('.canvas-wrapper')
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
const presets = [
  { 'brightness': [1.5] },
  { 'saturation': [1.5] },
  { 'contrast': [1.5] },
  { 'hue': [180] },
  { 'triangleBlur': [30] }
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
    effects.concat(Object.keys(Filter)).filter((v)=>{return v!=='Filter'}).map((effect) => {
      let div = document.createElement('div')
      canvasWrapper.appendChild(div)
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

    /* append will trigger reflow, img width value will be reneded value,in this its flexd,
    not original */
    this.imgs[0].style['width'] = `${this.imgs[0].width}px`
    append(imgWrapper,this.imgs[0])

    this.filterApp = new FilterApp(this.imgs[0])

    canvasWrapper.addEventListener('click', (e) => {
      if (e.target.classList.contains('effect')) {
        toggle(canvasWrapper, e.target, 'active')
        const effect = e.target.innerHTML
        this.filterApp.reset()

        if (presets.includes(effect)) {
          this.filterApp.addFilter(effect, presets[effect][0])
        } else if (['1977', 'Brannan', 'Hefe', 'Lord Kelvin', 'Nashville', 'X-PRO II', 'Gotham'].includes(effect)){
          this.filterApp.addFilter('instagramFilter', effect)
          if (effect === 'Gotham') this.filterApp.addFilter('Inkwell')
        } else if (effect !== 'normal') {
          this.filterApp.addFilter(effect)
        }

        const filteredImage = this.filterApp.render(this.imgs[0])

        imgWrapper.innerHTML = ''
        this.filterApp.textures.map((v) => {
          let t = v.img
          t.style['width'] = `${t.width}px`
          imgWrapper.appendChild(t)
        })
      }
    })

    // for dubug
    document.querySelector('.edge').click()
    this._animation()
  }
  _animation(now) {
    now *= 0.001
    const id = requestAnimationFrame(this._animation.bind(this))

    try {
      this.filterApp.render(this.imgs[0])
    } catch (e) {
      console.error(e)
      cancelAnimationFrame(id)
    }
  }
}

let app = new App()
app.init()


file.addEventListener('change', (e) => {

  let t = e.target.files[0]
  if (!t) return
  if (isType(t.name, 'img')) {

    readFile(t, (event) => {
      app.imgs[0] = new Image()
      app.imgs[0].src = event.target.result

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

function readFile(file, loadCall){
  let reader = new FileReader()
  reader.addEventListener('load', (event) => {
    loadCall(event)
  })
  reader.readAsDataURL(file)
}
function isType(name, type) {
  let allowedExtension
  if (type === 'img') allowedExtension= ['jpeg', 'jpg', 'png', 'gif', 'bmp']
  else if(type === 'video') allowedExtension = ['mp4', 'webm', 'ogg']
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

function append(parent, child, option) {
  let elm
  // use id or class as identity
  if(typeof child ==='string'){
    if(/<(.+?)\b/i.test(child)){
      elm = document.createElement(RegExp.$1)
    }

    if (option === 'once') {

      let exist
      if (/id="?(.+?)"?/i.test(child)) {
        exist = document.getElementById(RegExp.$1)
      } else if (/class="?(.+?)"?/i.test(child)) {
        exist = document.getElementsByClassName(RegExp.$1)[0]
      }
      if (exist)
        return exist
    }
  } else {
    elm = child
    if (option === 'once') {

      let exist
      if (elm.id) {
        exist = document.getElementById(elm.id)
      } else if (elm.className) {
        exist = document.getElementsByClassName(elm.className)[0]
      }
      if (exist)
        return exist
    }
  }


  parent.appendChild(elm)
  if (typeof child === 'string') requestAnimationFrame(() => {elm.outerHTML = child})
  return elm
}
function toggle(parent, child ,className) {
  parent.querySelector(`.${className}`) && parent.querySelector(`.${className}`).classList.remove(className)
  child.classList.add(className)
}
function Toast(message) {
  if (typeof message === 'string') {
    const div = document.createElement('div')
    document.body.appendChild(div)
    div.outerHTML = `<div class="simple-toast">${message}</div>`
    setTimeout(() => {
      document.body.removeChild(div)
    }, 1000)
  }

}
