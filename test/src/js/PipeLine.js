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
        this.orbital = new OrbitalControls(this.camera)
        GlTools.setCamera(this.camera)
        this.init()
        this.attrib()
        this.prepare()
        this._setGUI()

        this.frameBufferGUI = new FrameBufferGUI()

        GlTools.customGlState()

        this._resize()
        window.addEventListener('resize', this._resize.bind(this), false);

    }

    init() {

    }
    compile(vs, fs) {
        const prg = new Program(vs, fs)
        return prg
    }

    basicVert(fs) {
        const prg = new Program(null, fs)
        return prg
    }

    basicColor() {
        const prg = new Program(null, basicColorFrag)
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
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        GlTools.aspectRatio = canvas.width / canvas.height

        this.camera.setAspectRatio(GlTools.aspectRatio);

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

    
    
    setRadio(prop, props, name = 'radio') {
        if(props) {
            const folder = this.gui.addFolder(name)
            props.forEach(prop => {
                this.addGUIParams({
                    [prop]: false
                })
                folder.add(this.params, prop).listen().onChange(() => {
                this.setRadio(prop)
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


