import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react"
import SpotifyWebApi from "spotify-web-api-js"

import Box from '@mui/material/Box';
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
  const [nowPlaying, setNowPlaying] = useState({});
  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    console.log("Token derived from URL: ", getTokenFromUrl());
    const spotifyToken = getTokenFromUrl().access_token;
    window.location.hash = "";
    console.log("Spotify token: ", spotifyToken);

    if (spotifyToken) {
      setSpotifyToken(spotifyToken);
      spotifyApi.setAccessToken(spotifyToken);
      spotifyApi.getMe().then((user) => {
        console.log(user);
        setUser(user);
      });
      setLoggedIn(true);
    }
  }, []);

  const getNowPlaying = () => {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      console.log(response);
      setNowPlaying({
        name: response.item.name,
        albumArt: response.item.album.images[0].url
      });
    });
  };

  return (
    <div className="App">
      <Box sx={{ backgroundColor: 'cyan', minHeight: '100vh', position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, margin: 0, padding: 0}}>
        <Typography variant="h1" color="primary" gutterBottom className="fadeInAnimation" >
          Welcome to MusicMuse!
        </Typography>
        <Typography variant="h2" color="secondary" gutterBottom className="fadeInAnimation" style={{ animationDelay: '0.5s' }} >
          Discover new music.
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
            <Typography variant="h5" color="primary" sx={{ fontWeight:'bold' } }>
              Welcome {user.display_name}!
            </Typography>
            <Typography variant="h5" color="secondary" sx={{ fontWeight:'bold' } }>
              Now Playing: {nowPlaying.name}
            </Typography>
            <div>
              <img src={nowPlaying.albumArt} style={{height: 300}} alt="Album Art"/>
            </div>
          </>
        )}
        {loggedIn && (
          <Button variant="contained" color="primary" onClick={() => getNowPlaying()}>Check Now Playing</Button>
        )}
      </Box>
    </div>
  );
}

export default App;