import React from "react";
import { Typography, Box, useTheme, ThemeProvider } from "@mui/material";

const TopGenres = ({ topGenres }) => {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="fadeInAnimation stats" // Ensure your CSS is handling this class correctly
          style={{
            backgroundColor: theme.palette.tertiary.main, // Make sure theme is passed correctly if needed
            width: "85vw",
            borderRadius: "20px",
            borderColor: "theme.palette.primary.main",
            borderWidth: "3px",
            borderStyle: "solid",
            padding: "20px",
            overflow: "auto",
          }}
        >
          <Box>
            <Typography
              variant="h2"
              color="primary"
              gutterBottom
              className="fadeInAnimation"
            >
              Your top genres.
            </Typography>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {topGenres.map((genre, index) => (
                <span
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h4" color="primary">
                    <b>{genre[0]}</b> <i>({genre[1]} tracks)</i>
                    {index < topGenres.length - 1 ? "," : ""}
                  </Typography>
                </span>
              ))}
            </div>
          </Box>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TopGenres;
