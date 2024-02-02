import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react"
import SpotifyWebApi from "spotify-web-api-js"

import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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
      <Paper style={{ backgroundColor: '#2196f3', padding: '20px', textAlign: 'center', width: '100%', height: '100vh' }}>
        <Typography variant="h1" color="primary" gutterBottom>
          Welcome to MusicMuse
        </Typography>
        {!loggedIn && (
          <>
            <Button variant="contained" color="primary" href="http://localhost:8888">
              Log In to Spotify
            </Button>
          </>
        )}
        {loggedIn && (
          <>
            <Typography variant="h6" style={{ fontWeight: 'bold', color: 'blue' }}>
              Now Playing: {nowPlaying.name}
            </Typography>
            <div>
              <img src={nowPlaying.albumArt} style={{height: 150}}/>
            </div>
          </>
        )}
        {loggedIn && (
          <Button variant="contained" color="primary" onClick={() => getNowPlaying()}>Check Now Playing</Button>
        )}
      </Paper>
    </div>
  );
}

export default App;
