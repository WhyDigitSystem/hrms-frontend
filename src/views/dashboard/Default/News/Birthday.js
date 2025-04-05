import React, { useState, useEffect } from 'react';
import {
    Avatar, Box, Typography, Divider, Grid
} from '@mui/material';
import apiCalls from 'apicall';
import { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

function Birthday() {
    const [orgId] = useState(localStorage.getItem('orgId'));
    const [loginUserName] = useState(localStorage.getItem('userName'));
    const [todayBirthdays, setTodayBirthdays] = useState([]);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);

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
                const today = dayjs();
                const todayFormatted = today.format('MM-DD');

                const todayList = [];
                const upcomingList = [];

                allBirthdays.forEach(emp => {
                    const birthDate = dayjs(emp.dob);
                    let birthdayThisYear = dayjs(`${today.year()}-${birthDate.format('MM-DD')}`);

                    if (birthdayThisYear.isBefore(today, 'day')) {
                        birthdayThisYear = birthdayThisYear.add(1, 'year');
                    }

                    const diffDays = birthdayThisYear.diff(today, 'day');

                    if (birthDate.format('MM-DD') === todayFormatted) {
                        todayList.push({
                            name: emp.empCode,
                            initials: emp.empCode[0],
                            employeeId: emp.empName,
                            role: 'Employee',
                        });
                    } else if (diffDays > 0 && diffDays <= 7) {
                        upcomingList.push({
                            name: emp.empCode,
                            employeeId: emp.empName,
                            date: birthdayThisYear.format('MMM DD'),
                            image: '',
                        });
                    }
                });

                setTodayBirthdays(todayList);
                setUpcomingBirthdays(upcomingList);
            } else {
               
            }
        } catch (error) {
            console.error('Error fetching birthday data:', error);
            
        }
    };

    return (
        <>
            <Typography variant="h6" style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                🎉 Birthdays Today
            </Typography>
            {todayBirthdays.length > 0 ? (
                todayBirthdays.map((person, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        <Avatar sx={{ backgroundColor: '#1976d2', color: '#fff' }}>{person.initials}</Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 'bold' }}>{person.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#757575' }}>
                                {person.employeeId} | {person.role}
                            </Typography>
                        </Box>
                    </Box>
                ))
            ) : (
                <Typography variant="body2" style={{ color: '#757575' }}>
                    No birthdays today.
                </Typography>
            )}

            <Divider style={{ margin: '16px 0', backgroundColor: '#e0e0e0' }} />

            <Typography variant="h6" style={{ color: '#1976d2', marginBottom: '16px', fontWeight: 'bold' }}>
                🗓️ Upcoming Birthdays
            </Typography>
            {upcomingBirthdays.length > 0 ? (
                <Grid container spacing={2}>
                    {upcomingBirthdays.map((person, index) => (
                        <Grid
                            item
                            key={index}
                            xs={6}
                            sm={4}
                            md={3}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <Avatar
                                alt={person.name}
                                src={person.image || ''}
                                style={{
                                    marginBottom: '8px',
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                }}
                            >
                                {person.name[0]}
                            </Avatar>
                            <Typography variant="body2" align="center" style={{ fontWeight: 'bold' }}>
                                {person.name}
                            </Typography>
                            <Typography variant="caption" align="center" style={{ color: '#757575' }}>
                                {person.date}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body2" style={{ color: '#757575' }}>
                    No upcoming birthdays in the next 7 days.
                </Typography>
            )}
        </>
    );
}

export default Birthday;
