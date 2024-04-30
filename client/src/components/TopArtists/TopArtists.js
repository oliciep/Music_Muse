import React from "react";
import { Typography, Box, useTheme, ThemeProvider } from "@mui/material";
import "./TopArtists.css"; // Make sure the path is correct

const TopArtists = ({ topArtists }) => {
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
          Your top artists.
        </Typography>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {topArtists.map((artist, index) => (
            <div
              key={index}
              className="artistContainer" // Applying the CSS class
            >
              <Typography variant="h4" color="primary">
                <b>{index + 1}.</b> &nbsp;
              </Typography>
              {artist.image && (
                <img
                  src={artist.image}
                  alt="Artist"
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
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <b>{artist.name}</b>
                </a>
              </Typography>
            </div>
          ))}
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default TopArtists;
