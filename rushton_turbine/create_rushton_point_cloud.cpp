
//
//  define_datastructures.h
//  stirred-tank-3d-xcode-cpp
//
//  Created by Niall P. O'Byrnes on 18/22/11.
//  Copyright © 2018 Niall P. O'Byrnes. All rights reserved.
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
#include "Rushton_Geometry_Config.hpp"



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

    


    tStep starting_step = 0;
    tGeomShape impeller_start_angle = 0.0;
    tStep impeller_startup_steps_until_normal_speed = 0;
    


    tGeomShape uav = 0.1;
    GeometryConfig tankConfig;


    tankConfig.setGeometryConfig(grid.x, uav);
    tankConfig.setGeometryStartup(starting_step, impeller_start_angle, impeller_startup_steps_until_normal_speed);


    tankConfig.saveGeometryConfigAsJSON("tankConfig.json");
    tankConfig.loadGeometryConfigAsJSON("tankConfig.json");

    
    Geometry geometry;
    geometry.Init(grid, node, tankConfig);
    
    
    
    geometry.print_geometry_points_csv("tank_geometry.csv", geometry.geom_fixed, "");
    geometry.print_geometry_points_csv("tank_geometry.csv", geometry.geom_rotating, "append");

    geometry.print_geometry_points_csv("tank_geometry.csv", geometry.geom_fixed_solid, "append");
    geometry.print_geometry_points_csv("tank_geometry.csv", geometry.geom_rotating_solid, "append");



}
