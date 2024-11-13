#include "colors.inc"

camera {
  location <-2, 3, -10>
  look_at <0, 5, 0>
}

plane { // the floor
  y, 0  // along the x-z plane (y is the normal vector)
  pigment { checker color Black color White } // checkered pattern
}

sphere {
  <0, 5, 0>, 2
  pigment { color White }
  finish {
    reflection 0.9
    phong 1
  }
}

light_source { <10, 10, -10> color White }

light_source { <-10, 5, -15> color White }
