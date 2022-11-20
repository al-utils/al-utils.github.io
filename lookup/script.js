var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)
var userQuery = urlParams.get('user')
var pageEle = document.getElementById('page')

if (userQuery !== '' && userQuery !== null) {
    users = userQuery.split(',')
    for (user of users) {
        search(user)
    }
}

function enter(ele) {
    var user = document.getElementById('search-input').value
    if (event.key === 'Enter' && user !== '') {
        addUser()
    }
}

function newSearch() {
    var user = document.getElementById('search-input').value
    user = user.replaceAll(', ', ',')
    window.open('/lookup/?user=' + user, '_self')
}

function addUser() {
    var s = document.getElementById('search-input')
    var users = s.value.replaceAll(', ', ',')
    users = users.split(',')
    for (user of users) {
        search(user)
    }
    s.value = ''
    s.focus()
}

function search(user) {
    if (user == '' || user === null) {
        return
    }

    document.getElementById('reset').innerHTML += `
    <div class="page" id="page-${user}" style="display:none;">
        <div class="body">
            
            <div id="banner-${user}" class="banner"></div>
            <div class="left">
                <img id="avatar-${user}" width="230"></img>
                <p id="name-${user}"></p>
                <p id="id-${user}"></p>
                <a id="avatar-link-${user}" target="_blank" rel="noopener nonreferrer">Avatar</a>
                |&nbsp<a id="banner-image-${user}" target="_blank" rel="noopener nonreferrer">Banner</a>
                |&nbsp<a id="site-url-${user}" target='_blank' rel='noopener nonreferrer'>URL</a>
            </div>
            <div class="right">
                <p id="created-at-${user}"></p>
                <p id="updated-at-${user}"></p>
                <p id="donator-${user}"><u>Donator</u>: </p>
                <p id="donator-tier-${user}"></p>
                <p id="donator-badge-${user}"></p>
                <br>
                <br>
                <div class="previous-names" id="previous-names-${user}"><u>Previous Names</u>: </div>
                <br>
                <p id="following-${user}"></p>
                <p id="followers-${user}"></p>
            </div>
            <div class="about-title">Raw About: </div>
            <pre class="about" id="about-${user}"></pre>
        </div>
    </div>
    <div id="error-${user}" class="page" style="display:none;">
        (&nbsp!&nbsp) User not found
    </div>
    `

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
                name: user
            }
        })
    }
    fetch(url, options).then(handleResponse)
        .then(handleData)
        .catch((error) => {
            // console.log(error)
            document.getElementById('error-' + user).style.display = ''
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
    
    var n = name.toLowerCase()

    document.getElementById('id-' + n).textContent = 'ID: ' + id
    document.getElementById('name-' + n).textContent = 'Name: ' + name
    document.title = '@' + name + ' | al-utils'
    document.getElementById('about-' + n).textContent = about
    document.getElementById('avatar-' + n).src = avatarLarge
    document.getElementById('avatar-link-' + n).href = avatarLarge
    document.getElementById('banner-' + n).style.backgroundImage = `url('${bannerImage}')`
    document.getElementById('banner-image-' + n).href = bannerImage
    document.getElementById('site-url-' + n).href = siteUrl
    if (donatorTier > 0) {
        document.getElementById('donator-tier-' + n).textContent = 'Donator Tier: ' + donatorTier
        document.getElementById('donator-badge-' + n).textContent = 'Donator Badge: ' + donatorBadge
    } else {
        document.getElementById('donator-' + n).style.display = 'none'
        document.getElementById('donator-tier-' + n).style.display = 'none'
        document.getElementById('donator-badge-' + n).style.display = 'none'
    }
    document.getElementById('created-at-' + n).textContent = `Joined: ${createdAt.getMonth() + 1}/${createdAt.getDate()}/${createdAt.getFullYear()}`
    document.getElementById('updated-at-' + n).textContent = `Last Updated: ${updatedAt.getMonth() + 1}/${updatedAt.getDate()}/${updatedAt.getFullYear()}`

    var div = document.getElementById('previous-names-' + n)
    if (previousNames.length == 0) {
        var none = document.createElement('p')
        none.textContent = '- - -'
        div.append(none)
    }
    Object.keys(previousNames).forEach(function(key) {
        var name = document.createElement('p')
        name.textContent = previousNames[key]['name']
        var start = new Date(previousNames[key]['createdAt'] * 1000)
        var end = new Date(previousNames[key]['updatedAt'] * 1000)
        name.title = `${start.getMonth()}/${start.getDate()}/${start.getFullYear()} - ${end.getMonth()}/${end.getDate()}/${end.getFullYear()}`
        div.append(name)
    })
    document.getElementById('page-' + n).style.display = ''

    var url = 'https://graphql.anilist.co'
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: `query ($id: Int!) {
                        followers: Page (page: 1, perPage: 1) {
                            pageInfo {
                                total
                            }
                            followers (userId: $id) {
                                id
                            }
                        }
                        following: Page (page: 1, perPage: 1) {
                            pageInfo {
                                total
                            }
                            following (userId: $id) {
                                id
                            }
                        }
                    }`,
            variables: {
                id: id
            }
        })
    }
    fetch(url, options).then(handleResponseFollow)
        .then(handleDataFollow)
        .catch((error) => {
            // console.log(error)
        })

    function handleResponseFollow(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }

    function handleDataFollow(data) {
        var following = document.getElementById('following-' + n)
        var followers = document.getElementById('followers-' + n)
        following.textContent = 'Following: ' + data['data']['following']['pageInfo']['total']
        followers.textContent = 'Followers: ' + data['data']['followers']['pageInfo']['total']
    }
}

// good luck to future me when i try to fix this code
