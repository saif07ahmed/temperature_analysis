async function fetchCities() {
  const response = await fetch('https://Temperatures2.saifahmed60.repl.co/data/cities');
  const data = await response.json();
  displayCities(data)
}

fetchCities()
function displayCities(data) {
  const cityList = data.map(item => item.city)
  console.log(cityList)
  const select = document.getElementById('citySelect');
  cityList.forEach((item) => {
    const option = document.createElement("option");
    option.textContent = item;
    select.appendChild(option);
  });
}

function typeSelection() {
  const selection = document.getElementById('typeSelect').value
  if (selection == 'monthWise') {
    document.getElementById('yearSelect').style.display = 'block'
    fetchYears()
  }
  else if (selection == 'yearWise') {
    document.getElementById('yearSelect').style.display = 'none'
  }
  else {
    document.getElementById('yearSelect').style.display = 'none'
  }
}


async function fetchYears() {
  const cityOption = document.getElementById('citySelect').value
  console.log(cityOption)
  const response = await fetch(`https://Temperatures2.saifahmed60.repl.co/data/years?city=${cityOption}`);
  const data = await response.json();
  console.log(data)
  displayYears(data)
}


function displayYears(data) {
  const yearList = data.map(item => item.year)
  console.log(yearList)
  const select = document.getElementById('yearSelect');
  yearList.forEach((item) => {
    const option = document.createElement("option");
    option.textContent = item;
    select.appendChild(option);
  });
}

async function visualise() {
  const city = document.getElementById('citySelect').value
  const selection = document.getElementById('typeSelect').value
  if (selection == 'monthWise') {
    const year = document.getElementById('yearSelect').value
    const response = await fetch(`https://Temperatures2.saifahmed60.repl.co/data/month?city=${city}&year=${year}`);
    const data = await response.json();
    plotGraph(data, 'Months', city, year)
  }
  else if (selection == 'yearWise') {
    const response = await fetch(`https://Temperatures2.saifahmed60.repl.co/data/year?city=${city}`);
    const data = await response.json();
    console.log(data)
    plotGraph(data, 'Years', city)
  }
  else {
    const response = await fetch(`https://Temperatures2.saifahmed60.repl.co/data/days?city=${city}`);
    const data = await response.json();
    plotGraph(data, 'Days', city)
  }
}

function plotGraph(data, type, city, year = "N/A") {
  // console.log(data)
  const tickIntervalVal = type == 'Years' ? 1 : 1
  const years = data.map(item => {
    return item["year"]
  })
  const months = data.map(item => {
    return item["months"]
  })
  const days = data.map(item => {
    return item["days"]
  })
  const monthsInYear = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  let yearsData = []
  if (type == 'Days') {
    dailyTemps = data.map(item => {
      item = item['array_agg'].map(i => {
        x=parseFloat(i)
        return parseFloat(x.toFixed(2))
      })
      return item
    })
    for (let i = 0; i < dailyTemps.length; i++) {
      const obj = { name: years[i], data: dailyTemps[i] }
      yearsData.push(obj)
    }
    const interval = Math.floor(yearsData.length / 3);
    const middle1 = yearsData[interval];
    const middle2 = yearsData[interval * 2];
    yearsData = [yearsData[0], middle1, middle2, yearsData[yearsData.length - 2]]
    // console.log(yearsData)
  }
  categoryVal = type == "Years" ? years : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const maxTemps = data.map(item => {
    return parseInt(item['max_temp'])
  })
  const minTemps = data.map(item => {
    return parseInt(item['min_temp'])
  })
  if (type != 'Days') {

    //CHART
    Highcharts.chart('container', {
      chart: {
        type: 'line',
        width: 1000,
        height: 700
      },
      title: {
        text: type == 'Years' ? `Average Temperature for ${city} over the Years` : `Average Temperature for ${city} for ${year}`
      },
      xAxis: {
        categories: categoryVal,
        tickInterval: tickIntervalVal,
        startOnTick: true,
        endOnTick: true,
        crosshair: {
          width: 1,
          color: 'grey',
          dashStyle: 'dot'
        }
      },
      yAxis: {
        title: {
          text: 'Average Temperature in Celcius'
        }
      },
      plotOptions: {
        area: {
          fillColor: '#b3d7ff' // light blue color
        }
      },
      //   tooltip: {
      //     formatter: function () {
      //         // Access the x-axis label for this point
      //         if (type=="Month"){
      //           let yearD = this.x;
      //           const response = await fetch(`localhost:700/data/day/?city=Delhi&month=&year=${yearD}`);
      //           const data = await response.json();
      //           console.log("ye hai")                
      //           console.log(data)
      //           // let additionalData = ...;
      //           // Return the formatted tooltip text
      //           return yearD 
      //         }
      //     }
      // },
      series: [
        {
          name: 'MAX TEMPERATURE',
          data: maxTemps, // set the CO2 values as series data
          // type:"area"
        },
        {
          name: 'MIN TEMPERATURE',
          data: minTemps, // set the CO2 values as series data
          // type:"area"
        }
      ],

    });
  }
  else {
    Highcharts.chart('container', {
      chart: {
        type: 'line',
        width: 1100,
        height: 600
      },
      title: {
        text: `Daily Temperature for ${city}`
      },
      xAxis: {
        labels: {
          formatter: function() {
            const date = getMonthAndDate(this.value);
            return `${monthsInYear[date.month]}`;
          }
        },
        crosshair: {
          width: 1,
          color: 'grey',
          dashStyle: 'dot'
        },
        title: {
          text: 'Days in a year'
        }

      },
      yAxis: {
        title: {
          text: 'Temperature in Celsius'
        },
        crosshair: {
          width: 1,
          color: 'grey',
          dashStyle: 'dot'
        },
      },
      tooltip: {
        formatter: function () {
          let day = this.x;
          const date = getMonthAndDate(day)
          return `${monthsInYear[date.month]} ${date.day},${this.series.name}<br>Temperature:${this.y}°C`
          // }
        }
      },
      series: yearsData // array of objects with data for each year (e.g. [{name: '2019', data: [25, 26, ...]}, {name: '2020', data: [24, 23, ...]}, ...])
    });

    h2text = document.createElement('h2')
    h2text.innerHTML = 'Click on the years to toggle turn on/off'
    document.getElementById('container').appendChild(h2text)
  }
}

function getMonthAndDate(dayOfYear) {
  var date = new Date(new Date().getFullYear(), 0); // create a new date object for January 1st of the current year
  date.setDate(dayOfYear); // set the day of the year
  var month = date.getMonth(); // get the month (0-11)
  var day = date.getDate(); // get the date (1-31)
  return { month: month, day: day };
}
