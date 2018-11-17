import React, { Component } from "react";
import { Map, TileLayer, LayersControl, ScaleControl, GeoJSON } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
// import L from 'leaflet/dist/leaflet.js';
import './style.css';
import axios from 'axios';
const { BaseLayer, Overlay } = LayersControl;


export default class hraMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
    lat: 49.016,
    lng: -126.131,
    zoom: 10,
    maxZoom: 10, // for ESRI Ocean Base Map, which has the most limited zoom level
    minZoom: 2, // global scale
    vectors: [],
    };

    const self = this;
    const vectorDir = 'data/vectors';
    axios.get(vectorDir)
      .then(
        response => {
          for (var i = 0; i < response.data.length; i++) {
            // fetch geojson data via their path and store the data in vectors
            let vectorPath = vectorDir + '/' + response.data[i];
            fetch(vectorPath)
              .then(response => response.json()) // parsing the data as JSON
              .then(data => self.setState(
                {vectors: [...self.state.vectors, data]}))
          };
        },
        error => console.log(error));
  }

  getStyle(feature, layer) {
    return {
      color: '#006400',
      weight: 1,
      opacity: 0.65
    }
  }

  renderGeoJSONs() {
    let vectors = this.state.vectors;
    if (vectors.length > 0) {
      return (
        vectors.map(vectorData => (
          <Overlay key={vectorData.name} name={vectorData.name} checked>
            <GeoJSON key={vectorData.name} data={vectorData} style={this.getStyle()}/>
          </Overlay>
        ))
      )
    }
  }

  render() {
    let position = [this.state.lat, this.state.lng];
    return (
      <div>
        <Map center={position} zoom={this.state.zoom} style={{height: "650px"}} maxZoom={this.state.maxZoom} minZoom={this.state.minZoom}>

          <LayersControl position='topright' collapsed="false">
            <BaseLayer name="Open Street Map" checked>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors" />
            </BaseLayer>

            <BaseLayer name="ESRI Ocean Basemap">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri"
                maxZoom="10"/>
            </BaseLayer>

            {this.renderGeoJSONs()}
          </LayersControl>

          <ScaleControl position={"bottomleft"} maxWidth={100}/>
        </Map>
      </div>
    );
  }
}
