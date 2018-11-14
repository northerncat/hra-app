import React, { Component } from "react";
import { Map, TileLayer, LayersControl, ScaleControl } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import './style.css';
const { BaseLayer, Overlay } = LayersControl;

export default class MapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
    lat: 51.505,
    lng: -0.09,
    zoom: 10,
    maxZoom: 10 // for ESRI Ocean Base Map, which has the most limited zoom level
    };
  }

  render() {
    let position = [this.state.lat, this.state.lng];
    return (
      <div>
        <Map center={position} zoom={this.state.zoom} style={{height: "650px"}} maxZoom={this.state.maxZoom}>
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
          </LayersControl>
          <ScaleControl position={"bottomleft"} maxWidth={100}/>
        </Map>
      </div>
    );
  }
}
