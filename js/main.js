"use strict";

var apiKey = "9da26ae1350cf4c9c3501f0257e754dd";
var moviesToShow = 5; // Up to 20 (1 page at TMDb API)

var tmdbEndpoint = "https://api.themoviedb.org/3";


var inTheatersButton = document.querySelector("#in-theaters");
var popularsButton = document.querySelector("#populars");
var searchbox = document.querySelector("#searchbox");
var modal = document.querySelector("#modal-container");
var modalCloseButton = document.querySelector(".close");

modalCloseButton.onclick = function () {
    modal.style.opacity = 0;
    modal.style.visibility = "hidden";
};

modal.onclick = function (e) {
    if (e.target === modal) {
        modal.style.opacity = 0;
        modal.style.visibility = "hidden";
    }
};

function openPopular() {
    if (document.querySelector("a.active") === popularsButton) return;
    callTmdbEndpoint(generateRequestURI("popular"), function (response) {
        inTheatersButton.className = "";
        popularsButton.classList = "active";
        refreshMoviesList(JSON.parse(response).results, moviesToShow);
    });
}

function openInTheaters() {
    if (document.querySelector("a.active") === inTheatersButton) return;    
    callTmdbEndpoint(generateRequestURI("now_playing"), function (response) {
        inTheatersButton.className = "active";
        popularsButton.className = "";
        refreshMoviesList(JSON.parse(response).results, moviesToShow);
    });
}

function searchMovie() {
    var query = searchbox.value;
    if (query === "") return;
    callTmdbEndpoint(generateRequestURI("search", query), function (response) {
        var tmdbResults = JSON.parse(response).results;
        if (tmdbResults.length === 0) {
            console.log("A pesquisa encontrou nada!");
            return;
        }
        inTheatersButton.className = "";
        popularsButton.className = "";
        refreshMoviesList(tmdbResults, moviesToShow);
    });
}

function generateRequestURI(request, query) {
    var uri = tmdbEndpoint;
    if (request === "search") {
        uri += "/search/movie?include_adult=false&query=" + encodeURIComponent(query) + "&";
    } else {
        uri += "/movie/" + request + "?";
    }
    return uri + "page=1&region=BR&language=pt-BR&api_key=" + apiKey;
}

function callTmdbEndpoint(requestURI, callback) {
    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            callback(this.responseText);
        }
    });

    xhr.addEventListener("timeout", function () {
        throw ("Request timed out!");
    });

    xhr.open("GET", requestURI, true);

    xhr.send();
}

function refreshMoviesList(tmdbResults, qty) {
    var newItems = "";
    for (var i = 0; i < qty; i++) {
        newItems += '<div class="movie-general" id="movie' + i + '" onclick=showMovieDetails(' + tmdbResults[i].id + ')>' +
            '<img class="movie-img" src="http://image.tmdb.org/t/p/w185' + tmdbResults[i].poster_path + '" alt="Poster ' + tmdbResults[i].title + '">' +
            '<p class="movie-name">' + tmdbResults[i].title + '</p>' +
            '<p>Estréia: ' + invertDateString(tmdbResults[i].release_date) + '</p>' +
            '</div>\n';
    }
    document.querySelector("main").innerHTML = newItems;
}

function invertDateString(dateString) {
    var lista = dateString.split("-");
    return lista[2] + "-" + lista[1] + "-" + lista[0];
}

function showMovieDetails(id) {
    modal.style.opacity = 1;
    modal.style.visibility = "visible";
}