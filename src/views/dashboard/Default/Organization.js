import { useState } from 'react';
import { Box, Typography, Avatar, Button, Grid } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PostIcon from '@mui/icons-material/PostAdd'; // Icon for POST
import PollIcon from '@mui/icons-material/Poll'; // Icon for POLL
import PraiseIcon from '@mui/icons-material/ThumbUp'; // Icon for PRAISE
import Chart from 'react-apexcharts';
import ChartDataMonth from './chart-data/total-order-month-line-chart';
import ChartDataYear from './chart-data/total-order-year-line-chart';

// Styled Components
const CardWrapper = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper, // Use theme's paper color
    color: theme.palette.text.primary,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    transition: 'background-color 0.5s ease', // Background color animation
    '&:after, &:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.primary[800],
        borderRadius: '50%',
        opacity: 0.1, // Subtle opacity for the circles
    },
    '&:after': { top: -85, right: -95 },
    '&:before': { top: -125, right: -15 }
}));

const ITContentWrapper = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper, // Use theme's paper color
    color: theme.palette.text.primary,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: theme.shadows[3], // Add a subtle shadow for depth
    '&:after, &:before': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background: theme.palette.secondary[800],
        borderRadius: '50%',
        opacity: 0.1, // Subtle opacity for the circles
    },
    '&:after': { top: -85, right: -95 },
    '&:before': { top: -125, right: -15 }
}));

const OrganizationTab = () => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0); // Main tab state
    const [nestedTabValue, setNestedTabValue] = useState(0); // Nested tab state
    const [timeValue, setTimeValue] = useState(false);

    const handleChange = (newValue) => setTabValue(newValue);
    const handleNestedChange = (newValue) => setNestedTabValue(newValue);
    const handleChangeTime = (newValue) => setTimeValue(newValue);

    return (
        <Box sx={{ width: '100%' }}>
            {/* Custom Buttons for Organization and IT */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    variant={tabValue === 0 ? 'contained' : 'outlined'}
                    onClick={() => handleChange(0)}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        backgroundColor: tabValue === 0 ? theme.palette.primary.main : 'transparent',
                        color: tabValue === 0 ? '#fff' : theme.palette.text.primary,
                        '&:hover': {
                            backgroundColor: tabValue === 0 ? theme.palette.primary.dark : theme.palette.action.hover,
                        },
                    }}
                >
                    Organization
                </Button>
                <Button
                    variant={tabValue === 1 ? 'contained' : 'outlined'}
                    onClick={() => handleChange(1)}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        backgroundColor: tabValue === 1 ? theme.palette.secondary.main : 'transparent',
                        color: tabValue === 1 ? '#fff' : theme.palette.text.primary,
                        '&:hover': {
                            backgroundColor: tabValue === 1 ? theme.palette.secondary.dark : theme.palette.action.hover,
                        },
                    }}
                >
                    IT
                </Button>
            </Box>

            {/* Content for Organization Tab */}
            {tabValue === 0 && (
                <CardWrapper>

                    {/* Nested Tabs inside Organization Tab */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-start' }}> {/* Align to start */}
                        <Box
                            onClick={() => handleNestedChange(0)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                color: nestedTabValue === 0 ? theme.palette.primary.main : theme.palette.text.secondary,
                                fontWeight: nestedTabValue === 0 ? 600 : 400,
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            <PostIcon /> {/* POST Icon */}
                            <Typography variant="h6" className='fst-italic' style={{ fontSize: '14px' }}>POST</Typography>
                        </Box>
                        <Box
                            onClick={() => handleNestedChange(1)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                color: nestedTabValue === 1 ? theme.palette.success.main : theme.palette.text.secondary,
                                fontWeight: nestedTabValue === 1 ? 600 : 400,
                                '&:hover': {
                                    color: theme.palette.success.main,
                                },
                            }}
                        >
                            <PollIcon /> {/* POLL Icon */}
                            <Typography variant="h6" className='fst-italic' style={{ fontSize: '14px' }}>POLL</Typography>
                        </Box>
                        <Box
                            onClick={() => handleNestedChange(2)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                color: nestedTabValue === 2 ? theme.palette.warning.main : theme.palette.text.secondary,
                                fontWeight: nestedTabValue === 2 ? 600 : 400,
                                '&:hover': {
                                    color: theme.palette.warning.main,
                                },
                            }}
                        >
                            <PraiseIcon /> {/* PRAISE Icon */}
                            <Typography variant="h6" className='fst-italic' style={{ fontSize: '14px' }}>PRAISE</Typography>
                        </Box>
                    </Box>

                    {/* Content for Nested Tabs */}
                    {nestedTabValue === 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 500, textAlign: 'center', mt: 4, color: theme.palette.text.primary }}>
                                <PostIcon sx={{ fontSize: 40, mb: 2 }} /> {/* POST Icon */}
                                POST Content
                            </Typography>
                            <Typography sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                                This is a dummy content for POST. You can add your own content here.
                            </Typography>
                        </Box>
                    )}
                    {nestedTabValue === 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 500, textAlign: 'center', mt: 4, color: theme.palette.text.primary }}>
                                <PollIcon sx={{ fontSize: 40, mb: 2 }} /> {/* POLL Icon */}
                                POLL Content
                            </Typography>
                            <Typography sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                                This is a dummy content for POLL. You can add your own content here.
                            </Typography>
                        </Box>
                    )}
                    {nestedTabValue === 2 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 500, textAlign: 'center', mt: 4, color: theme.palette.text.primary }}>
                                <PraiseIcon sx={{ fontSize: 40, mb: 2 }} /> {/* PRAISE Icon */}
                                PRAISE Content
                            </Typography>
                            <Typography sx={{ textAlign: 'center', color: theme.palette.text.secondary }}>
                                This is a dummy content for PRAISE. You can add your own content here.
                            </Typography>
                        </Box>
                    )}
                </CardWrapper>
            )}

            {/* Content for IT Tab */}
            {tabValue === 1 && (
                <ITContentWrapper>
                    <Grid container direction="column">
                        <Grid item>
                            <Grid container justifyContent="space-between" alignItems="center">
                                <Grid item>
                                    <Avatar sx={{ backgroundColor: theme.palette.secondary[800], color: '#fff' }}>
                                        <LocalMallOutlinedIcon />
                                    </Avatar>
                                </Grid>
                                <Grid item>
                                    <Button variant={timeValue ? 'contained' : 'outlined'} size="small" onClick={() => handleChangeTime(true)}>
                                        Month
                                    </Button>
                                    <Button variant={!timeValue ? 'contained' : 'outlined'} size="small" onClick={() => handleChangeTime(false)}>
                                        Year
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sx={{ mt: 2 }}>
                            <Grid container alignItems="center">
                                <Grid item xs={6}>
                                    <Typography variant="h4" sx={{ fontWeight: 500 }}>
                                        {timeValue ? '₹208' : '₹1161'}
                                    </Typography>
                                    <Avatar sx={{ backgroundColor: theme.palette.secondary[200], color: theme.palette.secondary.dark }}>
                                        <ArrowDownwardIcon sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }} />
                                    </Avatar>
                                    <Typography sx={{ color: theme.palette.text.secondary }}>Total IT Orders</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    {timeValue ? <Chart {...ChartDataMonth} /> : <Chart {...ChartDataYear} />}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </ITContentWrapper>
            )}
        </Box>
    );
};

export default OrganizationTab;