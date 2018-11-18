import React, { Component } from 'react';
import { Map, TileLayer, LayersControl, ScaleControl } from 'react-leaflet';
// import L from 'leaflet/dist/leaflet.js';
import { bbox } from '@turf/turf'
import Choropleth from 'react-leaflet-choropleth';
import axios from 'axios';

import 'leaflet/dist/leaflet.css';
import './style.css';

const { BaseLayer, Overlay } = LayersControl;

export default class Hramap extends Component {
  constructor(props) {
    super(props);

    this.state = {
    coords: 'Move mouse over the map to display coordinates.',
    maxZoom: 13, // for ESRI Ocean Base Map, which has the most limited zoom level
    minZoom: 2, // global scale
    maxBbox: [[-90, -180], [90, 180]], // default is the global view
    vectors: [],
    lats: [],
    lngs: [],
    };

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
                  self.getMaxBbox();
                }
              })
          };
        },
        error => console.log(error));
  }

  getMaxBbox() {
    if (this.state.lats.length > 0 && this.state.lngs.length > 0) {
      // calc the min and max lng and lat
      var minlat = Math.min(...this.state.lats),
          maxlat = Math.max(...this.state.lats);
      var minlng = Math.min(...this.state.lngs),
          maxlng = Math.max(...this.state.lngs);
      this.setState({maxBbox: [[minlat, minlng],[maxlat, maxlng]]});
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

  displayMouseCoords(e) {
    let coords = "Lat: " + e.latlng.lat.toFixed(5) + ", Long: "+e.latlng.lng.toFixed(5);
    this.setState({coords: coords});
  }

  render() {
    return (
      <div>
        <Map id='mapdiv' maxZoom={this.state.maxZoom} minZoom={this.state.minZoom} bounds={this.state.maxBbox} onMouseMove={this.displayMouseCoords.bind(this)}>
          <div id='coords'>{this.state.coords}</div>

          <LayersControl position='topright' collapsed='false'>
            <BaseLayer name='Open Street Map' checked>
              <TileLayer
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                attribution='&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors' />
            </BaseLayer>
            <BaseLayer name='ESRI Ocean Basemap'>
              <TileLayer
                url='https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}'
                attribution='Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'/>
            </BaseLayer>

            {this.renderGeojsons()}
          </LayersControl>

          <ScaleControl position={'bottomleft'} maxWidth={100}/>
        </Map>
      </div>
    );
  }
}
