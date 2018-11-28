import ReactMapboxGl, { Layer, Feature, Marker, Popup } from 'react-mapbox-gl';
import mapboxgl from 'mapbox-gl';
import Link from 'next/link';
import { connect } from 'react-redux';
import { setWaypointsAction, setLineAction } from '../store/actions/tripactions.js'
import Axios from 'axios';
import Dock from 'react-dock'
import ItineraryView from './itineraryView.js'
import Start from './start.js'
import PoiView from './pois.js'


import { timingSafeEqual } from 'crypto';
import { runInContext } from 'vm';

const dotenv = require('dotenv').config();
mapboxgl.accessToken = process.env.MAPBOX_API_KEY;

const Map = ReactMapboxGl({ accessToken: process.env.MAPBOX_API_KEY })
let map

class DynamicMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positionIdx: 0,
      isVisible: false,
      fluid: true,
      customAnimation: false,
      slow: false,
      size: 0.50,
      currentDrawer: null,
      parks: false,
      food: false,
      history: false,
      hotels: false,
      muesums: false,
    };
    this.addToTrip = this.addToTrip.bind(this);
    this.redrawLine = this.redrawLine.bind(this);
    this.renderDrawer = this.renderDrawer.bind(this);
    this.setPois = this.setPois.bind(this);
  }

componentDidMount(){
  const { line, pois } = this.props;
  if (line) {
    console.log(line);
   this.populateMap();
  }
   map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-98.5795, 39.8283],
    zoom: 3,
  });
}
componentDidUpdate(prevProps){
  if (this.props.line !== prevProps.line){
    this.populateMap();
    this.setState({ isVisible: false })
  } 
}

populateMap(){
  const { line, pois } = this.props;
  let coordinates = line;
  let centerLng = coordinates[Math.floor(coordinates.length / 2)][0]
  let centerLat = coordinates[Math.floor(coordinates.length / 2)][1]
  var bounds = coordinates.reduce((bounds, coord)=>{
    return bounds.extend(coord);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [centerLng, centerLat],
  });
  let data = {
    "type": "geojson",
    "data": {
      "type": "Feature",
      "properties": { },
      "geometry": {
        "type": "LineString",
        "coordinates": line
      }
    }
  }
  map.on('load', function () {
  map.addSource('route', data);
    map.addLayer({
      "id": "route",
      "type": "line",
      "source": "route",
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": "#E87111",
        "line-width": 6
      }
    })
    .fitBounds(bounds, {
      padding: 20
    });
  });
  window.cainTest = [];
  pois.forEach(({ img, lat, lng, name }, i)=>{
    window.cainTest.push(() => this.addToTrip(lng, lat, name));
    new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<img src=${img} height="150px" width="150px"><br>
      <strong>${name}</strong>
      <div onClick="window.cainTest[${i}]()">add to trip</div>`))
      .addTo(map);
  });

}

redrawLine(){
  const { line } = this.props;
  map.getSource('route').setData({
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": line
      }
    })
}

addToTrip(lng, lat, name){
  const { line, waypoints } = this.props;
   this.props.setWaypoint({
       lng,
       lat,
       name,
   })
   let currentWaypointsString = `${lng},${lat};`
   waypoints.map(waypoint=>{
     currentWaypointsString += `${waypoint.lng},${waypoint.lat};` 
   })
   let queryString = `${line[0][0]},${line[0][1]};${currentWaypointsString}${line[line.length-1][0]},${line[line.length-1][1]}`  
   Axios.get('/redraw', {
     params: queryString
   })
   .then((response)=>{
     let line = response.data.trips[0].geometry.coordinates
     this.props.setLine({
       line
     });
    })
    .then(() => {
      this.redrawLine();
    })
   .catch(err=>{
     console.log(err)
   })
} 

renderDrawer(type){
  this.setState({ 
    isVisible: !this.state.isVisible,
    currentDrawer: type
  })
}

setPois(key){
  this.setState({
    //tggle state property of key
    [key]: !this.state[key]
  })
}

  render() {
    return (
    <div>
        <div id="map" className="absolute top right left bottom" />
        <nav id="listing-group" className="listing-group">
          <Link href='/forms/login'><img src="/static/user.png"></img></Link><br/>
          <img src="/static/info.png" onClick={()=> this.renderDrawer('pois')}></img><br/>
          <img src="/static/sports-car.png" onClick={() => this.renderDrawer('itnierary')} zindex={4}></img><br/>
          <Link href='/trip/music'><img src="/static/spotify.png"></img></Link><br/>
          <Link href='/trip/photos'><img src="/static/camera.png"></img></Link><br/>
          <img src="/static/left-arrow.png" onClick={()=>this.renderDrawer('start')}></img>
          <div id="food" name="food" onClick={this.setPois}>food</div>

          <Dock position="bottom"
            size={this.state.size}
            isVisible={this.state.isVisible}
            onVisibleChange={this.handleVisibleChange}
            onSizeChange={this.handleSizeChange}
            fluid={this.state.fluid}
            dimStyle={{ background: 'rgba(0, 0, 100, 0.2)' }}
            dockStyle={this.state.customAnimation ? { transition: transitions } : null}
            zIndex={3}
            // duration={duration}
            >
            {({ position, isResizing }) =>
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: 'black'
              }}>
                <div onClick={()=>this.renderDrawer(null)}
                  style={{
                  position: 'absolute',
                  zIndex: 1,
                  left: '10px',
                  top: '10px',
                }}><img src="/static/left-arrow.png" size="20px"></img></div>
                {this.state.currentDrawer === 'itnierary' ? <ItineraryView></ItineraryView> : null}
                {this.state.currentDrawer === 'pois' ? <PoiView setPois={this.setPois}></PoiView>: null }
                {this.state.currentDrawer === 'start' ? <Start closeDrawer={this.renderDrawer}/> : null}

              </div>
            }
          </Dock>

          

</nav>
      <style jsx>{`
      #map { position:absolute; top:0; bottom:0; width:100%; }
      nav {
        font: 20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
        font-weight: 600;
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 1;
        border-radius: 3px;
        max-width: 20%;
        color: #fff;

    }

    label {
        border-radius: 0 0 3px 3px;
        padding: 20px;
    }
      `}
      </style>
      </div>
    )
  }
}
export default connect(
  null,
  dispatch => ({
    setWaypoint: setWaypointsAction(dispatch),
    setLine: setLineAction(dispatch)
  })
)(DynamicMap)
