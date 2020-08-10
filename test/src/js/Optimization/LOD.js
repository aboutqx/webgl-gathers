import Pipeline from '../PipeLine'
export default class LOD extends Pipeline{
    
}

const k = 3
const select = [1, 3, 3, 3, 3, 4, 4, 4, 7]


function plusNDivideK(select, k){
    const winerTimes = Math.ceil((select.length+1) / k)
    const sortSelect = select.sort((a, b) => a - b)

    const splitArray = []
    for(let i = 0; i < sortSelect.length; i+= winerTimes -1) {
        const t = []
        for(let j = 0; j < winerTimes - 1; j++){
            t.push( i+j < sortSelect.length ? sortSelect[i + j] : 0)
        }
        splitArray.push(t)
    }
    console.log(splitArray)
    for(let j=0;j < splitArray.length; j++) {
        const arr = splitArray[j]
        let sum = 0
        for(let k =0 ; k < winerTimes -1; k++){
            sum += arr[k]
        }
        if(sum == arr[0] * (winerTimes -1) && splitArray[j-1][winerTimes -2] == arr[0]) {
            return arr[0]
        }
        if(sum == arr[0] * (winerTimes -1) && splitArray[j+1][0] == arr[0]) {
            return arr[0]
        }
    }
}
console.log(plusNDivideK(select, k))








function selectMaxTimes(select) {
    select = select.splice(0, 1)
    const map = new Array(select.length).fill(0)
    let i = 0
    while(i < select.length){
        map[select[i] - 1]++
        i++ 
    }

    let j = 0
    let maxTime = 0
    let maxIndex = 0
    while(j < select.length){
        console.log(j+1, '->', map[j])
        if(map[j] > maxTime) {
            maxTime = map[j]
            maxIndex = j + 1
        }
        j++
        
    }
    console.log('max ->', maxIndex)
}


