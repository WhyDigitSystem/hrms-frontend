import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box, Typography, Grid, useMediaQuery, Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const CardWrapper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    background: `linear-gradient(135deg, ${'#e1efef'} 30%, ${'#239f9d'} 90%)`,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[4]
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
        <CardWrapper className='mt-lg-5 mt-4'>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center">
                        <AccessTimeIcon sx={{ fontSize: isMobile ? 40 : 48, mr: 1, color: theme.palette.info.light }} />
                        <Typography variant={isMobile ? 'h5' : 'h4'}>{getGreeting()}</Typography>
                    </Box>
                    <Typography variant={isMobile ? 'h6' : 'h3'} sx={{ mt: 1, fontWeight: 'bold' }}>
                        {formattedTime}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        {formattedDate}
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" justifyContent={isMobile ? 'flex-start' : 'flex-end'}>
                        <LocationOnIcon sx={{ fontSize: isMobile ? 40 : 48, mr: 1, color: theme.palette.success.light }} />
                        <Typography variant="h6">{location.city}, {location.country}</Typography>
                    </Box>
                    <Typography variant="subtitle2" align={isMobile ? 'left' : 'right'}>
                        Time Zone: {timeZone}
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent={isMobile ? 'flex-start' : 'flex-end'} sx={{ mt: 1 }}>
                        <WbSunnyIcon sx={{ fontSize: 24, color: theme.palette.warning.light, mr: 1 }} />
                        <Typography variant="subtitle1">{weather.temperature} | {weather.condition}</Typography>
                    </Box>
                </Grid>
            </Grid>
        </CardWrapper>
    );
};

TimeDate.propTypes = {
    isLoading: PropTypes.bool
};

export default TimeDate;
