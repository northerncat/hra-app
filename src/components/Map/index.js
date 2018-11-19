import React, { Component } from 'react';
import { Map, TileLayer, LayersControl, ScaleControl, Marker } from 'react-leaflet';
// import L from 'leaflet/dist/leaflet.js';
import { bbox } from '@turf/turf'
import Choropleth from 'react-leaflet-choropleth';
import axios from 'axios';
import Control from 'react-leaflet-control';
import parse_georaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';

import 'font-awesome/css/font-awesome.min.css';
import 'leaflet/dist/leaflet.css';
import './style.css';

const { BaseLayer, Overlay } = LayersControl;

export default class Hramap extends Component {
  constructor(props) {
    super(props);

    this.state = {
    coords: 'Hover mouse over the map to display coordinates.',
    maxZoom: 13, // for ESRI Ocean Base Map, which has the most limited zoom level
    minZoom: 2, // global scale
    maxBbox: [[-90, -180], [90, 180]], // default is the global view
    vectors: [],
    lats: [],
    lngs: [],
    vectorLength: null,
    rasters: new Object(),
    rasterLength: null,
    };
  }

  componentDidMount() {
    this.mapApi = this.refs.mapRef.leafletElement; // the Leaflet Map object
    const self = this;
    const vectorDir = 'data/vectors';
    let lats = [];
    let lngs = [];
    let vectorData = [];
    axios.get(vectorDir)
      .then(
        response => {
          self.setState({vectorLength: response.data.length});
          for (var i = 0; i < response.data.length; i++) {
            // fetch geojson data via their path and store the data in vectors
            let vectorPath = vectorDir + '/' + response.data[i];
            fetch(vectorPath)
              .then(response => response.json()) // parsing the data as JSON
              .then(data => {
                // Add geojson bounding box to lat and long arrays
                let vectorBbox = bbox(data);
                vectorData.push(data);
                lngs.push(...[vectorBbox[0], vectorBbox[2]]);
                lats.push(...[vectorBbox[1], vectorBbox[3]]);

                // only set state when all vectors are loaded
                if (vectorData.length === self.state.vectorLength) {
                  self.setState({vectors: [...self.state.vectors, ...vectorData]});
                  self.setState({lngs: [...self.state.lngs, ...lngs]});
                  self.setState({lats: [...self.state.lats, ...lats]});
                  self.fitToMaxBbox();
                }
              })
          };
        },
        error => console.log(error));

    const rasterDir = 'data/rasters';
    let rasterData = new Object();
    let geotiffPath = 'data/rasters/risk_eelgrass.tif';
    axios.get(rasterDir)
      .then(
        response => {
          self.setState({rasterLength: response.data.length});
          for (var i = 0; i < response.data.length; i++) {
            let rasterFilename = response.data[i]
            let rasterPath = rasterDir + '/' + rasterFilename;
            fetch(rasterPath).then(response =>
              response.arrayBuffer()).then(arrayBuffer => {
                parse_georaster(arrayBuffer).then(georaster => {
                  let geoRasterLayer = new GeoRasterLayer({
                      georaster: georaster,
                      opacity: 0.7,
                      pixelValueToColorFn: value =>
                        value > 2  ? '#aa0101' :
                        value > 1  ? '#cc5d5d' :
                        value > 0  ? '#efbaba' :
                                     'rgb(255, 255, 255, 0)'}) // gradient color
                  rasterData[rasterFilename.replace(/\.[^/.]+$/, "")] = geoRasterLayer;
                  if (Object.keys(rasterData).length === this.state.rasterLength) {
                    self.setState({rasters: rasterData});
                  }
              })
            });

          }
        },
      error => console.log(error));
  }

  fitToMaxBbox() {
    if (this.state.lats.length > 0 && this.state.lngs.length > 0) {
      // calc the min and max lng and lat
      var minlat = Math.min(...this.state.lats),
          maxlat = Math.max(...this.state.lats);
      var minlng = Math.min(...this.state.lngs),
          maxlng = Math.max(...this.state.lngs);
      this.setState({maxBbox: [[minlat, minlng],[maxlat, maxlng]]});
    this.mapApi.fitBounds(this.state.maxBbox);
    }
  }

  getStyle() { // basic style for polygons
    return {
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  }

  popupText(feature, layer) {
    let popupText = [];
    const properties = feature.properties;
    if (properties){
      for (var field in properties){
          popupText.push(field + ": " + properties[field]);
      }
    }
    layer.bindPopup(popupText.join("<br/>"));
  }

  renderGeojsons() {
    let geojsons = this.state.vectors;
    if (geojsons.length > 0) {
      return (
        geojsons.map((geojson, index) => (
          <Overlay key={geojson.name} name={geojson.name} checked>
            <Choropleth
              data={{type: 'FeatureCollection', features: geojson.features}}
              valueProperty={(feature) => feature.properties.VALUE}
              scale={['#efbaba', '#aa0101']}
              steps={3}
              mode='e'
              style={this.getStyle()}
              onEachFeature={(feature, layer) => this.popupText(feature, layer)}
            />
          </Overlay>
        ))
      );
    }
  }

  renderGeotiffs() {
    const rasters = this.state.rasters;
    let rasterOverlays = [];
    if (Object.keys(rasters).length === this.state.rasterLength) {
      for (var rasterName in rasters) {
        let rasterLayer = rasters[rasterName];
        rasterOverlays.push(
          <Overlay key={rasterName} name={rasterName} checked>
            <Marker position={[51.505,-0.09]}></Marker>
          </Overlay>
          )
        rasterLayer.addTo(this.mapApi);
        // layerControl.addOverlay(imageOverlayNew, newLayerName);
      }
    }
    return rasterOverlays
  }

  displayMouseCoords(e) {
    let coords = "Lat: " + e.latlng.lat.toFixed(5) + ", Long: "+e.latlng.lng.toFixed(5);
    this.setState({coords: coords});
  }

  removeCoords(e) {
    this.setState({coords: 'Hover mouse over the map to display coordinates.'});
  }

  zoomToMaxBbox(e) {
    this.mapApi.fitBounds(this.state.maxBbox);
  }

  displayLegend() {
    const riskColors = {
      'High Risk': '#aa0101',
      'Medium Risk': '#cc5d5d',
      'Low Risk':'#efbaba'
    };
    let riskLegend = [];
    for (var risk in riskColors) {
      riskLegend.push(
        <li key={risk}>
            <svg className='legendSvg'>
              <rect className='legendSvg' fill={riskColors[risk]}/>
            </svg>
            <span className='legendText'>{risk}</span>
        </li>
        )
    }
    return riskLegend;
  }

  render() {
    return (
      <div>
        <Map ref='mapRef' id='mapdiv' maxZoom={this.state.maxZoom} minZoom={this.state.minZoom}
          onMouseMove={this.displayMouseCoords.bind(this)}
          onMouseOut={this.removeCoords.bind(this)} className='map'>

        <Control position='bottomright'>
          <ul className='legend'>
            {this.displayLegend()}
          </ul>
        </Control>

        <Control position='topleft'>
          <button id='zoomBtn'
            onClick={this.zoomToMaxBbox.bind(this)}>
            <i className="fa fa-crosshairs fa-lg"/>
          </button>
        </Control>

        <Control position='bottomleft'>
          <div id='coords'>{this.state.coords}</div>
        </Control>

          <LayersControl position='topright' collapsed={false}>
            <BaseLayer name='Open Street Map' checked={true}>
              <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&amp;copy <a href=&quot;http://osm.org/copyright&quot;>
                OpenStreetMap</a> contributors' />
            </BaseLayer>
            <BaseLayer name='ESRI Ocean Basemap'>
              <TileLayer
                url='https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}'
                attribution='Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'/>
            </BaseLayer>

            {this.renderGeojsons()}

            {this.renderGeotiffs()}

          </LayersControl>

          <ScaleControl position={'bottomleft'} maxWidth={100}/>
        </Map>
      </div>
    );
  }
}


