import React, { useState, useEffect } from 'react';
import {
    Avatar, Box, Typography, Divider, Paper
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import apiCalls from 'apicall';
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
            }
        } catch (error) {
            console.error('Error fetching birthday data:', error);
        }
    };

    const BirthdayCard = ({ person, icon, isToday }) => (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                borderLeft: isToday ? '6px solid #1976d2' : '6px solid #ffa726',
                borderRadius: 2,
                background: 'linear-gradient(to right, #fdfcfb, #e2d1c3)', // Gradient background
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'background-color 0.3s ease', // Smooth transition effect
                '&:hover': {
                    background: 'linear-gradient(to right, #f3e5f5, #e2d1c3)', // Hover gradient
                }
            }}
        >
            <Avatar
                src={person.image || ''}
                sx={{
                    bgcolor: isToday ? '#1976d2' : '#fb8c00',
                    color: '#fff',
                    width: 56,
                    height: 56,
                    fontSize: 22,
                    mr: 2
                }}
            >
                {person.name[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight="bold">{person.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {person.employeeId}
                </Typography>
            </Box>
            <Box>
                <Typography variant="caption" color={isToday ? '#1976d2' : '#fb8c00'}>
                    {isToday ? 'Today 🎉' : person.date}
                </Typography>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ p: 3 }}>
            {/* Birthdays Today */}
            {todayBirthdays.length > 0 ? (
                todayBirthdays.map((person, idx) => (
                    <BirthdayCard key={idx} person={person} isToday />
                ))
            ) : (
                <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
                    No birthdays today.
                </Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Upcoming Birthdays */}
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#fb8c00' }}>
                <CalendarMonthIcon /> Upcoming Birthdays
            </Typography>
            {upcomingBirthdays.length > 0 ? (
                upcomingBirthdays.map((person, idx) => (
                    <BirthdayCard key={idx} person={person} isToday={false} />
                ))
            ) : (
                <Typography variant="body2" sx={{ color: '#888' }}>
                    No upcoming birthdays in the next 7 days.
                </Typography>
            )}
        </Box>
    );
}

export default Birthday;
