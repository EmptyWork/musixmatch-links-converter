const notificationAreaElement = document.querySelector("#notificationArea")

const getReadableMonthName = (num) => {
    switch (num) {
        case 0:
            return "Jan"
        case 1:
            return "Feb"
        case 2:
            return "Mar"
        case 3:
            return "Apr"
        case 4:
            return "May"
        case 5:
            return "Jun"
        case 6:
            return "Jul"
        case 7:
            return "Aug"
        case 8:
            return "Sep"
        case 9:
            return "Oct"
        case 10:
            return "Nov"
        case 11:
            return "Dec"
        default:
            break;
    }
}

const downloadCSV = (csv, filename) => {
    const csvFile = new Blob([csv], { type: 'text/csv' })
    const downloadLink = document.createElement("a")
    downloadLink.download = filename
    downloadLink.href = window.URL.createObjectURL(csvFile)
    downloadLink.style.display = "none"
    document.body.appendChild(downloadLink)
    downloadLink.click()
}

const getDevelopmentStatus = () => {
    return (location.hostname == "127.0.0.1") ? true : false
}


const selectNotificationWithID = (id) => {
    return document.querySelector(`[notification-id=${id}]`)
}

const createNotificationText = (id, text) => {
    const notificationContainer = document.createElement('div')
    notificationContainer.classList.add("notification-text")
    notificationContainer.innerText = text
    notificationContainer.setAttribute("notification-id", id)

    notificationAreaElement.appendChild(notificationContainer)

    showNotification(notificationContainer)
    removeNotification(notificationContainer)
}

const showNotification = async (elem) => {
    await new Promise(resolve => setTimeout(resolve, 0))
    elem.classList.add("show")
}

const removeNotification = async (elem) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    elem.classList.remove("show")
    await new Promise(resolve => setTimeout(resolve, 500))
    elem.remove()
}

const inputHandler = (event) => {
    let value = inputElement.value
    if (event) {
        value = event.target.value
    }
    let text = ""
    let enableNewSeperator = enableNewSeperatorElement.checked ?? false
    if (value == null || value == "") return
    parsedData = JSON.parse(value)

    new JsonViewer({ value: tracksSourceReplace(parsedData) }).render('#output')
    copyElement.classList.remove('hidden')
    downloadElement.classList.remove('hidden')

    processedData = tracksSourceReplace(parsedData)
    csvParsedData = csvParser.parse(processedData)

    outputElement.value = JSON.stringify(processedData)
    if (!enableNewSeperator) text = "sep=, \n"
    outputCSVElement.value = `${text}${csvParsedData}`
}

const tracksSourceReplace = (tracks) => {
    let enableAppleMusicLinks = enableAppleMusicLinksElement.checked ?? false
    if (isDevelopment) console.log(enableAppleMusicLinks)
    tracks.forEach(track => {
        let trackUri = track.actionURI ?? ""
        let convertedUri
        if (trackUri.includes("track_applemusic_id") && enableAppleMusicLinks) {
            convertedUri = changeURItoApple(trackUri)
            if (isDevelopment) console.log(`this is apple song ${track.trackTitle}`)
            track.appleLink = convertedUri
        }
        if (trackUri.includes("track_spotify_id")) {
            convertedUri = changeURItoSpotify(trackUri)
            if (isDevelopment) console.log(`this is spotify song ${track.trackTitle}`)
            track.spotifyLink = convertedUri
        }

        delete track.actionURI
        delete track.rank
        delete track.resourceId
        delete track.id
        delete track.destinationLanguage
        delete track.missionId
        delete track.trackLanguage
        delete track.trackLength
        delete track.hasLyrics
        delete track.hasSync
    })

    if (isDevelopment) console.table(tracks)
    return tracks
}

const changeURItoSpotify = (uri) => {
    let spotifyRegex
    if (uri.includes("track_applemusic_id")) {
        spotifyRegex = /mxm:\/\/match\/\?commontrack_id=\d+&track_applemusic_id=\d+&track_spotify_id=/i
    } else {
        spotifyRegex = /mxm:\/\/match\/\?commontrack_id=\d+&track_spotify_id=/i
    }
    return uri.replace(spotifyRegex, "https://open.spotify.com/track/")
}

const changeURItoApple = (uri) => {
    const appleRegex = /mxm:\/\/match\/\?commontrack_id=\d+&track_applemusic_id=/i
    const appleAfterRegex = /&[a-z_=A-Z0-9]*/i
    uri = uri.replace(appleRegex, "https://music.apple.com/album/")
    uri = uri.replace(appleAfterRegex, " ")

    return uri
}