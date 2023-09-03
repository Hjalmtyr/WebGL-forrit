/////////////////////////////////////////////////////////////////
//    Sýnislausn dæmi 4 í heimadæmum 2 í Tölvugrafík
//     Teiknar marga slembi þríhyrninga af slembilit
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
/////////////////////////////////////////////////////////////////
var gl;
var points;

var colorLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Búum til einn lítinn þríhyrning í miðjunni
    var points = [
        vec2( -0.1, -0.1 ),
        vec2(  0.0,  0.1 ),
        vec2(  0.1, -0.1 )
    ];

    // Núna inniheldur points-fylki einn þríhyrning.
    // Búum nú til 99 aðra þríhyrninga á slembistað
    //  og bætum þeim við points-fylkið
    for ( var i = 1; i < 100; i++ ) {
        // Búa til slembihliðrun
        delta = vec2( 2.0*Math.random() - 1.0, 2.0*Math.random() - 1.0 );

        // Bætum hliðrun við alla hnúta upphafsþríhyrningsins og setja í fylkið
        points.push( add(points[0], delta) );
        points.push( add(points[1], delta) );
        points.push( add(points[2], delta) );
        
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
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

    // Find the location of the color variable in the shader program
    colorLoc = gl.getUniformLocation( program, "fColor" );
    
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    for( var i = 0; i < 100; i++ ) {
        // Búum til slembilit og sendum hann yfir
        gl.uniform4fv( colorLoc, vec4(Math.random(), Math.random(), Math.random(), 1.0) );
        
        // Teikna einn þríhyrning
        gl.drawArrays( gl.TRIANGLES, 3*i, 3 );
    }

}
