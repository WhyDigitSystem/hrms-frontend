import React, { useState, useEffect } from 'react';
import {
    Avatar,
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    useMediaQuery
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import apiCalls from 'apicall';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import birthdayBackground from '../../../../assets/images/happy-birthday-flags-banner-with-confetti-vector.webp';

dayjs.extend(isBetween);

function Birthday() {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [todayBirthdays, setTodayBirthdays] = useState([]);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
    const [openProfileDialog, setOpenProfileDialog] = useState(false);

    useEffect(() => {
        if (orgId && loginUserName) {
            fetchBirthdayData();
        }
    }, [orgId, loginUserName]);

    const fetchBirthdayData = async () => {
        try {
            const result = await apiCalls('get', `/basicmaster/getEmpDob?orgId=${orgId}`);
            if (result?.status && result?.paramObjectsMap?.empDob?.length > 0) {
                const allBirthdays = result.paramObjectsMap.empDob;
                const today = dayjs().startOf('day');
                const endDate = today.add(7, 'day');
                const todayFormatted = today.format('MM-DD');

                const todayList = [];
                const upcomingList = [];

                allBirthdays.forEach(emp => {
                    const birthDate = dayjs(emp.dob, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD-MM-YYYY']);
                    let birthdayThisYear = dayjs(`${today.year()}-${birthDate.format('MM-DD')}`);

                    // Adjust to next year if already passed
                    if (birthdayThisYear.isBefore(today, 'day')) {
                        birthdayThisYear = birthdayThisYear.add(1, 'year');
                    }

                    const personData = {
                        name: emp.empCode,
                        employeeId: emp.empName,
                        image: emp.profileImage || '', // base64 string or empty
                        date: birthdayThisYear.format('MMM DD'),
                    };

                    if (birthDate.format('MM-DD') === todayFormatted) {
                        todayList.push(personData);
                    } else if (birthdayThisYear.isAfter(today) && birthdayThisYear.isBefore(endDate)) {
                        upcomingList.push(personData);
                    }
                });

                setTodayBirthdays(todayList);
                setUpcomingBirthdays(upcomingList);
            }
        } catch (error) {
            console.error('Error fetching birthday data:', error);
        }
    };

    const BirthdayCard = ({ person, isToday }) => (
        <Paper
            elevation={3}
            sx={{
                p: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                backgroundColor: 'transparent',
            }}
        >
            <div className='pt-4 mt-5 mb-3'>
                <div className='d-flex align-item:center justify-content-center align-items-center'>
                    <div>
                        <Avatar
                            src={person.image ? `data:image/png;base64,${person.image}` : ''}
                            onClick={() => setOpenProfileDialog(true)}
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: '#1976d2',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: 20,
                            }}
                        >
                            {!person.image && person.name[0]}
                        </Avatar>
                    </div>
                    <div className='.pt-5 .mt-5 ps-4'>
                        <Typography fontWeight="bold">{person.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {person.employeeId}
                        </Typography>
                        {/* {!isToday && (
                            <Typography variant="caption" color="text.secondary">
                                🎂 {person.date}
                            </Typography>
                        )} */}
                    </div>
                </div>
            </div>
        </Paper>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Today's Birthdays Section */}
            {todayBirthdays.length > 0 ? (
                <Box
                    sx={{
                        p: 1,
                        mb: 4,
                        borderRadius: 3,
                        backgroundImage: `url(${birthdayBackground})`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            color: '#fff',
                            mb: 2,
                            textAlign: 'center',
                            textShadow: '1px 1px 4px rgba(0,0,0,0.4)',
                        }}
                    >
                    </Typography>

                    <Grid container spacing={2} justifyContent="center">
                        {todayBirthdays.map((person, idx) => (
                            <Grid item key={idx} xs={12} sm={6} md={4} lg={3}>
                                <BirthdayCard person={person} isToday />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ) : (
                <Typography
                    variant="body2"
                    sx={{
                        color: '#888',
                        textAlign: 'center',
                    }}
                >
                    No birthdays today.
                </Typography>
            )}

            {/* Divider */}
            {upcomingBirthdays.length > 0 && todayBirthdays.length > 0 && (
                <Divider sx={{ my: 3 }} />
            )}

            {/* Upcoming Birthdays Section */}
            {upcomingBirthdays.length > 0 && (
                <Box sx={{ borderRadius: 3, backgroundColor: 'transparent' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#fb8c00',
                        }}
                    >
                        <CalendarMonthIcon /> Upcoming Birthdays
                    </Typography>

                    <Grid container >
                        {upcomingBirthdays.map((person, idx) => (
                            <Grid item key={idx} xs={12} sm={12} md={12} lg={12}>
                                <BirthdayCard person={person} isToday={false} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

        </Box>
    );
}

export default Birthday;
