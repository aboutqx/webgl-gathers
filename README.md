# notes
1.gl_FragCoord是屏幕的左下角为（0,0）

2.gl_Position总是接受-1..1的值，将整个屏幕的x，y作为clipSpace的放大，没有3d projection,屏幕的正中心相当如gl_Position的（0,0）

gl_fragCoordX/canvasWidth=clipX*.5+.5

http://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html
