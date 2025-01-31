import React, { useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  // Sample events data
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Meeting with Team',
      start: new Date(2025, 0, 31, 10, 0), // Jan 31, 2025, 10:00 AM
      end: new Date(2025, 0, 31, 12, 0),   // Jan 31, 2025, 12:00 PM
    },
    {
      id: 2,
      title: 'Project Deadline',
      start: new Date(2025, 1, 5, 9, 0),  // Feb 5, 2025, 9:00 AM
      end: new Date(2025, 1, 5, 11, 0),   // Feb 5, 2025, 11:00 AM
    }
  ]);

  return (
    <div style={{ height: '80vh', padding: '20px' }}>
      <h2>Calendar</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default Calendar;
