import React, { Component } from 'react';
import { Checkbox, Icon, InputNumber, Layout, Menu, Radio } from 'antd';
import Turbine from './Turbine';

import 'antd/dist/antd.css';
import './App.css';
import jQuery from 'jquery';

const { Content, Header, Sider } = Layout;

export default class App extends Component {
  constructor(props) {
    super(props);

    const unit = 300;
    this.state = {
      canvasWidth: 50,
      canvasHeight: 50,
      tankDiameter: unit,
      tankHeight: unit,
      shaftRadius: unit * 2 / 75,
      kernelAutoRotation: true,
      kernelRotationDir: 'clockwise',
      baffleCount: 4,
      baffleInnerRadius: unit * 2 / 5,
      baffleOuterRadius: unit / 2,
      baffleWidth: unit / 75,
      hub0Radius: unit * 4 / 75,
      hub0Height: unit / 15,
      disk0Radius: unit / 8,
      disk0Height: unit / 75,
      blade0Count: 6,
      blade0InnerRadius: unit / 12,
      blade0OuterRadius: unit / 6,
      blade0Width: unit / 75,
      blade0Height: unit / 15,

      hub1Radius: unit * 4 / 75,
      hub1Height: unit / 15,
      disk1Radius: unit / 8,
      disk1Height: unit / 75,
      blade1Count: 6,
      blade1InnerRadius: unit / 12,
      blade1OuterRadius: unit / 6,
      blade1Width: unit / 75,
      blade1Height: unit / 15,

      hub2Radius: unit * 4 / 75,
      hub2Height: unit / 15,
      disk2Radius: unit / 8,
      disk2Height: unit / 75,
      blade2Count: 6,
      blade2InnerRadius: unit / 12,
      blade2OuterRadius: unit / 6,
      blade2Width: unit / 75,
      blade2Height: unit / 15,

      transPanXY: 0,
      transPanYZ: 0,
      transPanXZ: 0,
      transEnableXY: false,
      transEnableYZ: false,
      transEnableXZ: false,
      hoverObject: '',
      setting:''
    };
    this.fileReader = new FileReader();
    this.fileReader.onload = (event) => {
      // or do whatever manipulation you want on JSON.parse(event.target.result) here.

      var jsonData = JSON.parse(event.target.result);
      var impeller0 = jsonData.impeller0;
      var impeller1 = jsonData.impeller1;
      var impeller2 = jsonData.impeller2;
      if (!impeller1) impeller1 = impeller0;
      if (!impeller2) impeller2 = impeller0;
      var importJsonData = {
        tankDiameter: jsonData.tankDiameter,
        tankHeight: jsonData.gridx,
        shaftRadius: jsonData.shaft.radius,
        baffleCount: jsonData.baffles.numBaffles,
        baffleInnerRadius: jsonData.baffles.innerRadius,
        baffleOuterRadius: jsonData.baffles.outerRadius,
        baffleWidth: jsonData.baffles.thickness,

        hub0Radius: impeller0.hub.radius,
        hub0Height: impeller0.hub.top,
        disk0Radius: impeller0.disk.radius,
        disk0Height: impeller0.disk.top,
        blade0Count: impeller0.numBlades,
        blade0InnerRadius: impeller0.blades.innerRadius,
        blade0OuterRadius: impeller0.blades.outerRadius,
        blade0Width: impeller0.blades.bladeThickness,
        blade0Height: impeller0.blades.top,

        hub1Radius: impeller1.hub.radius,
        hub1Height: impeller1.hub.top,
        disk1Radius: impeller1.disk.radius,
        disk1Height: impeller1.disk.top,
        blade1Count: impeller1.numBlades,
        blade1InnerRadius: impeller1.blades.innerRadius,
        blade1OuterRadius: impeller1.blades.outerRadius,
        blade1Width: impeller1.blades.bladeThickness,
        blade1Height: impeller1.blades.top,

        hub2Radius: impeller2.hub.radius,
        hub2Height: impeller2.hub.top,
        disk2Radius: impeller2.disk.radius,
        disk2Height: impeller2.disk.top,
        blade2Count: impeller2.numBlades,
        blade2InnerRadius: impeller2.blades.innerRadius,
        blade2OuterRadius: impeller2.blades.outerRadius,
        blade2Width: impeller2.blades.bladeThickness,
        blade2Height: impeller2.blades.top
      };
      console.log(importJsonData);
      Object.keys(importJsonData).forEach(key => {
        this.setState({ [key]: importJsonData[key] });
      });
    };
  }

  componentDidMount() {
    this.setState({
      canvasWidth: window.innerWidth - 320,
      canvasHeight: window.innerHeight - 64
    });
    this.handleResize = () => {
      this.setState({
        canvasWidth: window.innerWidth - 320,
        canvasHeight: window.innerHeight - 64
      });
    }
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleChange(field, value) {
    this.setState({ [field]: value });
  }
  handleTransEnable(field, value) {
    setTimeout(() => {
      this.setState({ [field]: value.target.checked });
    }, 100);
    
  }

  handleAutoRotation(event) {
    this.setState({ kernelAutoRotation: event.target.checked });
  }

  handleRadio(event) {
    this.setState({ kernelRotationDir: event.target.value });
  }

  handleHoverObject(name) {
    this.setState({ hoverObject: name });
  }

  handleSetting(type) {
    this.setState({setting:type});
    setTimeout(() => {
      this.setState({setting:''});
    }, 100);
  }

  handleFileSelect = (e) => {
    e.preventDefault();
    this.refs.fileInput.click();
  }

  handleFile(file) {
    this.fileReader.readAsText(file);
  }

  exportJsonFile() {
    // kernelAutoRotation={this.state.kernelAutoRotation}
    // kernelRotationDir={this.state.kernelRotationDir}

    var exportJsonData = {
          name: "GeometryConfig",
          gridx: this.state.tankHeight,
          resolution: "0.699999988",
          tankDiameter: this.state.tankDiameter,
          starting_step: 0,
          impeller_start_angle: 0,
          impeller_startup_steps_until_normal_speed: 0,
          baffles: {
              numBaffles: this.state.baffleCount,
              firstBaffleOffset: "0.785398185",
              innerRadius: this.state.baffleInnerRadius,
              outerRadius: this.state.baffleOuterRadius,
              thickness: this.state.baffleWidth
          },
          numImpellers: "1",
          impeller0: {
              numBlades: this.state.blade0Count,
              firstBladeOffset: 0,
              uav: "0.100000001",
              blade_tip_angular_vel_w0: "0.00588235306",
              impeller_position: this.state.tankDiameter/4,
              blades: {
                  innerRadius: this.state.blade0InnerRadius,
                  outerRadius: this.state.blade0OuterRadius,
                  bottom: "71.4000015",
                  top: this.state.blade0Height,
                  bladeThickness: this.state.blade0Width
              },
              disk: {
                  radius: this.state.disk0Radius,
                  bottom: "68.6800003",
                  top: this.state.disk0Height
              },
              hub: {
                  radius: this.state.hub0Radius,
                  bottom: "71.4000015",
                  top: this.state.hub0Height
              }
          },
          impeller1: {
            numBlades: this.state.blade1Count,
            firstBladeOffset: 0,
            uav: "0.100000001",
            blade_tip_angular_vel_w0: "0.00588235306",
            impeller_position: this.state.tankDiameter/2,
            blades: {
                innerRadius: this.state.blade1InnerRadius,
                outerRadius: this.state.blade1OuterRadius,
                bottom: "71.4000015",
                top: this.state.blade1Height,
                bladeThickness: this.state.blade1Width
            },
            disk: {
                radius: this.state.disk1Radius,
                bottom: "68.6800003",
                top: this.state.disk1Height
            },
            hub: {
                radius: this.state.hub1Radius,
                bottom: "71.4000015",
                top: this.state.hub1Height
            }
          },
          impeller2: {
            numBlades: this.state.blade2Count,
            firstBladeOffset: 0,
            uav: "0.100000001",
            blade_tip_angular_vel_w0: "0.00588235306",
            impeller_position: this.state.tankDiameter*3/4,
            blades: {
                innerRadius: this.state.blade2InnerRadius,
                outerRadius: this.state.blade2OuterRadius,
                bottom: "71.4000015",
                top: this.state.blade2Height,
                bladeThickness: this.state.blade2Width
            },
            disk: {
                radius: this.state.disk2Radius,
                bottom: "68.6800003",
                top: this.state.disk2Height
            },
            hub: {
                radius: this.state.hub2Radius,
                bottom: "71.4000015",
                top: this.state.hub2Height
            }
          },
          shaft: {
              radius: this.state.shaftRadius
          }
        };
    //this.state
    jQuery("<a />", {
      "download": "data.json",
      "href" : "data:application/json," + encodeURIComponent(JSON.stringify(exportJsonData))
    }).appendTo("body")
    .click(function() {
      jQuery(this).remove()
    })[0].click();
  }
  
  render() {
    return (
      <div className="App">
        <Layout style={{ height: '100%' }}>
          <Layout>
            <Header>
              <h1>Turbulent Dynamics</h1>
            </Header>
            <Content style={{ overflowY: 'hidden' }}>
              <Turbine
                width={this.state.canvasWidth}
                height={this.state.canvasHeight}
                tankDiameter={this.state.tankDiameter}
                tankHeight={this.state.tankHeight}
                shaftRadius={this.state.shaftRadius}
                kernelAutoRotation={this.state.kernelAutoRotation}
                kernelRotationDir={this.state.kernelRotationDir}
                baffleCount={this.state.baffleCount}
                baffleInnerRadius={this.state.baffleInnerRadius}
                baffleOuterRadius={this.state.baffleOuterRadius}
                baffleWidth={this.state.baffleWidth}

                hub0Radius={this.state.hub0Radius}
                hub0Height={this.state.hub0Height}
                disk0Radius={this.state.disk0Radius}
                disk0Height={this.state.disk0Height}
                blade0Count={this.state.blade0Count}
                blade0InnerRadius={this.state.blade0InnerRadius}
                blade0OuterRadius={this.state.blade0OuterRadius}
                blade0Width={this.state.blade0Width}
                blade0Height={this.state.blade0Height}

                hub1Radius={this.state.hub1Radius}
                hub1Height={this.state.hub1Height}
                disk1Radius={this.state.disk1Radius}
                disk1Height={this.state.disk1Height}
                blade1Count={this.state.blade1Count}
                blade1InnerRadius={this.state.blade1InnerRadius}
                blade1OuterRadius={this.state.blade1OuterRadius}
                blade1Width={this.state.blade1Width}
                blade1Height={this.state.blade1Height}

                hub2Radius={this.state.hub2Radius}
                hub2Height={this.state.hub2Height}
                disk2Radius={this.state.disk2Radius}
                disk2Height={this.state.disk2Height}
                blade2Count={this.state.blade2Count}
                blade2InnerRadius={this.state.blade2InnerRadius}
                blade2OuterRadius={this.state.blade2OuterRadius}
                blade2Width={this.state.blade2Width}
                blade2Height={this.state.blade2Height}

                transPanXY={this.state.transPanXY}
                transPanYZ={this.state.transPanYZ}
                transPanXZ={this.state.transPanXZ}
                transEnableXY={this.state.transEnableXY}
                transEnableYZ={this.state.transEnableYZ}
                transEnableXZ={this.state.transEnableXZ}
                onHoverObject={name => this.handleHoverObject(name)}
                setting={this.state.setting}
              />
            </Content>
          </Layout>
          <Sider width={320} style={{ overflowY: 'auto' }}>
            <div className="logo"></div>
            <Menu theme="dark" mode="inline">
              <Menu.SubMenu className="subMenu" key="tank" title={
                <span>
                  <Icon type={this.state.hoverObject === 'tank' ? 'environment' : 'mail'} />
                  <span style={{fontWeight: this.state.hoverObject === 'tank' ? 'bold' : 'normal'}}>Tank</span>
                </span>
              }>
                <Menu.Item key="menuitem1">
                  <span>Diameter</span>
                  <InputNumber size="small" min={100} defaultValue={this.state.tankDiameter} onChange={(value) => this.handleChange('tankDiameter', value)} />
                </Menu.Item>
                <Menu.Item key="menuitem2">
                  <span>Height</span>
                  <InputNumber size="small" min={100} defaultValue={this.state.tankHeight} onChange={(value) => this.handleChange('tankHeight', value)} />
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu className="subMenu" key="shaft" title={
                <span>
                  <Icon type={this.state.hoverObject === 'shaft' ? 'environment' : 'mail'} />
                  <span style={{fontWeight: this.state.hoverObject === 'shaft' ? 'bold' : 'normal'}}>Shaft</span>
                </span>
              }>
                <Menu.Item key="menuitem3">
                  <span>Radius</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.shaftRadius} onChange={(value) => this.handleChange('shaftRadius', value)} />
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu className="subMenu" key="baffle" title={
                <span>
                  <Icon type={this.state.hoverObject === 'baffle' ? 'environment' : 'mail'} />
                  <span style={{fontWeight: this.state.hoverObject === 'baffle' ? 'bold' : 'normal'}}>Baffle</span>
                </span>
              }>
                <Menu.Item key="menuitem15">
                  <span>Count</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.baffleCount} onChange={(value) => this.handleChange('baffleCount', value)} />
                </Menu.Item>
                <Menu.Item key="menuitem16">
                  <span>Inner Radius</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.baffleInnerRadius} onChange={(value) => this.handleChange('baffleInnerRadius', value)} />
                </Menu.Item>
                <Menu.Item key="menuitem17">
                  <span>Outer Radius</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.baffleOuterRadius} onChange={(value) => this.handleChange('baffleOuterRadius', value)} />
                </Menu.Item>
                <Menu.Item key="menuitem18">
                  <span>Width</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.baffleWidth} onChange={(value) => this.handleChange('baffleWidth', value)} />
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.SubMenu className="subMenu" key="impeller0" title={
                <span><Icon type={'mail'}/><span>Impeller0</span></span>
              }>
                <Menu.SubMenu className="subMenu" key="hub0" title={
                  <span><Icon type={'mail'} /><span>Hub</span></span>
                }>
                  <Menu.Item key="hub0Radius">
                    <span>Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.hub0Radius} onChange={(value) => this.handleChange('hub0Radius', value)} />
                  </Menu.Item>
                  <Menu.Item key="hub0Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.hub0Height} onChange={(value) => this.handleChange('hub0Height', value)} />
                  </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu className="subMenu" key="disk0" title={
                  <span><Icon type={'mail'}/><span>Disk</span></span>
                }>
                  <Menu.Item key="disk0Radius">
                    <span>Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.disk0Radius} onChange={(value) => this.handleChange('disk0Radius', value)} />
                  </Menu.Item>
                  <Menu.Item key="disk0Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.disk0Height} onChange={(value) => this.handleChange('disk0Height', value)} />
                  </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu className="subMenu" key="blade0" title={
                  <span><Icon type={'mail'}/><span>Blade</span></span>
                }>
                  <Menu.Item key="blade0Count">
                    <span>Count</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade0Count} onChange={(value) => this.handleChange('blade0Count', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade0InnerRadius">
                    <span>Inner Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade0InnerRadius} onChange={(value) => this.handleChange('blade0InnerRadius', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade0OuterRadius">
                    <span>Outer Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade0OuterRadius} onChange={(value) => this.handleChange('blade0OuterRadius', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade0Width">
                    <span>Width</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade0Width} onChange={(value) => this.handleChange('blade0Width', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade0Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade0Height} onChange={(value) => this.handleChange('blade0Height', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade0AutoRotate">
                    <Checkbox checked={this.state.kernelAutoRotation} onChange={this.handleAutoRotation.bind(this)}>
                      <span className="ant-menu-control">Auto Rotation</span>
                    </Checkbox>
                  </Menu.Item>
                  <Menu.Item key="blade0Kernel">
                    <Radio.Group onChange={this.handleRadio.bind(this)} value={this.state.kernelRotationDir}>
                      <Radio value="clockwise">
                        <span className="ant-menu-control">Clockwise</span>
                      </Radio>
                      <Radio value="counter-clockwise">
                        <span className="ant-menu-control">Counter-Clockwise</span>
                      </Radio>
                    </Radio.Group>
                  </Menu.Item>
                </Menu.SubMenu>
              </Menu.SubMenu>

              <Menu.SubMenu className="subMenu" key="impeller1" title={
                <span><Icon type={'mail'}/><span>Impeller1</span></span>
              }>
                <Menu.SubMenu className="subMenu" key="hub1" title={
                  <span><Icon type={'mail'} /><span>Hub</span></span>
                }>
                  <Menu.Item key="hub1Radius">
                    <span>Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.hub1Radius} onChange={(value) => this.handleChange('hub1Radius', value)} />
                  </Menu.Item>
                  <Menu.Item key="hub1Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.hub1Height} onChange={(value) => this.handleChange('hub1Height', value)} />
                  </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu className="subMenu" key="disk1" title={
                  <span><Icon type={'mail'}/><span>Disk</span></span>
                }>
                  <Menu.Item key="disk1Radius">
                    <span>Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.disk1Radius} onChange={(value) => this.handleChange('disk1Radius', value)} />
                  </Menu.Item>
                  <Menu.Item key="disk1Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.disk1Height} onChange={(value) => this.handleChange('disk1Height', value)} />
                  </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu className="subMenu" key="blade1" title={
                  <span><Icon type={'mail'}/><span>Blade</span></span>
                }>
                  <Menu.Item key="blade1Count">
                    <span>Count</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade1Count} onChange={(value) => this.handleChange('blade1Count', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade1InnerRadius">
                    <span>Inner Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade1InnerRadius} onChange={(value) => this.handleChange('blade1InnerRadius', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade1OuterRadius">
                    <span>Outer Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade1OuterRadius} onChange={(value) => this.handleChange('blade1OuterRadius', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade1Width">
                    <span>Width</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade1Width} onChange={(value) => this.handleChange('blade1Width', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade1Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade1Height} onChange={(value) => this.handleChange('blade1Height', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade1AutoRotate">
                    <Checkbox checked={this.state.kernelAutoRotation} onChange={this.handleAutoRotation.bind(this)}>
                      <span className="ant-menu-control">Auto Rotation</span>
                    </Checkbox>
                  </Menu.Item>
                  <Menu.Item key="blade1Kernel">
                    <Radio.Group onChange={this.handleRadio.bind(this)} value={this.state.kernelRotationDir}>
                      <Radio value="clockwise">
                        <span className="ant-menu-control">Clockwise</span>
                      </Radio>
                      <Radio value="counter-clockwise">
                        <span className="ant-menu-control">Counter-Clockwise</span>
                      </Radio>
                    </Radio.Group>
                  </Menu.Item>
                </Menu.SubMenu>
              </Menu.SubMenu>

              <Menu.SubMenu className="subMenu" key="impeller2" title={
                <span><Icon type={'mail'}/><span>Impeller2</span></span>
              }>
                <Menu.SubMenu className="subMenu" key="hub2" title={
                  <span><Icon type={'mail'} /><span>Hub</span></span>
                }>
                  <Menu.Item key="hub2Radius">
                    <span>Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.hub2Radius} onChange={(value) => this.handleChange('hub2Radius', value)} />
                  </Menu.Item>
                  <Menu.Item key="hub2Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.hub2Height} onChange={(value) => this.handleChange('hub2Height', value)} />
                  </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu className="subMenu" key="disk2" title={
                  <span><Icon type={'mail'}/><span>Disk</span></span>
                }>
                  <Menu.Item key="disk2Radius">
                    <span>Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.disk2Radius} onChange={(value) => this.handleChange('disk2Radius', value)} />
                  </Menu.Item>
                  <Menu.Item key="disk2Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.disk2Height} onChange={(value) => this.handleChange('disk2Height', value)} />
                  </Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu className="subMenu" key="blade2" title={
                  <span><Icon type={'mail'}/><span>Blade</span></span>
                }>
                  <Menu.Item key="blade2Count">
                    <span>Count</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade2Count} onChange={(value) => this.handleChange('blade2Count', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade2InnerRadius">
                    <span>Inner Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade2InnerRadius} onChange={(value) => this.handleChange('blade2InnerRadius', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade2OuterRadius">
                    <span>Outer Radius</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade2OuterRadius} onChange={(value) => this.handleChange('blade2OuterRadius', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade2Width">
                    <span>Width</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade2Width} onChange={(value) => this.handleChange('blade2Width', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade2Height">
                    <span>Height</span>
                    <InputNumber size="small" min={1} defaultValue={this.state.blade2Height} onChange={(value) => this.handleChange('blade2Height', value)} />
                  </Menu.Item>
                  <Menu.Item key="blade2AutoRotate">
                    <Checkbox checked={this.state.kernelAutoRotation} onChange={this.handleAutoRotation.bind(this)}>
                      <span className="ant-menu-control">Auto Rotation</span>
                    </Checkbox>
                  </Menu.Item>
                  <Menu.Item key="blade2Kernel">
                    <Radio.Group onChange={this.handleRadio.bind(this)} value={this.state.kernelRotationDir}>
                      <Radio value="clockwise">
                        <span className="ant-menu-control">Clockwise</span>
                      </Radio>
                      <Radio value="counter-clockwise">
                        <span className="ant-menu-control">Counter-Clockwise</span>
                      </Radio>
                    </Radio.Group>
                  </Menu.Item>
                </Menu.SubMenu>
              </Menu.SubMenu>

              <Menu.SubMenu className="setting subMenu" key="setting" title={
                <span>
                  <Icon type={this.state.hoverObject === 'setting' ? 'environment' : 'mail'} />
                  <span style={{
                    fontWeight: this.state.hoverObject === 'setting' ? 'bold' : 'normal'
                  }}>Setting</span>
                </span>
              }>
                <div className="setting-item">
                  <button onClick={ev => {this.handleSetting("reset")}}>Reset Camera</button>
                </div>
                <div><input id="fileInput" ref="fileInput" type="file" onChange={ (e) => this.handleFile(e.target.files[0]) } /></div>
                <div className="setting-item">
                  <button onClick={this.handleFileSelect}>Load Json</button>
                </div>
                <div className="setting-item">
                  <button onClick={this.exportJsonFile.bind(this)}>Save Json</button>
                </div>
              </Menu.SubMenu>
              <Menu.SubMenu className="translucent subMenu" key="translucent" title={
                <span>
                  <Icon type={this.state.hoverObject === 'translucent' ? 'environment' : 'mail'} />
                  <span style={{fontWeight: this.state.hoverObject === 'translucent' ? 'bold' : 'normal'}}>Translucent</span>
                </span>
              }>
                <Menu.Item className="testClass" key="menuitem15">
                  <span className="trans-pan">XY Side Enable</span>
                  <Checkbox className="transCheck" onChange={(value) => this.handleTransEnable('transEnableXY', value)}></Checkbox>
                  <InputNumber size="small" min={this.state.tankDiameter * -0.5} max={this.state.tankDiameter * 0.5} defaultValue={this.state.transPanXY} onChange={(value) => this.handleChange('transPanXY', value)} />
                </Menu.Item>
                <Menu.Item key="menuitem16">
                  <span className="trans-pan">YZ Side Enable</span>
                  <Checkbox className="transCheck" onChange={(value) => this.handleTransEnable('transEnableYZ', value)}></Checkbox>
                  <InputNumber size="small" min={this.state.tankDiameter * -0.5} max={this.state.tankDiameter * 0.5} defaultValue={this.state.transPanYZ} onChange={(value) => this.handleChange('transPanYZ', value)} />
                </Menu.Item>
                <Menu.Item key="menuitem17">
                  <span className="trans-pan">XZ Side Enable</span>
                  <Checkbox className="transCheck" onChange={(value) => this.handleTransEnable('transEnableXZ', value)}></Checkbox>
                  <InputNumber size="small" min={this.state.tankHeight * -0.5} max={this.state.tankHeight * 0.5} defaultValue={this.state.transPanXZ} onChange={(value) => this.handleChange('transPanXZ', value)} />
                </Menu.Item>
                <Menu.SubMenu key="menuitem18" title="test subMenu">
                  <Menu.Item key="menuitem19">xx</Menu.Item>
                  <Menu.Item key="menuitem20">yy</Menu.Item>
                </Menu.SubMenu>
              </Menu.SubMenu>
            </Menu>
          </Sider>
        </Layout>
      </div>
    );
  }
}
//  onClick={ev => {this.handleSetting("load")}}