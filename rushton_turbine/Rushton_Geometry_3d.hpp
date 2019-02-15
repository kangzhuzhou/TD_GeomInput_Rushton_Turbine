//
//  Header.h
//  TD_GeomInput_Rushton_Turbine
//
//  Created by Nile Ó Broin on 13/02/2019.
//  Copyright © 2019 Nile Ó Broin. All rights reserved.
//

#ifndef Rushton_Geometry_3d_hpp
#define Rushton_Geometry_3d_hpp

#include <string>
#include <cstring>
#include <vector>


#include "define_algo.h"
#include "define_typealias.h"
#include "define_datastructures.hpp"
#include "Inline.hpp"
#include "timer.hpp"


#define MDIAM_BORDER 2




struct GeometryStartup
{

    tGeomShape impeller_start_angle = 0.0;
    tStep step = 0;
    tStep impeller_slow_step_limit = 0;

};


struct Baffles
{
    int num_baffles = 0;

    tGeomShape firstBaffleOffset = 0.0;

    tGeomShape innerRadius = 0.0f;
    tGeomShape outerRadius = 0.0f;
    tGeomShape thickness = 0.0f; // Half thickness a.k.a. symmetric thickness
};

struct Impellers
{
    int num_impellers = 0;

    tGeomShape theta = 0.0; // starting angle impeller

    tGeomShape innerRadius = 0.0;
    tGeomShape outerRadius = 0.0;
    tGeomShape bottom = 0.0;
    tGeomShape top = 0.0;
    tGeomShape bladeThickness = 0.0;
    tGeomShape w0 = 0.0; // max speed

};

struct Disk
{
    tGeomShape radius = 0.0;
    tGeomShape bottom = 0.0;
    tGeomShape top = 0.0;
};




class GeometryConfig
{
public:
    void setGeometryConfig(tNi snx, tGeomShape uav);

    void saveGeometryConfigAsJSON(std::string filepath);
    void loadGeometryConfigAsJSON(std::string filepath);

    // instantaneous angular velocity impeller
    tGeomShape wa = 0.0;


    tGeomShape uav = 0.0;

    // Model resolution
    tGeomShape resolution = 0.0;
    tGeomShape tankDiameter = 0.0;

    Baffles baffles;
    Impellers impellers;
    Disk disk;
    Disk hub;
    

    tGeomShape shaftRadius = 0.0f;

};






struct GeomData
{
    tGeomShape resolution = 0.0f;
    tGeomShape r_polar = 0.0f;
    tGeomShape t_polar = 0.0f;
    
    tGeomShape i_cart_fp = 0.0f;
    tGeomShape j_cart_fp = 0.0f;
    tGeomShape k_cart_fp = 0.0f;

    //Used in forcing
    tGeomShape u_delta_fp = 0.0f;
    tGeomShape v_delta_fp = 0.0f;
    tGeomShape w_delta_fp = 0.0f;

    
    tGeomShape i_cart_fraction = 0.0f;
    tGeomShape j_cart_fraction = 0.0f;
    tGeomShape k_cart_fraction = 0.0f;

    
    tNi i_cart = 0;
    tNi j_cart = 0;
    tNi k_cart = 0;  //cell point

    
    bool is_solid = 0; //Either 0 surface, or 1 solid (the cells between the surface)


    // Remember constructor for data types that does not get fully initialised each time they are used.
    // When the system hands out new memory to a program, the memory is cleared (zeroed), but when a
    // program frees some memory and then ask for new (later) it can get the same memory back but
    // without it being zeroed out.
    GeomData()
    {
        memset(this, 0, sizeof(GeomData));
    }


};






class Geometry {


private:
    GeometryStartup geomStartup;
    GeometryConfig tankConfig;

    Grid_Dims grid;
    Node_Dims node;
    Node_Bounds node_bounds;

    tGeomShape calc_this_step_impeller_increment(tStep step);


    void inline UpdateCoordinateFraction(tGeomShape coordinate, tNi *integerPart, tGeomShape *fractionPart);
    void inline UpdatePointFractions(GeomData &point);
    std::vector<GeomData> CreateTankWall(tNi lowerLimitX, tNi upperLimitX, bool get_solid);
    std::vector<GeomData> CreateBaffles(tNi lowerLimitX, tNi upperLimitX, bool get_solid);


    std::vector<GeomData> CreateImpellerBlades(tStep step, tNi lowerLimitX, tNi upperLimitX, bool get_solid);
    std::vector<GeomData> CreateImpellerDisk(tNi lowerLimitX, tNi upperLimitX, bool get_solid);
    std::vector<GeomData> CreateHub(tNi lowerLimitX, tNi upperLimitX, bool get_solid);
    std::vector<GeomData> CreateImpellerShaft(tNi lowerLimitX, tNi upperLimitX, bool get_solid);

    void print_val(const std::vector<GeomData> &geom);

public:
    std::vector<GeomData> geom_fixed;
    std::vector<GeomData> geom_fixed_solid;

    std::vector<GeomData> geom_rotating;
    std::vector<GeomData> geom_rotating_solid;


    void Init(GeometryStartup, Grid_Dims, Node_Dims, GeometryConfig);


    tGeomShape Update(Multi_Timer &timer, tStep step, tGeomShape impellerTheta);
    void setRotatingSolid(Multi_Timer &timer, tStep step, tGeomShape set_impellerTheta);



    void print_geometry_csv(const std::string &filename, const std::vector<GeomData> &geom, const std::string append);

    void print_geometry_points_csv(const std::string &filename, const std::vector<GeomData> &geom, const std::string append = "");
    
    std::vector<GeomData> load_geom_data_from_csv(const std::string &srcFile);



    Geom_Dims get_geom_dims();

    void clear_vectors();




};




#endif
