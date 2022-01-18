/////////////////////////////////////////////////////////////////
//    S�nid�mi � T�lvugraf�k
//     Hagkv�m a�fer� til a� sn�a ferningi.  H�kka sn�ningsgr��u
//     � JS forriti og senda hana yfir � GPU � hverri �trun og
//     l�ta litara reikna n� hnit (sendum bara eina breytu).
//     Notar setTimeout til a� st�ra hra�a forritsins
//
//    Hj�lmt�r Hafsteinsson, jan�ar 2022
/////////////////////////////////////////////////////////////////
"use strict";
var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var fps = 20;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vertices = [
        vec2(  0,  1 ),
        vec2(  -1,  0 ),
        vec2( 1,  0 ),
        vec2(  0, -1 )
    ];


    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation( program, "theta" );

    render();
};


function render() {

   setTimeout( function() {
      window.requestAnimFrame(render);
      gl.clear( gl.COLOR_BUFFER_BIT );

      // Change the rotating angle
      theta += 0.1;
    
      // Send the new angle over to GPU
      gl.uniform1f( thetaLoc, theta );

      // Draw!
      gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
   }, 1000/fps);
   
}
