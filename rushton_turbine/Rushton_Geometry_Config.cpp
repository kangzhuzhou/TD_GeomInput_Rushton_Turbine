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

    shaft.radius = tankDiameter * 2.0f / 75.0f;



    baffles.num_baffles = 4;

    //First baffle is offset by 1/8 of revolution, or 1/2 of the delta between baffles.
    baffles.firstBaffleOffset = (tGeomShape)(((2.0 * M_PI) / (double)baffles.num_baffles) * 0.5);

    baffles.innerRadius = 0.3830f * tankDiameter;
    baffles.outerRadius = 0.4830f * tankDiameter;
    baffles.thickness = tankDiameter / 75.0f;


    num_impellers = 1;


    impeller.blades.num_blades = 4;

    impeller.blades.theta = 0.0f;
    impeller.blades.innerRadius = tankDiameter / 12.0f;
    impeller.blades.outerRadius = tankDiameter / 6.0f;

    // bottom height impeller blade
    impeller.blades.bottom = tankDiameter * 9.0f / 30.f;
    impeller.blades.top = tankDiameter * 11.0f / 30.f;

    // top height impeller blade
    impeller.blades.bladeThickness = tankDiameter / 75.0f;

    // Eventual angular velocity impeller
    impeller.blades.w0 = uav / impeller.blades.outerRadius;



    impeller.disk.radius = tankDiameter / 8.0f;
    impeller.disk.bottom = tankDiameter * 49.0f / 150.0f;
    impeller.disk.top = tankDiameter * 51.0f / 150.0f;

    impeller.hub.radius = tankDiameter * 4.0f / 75.0f;
    impeller.hub.bottom = tankDiameter * 9.0f / 30.0f;
    impeller.hub.top = tankDiameter * 11.f / 30.0f;



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

        jsontree.put<tGeomShape>("snx", tankDiameter + MDIAM_BORDER);
        jsontree.put<tGeomShape>("uav", uav);

        jsontree.put<tGeomShape>("resolution", resolution);
        jsontree.put<tGeomShape>("tankDiameter", tankDiameter);

        
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






        boost::property_tree::ptree blades_json;
        blades_json.put<int>("num_blades", impeller.blades.num_blades);
        blades_json.put<tGeomShape>("theta", impeller.blades.theta);
        blades_json.put<tGeomShape>("innerRadius", impeller.blades.innerRadius);
        blades_json.put<tGeomShape>("outerRadius", impeller.blades.outerRadius);
        blades_json.put<tGeomShape>("bottom", impeller.blades.bottom);
        blades_json.put<tGeomShape>("top", impeller.blades.top);
        blades_json.put<tGeomShape>("bladeThickness", impeller.blades.bladeThickness);
        blades_json.put<tGeomShape>("w0", impeller.blades.w0);


        boost::property_tree::ptree disk_json;
        disk_json.put<tGeomShape>("radius", impeller.disk.radius);
        disk_json.put<tGeomShape>("bottom", impeller.disk.bottom);
        disk_json.put<tGeomShape>("top", impeller.disk.top);


        boost::property_tree::ptree hub_json;
        hub_json.put<tGeomShape>("radius", impeller.hub.radius);
        hub_json.put<tGeomShape>("bottom", impeller.hub.bottom);
        hub_json.put<tGeomShape>("top", impeller.hub.top);


        jsontree.put<int>("num_impellers", num_impellers);
        boost::property_tree::ptree impellers_json;
        impellers_json.put_child("blades", blades_json);
        impellers_json.put_child("disk", disk_json);
        impellers_json.put_child("hub", hub_json);


        jsontree.put_child("impeller_1", impellers_json);



        boost::property_tree::ptree shaft_json;
        shaft_json.put<tGeomShape>("radius", shaft.radius);
        jsontree.put_child("shaft", shaft_json);




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


        starting_step = jsontree.get<tStep>("starting_step", 0);
        impeller_start_angle = jsontree.get<tGeomShape>("impeller_start_angle", 0);
        impeller_startup_steps_until_normal_speed = jsontree.get<tStep>("impeller_startup_steps_until_normal_speed", 0);




        boost::property_tree::ptree baffles_json = jsontree.get_child("baffles");

        baffles.num_baffles = baffles_json.get<int>("num_baffles", 0);
        baffles.firstBaffleOffset = baffles_json.get<tGeomShape>("firstBaffleOffset", 0);
        baffles.innerRadius = baffles_json.get<tGeomShape>("innerRadius", 0);
        baffles.outerRadius = baffles_json.get<tGeomShape>("outerRadius", 0);
        baffles.thickness = baffles_json.get<tGeomShape>("thickness", 0);


        boost::property_tree::ptree impellers_json = jsontree.get_child("impeller_1");

        impeller.blades.num_blades = impellers_json.get<int>("num_blades", 0);
        impeller.blades.theta = impellers_json.get<tGeomShape>("theta", 0);
        impeller.blades.innerRadius = impellers_json.get<tGeomShape>("innerRadius", 0);
        impeller.blades.outerRadius = impellers_json.get<tGeomShape>("outerRadius", 0);
        impeller.blades.bottom = impellers_json.get<tGeomShape>("bottom", 0);
        impeller.blades.top = impellers_json.get<tGeomShape>("top", 0);
        impeller.blades.bladeThickness = impellers_json.get<tGeomShape>("bladeThickness", 0);
        impeller.blades.w0 = impellers_json.get<tGeomShape>("w0", 0);



        boost::property_tree::ptree disk_json = impellers_json.get_child("disk");
        impeller.disk.radius = disk_json.get<tGeomShape>("radius", 0);
        impeller.disk.bottom = disk_json.get<tGeomShape>("bottom", 0);
        impeller.disk.top = disk_json.get<tGeomShape>("top", 0);

        boost::property_tree::ptree hub_json = impellers_json.get_child("hub");
        impeller.hub.radius = hub_json.get<tGeomShape>("radius", 0);
        impeller.hub.bottom = hub_json.get<tGeomShape>("bottom", 0);
        impeller.hub.top = hub_json.get<tGeomShape>("top", 0);




        boost::property_tree::ptree shaft_json = jsontree.get_child("shaft");
        shaft.radius = shaft_json.get<tGeomShape>("radius", 0);



    }
    catch(std::exception& e)
    {
        std::cerr << "Unhandled Exception reached parsing arguments: "
        << e.what() << ", application will now exit" << std::endl;
    }


}




