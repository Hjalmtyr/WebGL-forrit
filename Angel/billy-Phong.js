/////////////////////////////////////////////////////////////////
//    S�nislausn � d�mi 2 � heimad�mum 6 � T�lvugraf�k
//     S�nir b�kahillu sm��a�a �r �tta teningum, l�st me�
//     l�singarl�kani Blinn-Phong og litu� me� Phong litun.
//
//    Hj�lmt�r Hafsteinsson, okt�ber 2014
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var normals = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -2.0;

var fovy = 50.0;
var near = 0.2;
var far = 100.0;

   
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    normalCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
 //   normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    projectionMatrix = perspective( fovy, 1.0, near, far );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );


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

    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp �r
                zDist += 0.1;
                break;
            case 40:	// ni�ur �r
                zDist -= 0.1;
                break;
         }
     }  );  

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

function normalCube()
{
    quad( 1, 0, 3, 2 );    // framhli�
    quad( 2, 3, 7, 6 );    // h�gri hli�
    quad( 3, 0, 4, 7 );    // ne�ri hli�
    quad( 6, 5, 1, 2 );    // efri hli�
    quad( 4, 5, 6, 7 );    // bakhli�
    quad( 5, 4, 0, 1 );    // vinstri hli�
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

    var indices = [ a, b, c, a, c, d ];

	var n = normalize(cross(subtract(vertices[a], vertices[b]), subtract(vertices[a], vertices[c])));
	n = vec4(n[0], n[1], n[2], 0.0);
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normals.push(n);
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var ctm = lookAt( vec3(0.0, 0.0, zDist), at, up );
    ctm = mult( ctm, rotateX(spinX) );
    ctm = mult( ctm, rotateY(spinY) ) ;

    // Sm��a hilluna
    // Fyrst hli�arnar..
    ctm1 = mult( ctm, translate( -0.4, 0.0, 0.0 ) );
    ctm1 = mult( ctm1, scalem( 0.02, 1.0, 0.3 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    ctm1 = mult( ctm, translate( 0.4, 0.0, 0.0 ) );
    ctm1 = mult( ctm1, scalem( 0.02, 1.0, 0.3 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // svo toppurinn..
    ctm1 = mult( ctm, translate( 0.0, 0.485, 0.0 ) );
    ctm1 = mult( ctm1, scalem( 0.8, 0.02, 0.295 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // 3 hillur..
    ctm1 = mult( ctm, translate( 0.0, 0.2, 0.0 ) );
    ctm1 = mult( ctm1, scalem( 0.8, 0.02, 0.295 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    ctm1 = mult( ctm, translate( 0.0, -0.1, 0.0 ) );
    ctm1 = mult( ctm1, scalem( 0.8, 0.02, 0.295 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    ctm1 = mult( ctm, translate( 0.0, -0.4, 0.0 ) );
    ctm1 = mult( ctm1, scalem( 0.8, 0.02, 0.295 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // baki�..
    ctm1 = mult( ctm, translate( 0.0, 0.04, 0.145 ) );
    ctm1 = mult( ctm1, scalem( 0.8, 0.9, 0.01 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // s�kkullinn..
    ctm1 = mult( ctm, translate( 0.0, -0.45, -0.11 ) );
    ctm1 = mult( ctm1, scalem( 0.8, 0.1, 0.02 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


    requestAnimFrame( render );
}

