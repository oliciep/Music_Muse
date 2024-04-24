// components/NowPlaying.js
import React from "react";
import Typography from "@mui/material/Typography";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const NowPlaying = ({ nowPlaying }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <Typography variant="h2" color="primary" gutterBottom>
        Your Recent Tracks
      </Typography>
      <div
        style={{
          backgroundColor: "lightgreen",
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        {nowPlaying.albumArt && (
          <img
            src={nowPlaying.albumArt}
            alt="Track Album"
            style={{ width: "50px", height: "50px", marginRight: "10px" }}
          />
        )}
        <Typography variant="h5" color="primary" style={{ flex: 1 }}>
          <a href={nowPlaying.url} target="_blank" rel="noopener noreferrer">
            {nowPlaying.name}
          </a>
        </Typography>
        <Typography variant="h5" color="primary" style={{ flex: 1 }}>
          <a
            href={nowPlaying.artistUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {nowPlaying.artist}
          </a>
        </Typography>
        {nowPlaying.albumArt && <VolumeUpIcon style={{ color: "darkgreen" }} />}
      </div>
    </div>
  );
};

export default NowPlaying;
