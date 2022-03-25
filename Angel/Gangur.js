/////////////////////////////////////////////////////////////////
//    S�nislausn � d�mi 2 � heimad�mum 7 � T�lvugraf�k
//     Forrit sem s�nir gang me� tveimur veggjum og g�lfi.  �a�
//     er h�gt a� ganga um og �a� er �rekstarv�rn.
//
//    Hj�lmt�r Hafsteinsson, mars 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var numVertices  = 6;

var program;

var pointsArray = [];
var texCoordsArray = [];

var texture;
var texVegg;
var texGolf;
var texLoft;

// Breytur fyrir hreyfingu �horfanda
var userXPos = 0.0;                // Initial position of user
var userZPos = 5.0;                //   in (x, z) coordinates, y is fixed
var userIncr = 0.1;                // Size of forward/backward step
var userAngle = 90.0;              // Direction of the user in degrees
var userXDir = 0.0;                // X-coordinate of heading
var userZDir = 1.0;                // Z-coordinate of heading


var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var proLoc;
var mvLoc;

// Hn�tar veggsins
var vertices = [
    vec4( -1.0,  0.0, 100.0, 1.0 ),
    vec4( -1.0,  0.0,  0.0, 1.0 ),
    vec4( -1.0,  1.0,  0.0, 1.0 ),
    vec4( -1.0,  1.0,  0.0, 1.0 ),
    vec4( -1.0,  1.0, 100.0, 1.0 ),
    vec4( -1.0,  0.0, 100.0, 1.0 ),
// Hn�tar g�lfsins (strax � eftir)
    vec4( -1.0,  0.0, 100.0, 1.0 ),
    vec4(  1.0,  0.0, 100.0, 1.0 ),
    vec4(  1.0,  0.0,  0.0, 1.0 ),
    vec4(  1.0,  0.0,  0.0, 1.0 ),
    vec4( -1.0,  0.0,  0.0, 1.0 ),
    vec4( -1.0,  0.0, 100.0, 1.0 )
];

// Mynsturhnit fyrir vegg
var texCoords = [
    vec2(  0.0, 0.0 ),
    vec2( 100.0, 0.0 ),
    vec2( 100.0, 3.0 ),
    vec2( 100.0, 3.0 ),
    vec2(  0.0, 3.0 ),
    vec2(  0.0, 0.0 ),
// Mynsturhnit fyrir g�lf
    vec2( 0.0,  0.0 ),
    vec2( 3.0,  0.0 ),
    vec2( 3.0, 100.0 ),
    vec2( 3.0, 100.0 ),
    vec2( 0.0, 100.0 ),
    vec2( 0.0,  0.0 )
];


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Lesa inn og skilgreina mynstur fyrir vegg
    var veggImage = document.getElementById("VeggImage");
    texVegg = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, veggImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // Lesa inn og skilgreina mynstur fyrir g�lf
    var golfImage = document.getElementById("GolfImage");
    texGolf = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texGolf );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, golfImage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);


    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 50.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            userAngle += 0.4*(origX - e.clientX);
            userAngle %= 360.0;
            userXDir = Math.cos( radians(userAngle) );
            userZDir = Math.sin( radians(userAngle) );
            origX = e.clientX;
        }
    } );
    
    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         var newXPos = userXPos;
         switch( e.keyCode ) {
            case 87:	// w
                newXPos += userIncr * userXDir;
                userZPos += userIncr * userZDir;;
                break;
            case 83:	// s
                newXPos -= userIncr * userXDir;
                userZPos -= userIncr * userZDir;;
                break;
            case 65:	// a
                newXPos += userIncr * userZDir;
                userZPos -= userIncr * userXDir;;
                break;
            case 68:	// d
                newXPos -= userIncr * userZDir;
                userZPos += userIncr * userXDir;;
                break;
         }
         // �rekstrav�rn
         if( newXPos > -.9 && newXPos < 0.9 )
             userXPos = newXPos;
     }  );  

    render();
 
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // sta�setja �horfanda og me�h�ndla m�sarhreyfingu
    var mv = lookAt( vec3(userXPos, 0.5, userZPos), vec3(userXPos+userXDir, 0.5, userZPos+userZDir), vec3(0.0, 1.0, 0.0 ) );
    
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    var mv1 = mv;

    // Teikna g�lf me� mynstri
    gl.bindTexture( gl.TEXTURE_2D, texGolf );
    gl.drawArrays( gl.TRIANGLES, numVertices, numVertices );

    // Teikna einn vegg me� mynstri
    mv = mv1;
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.bindTexture( gl.TEXTURE_2D, texVegg );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // Teikna annan vegg me� mynstri
    mv = mult( mv, translate( 2.0, 0.0, 0.0 ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    requestAnimFrame(render);
}
