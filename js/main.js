"use strict";

var apiKey = "9da26ae1350cf4c9c3501f0257e754dd";
var moviesToShowInTheaters = 3; // Up to 20 (1 page at TMDb API)
var moviesToShowPopular = 5;
var moviesToShowSearch = 9;

var tmdbEndpoint = "https://api.themoviedb.org/3";

var inTheatersButton = document.querySelector("#in-theaters");
var popularsButton = document.querySelector("#populars");
var searchbox = document.querySelector("#searchbox");
var movieModal = document.querySelector("#modal-container");
var modalContent = document.querySelector("#modal-container .modal-content");
var modalCloseButton = document.querySelector("#modal-container .close");
var modalPoster = document.querySelector("#modal-poster");
var movieTitle = document.querySelector("#movie-title");
var modalOverview = document.querySelector("#modal-overview");
var modalDate = document.querySelector("#modal-date");
var modalGenres = document.querySelector("#modal-genres");
var modalRuntime = document.querySelector("#modal-runtime");
var modalDirectors = document.querySelector("#modal-directors");
var modalCast = document.querySelector("#modal-cast");
var modalTmdb = document.querySelector("#modal-tmdb");
var modalTrailer = document.querySelector("#modal-trailer");

var errorCloseButton = document.querySelector("#modal-error .close");
var errorModal = document.querySelector("#modal-error");
var errorText = document.querySelector("#error-text");

var loadingContainer = document.querySelector("#loading-container");

modalCloseButton.onclick = function () {
    movieModal.style.opacity = 0;
    movieModal.style.visibility = "hidden";
};

movieModal.onclick = function (e) {
    if (e.target === movieModal) {
        movieModal.style.opacity = 0;
        movieModal.style.visibility = "hidden";
    }
};

errorCloseButton.onclick = function () {
    errorModal.style.opacity = 0;
    errorModal.style.visibility = "hidden";
};

errorModal.onclick = function (e) {
    if (e.target === errorModal) {
        errorModal.style.opacity = 0;
        errorModal.style.visibility = "hidden";
    }
};

function openPopular() {
    if (document.querySelector("a.active") === popularsButton) return;
    showLoadingScreen();
    callTmdbEndpoint(generateRequestURI("popular"), function (response) {
        inTheatersButton.className = "";
        popularsButton.classList = "active";
        refreshMoviesList(JSON.parse(response).results, moviesToShowInTheaters);
        hideLoadingScreen();
    });
}

function openInTheaters() {
    if (document.querySelector("a.active") === inTheatersButton) return;
    showLoadingScreen();
    callTmdbEndpoint(generateRequestURI("now_playing"), function (response) {
        inTheatersButton.className = "active";
        popularsButton.className = "";
        refreshMoviesList(JSON.parse(response).results, moviesToShowPopular);
        hideLoadingScreen();
    });
}

function searchMovie() {
    var query = searchbox.value;
    if (query === "") return;
    callTmdbEndpoint(generateRequestURI("search", query), function (response) {
        var tmdbResults = JSON.parse(response).results;
        if (tmdbResults.length === 0) {
            showErrorMessage("Nada foi encontrado!");
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
        uri += "/movie/" + query + "?append_to_response=videos,credits&";
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
            if (xhr.status === 200) {
                callback(this.responseText);
            } else {
                showErrorMessage();
            }
        }
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

function showLoadingScreen() {
    loadingContainer.style.opacity = 1;
    loadingContainer.style.visibility = "visible";
}

function hideLoadingScreen() {
    loadingContainer.style.opacity = 0;
    loadingContainer.style.visibility = "hidden";
}

function showErrorMessage(msg) {
    hideLoadingScreen();
    if (msg === undefined) {
        errorText.innerHTML = "Erro ao obter informações!";
    } else {
        errorText.innerHTML = msg;
    }
    errorModal.style.opacity = 1;
    errorModal.style.visibility = "visible";
}

function showMovieDetails(id) {
    showLoadingScreen();
    callTmdbEndpoint(generateRequestURI("movie", id), function (response) {
        var movie = JSON.parse(response);
        movieModal.style.opacity = 1;
        movieModal.style.visibility = "visible";
        // Título
        movieTitle.innerHTML = movie.title;
        // Resumo
        modalOverview.innerHTML = movie.overview;
        // Data de streia
        modalDate.innerHTML = "Data de estreia: " + invertDateString(movie.release_date);
        // Gêneros
        var genresStr = "Gêneros: ";
        var i = 0;
        for (; i < movie.genres.length; i++) {
            genresStr += movie.genres[i].name + ", ";
        }
        modalGenres.innerHTML = i === 0 ? "" : genresStr.substr(0, genresStr.length - 2);
        // Tempo de exibição
        modalRuntime.innerHTML = "Tempo de Exibição: " + Math.floor(movie.runtime / 60) + "h" + movie.runtime % 60;
        // Diretores
        var directorsStr = "";
        var count = 0;
        for (i = 0; i < movie.credits.crew.length; i++) {
            if (movie.credits.crew[i].job === "Director") {
                directorsStr += movie.credits.crew[i].name + ", ";
                count++;
            }
        }
        if (count === 1) {
            modalDirectors.innerHTML = "Diretor: " + directorsStr.substr(0, directorsStr.length - 2);
        } else if (count === 0) {
            modalDirectors.innerHTML = "";
        } else {
            modalDirectors.innerHTML = "Diretores: " + directorsStr.substr(0, directorsStr.length - 2);
        }
        // Elenco
        modalCast.innerHTML = "Elenco: ";
        for (i = 0; i < movie.credits.cast.length && i < 4; i++) {
            modalCast.innerHTML += movie.credits.cast[i].name + ", ";
        }
        modalCast.innerHTML += movie.credits.cast[i].name;
        // TMDb link
        modalTmdb.href = "https://www.themoviedb.org/movie/" + movie.id;
        // Trailer
        var trailerId = "";
        var videos = movie.videos.results;
        for (i = 0; i < videos.length; i++) {
            if (videos[i].site === "YouTube" && videos[i].type === "Trailer") {
                trailerId = videos[i].key;
                break;
            }
        }
        if (trailerId.length > 1) {
            modalTrailer.href = "https://youtu.be/" + trailerId;
            modalTrailer.innerHTML = "Abrir trailer";
        } else {
            modalTrailer.href = "";
            modalTrailer.innerHTML = "";
        }
        // Poster
        modalPoster.src = "http://image.tmdb.org/t/p/w342" + movie.poster_path;
        // Background
        if (movie.backdrop_path !== null) {
            modalContent.style.background = "linear-gradient(rgba(0, 0, 0, 0.90), rgba(0, 0, 0, 0.90)), url(http://image.tmdb.org/t/p/w780/" + movie.backdrop_path + ")";
            modalContent.style.backgroundRepeat = "no-repeat";
            modalContent.style.backgroundSize = "cover";
        } else {
            modalContent.style.backgroundImage = "";
            modalContent.style.backgroundColor = "rgb(48, 48, 48)";
        }

        hideLoadingScreen();
    });
}