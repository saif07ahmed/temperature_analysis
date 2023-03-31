//TAG: Global Variables

let gday = 25;
let gmonth = 1;
let map;
let timeoutId = null;
let data = {};

//TAG: CONSTANTS
const submit = document.querySelector("#btnSubmit");
const body = document.getElementsByTagName("body")[0];
const form = document.querySelector("#from");
const daySelected = document.querySelector("#day");
const monthSelected = document.querySelector("#month");

//const baseUrl = `http://127.0.0.1:8000/v1`;
const baseUrl = `https://temperatures2.saifahmed60.repl.co/data`;
let markersArr = [];

// TAG: MAPBOX APIS AND SETTINGS
mapboxgl.accessToken =
  "pk.eyJ1IjoieWFzaGdvZWwyOCIsImEiOiJjbGVjbjR1dGMxa3VyM3ZvNmszbWJiZjh2In0.mIWb0Fb03iisO3DHakRX9w";
const getMap = () => {
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // v11 for 2d and v12 for 3d
    center: [-97, 38], // starting position [lng, lat]
    zoom: 3.5, // starting zoom
  });
  return map;
};

//TAG: ADD MARKERS
async function addMarker(coordinates) {
  const marker2 = new mapboxgl.Marker({
    color: "black",
    rotation: 45,
  })
    .setLngLat([coordinates[0], coordinates[1]])
    .setPopup(
      new mapboxgl.Popup({
        offset: 25,
      }).setHTML()
    )
    .addTo(map);
  return marker2;
}

//TAG: EVENT LISTENERS

window.onload = async () => {
  markersArr = [];
  map = getMap();
  data = await fetchDivisons();
  daySelected.value = gday;
  monthSelected.value = gmonth;
  plotMarkers(data);
};

submit.addEventListener("click", async (e) => {
  e.preventDefault();
  
  let day = daySelected.value;
  let month = monthSelected.value;
  const topCoordinates = map.getBounds()._ne;
  const endCoordinates = map.getBounds()._sw;
  const centerLang = topCoordinates.lng / 2 + endCoordinates.lng / 2;
  const centerLat = topCoordinates.lat / 2 + endCoordinates.lat / 2;


  gday = day ? day : gday;
  gmonth = month ? month : gmonth;

  // map.easeTo({
  //   zoom: 5,
  //   center: [centerLang, centerLat],
  //   duration: 500,
  //   easing: function (t) {
  //     return t;
  //   },
  // });

  markersArr = [];
  data = await fetchDivisons();
  plotMarkers(data);
});

async function fetchDivisons() {
  let resp = await fetch(`${baseUrl}/cities`);
  let json = await resp.json();
  return json;
}

async function fetchCoordinates(loc) {
  let coordinates = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc}.json?limit=2&access_token=pk.eyJ1IjoieWFzaGdvZWwyOCIsImEiOiJjbGVjbjR1dGMxa3VyM3ZvNmszbWJiZjh2In0.mIWb0Fb03iisO3DHakRX9w`
  );
  let json = await coordinates.json();
  return json;
}

//TAG: PLOT RELATED FUNCTIONS
const plotMarkers = (divData) => {
  divData.forEach(async (div) => {
    let loc = div.city;
    const resp = await fetchCoordinates(loc);
    addMarker(resp.features[0].geometry.coordinates).then((marker) => {
      marker._element.onclick = (e) => PopupHandler(loc, e, marker);

      marker.getPopup()._content.id = "charts";
      marker.getPopup()._content.innerText = "Loading..";
      markersArr.push(marker);
    });
  });
};

async function fetchYearRangeData(loc) {
  const json = await fetch(
    `https://temperatures2.saifahmed60.repl.co/data/day/month?city=${loc}&month=${gmonth}&day=${gday}`
  );
  const jsonResp = await json.json();
  return jsonResp;
}

async function PopupHandler(loc, e, marker) {
  const yearData = await fetchYearRangeData(loc);
  const resp = convertDataToGraphCoOrdinates(yearData);
  const popup = marker.getPopup();
  body.onclick=()=>{
    marker.remove()
  }
  if (resp.length == 0) {
    popup._content.style.width = "100px";
    popup._content.style.height = "50px";
    popup._content.style.fontWeight = "500";
    popup._content.style.fontSize = "15px";
    popup._content.innerText = "No record found";
    return;
  }
  //modal.style.display = "block";
  plotGraph(resp, loc,yearData);
  const clickpos = { y: e.clientX, x: e.clientY };
  const mappos = {
    top: map._canvas.getBoundingClientRect().top,
    bottom: map._canvas.getBoundingClientRect().bottom,
    right: map._canvas.getBoundingClientRect().right,
    left: map._canvas.getBoundingClientRect().left,
    centerx:
      map._canvas.getBoundingClientRect().top / 2 +
      map._canvas.getBoundingClientRect().bottom / 2,
    centery:
      map._canvas.getBoundingClientRect().left / 2 +
      map._canvas.getBoundingClientRect().right / 2,
  };

  if (
    clickpos.x >= mappos.top &&
    clickpos.x <= mappos.centerx &&
    clickpos.y >= mappos.left &&
    clickpos.y <= mappos.centery
  ) {
    marker.getPopup().setOffset("top");
  } else if (
    clickpos.x >= mappos.centerx &&
    clickpos.x <= mappos.bottom &&
    clickpos.y >= mappos.left &&
    clickpos.y <= mappos.centery
  ) {
    marker.getPopup().setOffset("bottom");
  } else if (
    clickpos.x >= mappos.centerx &&
    clickpos.x <= mappos.bottom &&
    clickpos.y >= mappos.centery &&
    clickpos.y <= mappos.right
  ) {
    marker.getPopup().setOffset("bottom");
  } else {
    marker.getPopup().setOffset("top");
  }
}

function convertDataToGraphCoOrdinates(arr) {
  const arrXY = [];
  arr.forEach((ele) => {
    arrXY.push(parseFloat(ele.temperature));
  });
  return arrXY;
}

async function plotGraph(arr, loc,yearData) {
  console.log(loc)
  years=yearData.map(item=>{
    return item.year
  })
  // let chart = await new CanvasJS.Chart("charts", {
  //   exportEnabled: true,
  //   theme: "light1",
  //   title: {
  //     text: `Year Wise Temp For ${loc}`,
  //   },
  //   axisY: {
  //     includeZero: true,
  //   },
  //   data: [
  //     {
  //       type: "column",
  //       indexLabelFontColor: "#5A5757",
  //       indexLabelFontSize: 16,
  //       indexLabelPlacement: "outside",
  //       dataPoints: arr,
  //     },
  //   ],
  // });
  // await chart.render();
  Highcharts.chart("charts", {
    chart: {
      type: "line",
      width: 800,
    },
    title: {
      text: `Temperature over the Years for ${loc}`,
    },
    xAxis: {
      categories:years,
      accessibility: {
        rangeDescription: "Range: 1995 to 2019",
      },
      crosshair: {
        width: 1,
        color: "grey",
        dashStyle: "dot",
      },
    },
    yAxis: {
      title: {
        text: "Average Temperature in Celcius",
      },
    },
    series: [
      {
        name: "MAX TEMPERATURE",
        data: arr, // set the CO2 values as series data
        // type:"area"
      },
    ],
  });
}

function compare(a, b) {
  if (a.label < b.label) {
    return -1;
  }
  if (a.label > b.label) {
    return 1;
  }
  return 0;
}
