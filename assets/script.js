var date = moment().format("L");
// localStorage.clear()
var searchedCity = $(".weather-card-header");
var tempElement = $(".temp");
var humidityElement = $(".humidity");
var windElement = $(".wind");
var uvIndexElement = $(".uvIndex");

let savedSearches = [];
var APIKey = "4392f23b16ef4173136c90ec556dff94";

$(document).ready(function () {
    renderSearchList()
    $(".submit").on("click", function(event) {
        event.preventDefault();

        let citySearch = $('input').val();
        initiateSearch(citySearch);
    })


    $(".clear").click(function(){
        location.reload(true);
        localStorage.clear();
    });

    $("header").click(function() {
        location.reload(true);
    })

    function initiateSearch(cityName) {

        let currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;

        $("<button>").text(cityName).prepend('.history-list')

        $.ajax({
            url: currentWeatherUrl,
            method: "GET"
        })
        .then(function(response) {
            let previousCity = JSON.parse(localStorage.getItem("savedSearches"));
            if (previousCity) {
                previousCity.push(response.name);
                localStorage.setItem("savedSearches", JSON.stringify(previousCity));
            } else {
                savedSearches.push(response.name)
                localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
            }                                                           
            
            let weatherIconCode = response.weather[0].icon;
            var weatherIcon = "http://openweathermap.org/img/wn/" + weatherIconCode + ".png"

            $(".main-icon").attr("src", weatherIcon)
            searchedCity.text(response.name + " " + date + " ");

            let tempConversion = ((response.main.temp - 273.15) * 9/5 + 32).toFixed(2);

            tempElement.text("Temperature: " + tempConversion + "\xB0F");
            humidityElement.text("Humidity: " + response.main.humidity + "%");
            windElement.text("Wind Speed: " + response.wind.speed);

            let latitude = response.coord.lat;
            let longitude = response.coord.lon;
            let uvIndexUrl = "http://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + latitude + "&lon=" + longitude + "&units=imperial";

            $.ajax({
                type: "GET",
                url: uvIndexUrl,
            })
            .then(function (responseUV) {

                $(".uvIndex").text("UV Index: ");
                let highlightValue = $("<span class='badge' id='current-uv-level'>").text(responseUV.value);
                $(".uvIndex").append(highlightValue);
                if (responseUV.value >= 0 && responseUV.value < 3) {
                    $(highlightValue).addClass("highlight-good");
                } else if (responseUV.value >= 3 && responseUV.value < 6) {
                    $(highlightValue).addClass("highlight-mild");
                } else if (responseUV.value >= 6 && responseUV.value < 8) {
                    $(highlightValue).addClass("highlight-warning");
                } else if (responseUV.value >= 8 && responseUV.value < 11) {
                    $(highlightValue).addClass("highlight-veryhigh");
                } else if (responseUV.value >= 11) {
                    $(highlightValue).addClass("highlight-danger");
                }

            })
            renderSearchList();
            forecastSearch(cityName);
        });

    }

    function forecastSearch(cityName) {
        $(".card").empty();
        
        var weatherUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + APIKey;

        for(let i = 0; i < 5; i++) {    

            let selectArr = 2 + (i * 8);
            
            $.ajax({
                url: weatherUrl,
                method: "GET"
            })
            .then(function(responseForecast) {

                let forecastIconCode = responseForecast.list[selectArr].weather[0].icon;
                var weatherIcon = "http://openweathermap.org/img/wn/" + forecastIconCode + ".png"

                let forecastConversion = ((responseForecast.list[selectArr].main.temp - 273.15) * 9/5 + 32).toFixed(2);
                

                let forecastCard = $("<div>").addClass("card-body");

                let date = (moment.unix(responseForecast.list[selectArr].dt).format("MM/DD/YYYY"));
                let forecastDate = $("<h5>").text(date);
                forecastDate.addClass("card-title");

                let forecastIcon = $("<img>").attr("src", weatherIcon);

                let forecastTemp = $("<p>").text("Temp: " + forecastConversion + "\xB0F");
                forecastTemp.addClass("card-text");

                let forecastHumidity = $("<p>").text("Humidity: " + responseForecast.list[selectArr].main.humidity + "%");
                forecastHumidity.addClass("card-text");

                forecastCard.append(forecastDate);
                forecastCard.append(forecastIcon);
                forecastCard.append(forecastTemp);
                forecastCard.append(forecastHumidity);
                
                $(".card").append(forecastCard);
            })
        }

    }

    $(document).on("click", ".cityBtn", function () {
        JSON.parse(localStorage.getItem("savedSearches"));
        let cityName = $(this).text();
        initiateSearch(cityName);
    })

    function renderSearchList() {
        let searchList = JSON.parse(localStorage.getItem("savedSearches"));
        $(".search-history").empty();
        if (searchList) {
            for (i = 0; i < searchList.length; i++) {
                let listBtn = $("<button>").addClass("cityBtn").text(searchList[i]);
                let listElem = $("<li>").addClass('history-list');
                listElem.append(listBtn);
                $(".search-history").append(listElem);
            }
        }
    }
})





