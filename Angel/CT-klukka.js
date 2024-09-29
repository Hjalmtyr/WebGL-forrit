/////////////////////////////////////////////////////////////////
//    Sýnislausn á dæmi 5 á heimadæmum 4 í Tölvugrafík
//     Sýnir Continue Time klukku
//
//    Hjálmtýr Hafsteinsson, september 2024
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

var sek = 0;
var sekupph = 1.0;
var sekvisir = 0;
var minvisir = 0;
var kstvisir = 0;

var zDist = 1.5;

var proLoc;
var mvLoc;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
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

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Enable rotation on mouse down
    canvas.addEventListener("mousedown", function(e){
        if (e.button == 0) {
            movement = true;
            origX = e.offsetX;
            origY = e.offsetY;
            e.preventDefault();         // Disable drag and drop
        }
    } );

    // Disable rotation on mouse up
    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    // Moving mouse with button down rotates clock
    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (e.offsetY - origY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    // Change speed of clock with up/down keys
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp ör
                sekupph *= 1.1;
                break;
            case 40:	// niður ör
                sekupph /= 1.1;
                break;
         }
     }  );  

    // Zoom in/out with mousewheel
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
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

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[a]);
        
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var proj = perspective( 70.0, 1.0, 0.2, 10.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    
    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX( spinX ) );
    mv = mult( mv, rotateY( spinY ) );
    
    // Búa til bakgrunn fyrir klukku
    mvb = mult( mv, translate( 0.0, 0.0, -0.04 ) );
    mvb = mult( mvb, rotateY( 180.0 ) );
    mvb = mult( mvb, scalem( 1.25, 1.25, 0.01 ) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvb));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
    

    // Uppfæra sekúntu og snúningshorn allra vísanna
    sek += sekupph;
    sekvisir = 6*sek;
    minvisir = 0.1*sek;
    kstvisir = 0.1*sek/11.0;


    // ---------- Klukkustundavísir
    mv = mult( mv, rotateZ( -kstvisir ) );              // Snúa samkvæmt breytingu á tíma
    
     // Líkanavörpun klukkustundavísis
    mvk = mult( mv, translate( 0.0, 0.1, 0.0 ) );       // Hliðra upp, svo neðri endi í (0, 0, 0)
    mvk = mult( mvk, scalem( 0.025, 0.2, 0.025 ) );       // Setja í rétta stærð

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvk));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


    // ---------- Mínútuvísir
    mv = mult( mv, translate( 0.0, 0.2, 0.0 ) );        // Færa út á enda klukkustundavísis
    mv = mult( mv, rotateZ( -minvisir ) );              // Snúa samkvæmt breytingu á tíma
    
     // Líkanavörpun mínútuvísis
    mvm = mult( mv, translate( 0.0, 0.1, 0.0 ) );       // Hliðra upp, svo neðri endi í (0, 0, 0)
    mvm = mult( mvm, scalem( 0.02, 0.2, 0.02 ) );       // Setja í rétta stærð

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvm));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    
    // ----------- Sekúnduvísir
    mv = mult( mv, translate( 0.0, 0.2, 0.0 ) );        // Færa út á enda mínútuvísis
    mv = mult( mv, rotateZ( -sekvisir ) );              // Snúa samkvæmt breytingu á tíma
    
     // Líkanavörpun sekúnduvísis
    mvs = mult( mv, translate( 0.0, 0.1, 0.0 ) );       // Hliðra upp, svo neðri endi í (0, 0, 0)
    mvs = mult( mvs, scalem( 0.015, 0.2, 0.015 ) );       // Setja í rétta stærð

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvs));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );


    requestAnimFrame(render);
}

