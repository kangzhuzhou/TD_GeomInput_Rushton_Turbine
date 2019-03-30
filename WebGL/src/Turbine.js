import React, { Component } from 'react';
import PropTypes from 'prop-types';
import jQuery from 'jquery';

const THREE = require('three');
// var TrackballControls = require('three-trackballcontrols');
var OrbitControls = require("three-orbit-controls")(THREE);
var _ = require('lodash');
var metalColor = 0xFFFFFF;
var greyColor = 0xEEEEEE;

class Turbine extends Component {
  colors = {
    normal: {
      tank: greyColor,
      shaft: metalColor,
      disk: metalColor,
      hub: metalColor,
      blade: metalColor,
      baffle: metalColor
    },
    hover: {
      tank: 0x0000ff,
      shaft: 0x00ff00,
      disk: 0x00ff00,
      hub: 0x00ff00,
      blade: 0x00ff00,
      baffle: 0x00ff00
    }
  }

  componentDidUpdate(props) {
    switch (props.setting) {
      case "reset":
        this.resetViewer();
        break;
      case "save":
        this.saveJson();
        break;
      default:
        break;
    };
    if (props.transPanXY !== this.props.transPanXY)
      this.changeTransPan("XY", props.transPanXY);
    if (props.transPanYZ !== this.props.transPanYZ)
      this.changeTransPan("YZ", props.transPanYZ);
    if (props.transPanXZ !== this.props.transPanXZ)
      this.changeTransPan("XZ", props.transPanXZ);
  }

  componentDidMount() {
    this.glRenderer = new THREE.WebGLRenderer({
      canvas: this.refs.painter,
      alpha: true,
      antialias: true
    });
    this.glRenderer.animate(() => this.onAnimate());

    this.hoverArr = [ "disk", "hub", "shaft", "blade", "baffle"];//"tank",

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    this.camera.position.set(this.props.tankDiameter /2, this.props.tankHeight, this.props.tankDiameter * 3);
    this.scene.add(this.camera);

    this.light = new THREE.PointLight(0xffffff, 0.3);
    this.light.position.set(0, 0, this.props.tankDiameter * 3);
    this.scene.add(this.light);

    // this.controls = new TrackballControls(this.camera, this.refs.painter);
    this.controls = new OrbitControls(this.camera);

    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;

    this.controls.noZoom = false;
    this.controls.noPan = false;

    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;

    this.controls.keys = [ 65, 83, 68 ];

    this.controls.addEventListener('change', () => {
      this.light.position.copy(this.camera.position);
    });
    this.startAutoRotation();

    this.offsetX = this.refs.painter.offsetLeft;
    this.offsetY = this.refs.painter.offsetTop;

    this.raycaster = new THREE.Raycaster();
    this.normalVector = new THREE.Vector2();
    window.addEventListener('mousemove', event => {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      this.normalVector.x = ((event.clientX - this.offsetX) / this.props.width) * 2 - 1;
      this.normalVector.y = -((event.clientY - this.offsetY) / this.props.height) * 2 + 1;
  
      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.normalVector, this.camera);

      // calculate objects intersecting the picking ray
      var intersects = this.raycaster.intersectObjects(this.scene.children, true);
      this.colorFormat();
      if (intersects && intersects.length) {
        intersects.forEach(item => {
          if (this.hoverArr.indexOf(item.object.name) != -1) {
            item.object.material.color.setHex(0x00FF00);
            this.props.onHoverObject(item.object.name);
          }
        });
      }
    });

    this.createAxis(this.props.tankDiameter, this.props.tankHeight);
    this.createPlane();

    this.createTank();
    this.createShaft();
    this.createDisk();
    this.createHub();
    this.createTranslucent(this.props.tankDiameter, this.props.tankHeight);

    this.blades = [];
    this.changeBladeCount(this.props.bladeCount, 0);
    this.baffles = [];
    this.changeBaffleCount(this.props.baffleCount, 0);

    this.kernelAngle = 0;
  }

  componentWillUnmount() {
    this.stopAutoRotation();
    this.controls.dispose();
    delete this.controls;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      this.glRenderer.setSize(nextProps.width, nextProps.height);
      this.camera.aspect = nextProps.width / nextProps.height;
      this.camera.updateProjectionMatrix();
    }

    if (nextProps.tankDiameter !== this.props.tankDiameter || nextProps.tankHeight !== this.props.tankHeight) {
      this.scene.remove(this.axisGroup);
      this.createAxis(nextProps.tankDiameter, nextProps.tankHeight);
    }

    if (nextProps.kernelAutoRotation && !this.props.kernelAutoRotation) {
      this.startAutoRotation();
    } else if (!nextProps.kernelAutoRotation && this.props.kernelAutoRotation) {
      this.stopAutoRotation();
    }

    if (nextProps.bladeCount !== this.props.bladeCount) {
      this.changeBladeCount(nextProps.bladeCount, this.props.bladeCount);
    }
    if (nextProps.bladeInnerRadius !== this.props.bladeInnerRadius ||
        nextProps.bladeOuterRadius !== this.props.bladeOuterRadius ||
        nextProps.bladeWidth !== this.props.bladeWidth ||
        nextProps.bladeHeight !== this.props.bladeHeight) {
      this.changeBladeGeometry(nextProps.bladeInnerRadius, nextProps.bladeOuterRadius, nextProps.bladeWidth, nextProps.bladeHeight);
    }
    if (nextProps.baffleCount !== this.props.baffleCount) {
      this.changeBaffleCount(nextProps.baffleCount, this.props.baffleCount);
    }

    if (!_.isEqual(nextProps, this.props)) {
      this.updatePlane(nextProps);
      this.updateTank(nextProps);
      this.updateShaft(nextProps);
      this.updateDisk(nextProps);
      this.updateHub(nextProps);
      this.updateBlades(nextProps);
      this.updateBaffles(nextProps);
    }
  }

  colorFormat() {
    this.scene.children.forEach(mesh => {
      if (mesh && mesh.material && mesh.originalColor) {
        mesh.material.color.setHex(mesh.originalColor);
      }
    });
  }

  startAutoRotation() {
    this.timerId = window.setInterval(() => {
      switch (this.props.kernelRotationDir) {
        case 'clockwise':
          this.kernelAngle = (this.kernelAngle + 4) % 360;
          this.updateBlades(this.props);
          break;
        case 'counter-clockwise':
          this.kernelAngle = (this.kernelAngle - 4) % 360;
          this.updateBlades(this.props);
          break;
        default:
          break;
      }
    }, 60);
  }

  stopAutoRotation() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
  }

  onAnimate() {
    // we will get this callback every frame

    // pretend cubeRotation is immutable.
    // this helps with updates and pure rendering.
    // React will be sure that the rotation has now updated.
    // this.setState({
    //   cubeRotation: new THREE.Euler(
    //     this.props.cubeRotation.x + 0.1,
    //     this.props.cubeRotation.y + 0.1,
    //     0
    //   )
    // });
    this.controls.update();

    this.glRenderer.render(this.scene, this.camera);
  }

  createAxisLine(str, dir, color, font, self) {
    var dir3D = new THREE.Vector3(dir[0], dir[1], dir[2]);
    var originalPos = new THREE.Vector3(0, 0, 0);
    var arrow = new THREE.ArrowHelper(dir3D, originalPos, self.axisSize, color, 20, 10);
    arrow.name = str;
    self.axisGroup.add(arrow);

    var geoOption = {
      font: font,
      size: 15,
      height: 2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 5
    };
    var labelGeo = new THREE.TextGeometry(str, geoOption);
    var labelMat = new THREE.MeshStandardMaterial({color:color});
    var labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(dir[0] * (self.axisSize + 10),
                           dir[1] * (self.axisSize + 10),
                           dir[2] * (self.axisSize + 10) );
    self.axisGroup.add(labelMesh);
  }

  createAxis(tankDiameter, tankHeight) {
    this.axisGroup = new THREE.Group();
    this.scene.add(this.axisGroup);

    this.axisSize = Math.max(tankDiameter, tankHeight);
    this.axisGroup.add(this.axis);

    var self = this;
    var fontLoader = new THREE.FontLoader();
    fontLoader.load('fonts/helvetiker_regular.typeface.json', font => {
      self.createAxisLine("X", [1, 0, 0], 0xFF0000, font, self);
      self.createAxisLine("Y", [0, 1, 0], 0x00FF00, font, self);
      self.createAxisLine("Z", [0, 0, 1], 0x0000FF, font, self);
    });

    this.axisGroup.position.set(tankDiameter/-2, tankHeight/-2, tankDiameter/-2);

  }

  createPlane() {
    this.grid = new THREE.GridHelper(1000, 50);
    this.grid.position.y = -(this.props.tankHeight / 2);
    this.scene.add(this.grid);
  }

  updatePlane(props) {
    this.grid.position.y = -(props.tankHeight / 2);
  }

  createTankGeometry({ tankDiameter, tankHeight }) {
    return new THREE.CylinderGeometry(tankDiameter / 2, tankDiameter / 2, tankHeight, 30);
  }

  createTank() {
    var geometry = this.createTankGeometry(this.props);
    var material = new THREE.MeshLambertMaterial({
      color: greyColor,
      opacity: 0.2,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.tank = new THREE.Mesh(geometry, material);
    this.tank.name = "tank";
    this.tank.originalColor = greyColor;
    this.scene.add(this.tank);
  }

  updateTank(props) {
    delete this.tank.geometry;
    this.tank.geometry = this.createTankGeometry(props);
  }

  createShaftGeometry({ shaftRadius, tankHeight }) {
    return new THREE.CylinderGeometry(shaftRadius, shaftRadius, tankHeight, 30);
  }

  createShaft() {
    var geometry = this.createShaftGeometry(this.props);
    var material = new THREE.MeshPhongMaterial({
      color: metalColor
    });
    this.shaft = new THREE.Mesh(geometry, material);
    this.shaft.name = "shaft";
    this.shaft.originalColor = metalColor;
    this.scene.add(this.shaft);
  }

  updateShaft(props) {
    delete this.shaft.geometry;
    this.shaft.geometry = this.createShaftGeometry(props);
  }

  createDiskGeometry({ diskRadius, diskHeight }) {
    return new THREE.CylinderGeometry(diskRadius, diskRadius, diskHeight, 30);
  }

  createDisk() {
    var geometry = this.createDiskGeometry(this.props);
    var material = new THREE.MeshPhongMaterial({
      color: metalColor
    });
    this.disk = new THREE.Mesh(geometry, material);
    this.disk.position.set(0, -(this.props.tankHeight / 6), 0);
    this.disk.name = "disk";
    this.disk.originalColor = metalColor;
    this.scene.add(this.disk);
  }

  updateDisk(props) {
    delete this.disk.geometry;
    this.disk.geometry = this.createDiskGeometry(props);
    this.disk.position.set(0, -(props.tankHeight / 6), 0);
  }

  createHubGeometry({ hubRadius, hubHeight }) {
    return new THREE.CylinderGeometry(hubRadius, hubRadius, hubHeight, 30);
  }

  createHub() {
    var geometry = this.createHubGeometry(this.props);
    var material = new THREE.MeshPhongMaterial({
      color: metalColor
    });
    this.hub = new THREE.Mesh(geometry, material);
    this.hub.position.set(0, -(this.props.tankHeight / 6), 0);
    this.hub.name = "hub";
    this.hub.originalColor = metalColor;
    this.scene.add(this.hub);
  }

  createTranslucent(d, h) {
    var thickness = 20;
    this.transPanXY = this.createTranslucentPan([d * 1.1, h * 1.1, thickness]);
    this.transPanYZ = this.createTranslucentPan([thickness, h * 1.1, d * 1.1]);
    this.transPanXZ = this.createTranslucentPan([d * 1.1, thickness, d * 1.1]);
    this.scene.add(this.transPanXY);
    this.scene.add(this.transPanYZ);
    this.scene.add(this.transPanXZ);
  }

  createTranslucentPan(sizeArr) {
    var panGeo = new THREE.BoxGeometry(sizeArr[0], sizeArr[1], sizeArr[2]);
    var panMat = new THREE.MeshPhongMaterial({
          color : 0x0000FF,
          transparent : true,
          opacity : 0.8
        });
    return new THREE.Mesh(panGeo, panMat);
  }

  updateHub(props) {
    delete this.hub.geometry;
    this.hub.geometry = this.createHubGeometry(props);
    this.hub.position.set(0, -(props.tankHeight / 6), 0);
  }

  changeBladeCount(newValue, oldValue) {
    var i;
    if (newValue < oldValue) {
      for (i = oldValue - 1; i >= newValue; i--) {
        this.scene.remove(this.blades[i]);
        this.blades.pop();
        delete this.blades[i];
      }
    } else if (newValue > oldValue) {
      for (i = oldValue; i < newValue; i++) {
        var blade = new THREE.BoxGeometry(this.props.bladeWidth, this.props.bladeHeight, this.props.bladeOuterRadius - this.props.bladeInnerRadius);
        var material = new THREE.MeshPhongMaterial({ color: greyColor });
        var mesh = new THREE.Mesh(blade, material);
        this.blades.push(mesh);
        mesh.name = "blade";
        mesh.originalColor = greyColor;
        this.scene.add(mesh);
      }
    }
  }

  changeBladeGeometry(innerRadius, outerRadius, width, height) {
    for (var i = 0; i < this.blades.length; i++) {
      delete this.blades[i].geometry;
      this.blades[i].geometry = new THREE.BoxGeometry(width, height, outerRadius - innerRadius);
    }
  }

  updateBlades({ bladeInnerRadius, bladeOuterRadius, tankHeight }) {
    var distance = (bladeInnerRadius + bladeOuterRadius) / 2;
    var yAxis = new THREE.Vector3(0, 1, 0);
    var offset = new THREE.Vector3(0, -(tankHeight / 6), 0);
    for (var i = 0; i < this.blades.length; i++) {
      var angle = (360 * i / this.blades.length + this.kernelAngle) % 360;
      angle = 2 * Math.PI * angle / 360;
      this.blades[i].position.set(0, 0, distance);
      this.blades[i].position.applyAxisAngle(yAxis, angle);
      this.blades[i].position.add(offset);
      this.blades[i].rotation.set(0, angle, 0);
    }
  }

  createBaffleGeometry({ baffleInnerRadius, baffleOuterRadius, baffleWidth, tankHeight }) {
    return new THREE.BoxGeometry(baffleWidth, tankHeight, baffleOuterRadius - baffleInnerRadius);
  }

  changeBaffleCount(newValue, oldValue) {
    var i;
    if (newValue < oldValue) {
      for (i = oldValue - 1; i >= newValue; i--) {
        this.scene.remove(this.baffles[i]);
        this.baffles.pop();
        delete this.baffles[i];
      }
    } else if (newValue > oldValue) {
      for (i = oldValue; i < newValue; i++) {
        var baffle = this.createBaffleGeometry(this.props);
        var material = new THREE.MeshPhongMaterial({ color: greyColor });
        var mesh = new THREE.Mesh(baffle, material);
        this.baffles.push(mesh);
        mesh.name = "baffle";
        mesh.originalColor = greyColor;
        this.scene.add(mesh);
      }
    }
  }

  changeTransPan(type, value) {
    if (type == "XY") this.transPanXY.position.z = value;
    if (type == "YZ") this.transPanYZ.position.x = value;
    if (type == "XZ") this.transPanXZ.position.y = value;
  }

  updateBaffles(props) {
    const { baffleInnerRadius, baffleOuterRadius } = props;
    var distance = (baffleInnerRadius + baffleOuterRadius) / 2;
    var yAxis = new THREE.Vector3(0, 1, 0);
    for (var i = 0; i < this.baffles.length; i++) {
      delete this.baffles[i].geometry;
      this.baffles[i].geometry = this.createBaffleGeometry(props);
      var angle = 2 * Math.PI * i / this.baffles.length;
      this.baffles[i].position.set(0, 0, distance);
      this.baffles[i].position.applyAxisAngle(yAxis, angle);
      this.baffles[i].rotation.set(0, angle, 0);
    }
  }

  checkFirstObject(needle, haystack) {
    if (haystack.length > 0) {
      return needle.uuid === haystack[0].object.uuid;
    } else {
      return false;
    }
  }

  resetViewer() {
    this.camera.position.set(this.props.tankDiameter /2, this.props.tankHeight, this.props.tankDiameter * 3);
    this.controls.target.set(0, 0, 0);
  }

  saveJson() {
    console.log("saveJson");
  }

  render() {
    return (
      <canvas ref="painter" width={this.props.width} height={this.props.height}></canvas>
    );
  }
}

Turbine.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  tankDiameter: PropTypes.number.isRequired,
  tankHeight: PropTypes.number.isRequired,
  shaftRadius: PropTypes.number.isRequired,
  kernelAutoRotation: PropTypes.bool,
  kernelRotationDir: PropTypes.string,
  diskRadius: PropTypes.number.isRequired,
  diskHeight: PropTypes.number.isRequired,
  hubRadius: PropTypes.number.isRequired,
  hubHeight: PropTypes.number.isRequired,
  bladeCount: PropTypes.number.isRequired,
  bladeInnerRadius: PropTypes.number.isRequired,
  bladeOuterRadius: PropTypes.number.isRequired,
  bladeWidth: PropTypes.number.isRequired,
  bladeHeight: PropTypes.number.isRequired,
  baffleCount: PropTypes.number.isRequired,
  baffleInnerRadius: PropTypes.number.isRequired,
  baffleOuterRadius: PropTypes.number.isRequired,
  translucentXY: PropTypes.number.isRequired,
  translucentYZ: PropTypes.number.isRequired,
  translucentXZ: PropTypes.number.isRequired,
  baffleWidth: PropTypes.number.isRequired,
  onHoverObject: PropTypes.func
};

export default Turbine;
