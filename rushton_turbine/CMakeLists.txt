cmake_minimum_required(VERSION 3.12.3)
project (rushton_turbine)


cmake_host_system_information(RESULT host_name QUERY HOSTNAME)
if (${host_name} MATCHES "login*")
    message("Building on Cluster detected")
    set(CLUSTER True)
else()
    message("Assuming NOT building on Cluster")
endif()

find_package(Git 1.6.5 REQUIRED)


#set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ".")


include(CheckCXXCompilerFlag)
CHECK_CXX_COMPILER_FLAG("-std=c++14" COMPILER_SUPPORTS_CXX14)
set(CMAKE_CXX_STANDARD 14)

set(CMAKE_NO_SYSTEM_FROM_IMPORTED OFF)

find_package(MPI)
include_directories(SYSTEM ${MPI_INCLUDE_PATH})

#Must follow MPI...
find_package(OpenMP)
if (OPENMP_FOUND AND APPLE)
    message("OpenMP found but supressing on Apple Device")
elseif(OPENMP_FOUND)
    message("Building with OpenMP")
    set (CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${OpenMP_C_FLAGS}")
    set (CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${OpenMP_CXX_FLAGS}")
    set (CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} ${OpenMP_EXE_LINKER_FLAGS}")
endif()


find_package(Boost 1.68 COMPONENTS program_options REQUIRED)
if(Boost_FOUND)
    include_directories(${Boost_INCLUDE_DIRS}) 
endif()





include_directories("${CMAKE_SOURCE_DIR}")
include_directories("../local_include")
#include_directories("../../include")


add_executable(td_rushton_test create_rushton_point_cloud.cpp Rushton_Geometry_3d.cpp Rushton_Geometry_Config.cpp)

target_link_libraries(td_rushton_test ${MPI_LIBRARIES} ${Boost_LIBRARIES})

target_compile_definitions(td_rushton_test PRIVATE -DWITH_MPI=0)


add_library(LIB_RUSHTON STATIC Rushton_Geometry_3d.cpp Rushton_Geometry_Config.cpp)



#----------------------------------
# TESTS
#----------------------------------

option(ENABLE_TESTS "Build and install tests (default OFF)" OFF)

#if(ENABLE_TESTS)
#    enable_testing()
#    add_subdirectory("${CMAKE_SOURCE_DIR}/tests")
#endif()
