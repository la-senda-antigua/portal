
window.onload = () => {
    const rawDate = new Date()
    const date = moment(rawDate).format("MMM DD, YYYY")
    const elements = document.getElementsByClassName("date")

    for (const element of elements) {
        element.innerHTML = date
    }


}
