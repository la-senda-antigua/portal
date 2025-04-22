const getVerses = async () => {
    const url = "https://dailyverses.net/es/los-100-versiculo-de-la-biblia/rvr60"
    const req = await fetch(url)
    const res = await req.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(res, "text/html")    

    const verses = doc.querySelectorAll(".verses")
    const versesArray = Array.from(verses).map((verse) => {
        const verseText = verse.querySelector(".text").innerText
        const verseRef = verse.querySelector(".reference").innerText
        return {
            text: verseText,
            reference: verseRef,
        }
    })
    return versesArray
}


const data = await getVerses()
console.log(data)