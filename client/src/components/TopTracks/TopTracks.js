import React from "react";
import { Typography, Box, useTheme, ThemeProvider } from "@mui/material";
import "./TopTracks.css"; // Make sure the path is correct

const TopTracks = ({ topTracks }) => {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Box
        style={{
          backgroundColor: theme.palette.tertiary.main,
          width: "40vw",
          borderRadius: "20px",
          borderColor: theme.palette.primary.main,
          borderWidth: "3px",
          borderStyle: "solid",
          padding: "10px",
        }}
      >
        <Typography
          variant="h2"
          color="primary"
          gutterBottom
          className="fadeInAnimation"
        >
          Your top tracks.
        </Typography>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {topTracks.map((track, index) => (
            <div
              key={index}
              className="trackContainer" // Applying the CSS class
            >
              <Typography variant="h4" color="primary">
                <b>{index + 1}.</b> &nbsp;
              </Typography>
              {track.image && (
                <img
                  src={track.image}
                  alt="Track"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />
              )}
              <Typography variant="h4" color="primary">
                &nbsp;
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <b>{track.name}</b>
                </a>
              </Typography>
            </div>
          ))}
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default TopTracks;
