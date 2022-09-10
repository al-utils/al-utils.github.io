var queryString = window.location.search
var urlParams = new URLSearchParams(queryString)
var userQuery = urlParams.get('user')
var pageEle = document.getElementById('page')

if (userQuery !== '' && userQuery !== null) {
    search()
}

function enter(ele) {
    if (event.key === 'Enter' && user !== '') {
        var user = document.getElementById('search-input').value
        window.open('/lookup/?user=' + user, '_self')
    }
}

function search() {
    var user = urlParams.get('user')
    if (user == '' || user === null) {
        return
    }

    document.getElementById('reset').innerHTML = `
    <div class="page" id="page" style="display:none;">
        <div class="title" id="title">
            
        </div>
        <div class="body">
            
            <div id="banner"></div>
            <div class="left">
                <img id="avatar" width="230"></img>
                <p id="name"></p>
                <p id="id"></p>
                <a id="avatar-link" target="_blank" rel="noopener nonreferrer">Avatar</a>
                |&nbsp<a id="banner-image" target="_blank" rel="noopener nonreferrer">Banner</a>
                |&nbsp<a id="site-url" target='_blank' rel='noopener nonreferrer'>URL</a>
            </div>
            <div class="right">
                <p id="created-at"></p>
                <p id="updated-at"></p>
                <p id="donator"><u>Donator</u>: </p>
                <p id="donator-tier"></p>
                <p id="donator-badge"></p>
                <br>
                <br>
                <div class="previous-names" id="previous-names"><u>Previous Names</u>: </div>
                <br>
                <p id="following"></p>
                <p id="followers"></p>
            </div>
            <div class="about-title">Raw About: </div>
            <pre class="about" id="about"></pre>
        </div>
    </div>
    <div id="error" style="display:none;">
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
            document.getElementById('error').style.display = ''
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
    document.title = '@' + name + ' | al-utils'
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
    document.getElementById('page').style.display = ''

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
        var following = document.getElementById('following')
        var followers = document.getElementById('followers')
        following.textContent = 'Following: ' + data['data']['following']['pageInfo']['total']
        followers.textContent = 'Followers: ' + data['data']['followers']['pageInfo']['total']
    }
}

// good luck to future me when i try to fix this code