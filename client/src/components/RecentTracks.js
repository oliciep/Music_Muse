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
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {track.image && (
              <Box
                component="img"
                src={track.image}
                alt={track.name}
                sx={{ width: "50px", height: "50px", marginRight: "10px" }}
              />
            )}
            <Typography
              variant="h5"
              color="primary"
              sx={{ flexGrow: 1, marginRight: "10px" }}
            >
              <a href={track.url} target="_blank" rel="noopener noreferrer">
                {track.name}
              </a>
            </Typography>
          </Box>
          <Typography variant="h5" color="primary" sx={{ flexGrow: 1 }}>
            <a href={track.artistUrl} target="_blank" rel="noopener noreferrer">
              {track.artist}
            </a>
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default RecentTracks;
