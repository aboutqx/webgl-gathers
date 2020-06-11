//accept argument list
console.logMatrix = function(mat) {
    const length = mat.length
    if(arguments.length > 1) {
        Array.prototype.forEach.call(arguments, (v => {
            console.logMatrix(v)
        }))
        return
    }
    switch(length) {

        case 9:

            console.log(`
${mat[0]} ${mat[3]} ${mat[6]} 
${mat[1]} ${mat[4]} ${mat[7]}
${mat[2]} ${mat[5]} ${mat[8]}
            `)
            break;
        case 16:

            console.log(`
${mat[0]} ${mat[4]} ${mat[8]} ${mat[12]}
${mat[1]} ${mat[5]} ${mat[9]} ${mat[13]}
${mat[2]} ${mat[6]} ${mat[10]} ${mat[14]}
${mat[3]} ${mat[7]} ${mat[11]} ${mat[15]}
            `)
            break;
    }
}

let logged = false
console.logOnce = function(arg){
    if(!logged) {

        Array.prototype.forEach.call(arguments, (v => {
            console.log(v)
        }))
        
        logged = true
    }
}

console.logFrames = function() {
    
}