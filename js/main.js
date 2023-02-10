/**************************************************** Importation ****************************************************/

import { createApp, ref } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

/**************************************************** General variables ****************************************************/

const geo = ref("")
const weather = ref("")
const city = ref("")
const city_previous = ref("")
const country = ref("ctry")
const country_assoc = ref([""])
const lon = ref("")
const lat = ref("")
const timezone = ref("")
const current_page = ref("input")

/**************************************************** API variables ****************************************************/

const DOMAIN_geo = 'http://api.openweathermap.org/geo/1.0/direct?q='
const DOMAIN_weather = 'https://api.openweathermap.org/data/2.5/weather?lat='
const api_key = '&appid=your_api_key'

/**************************************************** Reset ****************************************************/

//Reset all general viariables to default
function reset() {
    geo.value = ""
    weather.value = ""
    city.value = ""
    city_previous.value = ""
    country.value = "ctry"
    country_assoc.value = [""]
    lon.value = ""
    lat.value = ""
    timezone.value = ""
    current_page.value = "input"
}

/**************************************************** API Functions ****************************************************/

//Get the geographic location by using the city and country entered
function confirmGeo() {
    if (city.value == '' || country.value == '') return
    const url = DOMAIN_geo + city.value + ',' + country.value + '&limit=1&lang=en' + api_key

    fetch(url).then(resp => resp.json()).then(resultat => {
        geo.value = resultat[0]
        city.value = geo.value.name
        country.value = geo.value.country
        lon.value = geo.value.lon
        lat.value = geo.value.lat
        current_page.value = "weather"

        getWeather(lat.value, lon.value)
    })
}

//Associate the country to the city
//It fetches what has been entered in the 'city' input
//If the country selector is clicked and the city has not changed, it does not need another API call
function countryAssoc() {
    if (city.value == city_previous.value) {return}

    const url = DOMAIN_geo+ city.value + '&limit=5&lang=en' + api_key
    country_assoc.value = [""]

    fetch(url).then(resp => resp.json()).then(resultat => {
        resultat.forEach((code) => {
            if (country_assoc.value.indexOf(code.country) === -1) {
                country_assoc.value.push(code.country)
            }
        })
        city_previous.value = city.value
    })
}

//Get the weather with the latitude and longitude from the geo API
function getWeather(lat, lon) {
    const url = DOMAIN_weather + lat + '&lon=' + lon + '&units=metric&lang=en' + api_key

    fetch(url).then(resp => resp.json()).then(resultat => {
        weather.value = resultat
    })
}

/**************************************************** Weather Functions ****************************************************/

//Assign the selected element from the dropdown
function country_select(element) {
    country.value = element
}

//Clear the current assigned country when clicking on the drop down menu
function changeCountry() {
    country.value = ''
}

//Get cardinal point
function cardinalPoint(type, deg) {
    let point = (
        (type == "lat" && deg >= 0) ?  "N" :
        (type == "lat" && deg < 0) ?  "S" :
        (type == "lon" && deg >= 0) ?  "E" : "W"
    )    
    return Math.abs(Math.floor(deg)) + "°" + point
}

//Get wind speed
function windSpeed(speed, deg) {
    let direction = (
        (deg <= 45) ? "N" :
        (deg > 45 && deg <= 135) ? "E" :
        (deg > 135 && deg <= 225) ? "S" :
        (deg > 225 && deg <= 315) ? "W" : "N"
    )
    return Math.floor(speed) + " km/h · " + direction
}

//Get the time for sunrise and sunset
function getTime(timestamp, twilight) {
    let time = new Date((timestamp+twilight)*1000).toUTCString()
    timezone.value = timestamp/3600 + "h"

    return time.slice(-12, -7).replace(":", "h")
}

//Get weather description
function description(desc) {
    return desc.charAt(0).toUpperCase() + desc.slice(1);
}

/**************************************************** Misc ****************************************************/

//Remove the first animation that plays when the body is loaded by removing a class that prevents animation
//See 'body.preload' in CSS for more info
setTimeout(function(){
    document.body.className="";
},1000);

/**************************************************** Return & mount ****************************************************/

const root = {
    setup() {
        return {
            confirmGeo,
            getWeather,
            countryAssoc,
            reset,
            cardinalPoint,
            windSpeed,
            getTime,
            description,
            country_select,
            changeCountry,

            geo,
            weather,
            city,
            country,
            country_assoc,
            lon,
            lat,
            timezone,
            current_page
        }
    }
}

createApp(root).mount("#app")