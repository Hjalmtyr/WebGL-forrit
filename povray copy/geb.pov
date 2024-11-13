//// 3D monogram, by Lars Huttar
// Inspired by the cover of Godel, Escher, Bach
//   by Douglas Hofstadter

// Declare your initials here:
#declare L1 = "G";
#declare L2 = "E";
#declare L3 = "B";
// You may need to reorder the letters for best results.     
// Try thicker (blacker) fonts such as "IMPACT.TTF" or "CARBONBL.TTF",
// or "cyrvetic.ttf" as a fallback.
#declare FontFile = "IMPACT.TTF";

#version  3.6;
global_settings { 
  assumed_gamma 2.2
}

#include "colors.inc"
#include "textures.inc"
#include "woods.inc"

camera {
   location  <3, 2,-3>*0.7
   direction <0, 0,  1>
   up        <0,  1,  0>
   right     <4/3, 0,  0>
   look_at   <0, -0.35, 0>
   }

background { color rgb <0.5, 0.5, 0.5> }  

#macro Make_Letter(letter, rotation)
    #local Letter = 
        text { ttf FontFile,
            letter, 1, 0
        };              
    #local Max = max_extent(Letter);
    object {
        Letter
        scale <1.0 / Max.x, 1.0 / Max.y, 1.0>
        translate -0.5 // put center at origin
        rotate rotation
    }        
#end

// Define each of the three letters, with the lower left corner at origin.
// Scale so that the opposite corner is at <1,1,1>.

intersection {
   Make_Letter(L1, y*-90)
   Make_Letter(L2, 0)
   Make_Letter(L3, x*90) 
   texture { T_Wood19
     finish { specular 0.50 roughness 0.1 ambient 0.25 }
   }
}

#declare Brightness = 0.8;
light_source {<100, 0, 0>  colour White*Brightness spotlight radius 0.2 falloff 0.5 point_at <-1,0,0>}
light_source {<100, 0, 0>  colour Orange*Brightness spotlight radius 0.3 falloff 0.6 point_at <-1,0,0>}
light_source {<0, 100, 0>  colour White*Brightness spotlight radius 0.2 falloff 0.5 point_at <0,-1,0>}
light_source {<0, 100, 0>  colour Orange*Brightness spotlight radius 0.3 falloff 0.6 point_at <0,-1,0>}
light_source {<0, 0, -100> colour White*Brightness spotlight radius 0.2 falloff 0.5 point_at <0,0,1>}
light_source {<0, 0, -100> colour Orange*Brightness spotlight radius 0.3 falloff 0.6 point_at <0,0,1>}

union {                          
   plane { <1, 0, 0>, -2 }
   plane { <0, 1, 0>, -1.75 }
   plane { <0, 0, -1>, -2 }
   pigment { color rgb <1, 1, 1> }
   finish { ambient 0.2 diffuse 0.6 }
}