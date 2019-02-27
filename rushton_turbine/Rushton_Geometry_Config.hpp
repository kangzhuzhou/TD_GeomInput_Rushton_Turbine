//
//  Header.h
//  TD_GeomInput_Rushton_Turbine
//
//  Created by Nile Ó Broin on 13/02/2019.
//  Copyright © 2019 Nile Ó Broin. All rights reserved.
//

#ifndef Rushton_Geometry_Config_hpp
#define Rushton_Geometry_Config_hpp

#include <string>

#include "define_typealias.h"





struct Baffles
{
    int numBaffles = 0;

    tGeomShape firstBaffleOffset = 0.0;

    tGeomShape innerRadius = 0.0f;
    tGeomShape outerRadius = 0.0f;
    tGeomShape thickness = 0.0f; // Half thickness a.k.a. symmetric thickness
};




struct Blades
{


    tGeomShape innerRadius = 0.0;
    tGeomShape outerRadius = 0.0;
    tGeomShape bottom = 0.0;
    tGeomShape top = 0.0;
    tGeomShape bladeThickness = 0.0;

};

struct Disk
{
    tGeomShape radius = 0.0;
    tGeomShape bottom = 0.0;
    tGeomShape top = 0.0;
};


struct Impeller
{

    int numBlades = 0;

    // first blade starting angle impeller
    tGeomShape firstBladeOffset = 0.0;

    //Normal velocity at impeller tip
    tGeomShape uav = 0.0;

    // max speed
    tGeomShape blade_tip_angular_vel_w0 = 0.0;

    //impeller height
    tGeomShape impeller_position = 0.0;


    Blades blades;
    Disk disk;
    Disk hub;
};


struct Shaft
{
    tGeomShape radius = 0.0;
    tGeomShape bottom = 0.0;
    tGeomShape top = 0.0;
};





class GeometryConfig
{
public:
    void setGeometryStartup(tStep starting_step, tGeomShape impeller_start_angle, tStep impeller_startup_steps_until_normal_speed);

    void setGeometryConfig(tNi gridx, tGeomShape uav);



    int saveGeometryConfigAsJSON(std::string filepath);
    void loadGeometryConfigAsJSON(std::string filepath);


    // Instantaneous angular velocity impeller
    tGeomShape wa = 0.0;




    tStep starting_step = 0;
    tGeomShape impeller_start_angle = 0.0;
    tStep impeller_startup_steps_until_normal_speed = 0;


    // Model resolution
    tGeomShape resolution = 0.0;
    tGeomShape tankDiameter = 0.0;

    Baffles baffles;

    int numImpellers;
    Impeller impeller0;

    Shaft shaft;

};








#endif
