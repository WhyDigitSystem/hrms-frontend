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
                const today = dayjs().startOf('day');
                const endDate = today.add(7, 'day');
                const todayFormatted = today.format('MM-DD');

                const todayList = [];
                const upcomingList = [];

                allBirthdays.forEach(emp => {
                    const birthDate = dayjs(emp.dob, ['YYYY-MM-DD', 'YYYY/MM/DD', 'DD-MM-YYYY']);
                    let birthdayThisYear = dayjs(`${today.year()}-${birthDate.format('MM-DD')}`);

                    // If birthday already occurred this year, consider next year's
                    if (birthdayThisYear.isBefore(today, 'day')) {
                        birthdayThisYear = birthdayThisYear.add(1, 'year');
                    }

                    // Check if today is the birthday
                    if (birthDate.format('MM-DD') === todayFormatted) {
                        todayList.push({
                            name: emp.empCode,
                            initials: emp.empCode[0],
                            employeeId: emp.empName,
                            role: 'Employee',
                            image: '', // Optional: Add image if available
                        });
                    }
                    // Check if upcoming within next 7 days
                    else if (birthdayThisYear.isAfter(today) && birthdayThisYear.isBefore(endDate)) {
                        upcomingList.push({
                            name: emp.empCode,
                            employeeId: emp.empName,
                            date: birthdayThisYear.format('MMM DD'),
                            image: '', // Optional: Add image if available
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

    const BirthdayCard = ({ person, isToday }) => (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                borderLeft: isToday ? '6px solid #1976d2' : '6px solid #ffa726',
                borderRadius: 2,
                background: 'linear-gradient(to right, #fdfcfb, #e2d1c3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                    background: 'linear-gradient(to right, #f3e5f5, #e2d1c3)',
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
            <Typography
                variant="h6"
                sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#fb8c00'
                }}
            >
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
