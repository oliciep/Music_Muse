import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react"
import SpotifyWebApi from "spotify-web-api-js"

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Modal from '@mui/material/Modal';

const lightTheme = createTheme({
  palette: {
    primary: {
      main: green[800], // green
    },
    secondary: {
      main: green[500], // darker green
    },
    tertiary: {
      main: green[300]
    }
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
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

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
        getRecentlyPlayedTracks();
        getRecentlyPlayedArtists();
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
          artist: "by " +  track.artists.map(artist => artist.name).join(", "),
          album: track.album.name,
          duration_ms: track.duration_ms,
          popularity: track.popularity,
          id: track.id,
          uri: track.uri
        };
        setNowPlaying(trackInfo);
      } else {
        setNowPlaying({
          name: "None",
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
  
    const playlistName = "Recently Played Playlist";
  
    spotifyApi.createPlaylist(user.id, { name: playlistName })
      .then((playlist) => {
        console.log("Playlist created:", playlist.id);
        if (nowPlaying.id) {
          addTracksToPlaylist(playlist.id, nowPlaying.uri);
        } else {
          console.error("No currently playing track found.");
        }
      })
      .catch((error) => {
        console.error("Error creating playlist:", error);
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

  const getTopRecentlyPlayedTracks = (tracks) => {
    const tracksMap = {};
  
    tracks.forEach((track) => {
      const trackId = track.id;
      const trackName = track.name;
      if (tracksMap[trackId]) {
        tracksMap[trackId].count++;
      } else {
        tracksMap[trackId] = { count: 1, name: trackName };
      }
    });
  
    const tracksArray = Object.keys(tracksMap).map((trackId) => ({
      id: trackId,
      name: tracksMap[trackId].name,
      count: tracksMap[trackId].count,
    }));
  
    tracksArray.sort((a, b) => b.count - a.count);
  
    return tracksArray.slice(0, 5);
  };
  
  const getRecentlyPlayedTracks = () => {
    spotifyApi
      .getMyRecentlyPlayedTracks({ limit: 50 })
      .then(async (response) => {
        const tracks = response.items.map((item) => item.track);
        const topTracks = getTopRecentlyPlayedTracks(tracks);
        const tracksWithImages = await Promise.all(
          topTracks.map(async (track) => {
            try {
              const trackData = await spotifyApi.getTrack(track.id);
              const image = trackData.album.images.length > 0 ? trackData.album.images[0].url : null;
              return {
                ...track,
                image: image,
              };
            } catch (error) {
              console.error("Error fetching track data:", error);
              return {
                ...track,
                image: null,
              };
            }
          })
        );
        console.log("Top 5 recently played tracks with images:", tracksWithImages);
        setTopTracks(tracksWithImages);
        handleModalOpen();
      })
      .catch((error) => {
        console.error("Error fetching recently played tracks:", error);
      });
  };

  const getTopRecentlyPlayedArtists = (tracks) => {
    const artistsMap = {};
  
    tracks.forEach(track => {
      track.artists.forEach(artist => {
        const artistId = artist.id;
        const artistName = artist.name;
        if (artistsMap[artistId]) {
          artistsMap[artistId].count++;
        } else {
          artistsMap[artistId] = { count: 1, name: artistName };
        }
      });
    });
  
    const artistsArray = Object.keys(artistsMap).map(artistId => ({
      id: artistId,
      name: artistsMap[artistId].name,
      count: artistsMap[artistId].count
    }));
  
    artistsArray.sort((a, b) => b.count - a.count);
  
    return artistsArray.slice(0, 5);
  };

  const getRecentlyPlayedArtists = () => {
    spotifyApi.getMyRecentlyPlayedTracks({ limit: 50 })
      .then(async (response) => {
        const tracks = response.items.map(item => item.track);
        const topArtists = getTopRecentlyPlayedArtists(tracks);
        const artistsWithImages = await Promise.all(
          topArtists.map(async (artist) => {
            try {
              const artistData = await spotifyApi.getArtist(artist.id);
              return {
                ...artist,
                image: artistData.images.length > 0 ? artistData.images[0].url : null
              };
            } catch (error) {
              console.error("Error fetching artist data:", error);
              return {
                ...artist,
                image: null
              };
            }
          })
        );
        console.log("Top 5 recently played artists with images:", artistsWithImages);
        setTopArtists(artistsWithImages);
        handleModalOpen();
      })
      .catch((error) => {
        console.error("Error fetching recently played tracks:", error);
      });
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <div className="App">
        <Box
          sx={{
            backgroundColor: 'aquamarine',
            height: '100%',
            width: '100%',
            margin: 0,
            padding: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            overflow: 'auto',
          }}
        >
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
                <div className="fadeInAnimation" style={{ animationDelay: '2s', backgroundColor: lightTheme.palette.tertiary.main, display: 'inline-block', borderRadius: '8px', borderColor: lightTheme.palette.primary.main, borderWidth: '3px', borderStyle: 'solid',  padding: '10px 20px 10px 0px' }}> 
                  <Grid container justifyContent="center" alignItems="center">
                    {nowPlaying.albumArt && (
                      <Grid item>
                        <img src={nowPlaying.albumArt} style={{ height: 100, opacity: 0, animation: 'fadeIn 1s ease-out forwards', marginRight: '10px' }} alt="Album Art" onLoad={(e) => { e.target.style.opacity = 1 }} />
                      </Grid>
                    )}
                    <Grid item>
                      <Typography variant="h5" color="primary" sx={{ fontWeight:'bold' } } className="fadeInAnimation" style={{ marginLeft: '10px' }}> 
                        Song: <i>{nowPlaying.name}</i> <i>{nowPlaying.artist}</i>
                      </Typography> 
                      <Typography variant="h5" color="#317256" sx={{ fontWeight:'bold' } } className="fadeInAnimation" style={{ marginLeft: '10px' }}> 
                        Album: <i>{nowPlaying.album}</i>
                      </Typography> 
                    </Grid>
                  </Grid>
                </div>
              )}

              <br></br><br></br>

              <Button variant="contained" color="secondary" className="fadeInAnimation" style={{ animationDelay: '1s' }} onClick={() => getNowPlaying()}>Check Now Playing</Button>
              
              <div style={{ marginBottom: '100vh' }}></div> {}

              <Typography variant="h1" color="primary" gutterBottom className="fadeInAnimation" >
                Your top artists.
              </Typography>

              <div className="fadeInAnimation" style={{ backgroundColor: lightTheme.palette.tertiary.main, display: 'inline-block', width: '60vw', borderRadius: '20px', borderColor: lightTheme.palette.primary.main, borderWidth: '3px', borderStyle: 'solid', padding: '10px'}}>
                <Box>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                   {topArtists.map((artist, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        {artist.image && (
                          <img src={artist.image} alt="Artist" style={{ width: '100px', height: '100px', borderRadius: '50%', marginRight: '10px' }} />
                        )}
                        <Typography variant="h3" color="primary">
                          {index + 1}. {artist.name}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </Box>
              </div>

              <div style={{ marginBottom: '20vh' }}></div> {}
              
              <Typography variant="h1" color="primary" gutterBottom className="fadeInAnimation" >
                Your top tracks.
              </Typography>

              <div className="fadeInAnimation" style={{ backgroundColor: lightTheme.palette.tertiary.main, display: 'inline-block', width: '60vw', borderRadius: '20px', borderColor: lightTheme.palette.primary.main, borderWidth: '3px', borderStyle: 'solid', padding: '10px' }}>
                <Box>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    {topTracks.map((track, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        {track.image && (
                          <img src={track.image} alt="Track Album" style={{ width: '100px', height: '100px', borderRadius: '50%', marginRight: '10px' }} />
                        )}
                        <Typography variant="h3" color="primary">
                          {index + 1}. {track.name}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </Box>
              </div>


              <div style={{ marginBottom: '100vh' }}></div> {}
              
              <Typography variant="h1" color="primary" gutterBottom className="fadeInAnimation" >
                Get a custom playlist made.
              </Typography>
              <Button variant="contained" color="secondary" className="fadeInAnimation" style={{ animationDelay: '1s' }} onClick={createPlaylist}>Create Playlist</Button>

              <div style={{ marginBottom: '80vh' }}></div> {}
            </>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;