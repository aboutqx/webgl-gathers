import Program from 'libs/GLShader'
import CameraPers from 'libs/cameras/CameraPerspective'
import OrbitalControls from 'libs/controls/OrbitalControls'
import { gl, GlTools, canvas } from 'libs/GlTools'
import FrameBufferGUI from 'libs/helpers/FrameBufferGUI'
import * as dat from 'dat.gui'
import { basicColorFrag } from 'CustomShaders'

export default class Pipeline {
    count = 0
    mousePos = { x: 0, y: 0 }
    camera = new CameraPers(45, canvas.width / canvas.height, .1, 1000)
    _params = {}
    gui = new dat.GUI({
        width: 300
    })
    radioProps = []

    constructor() {

        GlTools.setCamera(this.camera)
        this._resize() // set canvas width
        this.orbital = new OrbitalControls(this.camera)
        this.init()
        this.attrib()
        this.prepare()
        this._setGUI()

        this.frameBufferGUI = new FrameBufferGUI()

        GlTools.customGlState()


        window.addEventListener('resize', this._resize.bind(this), false);

    }

    init() {

    }
    compile(vs, fs, settings) {
        const prg = new Program(vs, fs, settings)
        return prg
    }

    basicVert(fs, settings) {
        const prg = new Program(null, fs, settings)
        return prg
    }

    basicColor(vs, settings) {
        const prg = new Program(vs, basicColorFrag, settings)
        return prg
    }

    attrib() {

    }
    uniform() {

    }
    prepare() {

    }
    _animate() {
        requestAnimationFrame(this._animate.bind(this))

        this.orbital.updateMatrix()
        this.uniform()
        this.render()
        this.frameBufferGUI.draw()
    }
    render() {

    }
    play() {
        this._animate()
    }

    resize() {
        
    }

    _resize() {
        GlTools.resize()

        this.resize()
    }

    _setGUI() {
        // this.addGUIParams({
        //   lt: 0.2,
        //   gt: 0.98,
        //   clamp: false
        // })
        // cconst folder = gui.addFolder('grayFocus')
        // folder.add(this.params, 'lt', 0, 1).step(0.01)
        // folder.add(this.params, 'gt', 0, 1).step(0.01)
        // folder.add(this.params, 'clamp')
        // folder.open()
    }

    addGUIParams(o) {
        return Object.assign(this._params, o)
    }

    
    
    addRadio(prop, props, name = 'radio', callback = function() {}) {
        if(props) {
            const folder = this.gui.addFolder(name)
            props.forEach(prop => {
                this.addGUIParams({
                    [prop]: false
                })
                folder.add(this.params, prop).listen().onChange(() => {
                    this.addRadio(prop)
                    callback()
                })
            folder.open()
            this.radioProps.push(prop)
            })
        }
        
        this.radioProps.forEach(v => this.params[v] = false)
        if(prop) this.params[prop] = true
    }

    get params() {
        return this._params
    }
    set params(param) {
        throw Error("Params has no setter,please use addGUIParams")
    }
}


