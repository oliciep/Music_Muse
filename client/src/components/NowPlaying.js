// components/NowPlaying.js
import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const NowPlaying = ({ nowPlaying }) => {
  return (
    <>
      <Typography variant="h2" color="primary" gutterBottom>
        Your Recent Tracks
      </Typography>
      <Box
        sx={{
          backgroundColor: "lightgreen",
          borderRadius: "5px",
          padding: "3px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {nowPlaying.albumArt && (
            <Box
              component="img"
              src={nowPlaying.albumArt}
              alt="Now Playing Album Art"
              sx={{
                width: "50px",
                height: "50px",
                marginLeft: "17px",
                marginRight: "20px",
              }}
            />
          )}
          <Typography variant="h5" color="primary">
            <a href={nowPlaying.url} target="_blank" rel="noopener noreferrer">
              <b>{nowPlaying.name}</b>
            </a>
          </Typography>
          <Typography variant="h5" color="primary" sx={{ marginLeft: "auto" }}>
            <a
              href={nowPlaying.artistUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <b>
                <i>{nowPlaying.artist}</i>
              </b>
            </a>
          </Typography>
          {nowPlaying.albumArt && (
            <VolumeUpIcon sx={{ color: "darkgreen", marginLeft: "10px" }} />
          )}
        </Box>
      </Box>
    </>
  );
};

export default NowPlaying;
