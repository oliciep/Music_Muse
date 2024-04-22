// TopTracksContainer.js
import React, { useState, useEffect } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import TopTracks from './TopTracks';

const spotifyApi = new SpotifyWebApi();

const TopTracksContainer = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchTracks = () => {
      spotifyApi.getMyTopTracks()
        .then(response => {
          const formattedTracks = response.items.map(track => ({
            name: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            image: track.album.images[0].url,
            url: track.external_urls.spotify
          }));
          setTracks(formattedTracks);
        })
        .catch(error => console.error("Error fetching top tracks:", error));
    };

    fetchTracks();
  }, []);

  return <TopTracks tracks={tracks} />;
}

export default TopTracksContainer;
