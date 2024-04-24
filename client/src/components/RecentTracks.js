// components/RecentTracks.js
import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const RecentTracks = ({ recentTracks }) => {
  return (
    <Box
      sx={{
        borderRadius: "5px",
        padding: "10px",
      }}
    >
      {recentTracks.map((track, index) => (
        <Box
          key={index}
          sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", minWidth: "220px" }}
          >
            {track.image && (
              <Box
                component="img"
                src={track.image}
                alt={track.name}
                sx={{ width: "50px", height: "50px", marginRight: "20px" }}
              />
            )}
            <Typography variant="h5" color="primary">
              <a href={track.url} target="_blank" rel="noopener noreferrer">
                <b>{track.name}</b>
              </a>
            </Typography>
          </Box>
          <Typography variant="h5" color="primary" sx={{ marginLeft: "auto" }}>
            <a href={track.artistUrl} target="_blank" rel="noopener noreferrer">
              <b>{track.artist}</b>
            </a>
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default RecentTracks;
