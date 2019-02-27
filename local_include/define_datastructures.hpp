//
//  Header.h
//  TD_GeomInput_Rushton_Turbine
//
//  Created by Nile Ó Broin on 13/02/2019.
//  Copyright © 2019 Nile Ó Broin. All rights reserved.
//

#ifndef define_datastructures_hpp
#define define_datastructures_hpp


#include "define_typealias.h"


struct Geom_Dims {

    tGeomShape xc = 0.0f;
    tGeomShape yc = 0.0f;
    tGeomShape zc = 0.0f;
    tGeomShape mdiam = 0.0f;

    tGeomShape impeller_increment = 0.0f;

};





struct Grid_Dims
{
    t3d ngx = 0;
    t3d ngy = 0;
    t3d ngz = 0;

    //Formally gridx, number of cells in each direction
    tNi x = 0;
    tNi y = 0;
    tNi z = 0;
};



struct Node_Dims
{

    t3d idi = 0;
    t3d idj = 0;
    t3d idk = 0;

    int node000 = 0;
    int ncpu = 0;
    int rank = 0;

    int nthreads = 0;
    int numprocs = 0;

    tNi x = 0;
    tNi y = 0;
    tNi z = 0;

};



typedef struct {
    tNi i0 = 0;
    tNi i1 = 0;

    tNi j0 = 0;
    tNi j1 = 0;

    tNi k0 = 0;
    tNi k1 = 0;

} Node_Bounds;



#endif /* Header_h */
