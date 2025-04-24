import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    useMediaQuery,
    Paper,
    Chip,
    Divider
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const CardWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2),
    },
    borderRadius: theme.shape.borderRadius * 2,
    background: `linear-gradient(135deg, #d0f0f0 30%, #239f9d 90%)`,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[6],
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'scale(1.01)',
        boxShadow: theme.shadows[10]
    },
    position: 'relative',
    overflow: 'hidden'
}));

const TimeDate = ({ isLoading }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [location, setLocation] = useState({ city: '', country: '' });
    const [weather, setWeather] = useState({ temperature: '', condition: '' });

    const WEATHER_API_KEY = '33fb936b8c658a7d2743cfef282557cf';

    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchLocationAndWeather = async () => {
            try {
                const locationResponse = await fetch('https://ipapi.co/json/');
                if (!locationResponse.ok) throw new Error('Failed to fetch location');
                const locationData = await locationResponse.json();
                setLocation({ city: locationData.city, country: locationData.country_name });

                const weatherResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${locationData.city}&appid=${WEATHER_API_KEY}&units=metric`
                );
                if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
                const weatherData = await weatherResponse.json();

                setWeather({
                    temperature: `${Math.round(weatherData.main.temp)}°C`,
                    condition: weatherData.weather[0].main
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                setLocation({ city: 'Unknown', country: '' });
                setWeather({ temperature: 'N/A', condition: 'N/A' });
            }
        };

        fetchLocationAndWeather();
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    });
    const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const getGreeting = () => {
        const hour = currentDateTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <CardWrapper className="mt-lg-3 mt-3">
            <Grid container spacing={3} alignItems="center" direction={isMobile ? 'column' : 'row'}>
                <Grid item xs={12} sm={6}>
                    <Box display="flex" flexDirection="column" alignItems={isMobile ? 'center' : 'flex-start'} textAlign={isMobile ? 'center' : 'left'}>
                        <Box display="flex" alignItems="center" mb={1}>
                            <AccessTimeIcon sx={{ fontSize: isMobile ? 32 : 44, mr: 1, color: theme.palette.info.light }} />
                            <Typography
                                variant={isMobile ? 'h6' : 'h4'}
                                sx={{
                                    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 700
                                }}
                            >
                                {getGreeting()}
                            </Typography>
                        </Box>

                        <Typography
                            variant={isMobile ? 'h5' : 'h3'}
                            sx={{ fontWeight: 'bold', color: theme.palette.common.white }}
                        >
                            {formattedTime}
                        </Typography>

                        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
                            {formattedDate}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box display="flex" flexDirection="column" alignItems={isMobile ? 'center' : 'flex-end'} textAlign={isMobile ? 'center' : 'right'}>
                        <Box display="flex" alignItems="center" mb={1}>
                            <LocationOnIcon sx={{ fontSize: isMobile ? 32 : 44, mr: 1, color: theme.palette.success.light }} />
                            <Typography variant="h6">
                                {location.city}, {location.country}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.3)', width: isMobile ? '80%' : '100%' }} />

                        <Box display="flex" justifyContent={isMobile ? 'center' : 'flex-end'} flexWrap="wrap" gap={1}>
                            <Chip
                                icon={<AccessTimeIcon />}
                                label={`Time Zone: ${timeZone}`}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    color: theme.palette.common.white,
                                    borderRadius: 2,
                                    fontSize: isMobile ? '0.75rem' : 'inherit'
                                }}
                            />
                            <Chip
                                icon={<WbSunnyIcon />}
                                label={`${weather.temperature} | ${weather.condition}`}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    color: theme.palette.common.white,
                                    borderRadius: 2,
                                    fontSize: isMobile ? '0.75rem' : 'inherit'
                                }}
                            />
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Decorative background icon */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    fontSize: 160,
                    opacity: 0.05,
                    color: theme.palette.common.white,
                    pointerEvents: 'none'
                }}
            >
                <WbSunnyIcon fontSize="inherit" />
            </Box>
        </CardWrapper>
    );
};

TimeDate.propTypes = {
    isLoading: PropTypes.bool
};

export default TimeDate;
