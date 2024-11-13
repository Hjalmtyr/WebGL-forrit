// Lausn á fyrirlestraæfingu 3 í fyrirlestri um POV-Ray
// Tölvugrafík, haust 2024
////////////////////////////////////////
#include "Colors.inc"

camera { location <0, 2,-3>  look_at <0, 0, 3> }

light_source { <1000, 1000, -700>  color rgb <1, 1, 1> }

sky_sphere { pigment { rgb <0.5, 0.8, 1> } }

plane { <0, 1, 0> 0
    pigment { checker color White color Black }
}

union{
    sphere{<0,1,0>, 0.35}
    cone {<0,0,0>, 0.5, <0,1,0>, 0.0}
    texture{
        pigment{ color rgb<1,0,0>}
        finish { diffuse 0.9 phong 0.5}
    }
}
