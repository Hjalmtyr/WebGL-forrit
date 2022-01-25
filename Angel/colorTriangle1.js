/////////////////////////////////////////////////////////////////
//    S�nid�mi � T�lvugraf�k
//     S�nir notkun hn�tahnit og hn�talita fl�ttu� saman � sama
//     minnissv��inu (buffers) � GPU
//
//    Hj�lmt�r Hafsteinsson, jan�ar 2022
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var vertices = [ vec4( -0.5, -0.5, 0.0, 1.0 ), vec4( 1.0, 0.0, 0.0, 1.0 ),
                 vec4(  0.0,  0.5, 0.0, 1.0 ), vec4( 0.0, 1.0, 0.0, 1.0 ),
                 vec4(  0.5, -0.5, 0.0, 1.0 ), vec4( 0.0, 0.0, 1.0, 1.0 ) ];

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
    
    // T�kum fr� pl�ss og sendum hn�tag�gnin yfir
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    // Tengjum hnitin vi� litarabreytuna vPosition (ath. n� er "stride" 32, �v� �a� er st�r� blokkarinnar)
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 4*8, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Tengjum litina vi� litarabreytuna vColor (ath. n� er "stride" 32 og "offset" 16 �v� �a� er st�r� hnitanna)
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 4*8, 4*4 );
    gl.enableVertexAttribArray( vColor );

    render();

}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    window.requestAnimFrame(render);

}
