import React from "react";
import memesdata from "./memesdata.js"


export default function Meme() {
    const [memeImage, setMemeImage] = React.useState("")


    const [meme, setMeme] = React.useState({
        topText: "",
        bottomText: "",
        randoImage: "https://imgflip.com/i/8dc4pt"
    })

    const [allMemeImage, setAllMemeImage] = React.useState(setMeme)

    function getMeme() {

        const memesArray = memesdata.data.memes
        const randomNumber = Math.floor(Math.random() * memesArray.length)
        setMemeImage(memesArray[randomNumber].url)
    }
    return (
        <main>
            <div className="form">
                <input className="form-input" type="text" />
                <input className="form-input" type="text" />
                <button className="form-button" onClick={getMeme}>Get a new meme</button>
            </div>

            <img className="dis-img" src={memeImage} />

        </main>
    )
}