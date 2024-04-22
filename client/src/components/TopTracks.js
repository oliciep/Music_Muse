// TopTracks.js
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const TopTracks = ({ tracks }) => {
  return (
    <Box>
      <Typography variant="h4">Top Tracks</Typography>
      {tracks.map((track, index) => (
        <Box key={index}>
          <img src={track.image} alt={track.name} style={{ width: 100, height: 100 }} />
          <div>
            <a href={track.url} target="_blank" rel="noopener noreferrer">{track.name} - {track.artist}</a>
          </div>
        </Box>
      ))}
    </Box>
  );
};

export default TopTracks;
