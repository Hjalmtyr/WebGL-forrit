/////////////////////////////////////////////////////////////////
//    S�nislausn � d�mi 4 � heimad�mum 4 � T�lvugraf�k
//     S�nir b�kahilluna Billy b�ina til �r �tta teningum.
//
//    Hj�lmt�r Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -2.0;

var modelViewLoc;
var projectionLoc;
var projectionMatrix;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionLoc = gl.getUniformLocation( program, "projectionMatrix" );
    projectionMatrix = perspective( 50.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix) );


    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );


    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  
       
    
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

    // Sm��a hilluna
    // Fyrst hli�arnar..
    mv1 = mult( mv, translate( -0.4, 0.0, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.02, 1.0, 0.3 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( 0.4, 0.0, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.02, 1.0, 0.3 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // svo toppurinn..
    mv1 = mult( mv, translate( 0.0, 0.485, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.8, 0.02, 0.295 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // 3 hillur..
    mv1 = mult( mv, translate( 0.0, 0.2, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.8, 0.02, 0.295 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( 0.0, -0.1, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.8, 0.02, 0.295 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( 0.0, -0.4, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.8, 0.02, 0.295 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // baki�..
    mv1 = mult( mv, translate( 0.0, 0.04, 0.145 ) );
    mv1 = mult( mv1, scalem( 0.8, 0.9, 0.01 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // s�kkullinn..
    mv1 = mult( mv, translate( 0.0, -0.45, -0.11 ) );
    mv1 = mult( mv1, scalem( 0.8, 0.1, 0.02 ) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


    requestAnimFrame( render );
}

