// S�nid�mi um POV-Ray l�kanam�li�
// T�lvugraf�k, haust 2024
////////////////////////////////////////
#include "Colors.inc"

camera { location <0, 3,-5>  look_at <0, 0, 3> }

light_source { <1000, 1000, -700>  color rgb <1, 1, 1> }

sky_sphere { pigment { rgb <0.5, 0.8, 1> } }

plane { <0, 1, 0> 0
    pigment { checker color White color Black }
}

sphere { <0, 2, 0>, 1.3
    texture {
        pigment { rgb <0.9, 0.9, 0.9> }
        finish {
            diffuse 0.5
            ambient 0.0
            reflection 0.5
            metallic
        }
    }
}
