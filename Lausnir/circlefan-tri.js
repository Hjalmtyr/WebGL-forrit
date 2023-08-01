/////////////////////////////////////////////////////////////////
//    S�nislausn � d�mi 2 � heimad�mum 2 � T�lvugraf�k
//     Teikna n�lgun � hring me� TRIANGLES � sta� TRIANGLE_FAN
//
//    Hj�lmt�r Hafsteinsson, jan�ar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;


var numCirclePoints = 20;
var radius = 0.2;
var center = vec2(0, 0);

var points = [];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
//    points.push( center );
    createCirclePoints( center, radius, numCirclePoints );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    render();
}


// Create the points of the circle
function createCirclePoints( cent, rad, k )
{
    var dAngle = 2*Math.PI/k;
	
	var a = k*dAngle;
	// Reikna fyrsta punktinn
	var p = vec2( rad*Math.sin(a) + cent[0], rad*Math.cos(a) + cent[1] );
	
    for( i=k-1; i>=0; i-- ) {
		points.push(cent);				// Setja mi�punktinn � fylki�
		points.push(p);					// Setja s��asta punkt � hringnum � fylki�
    	a = i*dAngle;
    	p = vec2( rad*Math.sin(a) + cent[0], rad*Math.cos(a) + cent[1] );
    	points.push(p);					// Setja n�sta punkt � hringnum � fylki�
    }
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // Draw circle using Triangles
    gl.drawArrays( gl.TRIANGLES, 0, 3*numCirclePoints );

    window.requestAnimFrame(render);
}
