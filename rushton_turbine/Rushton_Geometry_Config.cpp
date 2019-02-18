//
//  Header.h
//  TD_GeomInput_Rushton_Turbine
//
//  Created by Nile Ó Broin on 13/02/2019.
//  Copyright © 2019 Nile Ó Broin. All rights reserved.
//

#include <iostream>
#include <boost/property_tree/json_parser.hpp>


#include "Rushton_Geometry_Config.hpp"


#define MDIAM_BORDER 2




void GeometryConfig::setGeometryConfig(tNi snx, tGeomShape _uav)
{
    resolution = 0.7f;

    uav = _uav;


    //diameter tube / cylinder
    tankDiameter = tGeomShape(snx - MDIAM_BORDER);


    baffles.num_baffles = 4;

    //First baffle is offset by 1/8 of revolution, or 1/2 of the delta between baffles.
    baffles.firstBaffleOffset = (tGeomShape)(((2.0 * M_PI) / (double)baffles.num_baffles) * 0.5);


    baffles.innerRadius = 0.3830f * tankDiameter;
    baffles.outerRadius = 0.4830f * tankDiameter;
    baffles.thickness = tankDiameter / 75.0f;


    impellers.num_impellers = 6;

    impellers.theta = 0.0f;
    impellers.innerRadius = tankDiameter / 12.0f;
    impellers.outerRadius = tankDiameter / 6.0f;

    // bottom height impeller blade
    impellers.bottom = tankDiameter * 9.0f / 30.f;
    impellers.top = tankDiameter * 11.0f / 30.f;

    // top height impeller blade
    impellers.bladeThickness = tankDiameter / 75.0f;

    // Eventual angular velocity impeller
    impellers.w0 = uav / impellers.outerRadius;



    disk.radius = tankDiameter / 8.0f;
    disk.bottom = tankDiameter * 49.0f / 150.0f;
    disk.top = tankDiameter * 51.0f / 150.0f;

    hub.radius = tankDiameter * 4.0f / 75.0f;
    hub.bottom = tankDiameter * 9.0f / 30.0f;
    hub.top = tankDiameter * 11.f / 30.0f;

    shaftRadius = tankDiameter * 2.0f / 75.0f;


};



void GeometryConfig::setGeometryStartup(tStep starting_step, tGeomShape impeller_start_angle,
                                        tStep impeller_startup_steps_until_normal_speed){

    starting_step = starting_step;
    impeller_start_angle = impeller_start_angle;
    impeller_startup_steps_until_normal_speed = impeller_startup_steps_until_normal_speed;

}





int GeometryConfig::saveGeometryConfigAsJSON(std::string filepath){

    try
    {
        boost::property_tree::ptree jsontree;
        jsontree.put<std::string>("name", "GeometryConfig");

        jsontree.put<tGeomShape>("wa", wa);
        jsontree.put<tGeomShape>("uav", uav);
        jsontree.put<tGeomShape>("resolution", resolution);
        jsontree.put<tGeomShape>("tankDiameter", tankDiameter);
        jsontree.put<tGeomShape>("shaftRadius", shaftRadius);

        
        jsontree.put<tStep>("starting_step", starting_step);
        jsontree.put<tGeomShape>("impeller_start_angle", impeller_start_angle);
        jsontree.put<tStep>("impeller_startup_steps_until_normal_speed", impeller_startup_steps_until_normal_speed);



        boost::property_tree::ptree baffles_json;
        baffles_json.put<int>("num_baffles", baffles.num_baffles);
        baffles_json.put<tGeomShape>("firstBaffleOffset", baffles.firstBaffleOffset);
        baffles_json.put<tGeomShape>("innerRadius", baffles.innerRadius);
        baffles_json.put<tGeomShape>("outerRadius", baffles.outerRadius);
        baffles_json.put<tGeomShape>("thickness", baffles.thickness);
        jsontree.put_child("baffles", baffles_json);


        boost::property_tree::ptree impellers_json;
        impellers_json.put<int>("num_impellers", impellers.num_impellers);
        impellers_json.put<tGeomShape>("theta", impellers.theta);
        impellers_json.put<tGeomShape>("innerRadius", impellers.innerRadius);
        impellers_json.put<tGeomShape>("outerRadius", impellers.outerRadius);
        impellers_json.put<tGeomShape>("bottom", impellers.bottom);
        impellers_json.put<tGeomShape>("top", impellers.top);
        impellers_json.put<tGeomShape>("bladeThickness", impellers.bladeThickness);
        impellers_json.put<tGeomShape>("w0", impellers.w0);
        jsontree.put_child("impellers", impellers_json);



        boost::property_tree::ptree disk_json;
        disk_json.put<tGeomShape>("radius", disk.radius);
        disk_json.put<tGeomShape>("bottom", disk.bottom);
        disk_json.put<tGeomShape>("top", disk.top);
        jsontree.put_child("disk", disk_json);


        boost::property_tree::write_json(filepath.c_str(), jsontree);
        return 0;
    }
    catch(std::exception& e)
    {
        std::cerr << "Unhandled Exception reached parsing arguments: "
        << e.what() << ", application will now exit" << std::endl;
        return 1;
    }

    return 0;
}






void GeometryConfig::loadGeometryConfigAsJSON(std::string filepath){


    try
    {
        boost::property_tree::ptree jsontree;
        boost::property_tree::read_json(filepath.c_str(), jsontree);


        wa = jsontree.get<tGeomShape>("wa", 0);
        uav = jsontree.get<tGeomShape>("uav", 0);
        resolution = jsontree.get<tGeomShape>("resolution", 0);
        tankDiameter = jsontree.get<tGeomShape>("tankDiameter", 0);
        shaftRadius = jsontree.get<tGeomShape>("shaftRadius", 0);

        starting_step = jsontree.get<tStep>("starting_step", 0);
        impeller_start_angle = jsontree.get<tGeomShape>("impeller_start_angle", 0);
        impeller_startup_steps_until_normal_speed = jsontree.get<tStep>("impeller_startup_steps_until_normal_speed", 0);




        boost::property_tree::ptree baffles_json = jsontree.get_child("baffles");

        baffles.num_baffles = baffles_json.get<int>("num_baffles", 0);
        baffles.firstBaffleOffset = baffles_json.get<tGeomShape>("firstBaffleOffset", 0);
        baffles.innerRadius = baffles_json.get<tGeomShape>("innerRadius", 0);
        baffles.outerRadius = baffles_json.get<tGeomShape>("outerRadius", 0);
        baffles.thickness = baffles_json.get<tGeomShape>("thickness", 0);


        boost::property_tree::ptree impellers_json = jsontree.get_child("impellers");

        impellers.num_impellers = impellers_json.get<int>("num_impellers", 0);
        impellers.theta = impellers_json.get<tGeomShape>("theta", 0);
        impellers.innerRadius = impellers_json.get<tGeomShape>("innerRadius", 0);
        impellers.outerRadius = impellers_json.get<tGeomShape>("outerRadius", 0);
        impellers.bottom = impellers_json.get<tGeomShape>("bottom", 0);
        impellers.top = impellers_json.get<tGeomShape>("top", 0);
        impellers.bladeThickness = impellers_json.get<tGeomShape>("bladeThickness", 0);
        impellers.w0 = impellers_json.get<tGeomShape>("w0", 0);



        boost::property_tree::ptree disk_json = jsontree.get_child("disk");

        disk.radius = disk_json.get<tGeomShape>("radius", 0);
        disk.bottom = disk_json.get<tGeomShape>("bottom", 0);
        disk.top = disk_json.get<tGeomShape>("top", 0);



    }
    catch(std::exception& e)
    {
        std::cerr << "Unhandled Exception reached parsing arguments: "
        << e.what() << ", application will now exit" << std::endl;
    }


}




