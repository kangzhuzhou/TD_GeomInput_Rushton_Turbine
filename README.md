# Turbulent Dynamics Geometry Input Rushton Turbine
Application is part of a larger work to calculate a point cloud for a Rushton Turbine in an multi-node fluid dynamics code.  

[Graphical Frontend Available Here.](https://turbulentdynamics.github.io/TD_GeomInput_Rushton_Turbine/WebGL/build/)


## Install
```bash
cd rushton_turbine
cmake .
make
./td_rushton_test

octave display_rushton_geometry.m 
```

## Rushton produced from code
![Rushton Point Cloud](Rushton_Points.png)

## Rushton Turbine Image
![Rushton Turbine](Turbine.png)



# Graphical User Input

### Install nodejs and npm.  [See spack installation](https://github.com/TurbulentDynamics/TD_env_setup_dev_info/blob/master/env_setup/install_1_with_spack.md)
```
spack install node-js npm
```

### Install app dependencies and build
```
npm install
npm run-scripts build
```

### Runs the app in the development mode.
`npm start`
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

