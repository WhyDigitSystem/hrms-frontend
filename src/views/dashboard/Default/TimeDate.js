import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { Box, Typography, Grid, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// styles
const CardWrapper = styled(MainCard)(({ theme }) => ({
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.palette.primary[50],
    color: theme.palette.primary[900]
}));

const TimeDate = ({ isLoading }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile devices
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [location, setLocation] = useState({ city: '', country: '' });
    const [weather, setWeather] = useState({ temperature: '', condition: '' });

    const WEATHER_API_KEY = '33fb936b8c658a7d2743cfef282557cf';

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch user's location and weather data
    useEffect(() => {
        const fetchLocationAndWeather = async () => {
            try {
                const locationResponse = await fetch('https://ipapi.co/json/');
                if (!locationResponse.ok) throw new Error('Failed to fetch location');
                const locationData = await locationResponse.json();
                setLocation({ city: locationData.city, country: locationData.country_name });

                // Fetch weather based on user's city
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

    // Format date and time
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

    // Greeting message based on time
    const getGreeting = () => {
        const hour = currentDateTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <>
            {isLoading ? (
                <TotalIncomeCard />
            ) : (
                <CardWrapper border={false} content={false}>
                    <Box sx={{ p: isMobile ? 2 : 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            {/* Left Section: Time and Date */}
                            <Grid item>
                                <AccessTimeIcon sx={{ fontSize: isMobile ? 36 : 48, color: theme.palette.primary.main }} />
                            </Grid>
                            <Grid item xs>
                                <Typography variant={isMobile ? "h6" : "h5"} align="left" color="inherit">
                                    {getGreeting()}
                                </Typography>
                                <Typography variant={isMobile ? "h4" : "h2"} align="left" color="inherit" sx={{ mt: 1 }}>
                                    {formattedTime}
                                </Typography>
                                <Typography variant={isMobile ? "body1" : "h6"} align="left" color="inherit" sx={{ mt: 1 }}>
                                    Today - {formattedDate}
                                </Typography>
                            </Grid>

                            {/* Right Section: Location, Weather, and Time Zone */}
                            <Grid item>
                                <LocationOnIcon sx={{ fontSize: isMobile ? 36 : 48, color: theme.palette.secondary.main }} />
                            </Grid>
                            <Grid item xs>
                                <Typography variant={isMobile ? "body1" : "h6"} align="right" color="inherit">
                                    {location.city}, {location.country}
                                </Typography>
                                <Typography variant={isMobile ? "body2" : "body1"} align="right" color="inherit">
                                    Time Zone: {timeZone}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}>
                                    <WbSunnyIcon sx={{ fontSize: isMobile ? 20 : 24, color: theme.palette.warning.main, mr: 1 }} />
                                    <Typography variant={isMobile ? "body2" : "body1"} align="right" color="inherit">
                                        {weather.temperature} | {weather.condition}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

TimeDate.propTypes = {
    isLoading: PropTypes.bool
};

export default TimeDate;
