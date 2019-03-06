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







void GeometryConfig::setGeometryConfig(tNi gridx, tGeomShape uav)
{
    resolution = 0.7f;


    //diameter tube / cylinder
    tankDiameter = tGeomShape(gridx - MDIAM_BORDER);

    shaft.radius = tankDiameter * 2.0f / 75.0f;



    baffles.numBaffles = 4;

    //First baffle is offset by 1/8 of revolution, or 1/2 of the delta between baffles.
    baffles.firstBaffleOffset = (tGeomShape)(((2.0 * M_PI) / (tGeomShape)baffles.numBaffles) * 0.5);

    baffles.innerRadius = 0.3830f * tankDiameter;
    baffles.outerRadius = 0.4830f * tankDiameter;
    baffles.thickness = tankDiameter / 75.0f;


    numImpellers = 1;


    impeller0.impeller_position = tGeomShape(gridx) * (2.0f / 3.0f); //center x direction

    impeller0.numBlades = 6;

    impeller0.firstBladeOffset = 0.0f;


    impeller0.blades.innerRadius = tankDiameter / 12.0f;
    impeller0.blades.outerRadius = tankDiameter / 6.0f;

    // bottom height impeller blade
    impeller0.blades.top = tankDiameter * 19.0f / 30.f;
    impeller0.blades.bottom = tankDiameter * 21.0f / 30.f;


    // top height impeller blade
    impeller0.blades.bladeThickness = tankDiameter / 75.0f;


    impeller0.uav = uav;

    // Eventual angular velocity impeller
    impeller0.blade_tip_angular_vel_w0 = impeller0.uav / impeller0.blades.outerRadius;



    impeller0.disk.radius = tankDiameter / 8.0f;
    impeller0.disk.top = tankDiameter * 99.0f / 150.0f;
    impeller0.disk.bottom = tankDiameter * 101.0f / 150.0f;

    impeller0.hub.radius = tankDiameter * 4.0f / 75.0f;
    impeller0.hub.top = tankDiameter * 19.f / 30.0f;
    impeller0.hub.bottom = tankDiameter * 21.0f / 30.0f;



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

        jsontree.put<tGeomShape>("gridx", tankDiameter + MDIAM_BORDER);

        jsontree.put<tGeomShape>("resolution", resolution);
        jsontree.put<tGeomShape>("tankDiameter", tankDiameter);

        
        jsontree.put<tStep>("starting_step", starting_step);
        jsontree.put<tGeomShape>("impeller_start_angle", impeller_start_angle);
        jsontree.put<tStep>("impeller_startup_steps_until_normal_speed", impeller_startup_steps_until_normal_speed);



        boost::property_tree::ptree baffles_json;
        baffles_json.put<int>("numBaffles", baffles.numBaffles);
        baffles_json.put<tGeomShape>("firstBaffleOffset", baffles.firstBaffleOffset);
        baffles_json.put<tGeomShape>("innerRadius", baffles.innerRadius);
        baffles_json.put<tGeomShape>("outerRadius", baffles.outerRadius);
        baffles_json.put<tGeomShape>("thickness", baffles.thickness);
        jsontree.put_child("baffles", baffles_json);






        boost::property_tree::ptree blades_json;
        blades_json.put<tGeomShape>("innerRadius", impeller0.blades.innerRadius);
        blades_json.put<tGeomShape>("outerRadius", impeller0.blades.outerRadius);
        blades_json.put<tGeomShape>("bottom", impeller0.blades.bottom);
        blades_json.put<tGeomShape>("top", impeller0.blades.top);
        blades_json.put<tGeomShape>("bladeThickness", impeller0.blades.bladeThickness);


        boost::property_tree::ptree disk_json;
        disk_json.put<tGeomShape>("radius", impeller0.disk.radius);
        disk_json.put<tGeomShape>("bottom", impeller0.disk.bottom);
        disk_json.put<tGeomShape>("top", impeller0.disk.top);


        boost::property_tree::ptree hub_json;
        hub_json.put<tGeomShape>("radius", impeller0.hub.radius);
        hub_json.put<tGeomShape>("bottom", impeller0.hub.bottom);
        hub_json.put<tGeomShape>("top", impeller0.hub.top);


        jsontree.put<int>("numImpellers", numImpellers);
        boost::property_tree::ptree impeller0_json;

        impeller0_json.put<int>("numBlades", impeller0.numBlades);
        impeller0_json.put<tGeomShape>("firstBladeOffset", impeller0.firstBladeOffset);
        impeller0_json.put<tGeomShape>("uav", impeller0.uav);
        impeller0_json.put<tGeomShape>("blade_tip_angular_vel_w0", impeller0.blade_tip_angular_vel_w0);
        impeller0_json.put<tGeomShape>("impeller_position", impeller0.impeller_position);

        impeller0_json.put_child("blades", blades_json);
        impeller0_json.put_child("disk", disk_json);
        impeller0_json.put_child("hub", hub_json);





        jsontree.put_child("impeller0", impeller0_json);



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
        resolution = jsontree.get<tGeomShape>("resolution", 0);
        tankDiameter = jsontree.get<tGeomShape>("tankDiameter", 0);


        starting_step = jsontree.get<tStep>("starting_step", 0);
        impeller_start_angle = jsontree.get<tGeomShape>("impeller_start_angle", 0);
        impeller_startup_steps_until_normal_speed = jsontree.get<tStep>("impeller_startup_steps_until_normal_speed", 0);




        boost::property_tree::ptree baffles_json = jsontree.get_child("baffles");

        baffles.numBaffles = baffles_json.get<int>("numBaffles", 0);
        baffles.firstBaffleOffset = baffles_json.get<tGeomShape>("firstBaffleOffset", 0);
        baffles.innerRadius = baffles_json.get<tGeomShape>("innerRadius", 0);
        baffles.outerRadius = baffles_json.get<tGeomShape>("outerRadius", 0);
        baffles.thickness = baffles_json.get<tGeomShape>("thickness", 0);


        numImpellers = jsontree.get<int>("numImpellers", 0);
        boost::property_tree::ptree impeller0_json = jsontree.get_child("impeller0");

        impeller0.numBlades = impeller0_json.get<int>("numBlades", 0);
        impeller0.firstBladeOffset = impeller0_json.get<tGeomShape>("firstBladeOffset", 0);
        impeller0.uav = impeller0_json.get<tGeomShape>("uav", 0);
        impeller0.blade_tip_angular_vel_w0 = impeller0_json.get<tGeomShape>("blade_tip_angular_vel_w0", 0);
        impeller0.impeller_position = impeller0_json.get<tGeomShape>("impeller_position", 0);



        boost::property_tree::ptree blades_json = impeller0_json.get_child("blades");
        impeller0.blades.innerRadius = blades_json.get<tGeomShape>("innerRadius", 0);
        impeller0.blades.outerRadius = blades_json.get<tGeomShape>("outerRadius", 0);
        impeller0.blades.bottom = blades_json.get<tGeomShape>("bottom", 0);
        impeller0.blades.top = blades_json.get<tGeomShape>("top", 0);
        impeller0.blades.bladeThickness = blades_json.get<tGeomShape>("bladeThickness", 0);



        boost::property_tree::ptree disk_json = impeller0_json.get_child("disk");
        impeller0.disk.radius = disk_json.get<tGeomShape>("radius", 0);
        impeller0.disk.bottom = disk_json.get<tGeomShape>("bottom", 0);
        impeller0.disk.top = disk_json.get<tGeomShape>("top", 0);

        boost::property_tree::ptree hub_json = impeller0_json.get_child("hub");
        impeller0.hub.radius = hub_json.get<tGeomShape>("radius", 0);
        impeller0.hub.bottom = hub_json.get<tGeomShape>("bottom", 0);
        impeller0.hub.top = hub_json.get<tGeomShape>("top", 0);




        boost::property_tree::ptree shaft_json = jsontree.get_child("shaft");
        shaft.radius = shaft_json.get<tGeomShape>("radius", 0);



    }
    catch(std::exception& e)
    {
        std::cerr << "Unhandled Exception reached parsing arguments: "
        << e.what() << ", application will now exit" << std::endl;
    }


}




