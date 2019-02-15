
//
//  define_datastructures.h
//  stirred-tank-3d-xcode-cpp
//
//  Created by Niall P. O'Byrnes on 16/22/11.
//  Copyright © 2016 Niall P. O'Byrnes. All rights reserved.
//

#include <stdio.h>
#include <stdlib.h>

#ifdef _OPENMP
#include <omp.h>
#endif

#if WITH_MPI == 1
#include <mpi.h>
#endif



#include "Rushton_Geometry_3d.hpp"



//For testing
#define WITH_MPI 0



int main(){

    Grid_Dims grid;
    grid.ngx = 1;
    grid.ngy = 1;
    grid.ngz = 1;
    grid.x = 302;
    grid.y = 302;
    grid.z = 302;



    Node_Dims node;
    node.numprocs = 1;
    node.rank = 0;
    node.nthreads = 1;
    node.x = grid.x / grid.ngx;
    node.y = grid.y / grid.ngy;
    node.z = grid.z / grid.ngz;

    


    GeometryStartup geomStartup;
    geomStartup.step = 0;
    geomStartup.impeller_start_angle = 0.0f;
    geomStartup.impeller_slow_step_limit = 0;
    


    tGeomShape uav = 0.1;
    GeometryConfig tankConfig;
    tankConfig.setGeometryConfig(grid.x, uav);
    
    

    
    Geometry geometry;
    geometry.Init(geomStartup, grid, node, tankConfig);
    
    
    
    geometry.print_geometry_points_csv("tank_geometry.csv", geometry.geom_fixed, "");
    geometry.print_geometry_points_csv("tank_geometry.csv", geometry.geom_rotating, "append");

    geometry.print_geometry_points_csv("tank_geometry.csv", geometry.geom_fixed_solid, "append");
    geometry.print_geometry_points_csv("tank_geometry.csv", geometry.geom_rotating_solid, "append");




}
