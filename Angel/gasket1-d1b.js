///////////////////////////////////////////////////////////////////
//    Sýnislausn á dæmi 1 b) í heimadæmum 2 í Tölvugrafík
//     Láta einn horn punktinn vera mun líklegri en hina tvo.
//
//    Hjálmtýr Hafsteinsson, ágúst 2024
///////////////////////////////////////////////////////////////////
"use strict";
var gl;
var points;

var NumPoints = 50000;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

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
    
    // Veljum hornpunktanna þannig að punktur 0 valinn í 90%
    // tilvika (slembigildi 0 til 17), en hinir tveir í 5% tilvika hvor

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var k = Math.floor(Math.random() * 20);
        if ( k < 18 )
            p = add( points[i], vertices[0] );
        else if ( k == 18 )
            p = add( points[i], vertices[1] );
        else
            p = add( points[i], vertices[2] );
        p = scale( 0.5, p );
        points.push( p );
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

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

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, points.length );
}
