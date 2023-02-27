if (userQuery !== '' && userQuery !== null) {
    if (userQuery.split(',').length > 1 || userQuery.split(' ').length > 1) {
        sendError('Too many users')
    } else {
        search(userQuery)
    }
}

function enter(ele) {
    var user = document.getElementById('search-input').value
    if (event.key === 'Enter' && user !== '') {
        newSearch(user)
    }
}

function searchFormat() {
    var s = document.getElementById('search-input')
    var users = s.value.replaceAll(' ', ',')
    users = users.replaceAll(', ', ',')
    // s.value = ''
    return users
}

function newSearch() {
    user = searchFormat()
    if (user.length == 0) {
        sendError('Search is empty')
        return
    } else if (user.split(',').length > 1) {
        sendError('Too many users')
        var s = document.getElementById('search-input')
        s.value = ''
        return
    }
    window.open('/airing/?user=' + user, '_self')
}

// function airingChart() {

// }

function search(user) {

    // query to get id from name
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
            console.log(error)
            sendError('User not found: ' + user)
            return
        })

    function pages() {
        r = ''
        for (i = 1; i < 50; i++) {
            r += `
            page${i}: Page(page: ${i}, perPage: 50) {
                mediaList(userId: $id, status_in: [CURRENT, PLANNING], type: ANIME) {
                    media {
                        id
                    }
                }
            }
            `
        }
        return r
    }

    function handleData(data) {
        var id = data['data']['User']['id']
    
        // query to get planning and current lists
        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: `
                query ($id: Int) {
                    ${pages()}
                }`,
                variables: {
                    id: id
                }
            })
        }
        fetch(url, options).then(handleResponse)
            .then(handleData)
            .catch((error) => {
                console.log(error)
                sendError("Didn't work (rate-limited?)")
                return
            })

        function handleData(data) {
            mediaIds = []
            for (i = 1; i < 50; i++) {
                page = data['data']['page' + i]['mediaList']
                // break when pages empty
                if (page.length == 0) {
                    break
                }
                // add ids to mediaIds
                for (media of page) {
                    mediaIds.push(media.media.id)
                }
            }

            function pages() {
                r = ''
                for (i = 1; i < 100; i++) {
                    r += `
                    page${i}: Page(page: ${i}, perPage: 50) {
                        airingSchedules(mediaId_in: [${mediaIds}], notYetAired: true) {
                            mediaId
                            episode
                            timeUntilAiring
                        }
                    }
                    `
                    // airingAt
                }
                return r
            }

            var options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                    query {
                        ${pages()}
                    }`
                })
            }
            fetch(url, options).then(handleResponse)
                .then(handleData)
                .catch((error) => {
                    console.log(error)
                    sendError("Didn't work (rate-limited?)")
                    return
                })

            function handleData(data) {
                let seperate = {}
                for (i = 1; i < 100; i++) {
                    page = data['data']['page' + i]['airingSchedules']
                    if (page.length == 0) {
                        break
                    }
                    for (j = 0; j < page.length; j++) {
                        animeId = page[j].mediaId
                        key = '' + animeId
                        if (seperate[key] == undefined) { // doesn't exist
                            seperate[key] = {
                                "episode": page[j].episode,
                                "timeUntilAiring": page[j].timeUntilAiring
                            }
                        }
                        // else if (seperate[key].episode > page[j].episode)
                    }
                }
                // sort
                keys = Object.keys(seperate)
                keys.sort(function(x, y) {
                    return seperate[x].timeUntilAiring - seperate[y].timeUntilAiring
                })
                
                function allMedia(keys) {
                    r = ''
                    for (i = 0; i < keys.length; i++) {
                        r += `
                        a${keys[i]}: Media(id: ${keys[i]}) {
                            title {
                                english
                            }
                            episodes
                            coverImage {
                                extraLarge
                            }
                        }
                        `
                    }
                    return r
                }

                var options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                        query {
                            ${allMedia(keys)}
                        }`
                    })
                }
                fetch(url, options).then(handleResponse)
                    .then(handleData)
                    .catch((error) => {
                        console.log(error)
                        sendError("Didn't work (rate-limited?)")
                        return
                    })
                
                function handleData(data) {
                    grid = document.getElementById('chart')
                    data = data['data']
                    Object.keys(data).forEach(function(key) {
                        ele = document.createElement('a')
                        let id = key.replace('a', '')
                        ele.href = 'https://anilist.co/anime/' + id
                        ele.target = '_blank'

                        if (data[key].episodes == null)
                            data[key].episodes = '?'
                        
                        ele.innerHTML = `
                            <div class="chart-square" style="background-image: url('${data[key].coverImage['extraLarge']}')">
                                <div class="gradient">
                                    <p class="title">${data[key].title['english']}</p>
                                    <div class="sub">
                                        <p style="text-align: left">${secondsToString(seperate[id]['timeUntilAiring'])}</p>
                                        <p style="text-align: right; filter: brightness(0.75)">${seperate[id]['episode']}/${data[key].episodes}</p>
                                    </div>
                                </div>
                            </div>
                        `
                        grid.appendChild(ele)
                    });
                }

                function secondsToString(s) {
                    let d = Math.floor(s / (3600 * 24))
                    let h = Math.floor(s % (3600 * 24) / 3600)
                    return `${d}d${h}h`
                }
            }
        }
    }
}

// at least it works...