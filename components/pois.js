const content = [{
  type: "hotels",
  img: "/static/bed.png"
},
{
  type:"history",
  img:"/static/history.png"
},
  {
    type:"museums",
      img:"/static/library.png"
  },
  {
    type:"food",
      img:"/static/restaurant.png"
  },
  {
    type:"parks",
      img:"/static/mountain.png"
  },
];
class PoiView extends React.Component {
  constructor(props) {
    super(props);
}
    render() {
    return (

        <table>
          {content.map((div, i) => {
            return <td scope="col" className="columns" style={{padding: '15px'}}>
              <img key ={i} onClick={this.props.setPois.bind(this, div.type)} src={div.img} />
              <div key={div.type} >{div.type}</div>
              </td>
          })}
          {/* {content.map(div=>{
          return <th scope="row" className="rows">
          </th>
          })} */}
        </table> 
      // content.map(div=>{
      //   return  <div class="card" style={{width: '18rem'}}>
      //     <img onClick={this.props.setPois.bind(this, div.type)} class="card-img-top" src={div.img} alt="Card image cap" />
      //       <div class="card-body">
      //         <p class="card-text">{div.type}</p>
      //       </div>
      //       </div>
    )
  }
}
export default PoiView
