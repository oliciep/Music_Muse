import React from "react";
import { Typography, Box } from "@mui/material";

const TopArtists = ({ topArtists }) => {
  return (
    <Box
      style={{
        backgroundColor: "lightTheme.palette.tertiary.main",
        width: "40vw",
        borderRadius: "20px",
        borderColor: "lightTheme.palette.primary.main",
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
            style={{
              width: "96%",
              display: "flex",
              alignItems: "center",
              marginTop: "10px",
              borderRadius: "5px",
              padding: "2px 0px 2px 10px",
            }}
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
  );
};

export default TopArtists;
