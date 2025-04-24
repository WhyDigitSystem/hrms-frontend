import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Divider,
    Tabs,
    Tab,
    Typography,
    Paper,
} from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Birthday from './Birthday';
import WorkAnniversaries from './workAnniversaries';
import NewJoiner from './NewJoiner';

const Index = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const renderSectionHeader = (icon, text) => (
        <Box display="flex" alignItems="center" mb={2}>
            {icon}
            <Typography variant="h6" ml={1.5} fontWeight="bold" color="primary.dark">
                {text}
            </Typography>
        </Box>
    );

    return (
        <Card
            sx={{
                borderRadius: 4,
                boxShadow: 6,
                width: '100%',
                background: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)',
                p: 3,
                border: '1px solid #d1d5db',
                borderLeft: '4px solid #264952',
            }}
        >

            <CardContent sx={{ p: 0 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="fullWidth"
                    TabIndicatorProps={{
                        style: { backgroundColor: '#1976d2', height: '3px' },
                    }}
                    sx={{
                        backgroundColor: '#ffffff',
                        borderRadius: 2,
                        mb: 2,
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            py: 1.5,
                        },
                    }}
                >
                    <Tab
                        label="Birthday"
                        icon={<CakeIcon />}
                        iconPosition="start"
                        sx={{
                            color: tabValue === 0 ? '#1976d2' : '#6b7280',
                            backgroundColor: tabValue === 0 ? '#e3f2fd' : 'transparent',
                        }}
                    />
                    <Tab
                        label="Work Anniversaries"
                        icon={<PeopleIcon />}
                        iconPosition="start"
                        sx={{
                            color: tabValue === 1 ? '#1976d2' : '#6b7280',
                            backgroundColor: tabValue === 1 ? '#e3f2fd' : 'transparent',
                        }}
                    />
                    <Tab
                        label="New Joiners"
                        icon={<PersonAddIcon />}
                        iconPosition="start"
                        sx={{
                            color: tabValue === 2 ? '#1976d2' : '#6b7280',
                            backgroundColor: tabValue === 2 ? '#e3f2fd' : 'transparent',
                        }}
                    />
                </Tabs>

                <Divider sx={{ my: 2, backgroundColor: '#cbd5e1' }} />

                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        background: 'linear-gradient(to right, #fdfcfb, #e2d1c3)', // Corrected this line
                        borderRadius: 3,
                        border: '1px solid #e0e0e0',
                    }}
                >
                    {tabValue === 0 && (
                        <>
                            {renderSectionHeader(<CakeIcon color="primary" />, 'Birthday Today')}
                            <Birthday />
                        </>
                    )}
                    {tabValue === 1 && (
                        <>
                            {renderSectionHeader(<PeopleIcon color="primary" />, 'Work Anniversaries')}
                            <WorkAnniversaries />
                        </>
                    )}
                    {tabValue === 2 && (
                        <>
                            {renderSectionHeader(<PersonAddIcon color="primary" />, 'New Joiners')}
                            <NewJoiner />
                        </>
                    )}
                </Paper>
            </CardContent>
        </Card>
    );
};

export default Index;
