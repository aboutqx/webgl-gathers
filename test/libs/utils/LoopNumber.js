// interpolat between discrete points, loop this in setting time
import Scheduler from 'scheduling';
import TweenNumber from './TweenNumber'

export class LoopNumber {
    loopTime
    discreteNumbers // maybe discrete arrays
    

    constructor(loopTime, discreteNumbers, tweenType = 'LINEAR') {
        this._startTime = perfomance.now()

        Scheduler.addEF(() => this._loop)
    }

    _which2toInter() {

    }

    _loop() {

    }

}