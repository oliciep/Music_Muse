import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react"
import SpotifyWebApi from "spotify-web-api-js"

const spotifyApi = new SpotifyWebApi

const getTokenFromUrl = () => {
  return window.location.hash.substring(1).split('&').reduce((initial, item) => {
    let parts = item.split("=");
    initial[parts[0]] = decodeURIComponent(parts[1]);
    return initial;
  }, {});
}


function App() {
  const [spotifyToken, setSpotifyToken] = useState("");
  const [nowPlaying, setNowPlaying] = useState({})
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    console.log("Token derived from URL: ", getTokenFromUrl())
    const spotifyToken = getTokenFromUrl().access_token
    window.location.hash = ""
    console.log("Spotify token: ", spotifyToken);

    if (spotifyToken) {
      setSpotifyToken(spotifyToken)
      spotifyApi.setAccessToken(spotifyToken)
      spotifyApi.getMe().then((user) => {
        console.log(user)
      })
      setLoggedIn(true)
    }
  })
  
  const getNowPlaying = () => {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      console.log(response);
      setNowPlaying({
        name: response.item.name,
        albumArt: response.item.album.images[0].url
      })
    })
  }

  return (
    <div className="App">
      <h2>Welcome to MusicMuse</h2>
      {!loggedIn && <a href="http://localhost:8888">Login to Spotify.</a>}
      {loggedIn && (
        <>
          <div>Now playing: {nowPlaying.name}</div>
          <div>
            <img src={nowPlaying.albumArt} style={{height: 150}}/>
          </div>
        </>
      )}
      {loggedIn && (
        <button onClick={() => getNowPlaying()}>Check Now Playing</button>
      )}
    </div>
  );
}

export default App;
