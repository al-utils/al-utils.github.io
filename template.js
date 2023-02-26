content = document.getElementById('content').innerHTML

template = `
    <div id="errors"></div>
    <div class="pattern"></div>
    
    <div id="content" class="container">
        
    </div>

    <div id="footer">(c) 2023 Java | <span class="about-links" onclick="showAbout()">About</span></div>

    <div id="about-links" style="opacity: 0; display: none">
        <div id="about-links-background" onclick="hideAbout()"></div>
        <div id="about-links-page">
            <div class="x-button-about" onclick="hideAbout()">&nbsp</div>
            # about
            <br>
            <br>font: <a href="https://github.com/floriankarsten/space-grotesk">Space Grotesk</a>
            <br>monospace font: Envy Code R
            <br>
            <br>icons: <a href="https://tabler-icons.io">Tabler Icons</a>
            <br><a href="https://icones.js.org/collection/all?s=anilist">anilist svg</a>
            <br>
            <br>anilist <a href="https://github.com/AniList/ApiV2-GraphQL-Docs">api</a>
        </div>
    </div>
`

document.body.innerHTML = template
document.getElementById('content').innerHTML = content