//
//  Header.h
//  TD_GeomInput_Rushton_Turbine
//
//  Created by Nile Ó Broin on 13/02/2019.
//  Copyright © 2019 Nile Ó Broin. All rights reserved.
//

#include <stdio.h>
#include <stdlib.h>

#include <vector>
#include <fstream>
#include <sstream>
#include <iostream>
#include <boost/property_tree/json_parser.hpp>


#include "Rushton_Geometry_3d.hpp"
#include "Rushton_Geometry_Config.hpp"







void inline Geometry::UpdateCoordinateFraction(tGeomShape coordinate, tNi *integerPart, tGeomShape *fractionPart)
{
    *integerPart = tNi(roundf(coordinate + 0.5f));
    *fractionPart = coordinate - (tGeomShape)(*integerPart) - 0.5f;
}



void inline Geometry::UpdatePointFractions(GeomData &point)
{
    UpdateCoordinateFraction(point.i_cart_fp, &point.i_cart, &point.i_cart_fraction);
    UpdateCoordinateFraction(point.j_cart_fp, &point.j_cart, &point.j_cart_fraction);
    UpdateCoordinateFraction(point.k_cart_fp, &point.k_cart, &point.k_cart_fraction);
}







std::vector<GeomData> Geometry::CreateTankWall(tNi lowerLimitY, tNi upperLimitY, bool get_solid = 0)
{
    tNi nCircPoints = 4 * tNi(roundf(M_PI * tankConfig.tankDiameter / (4 * tankConfig.resolution)));
    tGeomShape dTheta = 2.0f * M_PI / tGeomShape(nCircPoints);
    tGeomShape r = 0.5f * tankConfig.tankDiameter;
    
    std::vector<GeomData> result;
    for(tNi y = lowerLimitY; y <= upperLimitY; ++y)
    {
        for (tNi k = 0; k <= nCircPoints - 1; ++k)
        {
            tGeomShape theta = tGeomShape(k) * dTheta;
            if ((y & 1) == 1)
                theta += 0.5f * dTheta;
            
            
            GeomData g;
            g.resolution = tankConfig.resolution;
            g.i_cart_fp = center.x + r * cosf(theta);
            g.j_cart_fp = (tGeomShape)y + 0.5f;
            g.k_cart_fp = center.z + r * sinf(theta);
            g.is_solid = 0;
            
            //Separates the int and decimal part of float.  int is used for calculation in Forcing
            UpdatePointFractions(g);

            if (grid_ijk_on_node(g.i_cart, g.j_cart, g.k_cart, node_bounds)){

                g.i_cart = convert_i_grid_to_i_node(g.i_cart, node, node_bounds);
                g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);
                g.k_cart = convert_k_grid_to_k_node(g.k_cart, node, node_bounds);

                if (get_solid && g.is_solid) result.push_back(g);
                if (get_solid == 0 && g.is_solid == 0) result.push_back(g);


            }
            
        }
        
    }
    
    return result;
}



std::vector<GeomData> Geometry::CreateBaffles(tNi lowerLimitY, tNi upperLimitY, bool get_solid = 0)
{
    tNi nPointsBaffleThickness = tNi(roundf(tankConfig.baffles.thickness / tankConfig.resolution));
    if (nPointsBaffleThickness == 0)
        nPointsBaffleThickness = 1;
    
    tGeomShape resolutionBaffleThickness = tankConfig.baffles.thickness / tGeomShape(nPointsBaffleThickness);
    tGeomShape innerRadius = tankConfig.baffles.innerRadius;
    tGeomShape outerRadius = tankConfig.baffles.outerRadius;
    tNi nPointsR = tNi(roundf((outerRadius - innerRadius) / tankConfig.resolution));
    
    double deltaR = (outerRadius - innerRadius) / static_cast<tGeomShape>(nPointsR);

    double deltaBaffleOffset = 2.0/(double)tankConfig.baffles.numBaffles * M_PI;
    
    std::vector<GeomData> result;
    for (tNi nBaffle = 1; nBaffle <= (tNi)tankConfig.baffles.numBaffles; ++nBaffle)
    {
        for (tNi y = lowerLimitY; y <= upperLimitY; ++y)
        {
            for (tNi idxR = 0; idxR <= nPointsR; ++idxR)
            {
                tGeomShape r = innerRadius + deltaR * idxR;
                for (tNi idxTheta = 0; idxTheta <= nPointsBaffleThickness; ++idxTheta)
                {
                    tGeomShape theta = tankConfig.baffles.firstBaffleOffset +
                    deltaBaffleOffset * nBaffle +
                    (idxTheta - nPointsBaffleThickness / 2.0f) * resolutionBaffleThickness / r;
                    
                    bool isSurface = idxTheta == 0 || idxTheta == nPointsBaffleThickness ||
                    idxR == 0 || idxR == nPointsR;
                    
                    
                    GeomData g;
                    g.resolution = tankConfig.resolution;

                    g.i_cart_fp = center.x + r * cosf(theta);
                    g.j_cart_fp = (tGeomShape)y + 0.5f;
                    g.k_cart_fp = center.z + r * sinf(theta);

                    g.is_solid = isSurface ? 0 : 1;
                    
                    //Separates the int and decimal part of float.  int is used for calculation in Forcing
                    UpdatePointFractions(g);

                    
                    
                    if (grid_ijk_on_node(g.i_cart, g.j_cart, g.k_cart, node_bounds)){

                        //Fixed elements are referenced with node
                        g.i_cart = convert_i_grid_to_i_node(g.i_cart, node, node_bounds);
                        g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);
                        g.k_cart = convert_k_grid_to_k_node(g.k_cart, node, node_bounds);
                        
                        if (get_solid && g.is_solid) result.push_back(g);
                        if (get_solid == 0 && g.is_solid == 0) result.push_back(g);


                    }
                }
            }
        }
    }
    
    return result;
}





std::vector<GeomData> Geometry::CreateImpellerBlades(tStep step, tNi lowerLimitY, tNi upperLimitY, bool get_solid = 0)
{
    double innerRadius = tankConfig.impeller0.blades.innerRadius;
    double outerRadius = tankConfig.impeller0.blades.outerRadius;
    tNi discBottom = tNi(roundf(tankConfig.impeller0.disk.bottom));
    tNi discTop = tNi(roundf(tankConfig.impeller0.disk.top));
    tNi impellerBottom = tNi(roundf(tankConfig.impeller0.blades.bottom));
    tNi impellerTop = tNi(roundf(tankConfig.impeller0.blades.top));
    
    lowerLimitY = std::max(lowerLimitY, impellerTop);
    upperLimitY = std::min(upperLimitY, impellerBottom);

    tGeomShape nPointsR = tNi(roundf((outerRadius - innerRadius) / tankConfig.resolution));
    tGeomShape nPointsThickness = tNi(roundf(tankConfig.impeller0.blades.bladeThickness / tankConfig.resolution));
    if (nPointsThickness == 0)
        nPointsThickness = 1;
    
    tGeomShape resolutionBladeThickness = tankConfig.impeller0.blades.bladeThickness / tGeomShape(nPointsThickness);
    double deltaR = (outerRadius - innerRadius) / nPointsR;


    double deltaTheta = 2.0/(double)tankConfig.impeller0.numBlades * M_PI;



    tGeomShape wa;
    if (step < tankConfig.impeller_startup_steps_until_normal_speed)
        wa = 0.5f * tankConfig.impeller0.blade_tip_angular_vel_w0 * (1.0f - cosf(M_PI * (step) / ((float)tankConfig.impeller_startup_steps_until_normal_speed)));
    else
        wa = tankConfig.wa;
    
    
    
    std::vector<GeomData> result;
    for (tNi nBlade = 1; nBlade <= tankConfig.impeller0.numBlades; ++nBlade)
    {
        for (tNi y = lowerLimitY; y <= upperLimitY; ++y)
        {
            for (tNi idxR = 0; idxR <= nPointsR; ++idxR)
            {
                tGeomShape r = innerRadius  + deltaR * idxR;
                for (tNi idxThickness = 0; idxThickness <= nPointsThickness; ++idxThickness)
                {
                    tGeomShape theta = deltaTheta * nBlade +
                    tankConfig.impeller0.firstBladeOffset +
                    (idxThickness - nPointsThickness / 2.0f) * resolutionBladeThickness / r;
                    
                    bool insideDisc = (r <= tankConfig.impeller0.disk.radius) && (y >= discBottom) && (y <= discTop);
                    if(insideDisc)
                        continue;
                    
                    bool isSurface = idxThickness == 0 || idxThickness == nPointsThickness ||
                    idxR == 0 || idxR == nPointsR ||
                    y == impellerBottom || y == impellerTop;
                    
                    GeomData g;
                    g.resolution = tankConfig.resolution;
                    g.r_polar = r;
                    g.t_polar = theta;
                    g.i_cart_fp = center.x + r * cosf(theta);
                    g.j_cart_fp = (tGeomShape)y - 0.5f;
                    g.k_cart_fp = center.z + r * sinf(theta);

                    g.u_delta_fp = -wa * g.r_polar * sinf(g.t_polar);
                    g.v_delta_fp = 0.;
                    g.w_delta_fp = wa * g.r_polar * cosf(g.t_polar);

                    g.is_solid = isSurface ? 0 : 1;

                    
                    
                    //Separates the int and decimal part of float.  int is used for calculation in Forcing
                    UpdatePointFractions(g);

                    
                    
                    if (grid_j_on_node(g.j_cart, node_bounds)){
                        g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);


                        //BOTH THE SOLID AND SURFACE ELEMENTS ARE ROTATING
                        if (get_solid && g.is_solid) result.push_back(g);
                        if (get_solid == 0 && g.is_solid == 0) result.push_back(g);
                    }
                }
            }
        }
    }
    
    return result;
}




std::vector<GeomData> Geometry::CreateImpellerDisk(tNi lowerLimitY, tNi upperLimitY, bool get_solid = 0)
{
    tNi bottom = tNi(roundf(tankConfig.impeller0.disk.bottom));
    tNi top = tNi(roundf(tankConfig.impeller0.disk.top));
    tGeomShape hubRadius = tankConfig.impeller0.hub.radius;
    tGeomShape diskRadius = tankConfig.impeller0.disk.radius;

    tNi nPointsR = tNi(round((diskRadius - hubRadius) / tankConfig.resolution));
    tGeomShape deltaR = (diskRadius - hubRadius) / tGeomShape(nPointsR);

    lowerLimitY = std::max(lowerLimitY, top);
    upperLimitY = std::min(upperLimitY, bottom);

    std::vector<GeomData> result;
    for (tNi y = lowerLimitY; y <= upperLimitY; ++y)
    {
        for (tNi idxR = 1; idxR <= nPointsR; ++idxR)
        {
            tGeomShape r = hubRadius + idxR * deltaR;
            tGeomShape dTheta;
            tNi nPointsTheta = tNi(roundf(2 * M_PI * r / tankConfig.resolution));
            if(nPointsTheta == 0)
            {
                dTheta = 0;
                nPointsTheta = 1;
            }
            else
                dTheta = 2 * M_PI / nPointsTheta;

            tGeomShape theta0 = tankConfig.impeller0.firstBladeOffset;
            if ((idxR & 1) == 0)
                theta0 += 0.5f * dTheta;
            if ((y & 1) == 0)
                theta0 += 0.5f * dTheta;

            for (tNi idxTheta = 0; idxTheta <= nPointsTheta - 1; ++idxTheta)
            {
                bool isSurface = y == bottom || y == top || idxR == nPointsR;

                GeomData g;
                g.r_polar = r;
                g.t_polar = theta0 + idxTheta * dTheta;
                g.resolution = tankConfig.resolution * tankConfig.resolution;

                g.i_cart_fp = center.x + r * cos(g.t_polar);
                g.j_cart_fp = (tGeomShape)y - 0.5f;
                g.k_cart_fp = center.z + r * sin(g.t_polar);

                g.u_delta_fp = -tankConfig.wa * g.r_polar * sinf(g.t_polar);
                g.v_delta_fp = 0;
                g.w_delta_fp = tankConfig.wa * g.r_polar * cosf(g.t_polar);

                g.is_solid = isSurface ? 0 : 1;


                //Separates the int and decimal part of float.  int is used for calculation in Forcing
                UpdatePointFractions(g);




                if (get_solid && g.is_solid) {
                    if (grid_ijk_on_node(g.i_cart, g.j_cart, g.k_cart, node_bounds)){

                        //THE SHAFT SOLID ELEMENTS NEED NOT BE ROTATED
                        //The Impeller Disc Solid elements are Fixed and referenced with node
                        g.i_cart = convert_i_grid_to_i_node(g.i_cart, node, node_bounds);
                        g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);
                        g.k_cart = convert_k_grid_to_k_node(g.k_cart, node, node_bounds);

                        result.push_back(g);
                    }
                }
                if (get_solid == 0 && g.is_solid == 0) {
                    if (grid_j_on_node(g.j_cart, node_bounds)){
                        g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);
                        result.push_back(g);
                    }
                }


            }
        }
    }

    return result;
}

std::vector<GeomData> Geometry::CreateImpellerHub(tNi lowerLimitY, tNi upperLimitY, bool get_solid = 0)
{

    tNi diskBottom = tNi(roundf(tankConfig.impeller0.disk.bottom));
    tNi diskTop = tNi(roundf(tankConfig.impeller0.disk.top));



    tNi bottom = tNi(roundf(tankConfig.impeller0.hub.bottom));
    tNi top = tNi(roundf(tankConfig.impeller0.hub.top));
    tGeomShape hubRadius = tankConfig.impeller0.hub.radius;

    tNi nPointsR = tNi(roundf((hubRadius - tankConfig.shaft.radius) / tankConfig.resolution));
    tGeomShape resolutionR = (hubRadius - tankConfig.shaft.radius) / tGeomShape(nPointsR);

    lowerLimitY = std::max(lowerLimitY, top);
    upperLimitY = std::min(upperLimitY, bottom);

    std::vector<GeomData> result;
    for (tNi y = lowerLimitY; y <= upperLimitY; ++y)
    {
        bool isWithinDisk = y >= diskBottom && y <= diskTop;


        for (tNi idxR = 1; idxR <= nPointsR; ++idxR)
        {
            tGeomShape r = tankConfig.shaft.radius + idxR * resolutionR;
            tNi nPointsTheta = tNi(roundf(2 * M_PI * r / tankConfig.resolution));
            tGeomShape dTheta;
            if(nPointsTheta == 0)
            {
                dTheta = 0;
                nPointsTheta = 1;
            }
            else
                dTheta = 2 * M_PI / nPointsTheta;

            tGeomShape theta0 = tankConfig.impeller0.firstBladeOffset;
            if ((idxR & 1) == 0)
                theta0 += 0.5f * dTheta;
            if ((y & 1) == 0)
                theta0 += 0.5f * dTheta;

            for (tNi idxTheta = 0; idxTheta <= nPointsTheta - 1; ++idxTheta)
            {
                bool isSurface = (y == bottom || y == top || idxR == nPointsR) && !isWithinDisk;


                GeomData g;
                g.r_polar = r;
                g.t_polar = theta0 + idxTheta * dTheta;
                g.resolution = tankConfig.resolution * tankConfig.resolution;

                g.i_cart_fp = center.x + r * cos(g.t_polar);
                g.j_cart_fp = (tGeomShape)y - 0.5f;
                g.k_cart_fp = center.z + r * sin(g.t_polar);

                g.u_delta_fp = -tankConfig.wa * g.r_polar * sinf(g.t_polar);
                g.v_delta_fp = 0;
                g.w_delta_fp = tankConfig.wa * g.r_polar * cosf(g.t_polar);
                g.is_solid = isSurface ? 0 : 1;


                //Separates the int and decimal part of float.  int is used for calculation in Forcing
                UpdatePointFractions(g);




                if (get_solid && g.is_solid) {
                    if (grid_ijk_on_node(g.i_cart, g.j_cart, g.k_cart, node_bounds)){

                        //THE SHAFT SOLID ELEMENTS NEED NOT BE ROTATED
                        //The Impeller Disc Solid elements are Fixed and referenced with node
                        g.i_cart = convert_i_grid_to_i_node(g.i_cart, node, node_bounds);
                        g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);
                        g.k_cart = convert_k_grid_to_k_node(g.k_cart, node, node_bounds);

                        result.push_back(g);
                    }
                }
                if (get_solid == 0 && g.is_solid == 0) {
                    if (grid_j_on_node(g.j_cart, node_bounds)){
                        g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);
                        result.push_back(g);
                    }
                }



            }
        }
    }
    return result;
}


std::vector<GeomData> Geometry::CreateImpellerShaft(tNi lowerLimitY, tNi upperLimitY, bool get_solid = 0)
{
    tNi hubBottom = tNi(roundf(tankConfig.impeller0.hub.bottom));
    tNi hubTop = tNi(roundf(tankConfig.impeller0.hub.top));

    std::vector<GeomData> result;
    for (tNi y = lowerLimitY; y <= upperLimitY; ++y)
    {
        bool isWithinHub = y >= hubBottom && y <= hubTop;


        tGeomShape rEnd = tankConfig.shaft.radius; // isWithinHub ? modelConfig.hub.radius : modelConfig.shaft.radius;
        tNi nPointsR = roundf(rEnd / tankConfig.resolution);

        for(tNi idxR = 0; idxR <= nPointsR; ++idxR)
        {
            double r, dTheta;
            tNi nPointsTheta;
            if(idxR == 0)
            {
                r = 0;
                nPointsTheta = 1;
                dTheta = 0;
            }
            else
            {
                r = idxR * tankConfig.resolution;
                nPointsTheta = 4 * tNi(roundf(M_PI * 2.0f * r / (4.0f * tankConfig.resolution)));
                if(nPointsTheta == 0)
                    nPointsTheta = 1;
                dTheta = 2 * M_PI / nPointsTheta;
            }

            for (tNi idxTheta = 0; idxTheta < nPointsTheta; ++idxTheta)
            {
                tGeomShape theta = idxTheta * dTheta;
                if ((y & 1) == 0)
                    theta += 0.5f * dTheta;

                bool isSurface = idxR == nPointsR && !isWithinHub;
                GeomData g;
                g.r_polar = r;
                g.t_polar = theta;
                g.resolution = tankConfig.resolution;
                g.i_cart_fp = center.x + r * cosf(theta);
                g.j_cart_fp = (tGeomShape)y- 0.5f;
                g.k_cart_fp = center.z + r * sinf(theta);

                g.u_delta_fp = -tankConfig.wa * g.r_polar * sinf(g.t_polar);
                g.v_delta_fp = 0.0f;
                g.w_delta_fp =  tankConfig.wa * g.r_polar * cosf(g.t_polar);
                g.is_solid = isSurface ? 0 : 1;


                //Separates the int and decimal part of float.  int is used for calculation in Forcing
                UpdatePointFractions(g);

                



                if (get_solid && g.is_solid) {
                    if (grid_ijk_on_node(g.i_cart, g.j_cart, g.k_cart, node_bounds)){

                        //THE SHAFT SOLID ELEMENTS NEED NOT BE ROTATED
                        //The Impeller Disc Solid elements are Fixed and referenced with node
                        g.i_cart = convert_i_grid_to_i_node(g.i_cart, node, node_bounds);
                        g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);
                        g.k_cart = convert_k_grid_to_k_node(g.k_cart, node, node_bounds);

                        result.push_back(g);
                    }
                }
                if (get_solid == 0 && g.is_solid == 0) {
                    if (grid_j_on_node(g.j_cart, node_bounds)){
                        g.j_cart = convert_j_grid_to_j_node(g.j_cart, node, node_bounds);
                        result.push_back(g);
                    }
                }

                
                
            }
        }
    }

    return result;
}






tGeomShape Geometry::Init_at_angle(tGeomShape angle, tStep step, Grid_Dims grid, Node_Dims node, GeometryConfig tankConfig)
{

    Init(grid, node, tankConfig);

    tGeomShape this_step_impeller_increment_wa = calc_this_step_impeller_increment(step);


    #pragma omp parallel for
    for (tNi i = 0; i < geom_rotating_surface_and_internal_blades.size(); i++)
    {

        GeomData &g = geom_rotating_surface_and_internal_blades[i];

        g.t_polar += angle;



        g.i_cart_fp = center.x + g.r_polar * cosf(g.t_polar);
        g.k_cart_fp = center.z + g.r_polar * sinf(g.t_polar);

        g.u_delta_fp = -this_step_impeller_increment_wa * g.r_polar * sinf(g.t_polar);
        g.w_delta_fp =  this_step_impeller_increment_wa * g.r_polar * cosf(g.t_polar);

        UpdateCoordinateFraction(g.i_cart_fp, &g.i_cart, &g.i_cart_fraction);
        UpdateCoordinateFraction(g.k_cart_fp, &g.k_cart, &g.k_cart_fraction);


    }
    return angle;

}




void Geometry::Init(Grid_Dims _grid, Node_Dims _node, GeometryConfig _tankConfig)
{
    geom_fixed_surface.clear();
    geom_rotating_surface_and_internal_blades.clear();
    
    geom_fixed_internal.clear();
//    geom_rotating_static_internal.clear();


    grid = _grid;
    node = _node;
    tankConfig = _tankConfig;

    node_bounds = get_node_bounds(node, grid);

    tNi lowerLimitY = node_bounds.j0;
    tNi upperLimitY = node_bounds.j1;

    if (node.idj == 0) lowerLimitY = 1;
    if (node.idj == grid.ngy - 1) upperLimitY -= 1;


    center.x = tGeomShape(grid.x - MDIAM_BORDER) / 2.0f; //center x direction
    center.y = tankConfig.impeller0.impeller_position; //position of impeller, from the top
    center.z = tGeomShape(grid.z - MDIAM_BORDER) / 2.0f; //center z direction




    //Solid are the internal points, while above is only the surface rotating
    bool get_solid = 1;



    
    // Tank wall
    std::vector<GeomData> wallGeometry = CreateTankWall(lowerLimitY, upperLimitY);
    geom_fixed_surface.insert(geom_fixed_surface.end(), wallGeometry.begin(), wallGeometry.end());




    // baffles
    std::vector<GeomData> bafflesGeometry = CreateBaffles(lowerLimitY, upperLimitY);
    geom_fixed_surface.insert(geom_fixed_surface.end(), bafflesGeometry.begin(), bafflesGeometry.end());

    std::vector<GeomData> bafflesGeometry_solid = CreateBaffles(lowerLimitY, upperLimitY, get_solid);
    geom_fixed_internal.insert(geom_fixed_internal.end(), bafflesGeometry_solid.begin(), bafflesGeometry_solid.end());








    // impeller blades, both surface and internal elements are rotated
    std::vector<GeomData> impellerBladesGeometry = CreateImpellerBlades(tankConfig.starting_step, lowerLimitY, upperLimitY);
    geom_rotating_surface_and_internal_blades.insert(geom_rotating_surface_and_internal_blades.end(), impellerBladesGeometry.begin(), impellerBladesGeometry.end());


    std::vector<GeomData> impellerBladesGeometry_solid = CreateImpellerBlades(tankConfig.starting_step, lowerLimitY, upperLimitY, get_solid);
    geom_rotating_surface_and_internal_blades.insert(geom_rotating_surface_and_internal_blades.end(), impellerBladesGeometry_solid.begin(), impellerBladesGeometry_solid.end());






    //impeller disk
    std::vector<GeomData> impellerDiskGeometry = CreateImpellerDisk(lowerLimitY, upperLimitY);
    geom_rotating_surface_and_internal_blades.insert(geom_rotating_surface_and_internal_blades.end(), impellerDiskGeometry.begin(), impellerDiskGeometry.end());

    std::vector<GeomData> impellerDiskGeometry_solid = CreateImpellerDisk(lowerLimitY, upperLimitY, get_solid);
    geom_fixed_internal.insert(geom_fixed_internal.end(), impellerDiskGeometry_solid.begin(), impellerDiskGeometry_solid.end());



    //hub
    std::vector<GeomData> hubGeometry = CreateImpellerHub(lowerLimitY, upperLimitY);
    geom_rotating_surface_and_internal_blades.insert(geom_rotating_surface_and_internal_blades.end(), hubGeometry.begin(), hubGeometry.end());


    std::vector<GeomData> hubGeometry_solid = CreateImpellerHub(lowerLimitY, upperLimitY, get_solid);
    geom_fixed_internal.insert(geom_fixed_internal.end(), hubGeometry_solid.begin(), hubGeometry_solid.end());



    
    //impeller shaft
    std::vector<GeomData> impellerShaftGeometry = CreateImpellerShaft(lowerLimitY, upperLimitY);
    geom_rotating_surface_and_internal_blades.insert(geom_rotating_surface_and_internal_blades.end(), impellerShaftGeometry.begin(), impellerShaftGeometry.end());


    std::vector<GeomData> impellerShaftGeometry_solid = CreateImpellerShaft(lowerLimitY, upperLimitY, get_solid);
    geom_fixed_internal.insert(geom_fixed_internal.end(), impellerShaftGeometry_solid.begin(), impellerShaftGeometry_solid.end());


}






tGeomShape Geometry::calc_this_step_impeller_increment(tStep step)
{

    tGeomShape this_step_impeller_increment_wa = tankConfig.impeller0.blade_tip_angular_vel_w0;


    //slowly start the impeller
    if (step < tankConfig.impeller_startup_steps_until_normal_speed) {

        this_step_impeller_increment_wa = 0.5 * tankConfig.impeller0.blade_tip_angular_vel_w0 * (1.0 - cosf(M_PI * (tGeomShape)step / ((tGeomShape)tankConfig.impeller_startup_steps_until_normal_speed)));

    }
    return this_step_impeller_increment_wa;
}




tGeomShape Geometry::Update(Multi_Timer &timer, tStep step, tGeomShape impellerTheta)
{

#ifdef TIMER
    double start1 = timer.time_now();
#endif



    tGeomShape this_step_impeller_increment_wa = calc_this_step_impeller_increment(step);

    impellerTheta += this_step_impeller_increment_wa;





    //Only updates the rotating elements

    #pragma omp parallel for
    for (int i = 0; i < geom_rotating_surface_and_internal_blades.size(); i++)
    {

        GeomData &g = geom_rotating_surface_and_internal_blades[i];

        g.t_polar += this_step_impeller_increment_wa;



        g.i_cart_fp = center.x + g.r_polar * cosf(g.t_polar);
        g.k_cart_fp = center.z + g.r_polar * sinf(g.t_polar);

        g.u_delta_fp = -this_step_impeller_increment_wa * g.r_polar * sinf(g.t_polar);
        g.w_delta_fp =  this_step_impeller_increment_wa * g.r_polar * cosf(g.t_polar);

        UpdateCoordinateFraction(g.i_cart_fp, &g.i_cart, &g.i_cart_fraction);
        UpdateCoordinateFraction(g.k_cart_fp, &g.k_cart, &g.k_cart_fraction);


    }


#ifdef TIMER
    start1 = timer.check(0, 0, start1, "Geometry Update");
#endif

    return impellerTheta;
}








Geom_Dims Geometry::get_geom_dims(){

    Geom_Dims gdata;
    gdata.xc = center.x;
    gdata.yc = center.y;
    gdata.zc = center.z;


    gdata.mdiam = tankConfig.tankDiameter;

    gdata.impeller_increment = tankConfig.impeller0.blade_tip_angular_vel_w0;

    return gdata;
}






void Geometry::print_geometry_points_csv(const std::string &filename, const std::vector<GeomData> &geom, const std::string append)
{

    std::ofstream csvFile(filename, append=="append" ? std::ofstream::app : std::ofstream::out);

    csvFile.precision(std::numeric_limits<float>::max_digits10);



    for(auto &g: geom)
    {
        csvFile <<

        g.i_cart << " " <<
        g.j_cart << " " <<
        g.k_cart << " " <<

        g.is_solid << " " <<
        std::endl;
    }
    csvFile.close();
}





void Geometry::print_geometry_csv(const std::string &filename, const std::vector<GeomData> &geom, const std::string append)
{

    std::ofstream csvFile(filename, append=="append" ? std::ofstream::app : std::ofstream::out);

    csvFile.precision(std::numeric_limits<float>::max_digits10);



    for(auto &g: geom)
    {
        csvFile <<
        g.resolution << " " <<

        g.r_polar << " " <<
        g.t_polar << " " <<

        g.i_cart_fp << " " <<
        g.j_cart_fp << " " <<
        g.k_cart_fp << " " <<

        g.u_delta_fp << " " <<
        g.v_delta_fp << " " <<
        g.w_delta_fp << " " <<

        g.i_cart << " " <<
        g.i_cart_fraction << " " <<
        g.j_cart << " " <<
        g.j_cart_fraction << " " <<
        g.k_cart << " " <<
        g.k_cart_fraction << " " <<

        g.is_solid << " " <<
        std::endl;
    }
    csvFile.close();
}



//    Warning: Makes un-checked assumptions on dimensions of the
//    data. Do not use for other than particular job.
std::vector<GeomData> Geometry::load_geom_data_from_csv(const std::string &srcFile)
{
    std::ifstream csvFile(srcFile);
    if(!csvFile.is_open())
        throw std::string("Could not open source csv file.");

    std::vector<GeomData> result;
    for(std::string line; std::getline(csvFile, line); )
    {
        std::stringstream lineStream(line);
        GeomData entry;

        lineStream
        >> entry.resolution

        >> entry.r_polar
        >> entry.t_polar

        >> entry.i_cart_fp
        >> entry.j_cart_fp
        >> entry.k_cart_fp

        >> entry.u_delta_fp
        >> entry.v_delta_fp
        >> entry.w_delta_fp

        >> entry.i_cart
        >> entry.i_cart_fraction
        >> entry.j_cart
        >> entry.j_cart_fraction
        >> entry.k_cart
        >> entry.k_cart_fraction

        >> entry.is_solid;

        result.push_back(entry);
    }
    return result;
}



