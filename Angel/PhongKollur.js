/////////////////////////////////////////////////////////////////
//    Sýnislausn á dæmi 3 í heimadæmum 6 í Tölvugrafík
//     Sýnir skrifborð búið til úr fjórum teningum.
//
//    Hjálmtýr Hafsteinsson, október 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -2.0;

var fovy = 50.0;
var near = 0.2;
var far = 250.0;

// Ath: ljósstefna er núna (0, 1, 1)
var lightPosition = vec4(0.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
//var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 0.6, 0.6, 0.6, 1.0 );
var materialShininess = 100.0;

var mv;
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

    normalsCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
 
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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    projectionMatrix = perspective( fovy, 1.0, near, far );
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix) );

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
            case 38:	// upp ör
                zDist += 0.1;
                break;
            case 40:	// niður ör
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

function normalsCube()
{
    quad( 1, 0, 3, 2, 0 );   // front
    quad( 2, 3, 7, 6, 1 );   // right
    quad( 3, 0, 4, 7, 2 );   // down
    quad( 6, 5, 1, 2, 3 );   // up
    quad( 4, 5, 6, 7, 4 );   // back
    quad( 5, 4, 0, 1, 5 );   // left
}

function quad(a, b, c, d, n) 
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];


    var faceNormals = [
        vec4( 0.0, 0.0,  1.0, 0.0 ),  // front
        vec4(  1.0, 0.0, 0.0, 0.0 ),  // right
        vec4( 0.0, -1.0, 0.0, 0.0 ),  // down
        vec4( 0.0,  1.0, 0.0, 0.0 ),  // up
        vec4( 0.0, 0.0, -1.0, 0.0 ),  // back
        vec4( -1.0, 0.0, 0.0, 0.0 )   // left
    ];


    var indices = [ a, b, c, a, c, d ];

    // Úthlutum þvervigrum hliðanna með viðfanginu n
    
    for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( vertices[indices[i]] );
        normalsArray.push(faceNormals[n]);
        
    }

}

function sendModelView(mv) {

    normalMatrix = [
        vec3(mv[0][0], mv[0][1], mv[0][2]),
        vec3(mv[1][0], mv[1][1], mv[1][2]),
        vec3(mv[2][0], mv[2][1], mv[2][2])
    ];
	normalMatrix.matrix = true;
    
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zDist), at, up  );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) ) ;

    // Smíða kollinn
    // Fyrst eru fæturnir..
    mv1 = mult( mv, translate( -0.4, 0.0, -0.3 ) );
    mv1 = mult( mv1, scalem( 0.07, 0.5, 0.07 ) );
    sendModelView(mv1);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( -0.4, 0.0, 0.3 ) );
    mv1 = mult( mv1, scalem( 0.07, 0.5, 0.07 ) );
    sendModelView(mv1);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( 0.4, 0.0, 0.3 ) );
    mv1 = mult( mv1, scalem( 0.07, 0.5, 0.07 ) );
    sendModelView(mv1);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    mv1 = mult( mv, translate( 0.4, 0.0, -0.3 ) );
    mv1 = mult( mv1, scalem( 0.07, 0.5, 0.07 ) );
    sendModelView(mv1);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // Svo toppurinn á kollinum
    mv1 = mult( mv, translate( 0.0, 0.325, 0.0 ) );
    mv1 = mult( mv1, scalem( 0.9, 0.2, 0.7 ) );
    sendModelView(mv1);
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


    requestAnimFrame( render );
}

