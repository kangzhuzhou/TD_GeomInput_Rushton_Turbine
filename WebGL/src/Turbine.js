import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
      default:
        break;
    };
  }

  componentDidMount() {
    this.glRenderer = new THREE.WebGLRenderer({
      canvas: this.refs.painter,
      alpha: true,
      antialias: true
    });
    this.glRenderer.shadowMap.enabled = true;

    this.glRenderer.clippingPlanes = Object.freeze( [] ); // GUI sets it to globalPlanes
    this.glRenderer.localClippingEnabled = true;
    this.glRenderer.animate(() => this.onAnimate());

    this.hoverArr = [ "disk", "hub", "shaft", "blade", "baffle"];//"tank",

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    this.camera.position.set(this.props.tankDiameter /2,
                            this.props.tankHeight,
                            this.props.tankDiameter * 3);
    this.scene.add(this.camera);

    this.light = new THREE.PointLight(0xffffff, 0.3);
    this.light.position.set(0, 0, this.props.tankDiameter * 3);
    this.scene.add(this.light);

    this.createShadowLight([0, 0, 1]);
    this.createShadowLight([0, 1, 0]);
    this.createShadowLight([1, 0, 0]);

    // this.controls = new TrackballControls(this.camera, this.refs.painter);
    this.controls = new OrbitControls(this.camera);

    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;

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
          if (this.hoverArr.indexOf(item.object.name) !== -1) {
            item.object.material.color.setHex(0x00FF00);
            this.props.onHoverObject(item.object.name);
          }
        });
      }
    });

    this.transEnableXY = false;
    this.transEnableYZ = false;
    this.transEnableXZ = false;

    this.createAxis(this.props.tankDiameter, this.props.tankHeight);

    this.createTank();
    this.createShaft();

    this.blades = [];
    this.hubs = [];
    this.disks = [];
    var impellerCount = this.props.impellerCount;
    for (let i = 0; i < impellerCount; i++) {
      this.blades[i] = [];
      this.createHub(i, impellerCount);
      this.createDisk(i, impellerCount);
      this.changeBladeCount(this.props.bladeCount, 0, i);
    }

    this.baffles = [];
    this.changeBaffleCount(this.props.baffleCount, 0);

    this.createPlane();
    this.createTransPan(this.props.tankDiameter, this.props.tankHeight);

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
      for (let i = 0; i < this.props.impellerCount; i++) {
        this.changeBladeCount(nextProps.bladeCount, this.props.bladeCount, i);
      }
    }

    if (nextProps.bladeInnerRadius !== this.props.bladeInnerRadius ||
        nextProps.bladeOuterRadius !== this.props.bladeOuterRadius ||
        nextProps.bladeWidth !== this.props.bladeWidth ||
        nextProps.bladeHeight !== this.props.bladeHeight) {
      this.changeBladeGeometry(nextProps.bladeInnerRadius, nextProps.bladeOuterRadius, nextProps.bladeWidth, nextProps.bladeHeight);
    }

    if (nextProps.impellerCount !== this.props.impellerCount) {
      this.changeImpellerCount(nextProps.impellerCount, this.props.impellerCount);
    }

    if (nextProps.baffleCount !== this.props.baffleCount) {
      this.changeBaffleCount(nextProps.baffleCount, this.props.baffleCount);
    }

    if (nextProps.transPanXY !== this.props.transPanXY)
      this.changeTransPan("XY", nextProps.transPanXY);
    else if (nextProps.transPanYZ !== this.props.transPanYZ)
      this.changeTransPan("YZ", nextProps.transPanYZ);
    else if (nextProps.transPanXZ !== this.props.transPanXZ)
      this.changeTransPan("XZ", nextProps.transPanXZ);

    if (nextProps.transEnableXY !== this.props.transEnableXY)
      this.changeTransEnable("XY", nextProps.transEnableXY);
    else if (nextProps.transEnableYZ !== this.props.transEnableYZ)
      this.changeTransEnable("YZ", nextProps.transEnableYZ);
    else if (nextProps.transEnableXZ !== this.props.transEnableXZ)
      this.changeTransEnable("XZ", nextProps.transEnableXZ);

    if (!_.isEqual(nextProps, this.props)) {
      this.updatePlane(nextProps);
      this.updateTank(nextProps);
      this.updateShaft(nextProps);

      // this.updateDisk(nextProps.diskRadius, nextProps.diskHeight);
      // this.updateHub(nextProps.hubRadius, nextProps.hubHeight);
      // this.updateBlades(this.props.bladeInnerRadius, this.props.bladeOuterRadius);

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
    var iR, oR, tankHeight = this.props.tankHeight;
    this.timerId = window.setInterval(() => {
      switch (this.props.kernelRotationDir) {
        case 'clockwise':
          this.kernelAngle = (this.kernelAngle + 4) % 360;
          this.updateBlades(this.props.bladeInnerRadius, this.props.bladeOuterRadius);
          break;
        case 'counter-clockwise':
          this.kernelAngle = (this.kernelAngle - 4) % 360;
          this.updateBlades(this.props.bladeInnerRadius, this.props.bladeOuterRadius);
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

  createShadowLight(dirArr) {
    var dis = 3000;
    var dirLight = new THREE.DirectionalLight( 0x55505a, 1 );
    dirLight.position.set( dis* dirArr[0], dis* dirArr[1], dis* dirArr[2] );
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 9000;

    dirLight.shadow.camera.right = 1;
    dirLight.shadow.camera.left = - 1;
    dirLight.shadow.camera.top	= 1;
    dirLight.shadow.camera.bottom = - 1;

    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add( dirLight );
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

    var self = this;
    var fontLoader = new THREE.FontLoader();
    fontLoader.load('fonts/helvetiker_regular.typeface.json', font => {
      self.createAxisLine("X", [1, 0, 0], 0xFF0000, font, self);
      self.createAxisLine("Y", [0, -1, 0], 0x00FF00, font, self);
      self.createAxisLine("Z", [0, 0, -1], 0x0000FF, font, self);
    });

    this.axisGroup.position.set(tankDiameter/-2, tankHeight/2, tankDiameter/2);

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
      side: THREE.DoubleSide,
      clippingPlanes: [],
      clipShadows: true
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
      color: metalColor,
      side: THREE.DoubleSide,
      clippingPlanes: [],
      clipShadows: true
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

  createDiskGeometry(diskRadius, diskHeight ) {
    return new THREE.CylinderGeometry(diskRadius, diskRadius, diskHeight, 30);
  }

  createDisk(num, count) {
    var radius = this.props.diskRadius, height = this.props.diskHeight;
    var geometry = this.createDiskGeometry(radius, height);
    var material = new THREE.MeshPhongMaterial({
      color: metalColor,
      side: THREE.DoubleSide,
      // clippingPlanes: [],
      // clipShadows: true
    });
    var diskMesh = new THREE.Mesh(geometry, material);
    diskMesh.position.y = this.setImpellerPositionY(num, count);
    diskMesh.name = "disk" + num;
    diskMesh.originalColor = metalColor;
    this.disks.push(diskMesh);
    this.scene.add(diskMesh);
  }

  updateDisk(radius, height) {
    var diskGeo = this.createDiskGeometry(radius, height);
    for (let i = 0; i < this.props.impellerCount; i++) {
      delete this.disks[i].geometry;
      this.disks[i].geometry = diskGeo;
    }
  }

  createHubGeometry(hubRadius, hubHeight) {
    return new THREE.CylinderGeometry(hubRadius, hubRadius, hubHeight, 30);
  }

  createHub(num, count) {
    var radius = this.props.hubRadius, height = this.props.hubHeight;
    var geometry = this.createHubGeometry(radius, height);
    var material = new THREE.MeshPhongMaterial({
      color: metalColor,
      side: THREE.DoubleSide,
      // clippingPlanes: [],
      // clipShadows: true
    });
    var hubMesh = new THREE.Mesh(geometry, material);
    hubMesh.position.y = this.setImpellerPositionY(num, count);
    hubMesh.name = "hub" + num;
    hubMesh.originalColor = metalColor;
    this.hubs.push(hubMesh);
    this.scene.add(hubMesh);
  }

  updateHub(radius, height) {
    var hubGeo = this.createHubGeometry(radius, height);
    for (let i = 0; i < this.props.impellerCount; i++) {
      delete this.hubs[i].geometry;
      this.hubs[i].geometry = hubGeo;
    }
  }

  setImpellerPositionY(num, count) {
    var tankHeight = this.props.tankHeight;
    return tankHeight/-2 + tankHeight/(count + 1) * (num + 1);
  }

  createTransPan(d, h) {
    var thickness = 2;
    this.transPanMeshXY = this.createTranslucentPan([d * 1.1, h * 1.1, thickness]);
    this.transPanMeshYZ = this.createTranslucentPan([thickness, h * 1.1, d * 1.1]);
    this.transPanMeshXZ = this.createTranslucentPan([d * 1.1, thickness, d * 1.1]);
    this.scene.add(this.transPanMeshXY);
    this.scene.add(this.transPanMeshYZ);
    this.scene.add(this.transPanMeshXZ);
  }

  createTranslucentPan(sizeArr) {
    var panGeo = new THREE.BoxGeometry(sizeArr[0], sizeArr[1], sizeArr[2]);
    var panMat = new THREE.MeshPhongMaterial({
          color : 0x0000FF,
          side: THREE.DoubleSide,
          transparent : true,
          opacity : 0.8
        });
    var panMesh = new THREE.Mesh(panGeo, panMat);
    panMesh.name = "transPan";
    panMesh.visible = false;
    return panMesh;
  }

  changeBladeCount(newValue, oldValue, num) {
    var i;
    if (newValue < oldValue) {
      for (i = oldValue - 1; i >= newValue; i--) {
        this.scene.remove(this.blades[num][i]);
        this.blades[num].pop();
        delete this.blades[num][i];
      }
    } else if (newValue > oldValue) {
      for (i = oldValue; i < newValue; i++) {
        var blade = new THREE.BoxGeometry(this.props.bladeWidth,
                                          this.props.bladeHeight,
                                          this.props.bladeOuterRadius - this.props.bladeInnerRadius);
        var material = new THREE.MeshPhongMaterial({
                color: greyColor,
                side: THREE.DoubleSide,
                // clippingPlanes: [],
                // clipShadows: true
              });
        var mesh = new THREE.Mesh(blade, material);
        this.blades[num].push(mesh);
        mesh.name = "blade"+num;
        mesh.originalColor = greyColor;
        this.scene.add(mesh);
      }
    }
  }

  changeBladeGeometry(innerRadius, outerRadius, width, height) {
    for (let i = 0; i < this.props.impellerCount; i++) {
      for (var j = 0; j < this.blades[i].length; j++) {
        delete this.blades[i][j].geometry;
        this.blades[i][j].geometry = new THREE.BoxGeometry(width, height, outerRadius - innerRadius);
      }
    }
  }

  updateBlades(innerRadius, outerRadius) {
    var distance = (innerRadius + outerRadius) / 2;
    var yAxis = new THREE.Vector3(0, 1, 0);
    var offset, count = this.props.impellerCount;
    for (let i = 0; i < this.props.impellerCount; i++) {
      offset = new THREE.Vector3(0, this.setImpellerPositionY(i, count), 0);
      for (var j = 0; j < this.blades[i].length; j++) {
        var angle = (360 * j / this.blades[i].length + this.kernelAngle) % 360;
        angle = 2 * Math.PI * angle / 360;
        this.blades[i][j].position.set(0, 0, distance);
        this.blades[i][j].position.applyAxisAngle(yAxis, angle);
        this.blades[i][j].position.add(offset);
        this.blades[i][j].rotation.set(0, angle, 0);
      }
    }
  }

  createBaffleGeometry({ baffleInnerRadius, baffleOuterRadius, baffleWidth, tankHeight }) {
    return new THREE.BoxGeometry(baffleWidth, tankHeight, baffleOuterRadius - baffleInnerRadius);
  }

  changeImpellerCount(newValue, oldValue) {
    var posY;
    if (newValue < oldValue) {
      for (var i = oldValue - 1; i >= 0; i--) {
        if (i < newValue) {
          posY = this.setImpellerPositionY(i, newValue);
          this.hubs[i].position.y = posY;
          this.disks[i].position.y = posY;
        }
        else {
          this.scene.remove(this.hubs[i]);
          this.hubs.pop();
          this.scene.remove(this.disks[i]);
          this.disks.pop();
          for (var j = this.props.bladeCount - 1; j >= 0; j--) {
            this.scene.remove(this.blades[i][j]);
            // this.blades[i].pop();
            // delete this.blades[i][j];
          }
          this.blades.pop();
          // delete this.hubs[i];
          // delete this.disks[i];
          // delete this.blades[i];
        }
      }
    } else if (newValue > oldValue) {
      for (var i = 0; i < newValue; i++) {
        posY = this.setImpellerPositionY(i, newValue);
        if (i < oldValue) {
          this.hubs[i].position.y = posY;
          this.disks[i].position.y = posY;
          for (let j = 0; j < this.props.bladeCount; j++) {
            this.blades[i][j].position.y = posY;
          }
        }
        else {
          this.createHub(i, newValue);
          this.createDisk(i, newValue);
          this.blades[i] = [];
          this.changeBladeCount(this.props.bladeCount, 0, i);
        }
      }
    }

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
        var material = new THREE.MeshPhongMaterial({
                    color: greyColor,
                    side: THREE.DoubleSide,
                    // clippingPlanes: [],
                    // clipShadows: true
                  });
        var mesh = new THREE.Mesh(baffle, material);
        this.baffles.push(mesh);
        mesh.name = "baffle";
        mesh.originalColor = greyColor;
        this.scene.add(mesh);
      }
    }
  }

  changeTransPan(type, value) {
    if (type === "XY") {
      this.transPanMeshXY.position.z = value;
    } 
    else if (type === "YZ") {
      this.transPanMeshYZ.position.x = value;
    } 
    else if (type === "XZ") {
      this.transPanMeshXZ.position.y = value;
    }
  }

  changeTransEnable (type, value) {
    if (type === "XY") 
      this.transEnableXY = value;
    else if (type === "YZ")
      this.transEnableYZ = value;
    else if (type === "XZ")
      this.transEnableXZ = value;
    this.transPanMeshXY.visible = this.transEnableXY;
    this.transPanMeshYZ.visible = this.transEnableYZ;
    this.transPanMeshXZ.visible = this.transEnableXZ;
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
  baffleCount: PropTypes.number.isRequired,
  baffleInnerRadius: PropTypes.number.isRequired,
  baffleOuterRadius: PropTypes.number.isRequired,

  impellerCount : PropTypes.number.isRequired,
  hubRadius: PropTypes.number.isRequired,
  hubHeight: PropTypes.number.isRequired,
  diskRadius: PropTypes.number.isRequired,
  diskHeight: PropTypes.number.isRequired,
  bladeCount: PropTypes.number.isRequired,
  bladeInnerRadius: PropTypes.number.isRequired,
  bladeOuterRadius: PropTypes.number.isRequired,
  bladeWidth: PropTypes.number.isRequired,
  bladeHeight: PropTypes.number.isRequired,

  transPanXY: PropTypes.number.isRequired,
  transPanYZ: PropTypes.number.isRequired,
  transPanXZ: PropTypes.number.isRequired,
  transEnableXY: PropTypes.bool,
  transEnableYZ: PropTypes.bool,
  transEnableXZ: PropTypes.bool,
  baffleWidth: PropTypes.number.isRequired,
  onHoverObject: PropTypes.func
};

export default Turbine;
