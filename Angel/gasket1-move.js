////////////////////////////////////////////////////////////////////
//    Sýnislausn á dæmi 1 í Heimadæmum 3 í Tölvugrafík
//     Hægt að færa þríhyrning Sierpinski til með því að halda
//     niðri vinstri músarhnappi, þysja inná hann með músarhjóli
//     og breyta um lit á honum með því að slá á bilstöng.
//
//    Hjálmtýr Hafsteinsson, september 2024
////////////////////////////////////////////////////////////////////
"use strict";
var gl;
var points;

var NumPoints = 20000;
var sOffset = vec2( 0.0, 0.0 );
var sScale = 1.0;
var color = vec4( 1.0, 0.0, 0.0, 1.0 );

var movement = false;     // Do we move the triangle?
var origX;
var origY;

var locOffset;
var locScale;
var locColor;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [ vec2( -1, -1 ), vec2(  0,  1 ), vec2(  1, -1 ) ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );
    
    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 0.95, 0.95, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locOffset = gl.getUniformLocation(program, "Offset");
    gl.uniform2fv(locOffset, flatten(sOffset));

    locScale = gl.getUniformLocation(program, "Scale");
    gl.uniform1f(locScale, sScale);

    locColor = gl.getUniformLocation( program, "rcolor" );
    gl.uniform4fv( locColor, flatten(color) );
    

    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        // If spacebar hit then change color
        if( e.keyCode === 32 ) {
            var col = vec4( Math.random(), Math.random(), Math.random(), 1.0 );
            gl.uniform4fv( locColor, flatten(col) );
        }
    } );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        if( e.button === 0 ) {
            movement = true;
            origX = e.clientX;
            origY = e.clientY;
        }
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    sOffset[0] += 2.0*(e.clientX - origX)/canvas.width;
    	    sOffset[1] += 2.0*(origY - e.clientY)/canvas.height;
            origX = e.clientX;
            origY = e.clientY;

            gl.uniform2fv(locOffset, flatten(sOffset));

        }
    } );
    
    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             sScale *= 1.04;
         } else {
             sScale /= 1.04;
         }
         gl.uniform1f(locScale, sScale);

     }  );  

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    gl.drawArrays( gl.POINTS, 0, points.length );
    
    window.requestAnimFrame(render);
}
