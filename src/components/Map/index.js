import React, { Component } from "react";
import { Map, TileLayer, LayersControl, ScaleControl, GeoJSON } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
// import L from 'leaflet/dist/leaflet.js';
import './style.css';
import axios from 'axios';
const { BaseLayer, Overlay } = LayersControl;


export default class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
    lat: 49.016,
    lng: -126.131,
    zoom: 10,
    maxZoom: 10, // for ESRI Ocean Base Map, which has the most limited zoom level
    minZoom: 2, // global scale
    data: null,
    };

    const self = this;
    fetch('/data/vectors/softbottom.geojson')
      .then(response => response.json()) // parsing the data as JSON
      .then(data => {
        self.setState({data: data});
      });
  }

  componentDidMount() {
    const vectorDir = 'data/vectors';
    let vectorPaths = [];
    axios.get(vectorDir)
      .then(
        response => {
          for (var i = 0; i < response.data.length; i++) {
            vectorPaths.push(vectorDir + '/' + response.data[i]);
          }
          console.log(vectorPaths);
        },
        error => console.log(error));
  }

  getStyle(feature, layer) {
    return {
      color: '#006400',
      weight: 10,
      opacity: 0.65
    }
  }

  renderGeoJSON() {
    if (this.state.data != null) {
      return (
        <Overlay name="softbottom" checked>
          <GeoJSON key={this.state.data.type} data={this.state.data}/>
        </Overlay>);
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

            {this.renderGeoJSON()}
          </LayersControl>

          <ScaleControl position={"bottomleft"} maxWidth={100}/>
        </Map>
      </div>
    );
  }
}
