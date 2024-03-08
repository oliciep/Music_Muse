import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from "react"
import SpotifyWebApi from "spotify-web-api-js"

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';


// Light theme colour palette
const lightTheme = createTheme({
  palette: {
    primary: {
      main: green[800], 
    },
    secondary: {
      main: green[500],
    },
    tertiary: {
      main: green[300]
    }
  },
});

// Dark theme colour palette
const darkTheme = createTheme({
  palette: {
    primary: {
      main: green[400],
    },
    secondary: {
      main: green[800],
    },
  },
}); 

const spotifyApi = new SpotifyWebApi

// Function to retrieve parameters from URL, retrieves spotify access token
const getTokenFromUrl = () => {
  return window.location.hash.substring(1).split('&').reduce((initial, item) => {
    let parts = item.split("=");
    initial[parts[0]] = decodeURIComponent(parts[1]);
    return initial;
  }, {});
}

// Main logic for application's function
function App() {  
  const [spotifyToken, setSpotifyToken] = useState("");
  const [nowPlaying, setNowPlaying] = useState({});
  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [recentTracks, setRecentTracks] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

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
        getNowPlaying();
        getRecentTracks();
        getRecentlyPlayedTracks();
        getRecentlyPlayedArtists();
      });
      setLoggedIn(true);
    }
  }, []);

  // Function to get data of current playing song from user's spotify
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

  // Function to display the previous 5 songs the user has listened to
  const getRecentTracks = () => {
    // Make a request to the Spotify API to fetch the user's recently played tracks
    spotifyApi.getMyRecentlyPlayedTracks({ limit: 9 })
      .then(response => {
        // Extract the track information from the response
        const recentTracks = response.items.map(item => ({
          name: item.track.name,
          artists: item.track.artists.map(artist => artist.name).join(', '),
          album: item.track.album.name,
          image: item.track.album.images.length > 0 ? item.track.album.images[0].url : null
        }));
        
        // Set the recentTracks state to trigger re-rendering
        setRecentTracks(recentTracks);
      })
      .catch(error => {
        console.error("Error fetching recent tracks:", error);
      });
  };

  // Function to create a playlist for the user based on previous songs played
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
  

  // Function to add tracks to generated playlist
  const addTracksToPlaylist = (playlistId, trackUri) => {
    spotifyApi.addTracksToPlaylist(playlistId, [trackUri])
      .then((response) => {
        console.log("Track added to the playlist:", response);
      })
      .catch((error) => {
        console.error("Error adding track to playlist:", error);
      });
  };

  // Function to generate array (sorted by frequency) of previous 50 tracks from user
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
  
  // Function to get track data of last 50 tracks a user has listened to
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
      })
      .catch((error) => {
        console.error("Error fetching recently played tracks:", error);
      });
  };

  // Function to generate array (sorted by frequency) of artists from the last 50 tracks a user has listened to
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


  // Function to get artist data of last 50 tracks a user has listened to
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
      })
      .catch((error) => {
        console.error("Error fetching recently played tracks:", error);
      });
  };

  // Main HTML code for front-facing application
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

              <br></br><br></br>

              <div className="fadeInAnimation" style={{ width: '58%', margin: 'auto', backgroundColor: lightTheme.palette.tertiary.main, borderRadius: '20px', borderColor: lightTheme.palette.primary.main, borderWidth: '3px', borderStyle: 'solid', padding: '10px', position: 'relative' }}>
                <div style={{ margin: 'auto', width: '50%' }}>
                  <Typography variant="h2" color="primary" gutterBottom className="fadeInAnimation">
                    Your Recent Tracks
                  </Typography>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: '40px' }}>
                    <div style={{  display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                      {nowPlaying.albumArt && (
                        <img src={nowPlaying.albumArt} alt="Track Album" style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }} />
                      )}
                      <Typography variant="h5" color="primary">
                        <b>{nowPlaying.name}</b> - <i>{nowPlaying.artist}</i>  &nbsp;
                      </Typography>
                      <Typography  variant="h5" color="primary" style={{ backgroundColor: lightTheme.palette.secondary.main, borderRadius: '20px', borderColor: lightTheme.palette.primary.main, borderWidth: '3px', borderStyle: 'solid', padding: '5px' }}>
                        <b><i> Now Playing</i></b>
                      </Typography>
                      <div style={{ position: 'absolute', top: '0', right: '0' }}>
                        <Button variant="contained" color="secondary" className="fadeInAnimation" style={{ animationDelay: '1s' }} onClick={() => { getNowPlaying(); getRecentTracks(); }}>Refresh</Button>
                      </div>
                    </div>
                    {recentTracks.map((track, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        {track.image && (
                          <img src={track.image} alt="Track Album" style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }} />
                        )}
                        <Typography variant="h5" color="primary">
                          <b>{track.name}</b> - <i>{track.artists}</i>
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              <div style={{ marginBottom: '100vh' }}></div> {}
              
              <Typography variant="h1" color="primary" gutterBottom className="fadeInAnimation">
                Your stats.
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20vh' }}>
                <div style={{ marginRight: '2vw' }}>
                  <div className="fadeInAnimation" style={{ backgroundColor: lightTheme.palette.tertiary.main, width: '40vw', borderRadius: '20px', borderColor: lightTheme.palette.primary.main, borderWidth: '3px', borderStyle: 'solid', padding: '10px' }}> {/* adjusted width */}
                    <Box>
                      <Typography variant="h2" color="primary" gutterBottom className="fadeInAnimation">
                        Your top artists.
                      </Typography>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {topArtists.map((artist, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                            <Typography variant="h4" color="primary">
                              {index + 1}. &nbsp;
                            </Typography>
                            {artist.image && (
                              <img src={artist.image} alt="Artist" style={{ width: '100px', height: '100px', borderRadius: '50%', marginRight: '10px' }} />
                            )}
                            <Typography variant="h4" color="primary">
                              &nbsp; <b>{artist.name}</b>
                            </Typography>
                          </div>
                        ))}
                      </div>
                    </Box>
                  </div>
                </div>
                <div style={{ marginLeft: '2vw' }}>
                  <div className="fadeInAnimation" style={{ backgroundColor: lightTheme.palette.tertiary.main, width: '40vw', borderRadius: '20px', borderColor: lightTheme.palette.primary.main, borderWidth: '3px', borderStyle: 'solid', padding: '10px' }}> {/* adjusted width */}
                    <Box>
                      <Typography variant="h2" color="primary" gutterBottom className="fadeInAnimation">
                        Your top tracks.
                      </Typography>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {topTracks.map((track, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                            <Typography variant="h4" color="primary">
                              {index + 1}. &nbsp;
                            </Typography>
                            {track.image && (
                              <img src={track.image} alt="Track Album" style={{ width: '100px', height: '100px', borderRadius: '50%', marginRight: '10px' }} />
                            )}
                            <Typography variant="h4" color="primary">
                              &nbsp; <b>{track.name}</b>
                            </Typography>
                          </div>
                        ))}
                      </div>
                    </Box>
                  </div>
                </div>
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