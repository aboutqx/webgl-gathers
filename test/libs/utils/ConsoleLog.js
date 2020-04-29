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
${mat[0]} ${mat[1]} ${mat[2]} 
${mat[3]} ${mat[4]} ${mat[5]}
${mat[6]} ${mat[7]} ${mat[8]}
            `)
            break;
        case 16:

            console.log(`
${mat[0]} ${mat[1]} ${mat[2]} ${mat[3]}
${mat[4]} ${mat[5]} ${mat[6]} ${mat[7]}
${mat[8]} ${mat[9]} ${mat[10]} ${mat[11]}
${mat[12]} ${mat[13]} ${mat[14]} ${mat[15]}
            `)
            break;
    }
}