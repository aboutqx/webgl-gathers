let curTime = 0
let lastTime = 0

export default function FrameInterval(interval, func){
    curTime = performance.now()
    if (curTime - lastTime > interval) {
        func()
        lastTime = performance.now()
    }
}

