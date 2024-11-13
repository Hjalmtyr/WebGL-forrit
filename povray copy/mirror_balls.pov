// http://xahlee.org/3d/index.html
#include "colors.inc"

light_source { <50,50,-50> color White }
camera { location <2,-4,-3>*1.6 look_at <0,2,0> sky <0,0,-1>}

box { <0,0,0>, <10,4,4> pigment { color Orange } finish{ reflection 1 } rotate <0,0,15> translate <-5,5.5,-4> }

sphere {<-4,0,-1>, 1 texture{pigment{color Gray}finish{ reflection 0 }} }
sphere {<-2,0,-1>, 1 texture{pigment{color Yellow}finish{ reflection .25 }} }
sphere {< 0,0,-1>, 1 texture{pigment{color Green}finish{ reflection .5 }} }
sphere {< 2,0,-1>, 1 texture{pigment{color Blue }finish{ reflection .75 }} }
sphere {< 4,0,-1>, 1 texture{pigment{color Red}finish{ reflection 1 }} }

plane { <0,0,-1>, 0 pigment { checker color White, color Gray } }
