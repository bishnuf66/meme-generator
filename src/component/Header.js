import React from "react";



export default function Header() {
    return (
        <header>
            <img src={require("../images/h.jpg")} className="h-img" />
            <h2 className="header-title">MEME GENERATOR</h2>
            <h4 className="header-project">react project 4</h4>

        </header>
    )

}