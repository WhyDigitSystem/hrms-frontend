import React, { useState } from 'react';
import { Avatar, Box, Card, CardContent, Grid, Typography, Divider, Tabs, Tab, IconButton } from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import Birthday from './Birthday';
import WorkAnniversaries from './workAnniversaries';  
import NewJoiner from './NewJoiner';

const Index = () => {
    const [tabValue, setTabValue] = useState(0);
    const [wishesCount, setWishesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleWish = () => {
        setWishesCount(wishesCount + 1);
    };

    const handleComment = () => {
        setCommentsCount(commentsCount + 1);
    };

    // Sample data (Replace with API data)
    const todayBirthdays = [
        { name: 'Dinesh', initials: 'D', employeeId: 'EMP123', role: 'Software Engineer' },
    ];

    const upcomingBirthdays = [
        { name: 'Mani', date: '09 March', image: 'https://via.placeholder.com/40' },
        { name: 'Karthi', date: '10 March', image: 'https://via.placeholder.com/40' },
        { name: 'Sasi', date: '11 March', image: 'https://via.placeholder.com/40' },
    ];

    const workAnniversaries = [
        { name: 'Ramesh', years: '5', image: 'https://via.placeholder.com/40', employeeId: 'EMP789', role: 'Team Lead' },
        { name: 'Sneha', years: '2', image: 'https://via.placeholder.com/40', employeeId: 'EMP101', role: 'UX Designer' },
    ];

    return (
        <Card style={{
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            width: '100%',
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            overflow: 'hidden',
        }}>
            <CardContent>
                <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="fullWidth"
                    TabIndicatorProps={{
                        style: { backgroundColor: '#1976d2', height: '3px' },
                    }}
                    textColor="primary"
                >
                    <Tab
                        label="Birthdays"
                        icon={<CakeIcon style={{ color: tabValue === 0 ? '#1976d2' : '#757575' }} />}
                        style={{ fontWeight: tabValue === 0 ? 'bold' : 'normal', color: tabValue === 0 ? '#1976d2' : '#757575' }}
                    />
                    <Tab
                        label="Work Anniversaries"
                        icon={<PeopleIcon style={{ color: tabValue === 1 ? '#1976d2' : '#757575' }} />}
                        style={{ fontWeight: tabValue === 1 ? 'bold' : 'normal', color: tabValue === 1 ? '#1976d2' : '#757575' }}
                    />
                    <Tab
                        label="0 New Joiners"
                        style={{ fontWeight: tabValue === 2 ? 'bold' : 'normal', color: tabValue === 2 ? '#1976d2' : '#757575' }}
                    />
                </Tabs>
                <Divider style={{ margin: '16px 0', backgroundColor: '#e0e0e0' }} />

                {tabValue === 0 && (
                    <Birthday />
                )}

                {tabValue === 1 && (
                  <workAnniversaries />
                )}

                {tabValue === 2 && (
                    <NewJoiner />
                )}
            </CardContent>
        </Card>
    );
};

export default Index;
