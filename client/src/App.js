import "./App.css";
import React, { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import NowPlaying from "./components/NowPlaying";
import RecentTracks from "./components/RecentTracks";
import TopArtists from "./components/TopArtists/TopArtists";
import TopGenres from "./components/TopGenres";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { green } from "@mui/material/colors";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import TopTracks from "./components/TopTracks/TopTracks";

// Theme colour palette
const theme = createTheme({
  palette: {
    primary: {
      main: green[800],
    },
    secondary: {
      main: green[500],
    },
    tertiary: {
      main: green[300],
    },
  },
});

const spotifyApi = new SpotifyWebApi();

// Function to retrieve parameters from URL, retrieves spotify access token
const getTokenFromUrl = () => {
  return window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial, item) => {
      let parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});
};

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
  const [topGenres, setTopGenres] = useState([]);
  const [playlistImage, setPlaylistImage] = useState("");
  const [playlistLink, setPlaylistLink] = useState("");

  useEffect(() => {
    const token = getTokenFromUrl().access_token;
    if (token) {
      initializeSpotifySession(token);
    }
  }, []);

  const initializeSpotifySession = async (token) => {
    window.location.hash = "";
    console.log("Spotify token: ", token);
    setSpotifyToken(token);
    spotifyApi.setAccessToken(token);

    try {
      const user = await spotifyApi.getMe();
      console.log(user);
      setUser(user);
      getNowPlaying();
      getRecentTracks();
      getRecentlyPlayedTracks();
      getRecentlyPlayedArtists();
      getTopGenresFromRecentlyPlayedTracks();
      setLoggedIn(true);
    } catch (error) {
      console.error("Error initializing Spotify session:", error);
    }
  };

  // Function to get data of current playing song from user's spotify
  const getNowPlaying = () => {
    spotifyApi
      .getMyCurrentPlaybackState()
      .then(async (response) => {
        console.log(response);
        if (response.item) {
          const track = response.item;
          const mainArtist = track.artists[0];
          const artistData = await spotifyApi.getArtist(mainArtist.id);
          const trackInfo = {
            name: track.name,
            albumArt:
              track.album.images.length > 0 ? track.album.images[0].url : null,
            artist: mainArtist.name,
            artistUrl: artistData.external_urls.spotify,
            album: track.album.name,
            duration_ms: track.duration_ms,
            popularity: track.popularity,
            id: track.id,
            uri: track.uri,
            url: `https://open.spotify.com/track/${track.id}`,
          };
          setNowPlaying(trackInfo);
        } else {
          setNowPlaying({
            name: "Nothing currently playing.",
            albumArt: null,
            artist: "",
            album: "None",
            duration_ms: 0,
            popularity: 0,
            id: "",
            uri: "",
            url: "",
          });
        }
        setButtonClicked(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        setNowPlaying({
          name: "Error fetching current song name.",
          albumArt: null,
          artist: "",
          album: "Error fetching album.",
          duration_ms: 0,
          popularity: 0,
          id: "",
          uri: "",
          url: "",
        });
        setButtonClicked(true);
      });
  };

  // Function to display the previous 5 songs the user has listened to
  const getRecentTracks = () => {
    spotifyApi
      .getMyRecentlyPlayedTracks({ limit: 9 })
      .then(async (response) => {
        const recentTracks = await Promise.all(
          response.items.map(async (item) => {
            const trackData = await spotifyApi.getTrack(item.track.id);
            const mainArtist = trackData.artists[0];
            const artistData = await spotifyApi.getArtist(mainArtist.id);
            return {
              name: trackData.name,
              artist: mainArtist.name,
              artistUrl: artistData.external_urls.spotify,
              album: trackData.album.name,
              image:
                trackData.album.images.length > 0
                  ? trackData.album.images[0].url
                  : null,
              url: trackData.external_urls.spotify,
            };
          })
        );
        setRecentTracks(recentTracks);
      })
      .catch((error) => {
        console.error("Error fetching recent tracks:", error);
      });
  };

  // Function to create a playlist for the user based on previous songs played
  const createPlaylist = () => {
    if (!user) {
      console.error("User information not available.");
      return;
    }

    const playlistName = "MusicMuse Playlist";

    spotifyApi
      .createPlaylist(user.id, { name: playlistName })
      .then((playlist) => {
        console.log("Playlist created:", playlist.id);
        setPlaylistLink(playlist.external_urls.spotify);
        console.log("Playlist link:", playlist.external_urls.spotify);
        setPlaylistImage(nowPlaying.albumArt);

        spotifyApi
          .getMyRecentlyPlayedTracks({ limit: 50 })
          .then(async (response) => {
            const tracks = response.items.map((item) => item.track);
            const topTracks = getTopRecentlyPlayedTracks(tracks);
            const topTrackUris = topTracks.map(
              (track) => `spotify:track:${track.id}`
            );

            if (topTrackUris.length > 0) {
              addTracksToPlaylist(playlist.id, topTrackUris);
            } else {
              console.log("No top tracks found to add to the playlist.");
            }
          })
          .catch((error) => {
            console.error("Error fetching recently played tracks:", error);
          });
      })
      .catch((error) => {
        console.error("Error creating playlist:", error);
      });
  };

  // Function to add tracks to generated playlist
  const addTracksToPlaylist = (playlistId, trackUris) => {
    if (!trackUris.length) {
      console.error("No tracks URIs provided to add to the playlist.");
      return;
    }

    spotifyApi
      .addTracksToPlaylist(playlistId, trackUris)
      .then((response) => {
        console.log("Tracks added to the playlist:", response);
      })
      .catch((error) => {
        console.error("Error adding tracks to playlist:", error);
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
              const image =
                trackData.album.images.length > 0
                  ? trackData.album.images[0].url
                  : null;
              return {
                ...track,
                image: image,
                spotifyUrl: trackData.external_urls.spotify,
              };
            } catch (error) {
              console.error("Error fetching track data:", error);
              return {
                ...track,
                image: null,
                spotifyUrl: null,
              };
            }
          })
        );
        console.log(
          "Top 5 recently played tracks with images:",
          tracksWithImages
        );
        setTopTracks(tracksWithImages);
      })
      .catch((error) => {
        console.error("Error fetching recently played tracks:", error);
      });
  };

  // Function to generate array (sorted by frequency) of artists from the last 50 tracks a user has listened to
  const getTopRecentlyPlayedArtists = (tracks) => {
    const artistsMap = {};

    tracks.forEach((track) => {
      track.artists.forEach((artist) => {
        const artistId = artist.id;
        const artistName = artist.name;
        if (artistsMap[artistId]) {
          artistsMap[artistId].count++;
        } else {
          artistsMap[artistId] = { count: 1, name: artistName };
        }
      });
    });

    const artistsArray = Object.keys(artistsMap).map((artistId) => ({
      id: artistId,
      name: artistsMap[artistId].name,
      count: artistsMap[artistId].count,
    }));

    artistsArray.sort((a, b) => b.count - a.count);

    return artistsArray.slice(0, 5);
  };

  // Function to get artist data of last 50 tracks a user has listened to
  const getRecentlyPlayedArtists = () => {
    spotifyApi
      .getMyRecentlyPlayedTracks({ limit: 50 })
      .then(async (response) => {
        const tracks = response.items.map((item) => item.track);
        const topArtists = getTopRecentlyPlayedArtists(tracks);
        const artistsWithImages = await Promise.all(
          topArtists.map(async (artist) => {
            try {
              const artistData = await spotifyApi.getArtist(artist.id);
              return {
                ...artist,
                image:
                  artistData.images.length > 0
                    ? artistData.images[0].url
                    : null,
                spotifyUrl: artistData.external_urls.spotify,
              };
            } catch (error) {
              console.error("Error fetching artist data:", error);
              return {
                ...artist,
                image: null,
                spotifyUrl: null,
              };
            }
          })
        );
        console.log(
          "Top 5 recently played artists with images:",
          artistsWithImages
        );
        setTopArtists(artistsWithImages);
      })
      .catch((error) => {
        console.error("Error fetching recently played tracks:", error);
      });
  };

  const getTopGenresFromRecentlyPlayedTracks = () => {
    spotifyApi
      .getMyRecentlyPlayedTracks({ limit: 50 })
      .then(async (response) => {
        const tracks = response.items.map((item) => item.track);
        const uniqueArtistIds = [
          ...new Set(
            tracks.flatMap((track) => track.artists.map((artist) => artist.id))
          ),
        ];

        const artistDetails = await Promise.all(
          uniqueArtistIds.map(async (artistId) => {
            try {
              const artistData = await spotifyApi.getArtist(artistId);
              return artistData;
            } catch (error) {
              console.error(
                `Error fetching details for artist ID ${artistId}:`,
                error
              );
              return null;
            }
          })
        );

        const validArtists = artistDetails.filter((artist) => artist !== null);

        const genreCounts = validArtists
          .flatMap((artist) => artist.genres)
          .reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
          }, {});

        // Convert the genres object into an array of [genre, count] and sort by count
        const topGenres = Object.entries(genreCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        setTopGenres(topGenres);
        console.log("Top genres from recently played tracks:", topGenres);
      })
      .catch((error) => {
        console.error("Error fetching recently played tracks:", error);
      });
  };

  // Main HTML code for front-facing application
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Box
          sx={{
            backgroundColor: "aquamarine",
            height: "100%",
            width: "100%",
            margin: 0,
            padding: 0,
            position: "fixed",
            top: 0,
            left: 0,
            overflow: "auto",
          }}
        >
          <Typography variant="h1" color="primary" className="fadeInAnimation">
            musicMuse
          </Typography>
          <Typography
            variant="h3"
            color="secondary"
            gutterBottom
            className="fadeInAnimation"
            style={{ animationDelay: "0.5s" }}
          >
            Discover new music.
          </Typography>
          {!loggedIn && (
            <>
              <Button
                variant="contained"
                color="primary"
                href="http://localhost:8888"
              >
                Log In to Spotify
              </Button>
            </>
          )}
          {loggedIn && (
            <>
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <Typography
                  variant="h5"
                  color="secondary"
                  sx={{ fontWeight: "bold" }}
                  gutterBottom
                  className="fadeInAnimation"
                >
                  Welcome {user.display_name}!
                </Typography>
              </div>
              <br></br>
              <br></br>
              <div
                className="fadeInAnimation"
                style={{
                  width: "58%",
                  margin: "auto",
                  backgroundColor: theme.palette.tertiary.main,
                  borderRadius: "20px",
                  borderColor: theme.palette.primary.main,
                  borderWidth: "3px",
                  borderStyle: "solid",
                  padding: "10px",
                  position: "relative",
                }}
              >
                <IconButton
                  style={{ position: "absolute", top: "10px", right: "10px" }}
                  color="primary"
                  aria-label="refresh"
                  sx={{ fontSize: "32px", width: "64px", height: "64px" }}
                  onClick={() => {
                    getNowPlaying();
                    getRecentTracks();
                  }}
                >
                  <RefreshIcon sx={{ fontSize: "32px" }} />
                </IconButton>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      borderRadius: "5px",
                      padding: "10px",
                    }}
                  >
                    <NowPlaying nowPlaying={nowPlaying} />
                    <RecentTracks recentTracks={recentTracks} />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: "100vh" }}></div> {}
              <Typography
                variant="h1"
                color="primary"
                gutterBottom
                className="fadeInAnimation"
              >
                Your stats.
              </Typography>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20vh",
                }}
              >
                <div style={{ marginRight: "2vw" }}>
                  <TopArtists topArtists={topArtists} />
                </div>
                <div style={{ marginLeft: "2vw" }}>
                  <TopTracks topTracks={topTracks} />
                </div>
              </div>
              <TopGenres topGenres={topGenres} />
              <div style={{ marginBottom: "100vh" }}></div> {}
              <Typography
                variant="h1"
                color="primary"
                gutterBottom
                className="fadeInAnimation"
              >
                Get a custom playlist made.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                className="fadeInAnimation"
                style={{ animationDelay: "1s" }}
                onClick={createPlaylist}
              >
                Create Playlist
              </Button>
              <div style={{ marginBottom: "10vh" }}></div> {}
              {playlistLink && (
                <div style={{ width: "40%", margin: "auto" }}>
                  <div
                    className="fadeInAnimation"
                    style={{
                      animationDelay: "0.5s",
                      backgroundColor: theme.palette.tertiary.main,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "20px",
                      borderColor: theme.palette.primary.main,
                      borderWidth: "3px",
                      borderStyle: "solid",
                      padding: "10px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {playlistImage && (
                        <img
                          src={playlistImage}
                          alt="Playlist Cover"
                          style={{
                            height: 100,
                            opacity: 0,
                            animation: "fadeIn 1s ease-out forwards",
                            marginRight: "10px",
                          }}
                          onLoad={(e) => {
                            e.target.style.opacity = 1;
                          }}
                        />
                      )}
                      <div>
                        <Typography
                          variant="h5"
                          color="primary"
                          className="fadeInAnimation"
                          style={{ marginLeft: "10px" }}
                        >
                          <b>MusicMuse Playlist </b>
                          <i>(5 Tracks)</i>
                        </Typography>
                      </div>
                    </div>
                    <Button
                      variant="contained"
                      color="secondary"
                      className="fadeInAnimation"
                      style={{ animationDelay: "1s" }}
                      onClick={() => window.open(playlistLink, "_blank")}
                    >
                      Open Playlist
                    </Button>
                  </div>
                </div>
              )}
              <div style={{ marginBottom: "80vh" }}></div> {}
            </>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default App;
