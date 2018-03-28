"use strict";

var apiKey = "9da26ae1350cf4c9c3501f0257e754dd";
var moviesToShowInTheaters = 3; // Up to 20 (1 page at TMDb API)
var moviesToShowPopular = 5;
var moviesToShowSearch = 9;

var tmdbEndpoint = "https://api.themoviedb.org/3";

var inTheatersButton = document.querySelector("#in-theaters");
var popularsButton = document.querySelector("#populars");
var searchbox = document.querySelector("#searchbox");
var modal = document.querySelector("#modal-container");
var modalContent = document.querySelector(".modal-content");
var modalCloseButton = document.querySelector(".close");
var modalPoster = document.querySelector("#modal-poster");
var modalTitle = document.querySelector("#modal-title");
var modalDate = document.querySelector("#modal-date");
var modalGenres = document.querySelector("#modal-genres");

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
        refreshMoviesList(JSON.parse(response).results, moviesToShowInTheaters);
    });
}

function openInTheaters() {
    if (document.querySelector("a.active") === inTheatersButton) return;
    callTmdbEndpoint(generateRequestURI("now_playing"), function (response) {
        inTheatersButton.className = "active";
        popularsButton.className = "";
        refreshMoviesList(JSON.parse(response).results, moviesToShowPopular);
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
        refreshMoviesList(tmdbResults, moviesToShowSearch);
    });
}

function generateRequestURI(request, query) {
    var uri = tmdbEndpoint;
    if (request === "search") {
        uri += "/search/movie?include_adult=false&query=" +
            encodeURIComponent(query) + "&page=1&region=BR&";
    } else if (request === "movie") {
        uri += "/movie/" + query + "?";
    } else {
        uri += "/movie/" + request + "?page=1&region=BR&";
    }
    return uri + "language=pt-BR&api_key=" + apiKey;
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
    for (var i = 0; i < qty && i < tmdbResults.length; i++) {
        newItems += '<div class="movie-general" id="movie' + i + '" onclick=showMovieDetails(' + tmdbResults[i].id + ')>' +
            '<img class="movie-img" src="http://image.tmdb.org/t/p/w185' + tmdbResults[i].poster_path + '" alt="Poster ' + tmdbResults[i].title + '">' +
            '<p class="movie-name">' + tmdbResults[i].title + '</p>' +
            '<p>Estreia: ' + invertDateString(tmdbResults[i].release_date) + '</p>' +
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
    callTmdbEndpoint(generateRequestURI("movie", id), function (response) {
        var movie = JSON.parse(response);
        console.log(movie);
        modalTitle.innerHTML = movie.title;
        modalDate.innerHTML = "Data de estreia: " + invertDateString(movie.release_date);
        var genresStr = "Gêneros: ";
        var i = 0;
        for (; i < movie.genres.length; i++) {
            genresStr += movie.genres[i].name + ", ";
        }
        modalGenres.innerHTML = i === 0 ? "nenhum" : genresStr.substr(0, genresStr.length - 2);
        modalPoster.src = "http://image.tmdb.org/t/p/w342" + movie.poster_path;
        if (movie.backdrop_path !== null) {
            modalContent.style.background = "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url(http://image.tmdb.org/t/p/w780/" + movie.backdrop_path + ")";
            modalContent.style.backgroundRepeat = "no-repeat";
            modalContent.style.backgroundSize = "cover";
        } else {
            modalContent.style.backgroundImage = "";
            modalContent.style.backgroundColor = "rgb(48, 48, 48)";
        }
    });
}