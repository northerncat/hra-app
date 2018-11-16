import React, { Component } from "react";
import { Map, TileLayer, LayersControl, ScaleControl, GeoJSON } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
// import L from 'leaflet/dist/leaflet.js';
import './style.css';
import layer from './data/softbottom.geojson';
const { BaseLayer, Overlay } = LayersControl;

// https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
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
    fetch('/data/softbottom.geojson')
      .then(response => {
        return response.json()
      })
      .then(data => {
        self.setState({data: data});
      });
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
        return <GeoJSON key={this.state.data.type} data={this.state.data}/>;
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
            <Overlay name="softbottom" checked>
              {this.renderGeoJSON()}
            </Overlay>
          </LayersControl>
          <ScaleControl position={"bottomleft"} maxWidth={100}/>
        </Map>
      </div>
    );
  }
}
