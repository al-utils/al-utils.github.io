var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)
var userQuery = urlParams.get('user')

var pageEle = document.getElementById('page')

if (userQuery == '') {
    window.open('/lookup', '_self')
} else if (userQuery !== null) {
    pageEle.style.display = ''
}

function search(ele) {
    if (event.key === 'Enter') {
        user = ele.value
        window.open(`/lookup/?user=${user}`, '_self')
    }
}

var url = 'https://graphql.anilist.co'
var options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query: `query ($name: String) {
                    User (name: $name) {
                        id
                        name
                        about
                        avatar {
                            large
                            medium
                        }
                
                        bannerImage
                        siteUrl
                        donatorTier
                        donatorBadge
                        createdAt
                        updatedAt
                
                        previousNames {
                            name
                            createdAt
                            updatedAt
                        }
                    }
                }`,
        variables: {
            name: userQuery
        }
    })
}

if (userQuery) {
    fetch(url, options).then(handleResponse)
                       .then(handleData)
                       .catch((error) => {
                        window.open('/lookup', '_self')
                       })
}

function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    var user = data['data']['User']
    var id = user['id']
    var name = user['name']
    var about = user['about']
    var avatarLarge = user['avatar']['large']
    var bannerImage = user['bannerImage']
    var siteUrl = user['siteUrl']
    var donatorTier = user['donatorTier']
    var donatorBadge = user['donatorBadge']
    var createdAt = new Date(user['createdAt'] * 1000)
    var updatedAt = new Date(user['updatedAt'] * 1000)
    var previousNames = user['previousNames']

    document.getElementById('id').textContent = 'ID: ' + id
    document.getElementById('name').textContent = 'Name: ' + name
    document.getElementById('about').textContent = about    
    document.getElementById('avatar').src = avatarLarge
    document.getElementById('avatar-link').href = avatarLarge
    document.getElementById('banner').style.backgroundImage = `url('${bannerImage}')`
    document.getElementById('banner-image').href = bannerImage
    document.getElementById('site-url').href = siteUrl
    if (donatorTier > 0) {
        document.getElementById('donator-tier').textContent = 'Donator Tier: ' + donatorTier
        document.getElementById('donator-badge').textContent = 'Donator Badge: ' + donatorBadge
    } else {
        document.getElementById('donator').style.display = 'none'
        document.getElementById('donator-tier').style.display = 'none'
        document.getElementById('donator-badge').style.display = 'none'
    }
    document.getElementById('created-at').textContent = `Joined: ${createdAt.getMonth() + 1}/${createdAt.getDate()}/${createdAt.getFullYear()}`
    document.getElementById('updated-at').textContent = `Last Updated: ${updatedAt.getMonth() + 1}/${updatedAt.getDate()}/${updatedAt.getFullYear()}`

    var div = document.getElementById('previous-names')
    Object.keys(previousNames).forEach(function(key) {
        var name = document.createElement('p')
        name.textContent = previousNames[key]['name']
        var start = new Date(previousNames[key]['createdAt'] * 1000)
        var end = new Date(previousNames[key]['updatedAt'] * 1000)
        name.title = `${start.getMonth()}/${start.getDate()}/${start.getFullYear()} - ${end.getMonth()}/${end.getDate()}/${end.getFullYear()}`
        div.append(name)
    })

}