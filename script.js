var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)
var userQuery = urlParams.get('user')
var pageEle = document.getElementById('page')

function sendError(message) {
    var ele = document.createElement('div')
    ele.classList.add('error')
    ele.addEventListener("click", function() {
        ele.style.opacity = 0
        setTimeout(function () {
            errors.removeChild(ele)
        }, 500);
    })
    ele.innerHTML = '(&nbsp<span style="color: yellow">!</span>&nbsp) ' + message
    errors = document.getElementById('errors')
    errors.appendChild(ele)

    setTimeout(function () {
        ele.style.opacity = 0
        setTimeout(function () {
            errors.removeChild(ele)
        }, 500);
    }, 5000);
}

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}