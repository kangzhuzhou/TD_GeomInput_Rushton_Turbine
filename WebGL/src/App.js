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

      impellerCount: 3,
      hubRadius: unit * 4 / 75,
      hubHeight: unit / 15,
      diskRadius: unit / 8,
      diskHeight: unit / 75,
      bladeCount: 6,
      bladeInnerRadius: unit / 12,
      bladeOuterRadius: unit / 6,
      bladeWidth: unit / 75,
      bladeHeight: unit / 15,

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
      var importJsonData = {
        tankDiameter: jsonData.tankDiameter,
        tankHeight: jsonData.gridx,
        shaftRadius: jsonData.shaft.radius,
        baffleCount: jsonData.baffles.numBaffles,
        baffleInnerRadius: jsonData.baffles.innerRadius,
        baffleOuterRadius: jsonData.baffles.outerRadius,
        baffleWidth: jsonData.baffles.thickness,

        impellerCount : jsonData.numImpellers,
        hubRadius: impeller0.hub.radius,
        hubHeight: impeller0.hub.top,
        diskRadius: impeller0.disk.radius,
        diskHeight: impeller0.disk.top,
        bladeCount: impeller0.numBlades,
        bladeInnerRadius: impeller0.blades.innerRadius,
        bladeOuterRadius: impeller0.blades.outerRadius,
        bladeWidth: impeller0.blades.bladeThickness,
        bladeHeight: impeller0.blades.top,
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
          numImpellers: this.state.impellerCount,
          impeller0: {
              numBlades: this.state.bladeCount,
              firstBladeOffset: 0,
              uav: "0.100000001",
              blade_tip_angular_vel_w0: "0.00588235306",
              impeller_position: this.state.tankDiameter/4,
              blades: {
                  innerRadius: this.state.bladeInnerRadius,
                  outerRadius: this.state.bladeOuterRadius,
                  bottom: "71.4000015",
                  top: this.state.bladeHeight,
                  bladeThickness: this.state.bladeWidth
              },
              disk: {
                  radius: this.state.diskRadius,
                  bottom: "68.6800003",
                  top: this.state.diskHeight
              },
              hub: {
                  radius: this.state.hubRadius,
                  bottom: "71.4000015",
                  top: this.state.hubHeight
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

                impellerCount={this.state.impellerCount}
                hubRadius={this.state.hubRadius}
                hubHeight={this.state.hubHeight}
                diskRadius={this.state.diskRadius}
                diskHeight={this.state.diskHeight}
                bladeCount={this.state.bladeCount}
                bladeInnerRadius={this.state.bladeInnerRadius}
                bladeOuterRadius={this.state.bladeOuterRadius}
                bladeWidth={this.state.bladeWidth}
                bladeHeight={this.state.bladeHeight}

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

              <Menu.SubMenu className="subMenu" key="impellers" title={
                <span><Icon type={'mail'} /><span>Impeller Count</span></span>
              }>
                <Menu.Item key="impellerCount">
                  <span>Count</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.impellerCount} onChange={(value) => this.handleChange('impellerCount', value)} />
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.SubMenu className="subMenu" key="hub" title={
                <span>
                  <Icon type={this.state.hoverObject === 'hub' ? 'environment' : 'mail'} />
                  <span style={{fontWeight: this.state.hoverObject === 'hub' ? 'bold' : 'normal'}}>Hub</span>
                </span>
              }>
                <Menu.Item key="hubRadius">
                  <span>Radius</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.hubRadius} onChange={(value) => this.handleChange('hubRadius', value)} />
                </Menu.Item>
                <Menu.Item key="hubHeight">
                  <span>Height</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.hubHeight} onChange={(value) => this.handleChange('hubHeight', value)} />
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu className="subMenu" key="disk" title={
                <span>
                  <Icon type={this.state.hoverObject === 'disk' ? 'environment' : 'mail'} />
                  <span style={{fontWeight: this.state.hoverObject === 'disk' ? 'bold' : 'normal'}}>Disk</span>
                </span>
              }>
                <Menu.Item key="diskRadius">
                  <span>Radius</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.diskRadius} onChange={(value) => this.handleChange('diskRadius', value)} />
                </Menu.Item>
                <Menu.Item key="diskHeight">
                  <span>Height</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.diskHeight} onChange={(value) => this.handleChange('diskHeight', value)} />
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu className="subMenu" key="blade" title={
                <span>
                  <Icon type={this.state.hoverObject === 'blade' ? 'environment' : 'mail'} />
                  <span style={{fontWeight: this.state.hoverObject === 'blade' ? 'bold' : 'normal'}}>Blade</span>
                </span>
              }>
                <Menu.Item key="bladeCount">
                  <span>Count</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.bladeCount} onChange={(value) => this.handleChange('bladeCount', value)} />
                </Menu.Item>
                <Menu.Item key="bladeInnerRadius">
                  <span>Inner Radius</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.bladeInnerRadius} onChange={(value) => this.handleChange('bladeInnerRadius', value)} />
                </Menu.Item>
                <Menu.Item key="bladeOuterRadius">
                  <span>Outer Radius</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.bladeOuterRadius} onChange={(value) => this.handleChange('bladeOuterRadius', value)} />
                </Menu.Item>
                <Menu.Item key="bladeWidth">
                  <span>Width</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.bladeWidth} onChange={(value) => this.handleChange('bladeWidth', value)} />
                </Menu.Item>
                <Menu.Item key="bladeHeight">
                  <span>Height</span>
                  <InputNumber size="small" min={1} defaultValue={this.state.bladeHeight} onChange={(value) => this.handleChange('bladeHeight', value)} />
                </Menu.Item>
                <Menu.Item key="bladeAutoRotate">
                  <Checkbox checked={this.state.kernelAutoRotation} onChange={this.handleAutoRotation.bind(this)}>
                    <span className="ant-menu-control">Auto Rotation</span>
                  </Checkbox>
                </Menu.Item>
                <Menu.Item key="bladeKernel">
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