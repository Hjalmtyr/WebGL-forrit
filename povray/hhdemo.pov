// Sýnidæmi um POV-Ray líkanamálið
// Tölvugrafík, haust 2023
////////////////////////////////////////
#include "Colors.inc"

camera { location <0, 4,-6>  look_at <0, 0, 3> }

light_source { <1000, 1000, -700>  color rgb <1, 1, 1> }

sky_sphere { pigment { rgb <0.5, 0.8, 1> } }

plane { <0, 1, 0> 0
    pigment { checker color White color Black }
}

sphere { <0, 0, 0>, 1.3
    texture {
        pigment { rgb <0.9, 0.9, 0.9> }
        finish {
            diffuse 0.5
            ambient 0.0
            reflection 0.5
            metallic
        }
    }
    scale 1
    translate <-1, 2, 0>
}

cylinder { <0, 0, 0>, <0, 3.5, 0>, 0.5
    texture {
        pigment { rgb <1, 0, 0> }
        finish {
            ambient 0.2
            diffuse 0.2
            phong 0.8
            phong_size 100
            reflection 0.5
        }
    }         
    scale 1.5
    translate <1, 1, -1>
}
