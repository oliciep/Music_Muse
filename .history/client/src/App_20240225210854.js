import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react"
import SpotifyWebApi from "spotify-web-api-js"

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const lightTheme = createTheme({
  palette: {
    primary: {
      main: green[700], // green
    },
    secondary: {
      main: green[400], // darker green
    },
  },
});

const darkTheme = createTheme({
  palette: {
    primary: {
      main: green[400], // light green
    },
    secondary: {
      main: green[800], // darker green
    },
  },
}); 

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
  const [buttonClicked, setButtonClicked] = useState(false);

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
      if(response.item) {
        const track = response.item;
        const trackInfo = {
          name: track.name,
          albumArt: track.album.images.length > 0 ? track.album.images[0].url : null,
          artist: track.artists.map(artist => artist.name).join(", "),
          album: track.album.name,
          duration_ms: track.duration_ms,
          popularity: track.popularity,
          id: track.id,
          uri: track.uri
        };
        setNowPlaying(trackInfo);
      } else {
        setNowPlaying({
          name: "Nothing",
          albumArt: null,
          artist: "",
          album: "None",
          duration_ms: 0,
          popularity: 0,
          id: "",
          uri: ""
        });
      }
      setButtonClicked(true);
    }).catch(error => {
      console.error("Error:", error);
      setNowPlaying({
        name: "Error fetching song name",
        albumArt: null,
        artist: "",
        album: "Error fetching album",
        duration_ms: 0,
        popularity: 0,
        id: "",
        uri: ""
      });
      setButtonClicked(true);
    });
  };

  const createPlaylist = () => {
    if (!user) {
      console.error("User information not available.");
      return;
    }
  
    const playlistName = "MusicMuse Playlist";
  
    spotifyApi.createPlaylist(user.id, { name: playlistName })
      .then((playlist) => {
        console.log("Playlist created:", playlist.id);
        return getNowPlaying(); // Return the promise from getNowPlaying
      })
      .then((nowPlaying) => {
        const trackUri = nowPlaying.uri;
        console.log("Track URI is", trackUri)
        addTracksToPlaylist(playlist.id, trackUri);
      })
      .catch((error) => {
        console.error("Error creating playlist or adding track:", error);
      });
  };
  

  const addTracksToPlaylist = (playlistId, trackUri) => {
    spotifyApi.addTracksToPlaylist(playlistId, [trackUri])
      .then((response) => {
        console.log("Track added to the playlist:", response);
      })
      .catch((error) => {
        console.error("Error adding track to playlist:", error);
      });
  };


  return (
    <ThemeProvider theme={lightTheme}>
      <div className="App">
        <Box sx={{ backgroundColor: 'aquamarine', minHeight: '100vh', position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, margin: 0, padding: 0}}>
          <Typography variant="h1" color="primary" className="fadeInAnimation" >
            musicMuse
          </Typography>
          <Typography variant="h3" color="secondary" gutterBottom className="fadeInAnimation" style={{ animationDelay: '0.5s' }} >
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
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <Typography variant="h5" color="secondary" sx={{ fontWeight:'bold' }} gutterBottom className="fadeInAnimation">
                  Welcome {user.display_name}!
                </Typography>
              </div>
              {buttonClicked && (
                <Typography variant="h5" color="primary" sx={{ fontWeight:'bold' } } className="fadeInAnimation" style={{ animationDelay: '0.5s' }}> 
                  Now Playing: <i>{nowPlaying.name}</i> by <i>{nowPlaying.artist}</i>
                </Typography> 
              )}
              {buttonClicked && (
                <Typography variant="h5" color="secondary" sx={{ fontWeight:'bold' } } className="fadeInAnimation" style={{ animationDelay: '0.5s' }}> 
                Album: <i>{nowPlaying.album}</i>
              </Typography> 
              )}
              <div className="fadeInAnimation" style={{ animationDelay: '2s' }}>
                {nowPlaying.albumArt && (
                  <img src={nowPlaying.albumArt} style={{ height: 300, opacity: 0, animation: 'fadeIn 1s ease-out forwards' }} alt="Album Art" onLoad={(e) => { e.target.style.opacity = 1 }} />
                )}
              </div>
              <Button variant="contained" color="primary" className="fadeInAnimation" style={{ animationDelay: '1s' }} onClick={() => getNowPlaying()}>Check Now Playing</Button>
              <br></br><br></br>
            </>
          )}
          {loggedIn && (
            <Button variant="contained" color="secondary" className="fadeInAnimation" style={{ animationDelay: '1s' }} onClick={createPlaylist}>Create Playlist</Button>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;