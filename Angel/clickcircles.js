/////////////////////////////////////////////////////////////////
//    S�nislausn � d�mi 4 � heimad�mum 2 � T�lvugraf�k
//     Teiknar hring � strigann �ar sem notandinn smellir
//     me� m�sinni af slembist�r�
//
//    Hj�lmt�r Hafsteinsson, �g�st 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;


var maxNumCircles = 100;
var numCirclePoints = 30;
var numCirclePoints2 = numCirclePoints + 2;
var radius = 0.1;
var index = 0;
var points = [];

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumCircles*numCirclePoints2, gl.DYNAMIC_DRAW);
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    canvas.addEventListener("mousedown", function(e){

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        
        // Calculate coordinates of new center
        var t = vec2(2*e.offsetX/canvas.width-1, 2*(canvas.height-e.offsetY)/canvas.height-1);
        
        // Get random radius
        radius = Math.random()*0.3;
        
        // Fill points array with vertices for a new circle
        points = [];
        createCirclePoints( t, radius, numCirclePoints );

        // Add new circle behind the others
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index*numCirclePoints2, flatten(points));

        index++;
    } );

    render();
}

// Create the points of the circle
function createCirclePoints( cent, rad, k )
{
    points.push( cent );

    var dAngle = 2*Math.PI/k;
    for( i=k; i>=0; i-- ) {
    	a = i*dAngle;
    	var p = vec2( rad*Math.sin(a) + cent[0], rad*Math.cos(a) + cent[1] );
    	points.push(p);
    }
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // Need to draw the circles one by one, since we are using TRIANGLE_FAN
    for (i=0; i<index; i++) {
        gl.drawArrays( gl.TRIANGLE_FAN, i*numCirclePoints2, numCirclePoints2 );
    }

    window.requestAnimFrame(render);
}
