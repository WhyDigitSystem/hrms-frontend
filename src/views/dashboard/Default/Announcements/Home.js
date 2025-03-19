import React from 'react';
import { Box, Typography, styled, useTheme } from '@mui/material';
import Announcements from './Announcements';

// Styled Components
const CardWrapper = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    transition: 'background-color 0.5s ease',
    '&:after, &:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.primary[800],
        borderRadius: '50%',
        opacity: 0.1,
    },
    '&:after': { top: -85, right: -95 },
    '&:before': { top: -125, right: -15 },
}));

const Home = () => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%' }}>
            {/* Content for Announcements */}
            <CardWrapper>
                {/* Enhanced Heading for Announcements */}

                <Typography variant="h4" sx={{ mb: 2, color: theme.palette.text.primary }}>
                    Announcements
                </Typography>


                {/* Announcements Component */}
                <Box sx={{ mt: 2 }}>
                    <Announcements />
                </Box>
            </CardWrapper>
        </Box>
    );
};

export default Home;