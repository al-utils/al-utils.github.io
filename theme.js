let darkMode = sessionStorage.getItem('darkMode')
if (darkMode == null || darkMode === 'undefined') {
    darkMode = 'false'
    sessionStorage.setItem('darkMode', 'false')
} else if (darkMode == 'true') {
    // manual theme change
    root = document.querySelector(':root')
    style = getComputedStyle(root)
    dark = style.getPropertyValue('--dark')
    light = style.getPropertyValue('--light')
    root.style.setProperty('--light', dark)
    root.style.setProperty('--dark', light)
    root.style.setProperty('--card-background', 'var(--card-dark)')
}

function iconDark() { // called after icon loaded
    icon = document.getElementById('theme-icon')
    if (darkMode == 'true')
        icon.setAttribute('theme', 'dark')
    else
        icon.setAttribute('theme', 'light')
}

function switchTheme() {
    button = document.getElementById('theme-switcher')
    icon = document.getElementById('theme-icon')
    // current = icon.getAttribute('theme')
    current = darkMode

    style = getComputedStyle(document.body)
    root = document.querySelector(':root')
    dark = style.getPropertyValue('--dark')
    light = style.getPropertyValue('--light')
    bg = style.getPropertyValue('--card-background')
    
    delay = 500
    icon.style.backgroundColor = bg
    // this animation took forever to figure out (:
    setTimeout(function () {
        if (current == 'false') {
            root.style.setProperty('--card-background', 'var(--card-dark)')
            icon.setAttribute('theme', 'dark')
        } else {
            root.style.setProperty('--card-background', 'var(--card-light)')
            icon.setAttribute('theme', 'light')
        }
        bg = style.getPropertyValue('--card-background')
        icon.style.backgroundColor = bg
    }, delay)
    setTimeout(function () {
        root.style.setProperty('--light', dark)
        root.style.setProperty('--dark', light)
    }, delay / 2)
    if (darkMode == 'true') {
        darkMode = 'false'
        sessionStorage.setItem('darkMode', 'false')
    } else {
        darkMode = 'true'
        sessionStorage.setItem('darkMode', 'true')
    }
}