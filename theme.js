function switchTheme() {
    button = document.getElementById('theme-switcher')
    icon = document.getElementById('theme-icon')
    current = icon.getAttribute('theme')

    style = getComputedStyle(document.body)
    root = document.querySelector(':root')
    dark = style.getPropertyValue('--dark')
    light = style.getPropertyValue('--light')
    
    delay = 500
    icon.style.backgroundColor = dark
    // this animation took forever to figure out (:
    setTimeout(function () {
        if (current == 'light') {
            root.style.setProperty('--card-background', 'var(--card-dark)')
            icon.setAttribute('theme', 'dark')
        } else {
            root.style.setProperty('--card-background', 'var(--card-light)')
            icon.setAttribute('theme', 'light')
        }
        icon.style.backgroundColor = dark
    }, delay)
    setTimeout(function () {
        root.style.setProperty('--light', dark)
        root.style.setProperty('--dark', light)
        icon.style.backgroundColor = light
    }, delay / 2)
}

function showAbout() {
    ele = document.getElementById('about-links')
    ele.style.display = ''
    setTimeout(function () {
        ele.style.opacity = 1
    }, 100)
}

function hideAbout() {
    ele = document.getElementById('about-links')
    ele.style.opacity = 0
    setTimeout(function () {
        ele.style.display = 'none'
    }, 100)
}