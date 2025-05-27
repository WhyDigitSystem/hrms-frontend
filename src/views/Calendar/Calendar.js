import React, { useState, useEffect } from 'react';
import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [activeTab, setActiveTab] = useState('calendar');
  const [holidays, setHolidays] = useState([]);

  // Local storage values
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName] = useState(localStorage.getItem('branch'));
  const [department] = useState(localStorage.getItem('department'));
  const [empCode] = useState(localStorage.getItem('employeeCode'));
  const [empName] = useState(localStorage.getItem('employeeName'));

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const eventTypeColors = {
    holiday: '#FF6347',
    meeting: '#1E90FF',
    birthday: '#FFD700',
    training: '#32CD32',
    other: '#808080'
  };

  const [newEvent, setNewEvent] = useState({
    eventTitle: '',
    eventType: 'meeting',
    date: '',
    description: ''
  });

  useEffect(() => {
    const updateCalendar = () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const days = [];
      const firstDayIndex = startOfMonth.getDay();
      const totalDays = endOfMonth.getDate();
      const combinedEvents = [...calendarEvents, ...holidays];

      let dayCount = 1;
      for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
          if (i === 0 && j < firstDayIndex) {
            week.push(null);
          } else if (dayCount > totalDays) {
            break;
          } else {
            const dayWithEvents = {
              day: dayCount,
              events: combinedEvents.filter(event => {
                try {
                  const [year, month, day] = event.date.split('-').map(Number);
                  const eventDate = new Date(year, month - 1, day);
                  return (
                    eventDate.getDate() === dayCount &&
                    eventDate.getMonth() === currentDate.getMonth() &&
                    eventDate.getFullYear() === currentDate.getFullYear()
                  );
                } catch (error) {
                  console.error('Invalid date format:', event.date);
                  return false;
                }
              })
            };
            week.push(dayWithEvents);
            dayCount++;
          }
        }
        days.push(week);
        if (dayCount > totalDays) break;
      }
      setCalendarDays(days);
    };

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };

    const handleResize = () => setIsMobile(window.innerWidth <= 600);

    updateCalendar();
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentDate, calendarEvents, holidays]);

  // Fetch data functions
  const getAllCalendarByOrgId = async () => {
    try {
      const result = await apiCalls('get',
        `/basicmaster/getAllCalendarByOrgId?branchCode=${branchCode}&orgId=${orgId}&empCode=${empCode}`
      );
      if (result?.paramObjectsMap?.calendarVO) {
        const transformed = result.paramObjectsMap.calendarVO.reverse().map(event => ({
          ...event,
          eventTitle: event.eventTitle === "Untitled Event" ? "" : event.eventTitle?.trim() || "",
          eventType: event.eventType || 'other',
          // Add user details from localStorage
          empName: event.empName || empName,
          branchName: event.branchName || branchName,
          department: event.department || department
        }));
        setCalendarEvents(transformed);
      }
    } catch (err) {
      showToast('error', 'Error fetching calendar events');
    }
  };

  const getAllHolidaysByOrgId = async () => {
    try {
      const result = await apiCalls('get',
        `/basicmaster/getAllHolidayByOrgId?orgId=${orgId}&branchCode=${branchCode}`
      );
      if (result?.paramObjectsMap?.holidayVO) {
        const transformed = result.paramObjectsMap.holidayVO.map(holiday => ({
          eventTitle: `${holiday.festival} 🎉`,
          eventType: 'holiday',
          date: holiday.holidayDate,
          description: `Date: ${holiday.holidayDate}\nDay: ${holiday.day}\nType: Official Holiday`,
          id: `holiday-${holiday.id}`,
          isHoliday: true
        }));
        setHolidays(transformed);
      }
    } catch (err) {
      showToast('error', 'Error fetching holidays');
    }
  };

  useEffect(() => {
    getAllCalendarByOrgId();
    getAllHolidaysByOrgId();
  }, []);

  // Event handlers
  const handleAddEvent = () => {
    const today = new Date();
    setNewEvent({
      eventTitle: '',
      eventType: 'meeting',
      date: formatDateForInput(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      description: '',
      id: null
    });
    setShowModal(true);
  };

  const handleEventClick = (event) => {
    setNewEvent({
      ...event,
      isHoliday: event.isHoliday || false
    });
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    // Validate required fields
    if (!newEvent.eventTitle?.trim()) {
      showToast('error', 'Event title is required');
      return;
    }

    if (!newEvent.date) {
      showToast('error', 'Event date is required');
      return;
    }

    // Prepare the API payload
    const saveData = {
      id: newEvent.id || null,
      eventTitle: newEvent.eventTitle.trim(),
      eventType: newEvent.eventType,
      date: newEvent.date,
      description: newEvent.description,
      orgId: orgId,
      branchCode: branchCode,
      empCode: empCode,
      createdBy: loginUserName
    };

    try {
      const result = await apiCalls('put', '/basicmaster/createUpdateCalendar', saveData);

      if (result?.status) {
        showToast('success', 'Event saved successfully');
        setShowModal(false);
        await getAllCalendarByOrgId(); // Refresh the events list
      } else {
        showToast('error', result?.message || 'Failed to save event');
      }
    } catch (err) {
      console.error('Save Error:', err);
      showToast('error', 'Error saving event. Please try again.');
    }
  };


  const ModalForm = () => (
    // ... other modal container styles ...
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSaveEvent();
    }}>
      {/* Event Title Input */}
      <div style={{ marginBottom: 12 }}>
        <label>Title</label>
        <input
          name="eventTitle"  // Corrected name
          value={newEvent.eventTitle}
          onChange={handleEventChange}
          style={inputStyle}
        />
      </div>

      {/* Event Type Select */}
      <div style={{ marginBottom: 12 }}>
        <label>Type</label>
        <select
          name="eventType"  // Corrected name
          value={newEvent.eventType}
          onChange={handleEventChange}
          style={inputStyle}
        >
          <option value="meeting">Meeting</option>
          <option value="birthday">Birthday</option>
          <option value="training">Training</option>
          <option value="other">Other</option>
        </select>
      </div>

    </form>
  );

  // Helper functions
  const formatDateForInput = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // UI components
  const EventLegend = () => (
    <div style={{ marginTop: 16, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
      <h4 style={{ fontWeight: 'bold', marginBottom: 12 }}>Event Legend</h4>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {Object.entries(eventTypeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, backgroundColor: color, borderRadius: '50%' }} />
            <span style={{ textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const CalendarGrid = () => (
    <div style={{
      marginTop: 24, padding: isMobile ? 8 : 16,
      backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 4 : 7}, 1fr)`,
        gap: 8, borderBottom: '1px solid #e5e5e5'
      }}>
        {weekdays.map(day => (
          <div key={day} style={{
            padding: 8, textAlign: 'center', fontWeight: 500,
            backgroundColor: '#f5f5f5', borderRadius: 8
          }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 7}, 1fr)`,
        gap: isMobile ? 6 : 8, marginTop: 12
      }}>
        {calendarDays.map((week, wIdx) => week.map((cell, cIdx) => (
          <div key={`${wIdx}-${cIdx}`}
            style={{
              minHeight: isMobile ? 64 : 96, padding: 8, borderRadius: 8,
              backgroundColor: cell ? '#f9f9f9' : 'transparent',
              cursor: cell ? 'pointer' : 'default'
            }}
            onClick={() => cell && handleEventClick(cell.events[0])}>
            {cell && (
              <>
                <div style={{ color: '#1d4ed8', fontWeight: 'bold' }}>{cell.day}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {cell.events.slice(0, 2).map((event, eIdx) => (
                    <div key={eIdx} title={
                      `Date: ${event.date}\n` +
                      `Type: ${event.eventType}\n` +
                      `Branch: ${event.branchName || branchName}\n` +
                      `Department: ${event.department || department}\n` +
                      `Created by: ${event.empName || empName}\n\n` +
                      event.description}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: eventTypeColors[event.eventType],
                        color: 'white',
                        borderRadius: 4,
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: event.eventType === 'holiday' ? 'bold' : 'normal'
                      }}>
                      {event.eventTitle}
                    </div>
                  ))}
                  {cell.events.length > 2 && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                      +{cell.events.length - 2} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )))};
      </div>
    </div>
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewEvent({
      eventTitle: '',
      eventType: 'meeting',
      date: '',
      description: '',
      id: null
    });
  };

  return (
    <div style={{ margin: '0 auto', padding: isMobile ? 16 : 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{
        display: 'flex', gap: 8, marginBottom: 18,
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <button onClick={() => setActiveTab('calendar')}
          style={tabStyle(activeTab === 'calendar')}>
          Calendar View
        </button>
        <button onClick={() => setActiveTab('events')}
          style={tabStyle(activeTab === 'events')}>
          Events List
        </button>
      </div>

      {activeTab === 'calendar' ? (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row', alignItems: 'center'
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 20 : 28, fontWeight: 'bold' }}>
                {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <span>Current Time: {currentTime}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: isMobile ? 16 : 0 }}>
              <button onClick={handlePrevMonth} style={buttonStyle}>←</button>
              <button onClick={handleNextMonth} style={buttonStyle}>→</button>
              <button onClick={handleAddEvent} style={{
                ...buttonStyle,
                backgroundColor: '#1d4ed8', color: 'white'
              }}>
                Add Event
              </button>
            </div>
          </div>

          <EventLegend />
          <CalendarGrid />
        </>
      ) : (
        <div style={{ marginTop: 24, maxHeight: 400, overflowY: 'auto' }}>
          {[...calendarEvents, ...holidays].map((event, index) => (
            <div key={index} onClick={() => handleEventClick(event)}
              style={{
                padding: 16, marginBottom: 8, borderRadius: 8,
                backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: eventTypeColors[event.eventType]
                }} />
                <h3>{event.eventTitle}</h3>
              </div>
              <div style={{ marginTop: 8, color: '#666' }}>
                {new Date(event.date).toLocaleDateString()} - {event.eventType}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: 20, borderRadius: 8,
            width: isMobile ? '90%' : 400, maxWidth: '100%'
          }}>
            <h2 style={{ marginBottom: 16 }}>
              {newEvent.isHoliday ? '🎉 Holiday Details' : newEvent.id ? 'Edit Event' : 'New Event'}
            </h2>

            {newEvent.isHoliday && (
              <div style={{ padding: 12, marginBottom: 16, backgroundColor: '#fff3cd', borderRadius: 8 }}>
                <strong>Official Organization Holiday</strong>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }}>
              <div style={{ marginBottom: 12 }}>
                <label>Title</label>
                <input name="eventTitle" value={newEvent.eventTitle} onChange={handleEventChange}
                  disabled={newEvent.isHoliday} style={inputStyle} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Date</label>
                {newEvent.isHoliday ? (
                  <div style={{ padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
                    {new Date(newEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                ) : (
                  <input type="date" name="date" value={newEvent.date}
                    onChange={handleEventChange} style={inputStyle} />
                )}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Type</label>
                <select name="eventType" value={newEvent.eventType} onChange={handleEventChange}
                  disabled={newEvent.isHoliday} style={inputStyle}>
                  <option value="meeting">Meeting</option>
                  <option value="holiday">Holiday</option>
                  <option value="birthday">Birthday</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Description</label>
                <textarea name="description" value={newEvent.description}
                  onChange={handleEventChange} disabled={newEvent.isHoliday}
                  style={inputStyle} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={handleCloseModal} style={buttonStyle}>
                  Cancel
                </button>
                {!newEvent.isHoliday && (
                  <button type="submit" style={{ ...buttonStyle, backgroundColor: '#1d4ed8', color: 'white' }}>
                    Save
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Style constants
const buttonStyle = {
  padding: '10px 16px',
  borderRadius: 6,
  border: '1px solid #ddd',
  backgroundColor: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const inputStyle = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #eee',
  marginTop: 4
};

const tabStyle = (isActive) => ({
  padding: '12px 24px',
  borderRadius: 8,
  backgroundColor: isActive ? '#1d4ed8' : '#f5f5f5',
  color: isActive ? 'white' : '#333',
  border: 'none',
  cursor: 'pointer'
});

export default Calendar;