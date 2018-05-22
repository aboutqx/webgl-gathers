import FilterApp from './FilterApp'
import load from 'load-asset'
import Filter from './Filter'
import './assets/scss/simple-ui.scss'
import './assets/scss/main.scss'
// import React from 'react'
// import styled from 'styled-components'

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
  'shirt': 'shirt.jpg'
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
  //  'technicolor', 'polaroid', 'shiftToBGR','detectEdges', 'sobelX', 'sobelY',
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
  filterApp = null

  constructor() {

  }

  async init() {
    effects.concat(Object.keys(Filter)).map((effect) => {
      let div = document.createElement('div')
      canvasWrapper.appendChild(div)
      div.outerHTML = `<button class="effect">${effect}</button>`
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

    this.imgs.push(getAssets.shirt)

    /* append will trigger reflow, img width value will be reneded value,in this its flexd,
    not original */
    this.imgs[0].style['width'] = `${this.imgs[0].width}px`
    imgWrapper.appendChild(this.imgs[0])

    this.filterApp = new FilterApp(this.imgs[0])

    canvasWrapper.addEventListener('click', (e) => {
      if (e.target.className === 'effect') {
        canvasWrapper.querySelector('.active') && canvasWrapper.querySelector('.active').classList.remove('active')
        e.target.classList.add('active')
        const effect = e.target.innerHTML
        this.filterApp.reset()

        if (presets.includes(effect)) {
          this.filterApp.addFilter(effect, presets[effect][0])
        } else if (['1977', 'Brannan', 'Hefe', 'Lord Kelvin', 'Nashville', 'X-PRO II', 'Gotham'].indexOf(effect) !== -1) {
          this.filterApp.addFilter('instagramFilter', effect)
          if (effect === 'Gotham') this.filterApp.addFilter('Inkwell')
        } else if (effect !== 'normal') {
          this.filterApp.addFilter(effect)
        }

        const filteredImage = this.filterApp.render(this.imgs[0])
        if (this.filterApp.texture2Name) {
          let t = window.getAssets[this.filterApp.texture2Name]
          t.style['width'] = `${t.width}px`
          imgWrapper.appendChild(t)
        }
      }
    })

    // for dubug
    document.querySelector('.effect:last-child').click()
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

new App().init()


file.addEventListener('change', (e) => {
  let t = e.target.files[0]
  if (!t) return
  if (isImg(t.name)) {
    let reader = new FileReader()
    reader.addEventListener('load', (event) => {
      img = new Image()
      img.src = event.target.result

    }, false)
    reader.readAsDataURL(t)
  } else if (isVideo(t.name)) {
    if(!document.querySelector('#target-video')){
      let video = document.createElement('video')
      document.body.appendChild(video)
      video.outerHTML = '<video id="target-Video" controls autoplay loop style="display:none"></video>'
      let reader = new FileReader()
      reader.addEventListener('load', (event) => {
        video.src = event.target.result
      }, false)
      reader.readAsDataURL(t)
      video.addEventListener('loadeddata', () => {
        img = video
      })
    }
  }
})


function isImg(name) {
  let allowedExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp']
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

function isVideo(name) {
  let allowedExtension = ['mp4', 'webm', 'ogg']
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

function has(arr, key, value) { // array child object has key-value
  if (!arr || !arr.length) return -1
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) return i
  }
  return -1
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
