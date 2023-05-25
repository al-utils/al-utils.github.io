const maxPages = 30

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

function buildQuery(username) {
    r = ''
    for (i = 1; i < maxPages; i++) {
        r += `
        page${i}: Page(page: ${i}, perPage: 50) {
            mediaList(userName: "${username}", status_in: [CURRENT, PLANNING], type: ANIME) {
                media {
                    id
                    title {
                        english
                    }
                    episodes
                    coverImage {
                        extraLarge
                    }
                    nextAiringEpisode {
                        id
                        timeUntilAiring
                        episode
                    }
                }
            }
        }
        `
    }
    return r
}

function search(user) {

    let loading = document.getElementById('loading')
    loading.style.display = ''

    x = setInterval(function() {
        if (loading.style.display == 'none') {
            return
        }
        loading.textContent += '.'
        if (loading.textContent.length > 10) {
            loading.textContent = 'loading'
        }
    }, 300)

    // query to get id from name
    var url = 'https://graphql.anilist.co'
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: `query {
                        ${buildQuery(user)}
                    }`
        })
    }
    fetch(url, options).then(handleResponse)
        .then(handleData)
        .catch((error) => {
            console.log(error)
            sendError('User not found: ' + user)
            loading.style.display = 'none'
            return
        })

    function handleData(data) {
        let dict = {}

        for (i = 1; i < maxPages; i++) {
            let page = data['data']['page' + i]['mediaList']
            // break when pages empty
            if (page.length == 0) {
                break
            }
            
            for (j = page.length - 1; j >= 0; j--) {
                let nextAiringEpisode = page[j]['media']['nextAiringEpisode']
                if (nextAiringEpisode != null) {
                    let anime = page[j]['media']
                    let id = anime['id']
                    let title = anime['title']['english']
                    let totalEpisodes = anime['episodes']
                    let coverImage = anime['coverImage']['extraLarge']
                    let timeUntilAiring = anime['nextAiringEpisode']['timeUntilAiring']
                    let nextEpisode = anime['nextAiringEpisode']['episode']
                    dict['' + id] = {}
                    dict['' + id]['title'] = title
                    dict['' + id]['totalEpisodes'] = totalEpisodes
                    dict['' + id]['coverImage'] = coverImage
                    dict['' + id]['timeUntilAiring'] = timeUntilAiring
                    dict['' + id]['nextEpisode'] = nextEpisode
                }
            }
        }

        // sort, getting list of ordered keys
        keys = Object.keys(dict)
        keys.sort(function(x, y) {
            return dict[x].timeUntilAiring - dict[y].timeUntilAiring
        })

        // build grid tiles
        let grid = document.getElementById('chart')
        for (id of keys) {
            ele = document.createElement('a')
            ele.href = 'https://anilist.co/anime/' + id
            ele.target = '_blank'

            if (dict[id]['totalEpisodes'] == null) {
                dict[id]['totalEpisodes'] = '?'
            }
            
            ele.innerHTML = `
                <div class="chart-square" style="background-image: url('${dict[id]['coverImage']}')">
                    <div class="gradient">
                        <p class="title">${dict[id]['title']}</p>
                        <div class="sub">
                            <p style="text-align: left">${secondsToString(dict[id]['timeUntilAiring'])}</p>
                            <p style="text-align: right; filter: brightness(0.75)">${dict[id]['nextEpisode']}/${dict[id]['totalEpisodes']}</p>
                        </div>
                    </div>
                </div>
            `
            grid.appendChild(ele)
        }

        // hide loading
        loading.style.display = 'none'
    }
}

function secondsToString(s) {
    let d = Math.floor(s / (3600 * 24))
    let h = Math.floor(s % (3600 * 24) / 3600)
    return `${d}d${h}h`
}

// TODO: option only watching list