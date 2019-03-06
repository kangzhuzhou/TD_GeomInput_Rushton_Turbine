//
//  Header.h
//  TD_GeomInput_Rushton_Turbine
//
//  Created by Nile Ó Broin on 13/02/2019.
//  Copyright © 2019 Nile Ó Broin. All rights reserved.
//

#ifndef Inline_hpp
#define Inline_hpp

#include "math.h"
#include "stdlib.h"

#include "define_typealias.h"
#include "define_datastructures.hpp"






inline bool grid_ijk_on_node(tNi gi, tNi gj, tNi gk, Node_Bounds f){

    if (gi >= f.i0 && gi <= f.i1 && gj >= f.j0 && gj <= f.j1 && gk >= f.k0 && gk <= f.k1) return 1;

    return 0;

}




inline Node_Bounds get_node_bounds(const Node_Dims node, const Grid_Dims grid){

    Node_Bounds ret;

    ret.i0 = (node.x * (tNi)node.idi);
    if (node.idi>0) ret.i0 += 1;

    ret.i1 = (node.x * (tNi)node.idi + node.x);
    if (node.idi == grid.ngx-1) ret.i1 += 1;


    ret.j0 = (node.y * (tNi)node.idj);
    if (node.idj>0) ret.j0 += 1;

    ret.j1 = (node.y * (tNi)node.idj + node.y);
    if (node.idj == grid.ngy-1) ret.j1 += 1;


    ret.k0 = (node.z * (tNi)node.idk);
    if (node.idk > 0) ret.k0 += 1;

    ret.k1 = (node.z * (tNi)node.idk + node.z);
    if (node.idk == grid.ngz - 1) ret.k1 += 1;

    return ret;
}


inline tNi convert_i_grid_to_i_node(tNi ig, const Node_Dims node, Node_Bounds f){
    if (node.idi == 0) return ig;
    else return ig - f.i0 + 1;
}
inline tNi convert_j_grid_to_j_node(tNi jg, const Node_Dims node, Node_Bounds f){
    if (node.idj == 0) return jg;
    else return jg - f.j0 + 1;
}
inline tNi convert_k_grid_to_k_node(tNi kg, const Node_Dims node, Node_Bounds f){
    if (node.idk == 0) return kg;
    else return kg - f.k0 + 1;
}


inline bool grid_i_on_node(tNi gi, Node_Bounds f){
    if (gi >= f.i0 && gi <= f.i1) return 1;
    return 0;
}

inline bool grid_j_on_node(tNi gj, Node_Bounds f){
    if (gj >= f.j0 && gj <= f.j1) return 1;
    return 0;
}


inline bool grid_k_on_node(tNi gk, Node_Bounds f){
    if (gk >= f.k0 && gk <= f.k1) return 1;
    return 0;
}


#endif /* Header_h */
