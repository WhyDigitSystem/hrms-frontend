import React, { useState, useEffect } from 'react';
import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: '', date: '', description: '' });
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName] = useState(localStorage.getItem('branch'));
  const [department] = useState(localStorage.getItem('department'));
  const [empCode] = useState(localStorage.getItem('employeeCode'));
  const [empName] = useState(localStorage.getItem('employeeName'));
  
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const eventTypeColors = {
    holiday: '#FF6347', // Red for holiday
    meeting: '#1E90FF', // Blue for meeting
    birthday: '#FFD700', // Yellow for birthday
    training: '#32CD32', // Green for training
    other: '#808080' // Grey for other
  };


  const formatDateForInput = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  useEffect(() => {
    const updateCalendar = () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const days = [];
      const firstDayIndex = startOfMonth.getDay();
      const totalDays = endOfMonth.getDate();

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
              events: calendarEvents.filter(event => {
                const [year, month, day] = event.date.split('-').map(Number);
                const eventDate = new Date(year, month - 1, day);
                return (
                  eventDate.getDate() === dayCount &&
                  eventDate.getMonth() === currentDate.getMonth() &&
                  eventDate.getFullYear() === currentDate.getFullYear()
                );
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
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    updateCalendar();
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentDate, calendarEvents]);

  const handleAddEvent = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    setNewEvent({
      title: '',
      type: 'meeting',
      date: formatDateForInput(year, month, day),
      description: '',
      id: null
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewEvent({ title: '', date: '', type: 'meeting', description: '' });
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.type) {
      showToast('error', 'All fields are required');
      return;
    }

    const saveData = {
      id: newEvent.id || null, // optional, only if editing
      eventTitle: newEvent.title,
      eventType: newEvent.type,
      date: newEvent.date,
      description: newEvent.description,
      orgId,
      createdBy: loginUserName,
      branchCode,
      branchName,
      department,
      empCode,
      empName,
    };

    try {
      const result = await apiCalls('put', '/basicmaster/createUpdateCalendar', saveData);
      if (result.status === true) {
        showToast('success', 'Event saved successfully');
        setShowModal(false);
        setNewEvent({ title: '', date: '', type: 'meeting', description: '' });
        getAllCalendarByOrgId();
      } else {
        showToast('error', result.paramObjectsMap?.errorMessage || 'Failed to save event');
      }
    } catch (err) {
      console.error('Error saving event:', err);
      showToast('error', 'Error occurred while saving');
    }
  };

  const handleEventClick = (event) => {
    setNewEvent({
      title: event.eventTitle,
      type: event.eventType,
      date: event.date,
      description: event.description,
      id: event.id,
    });
    setShowModal(true);
  };

  useEffect(() => {
    getAllCalendarByOrgId();
  }, []);

  const getAllCalendarByOrgId = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getAllCalendarByOrgId?branchCode=${branchCode}&orgId=${orgId}&empCode=${empCode}`);
      if (result?.status && result?.paramObjectsMap?.calendarVO) {
        const events = result.paramObjectsMap.calendarVO.reverse();
        setCalendarEvents(events);
      } else {
        showToast('error', 'No calendar events found');
      }
    } catch (err) {
      console.log('Error fetching calendar data:', err);
      showToast('error', 'Error fetching calendar data');
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };


return (
    <div style={{ margin: '0 auto', padding: isMobile ? '16px' : '32px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
        <h1 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 'bold', color: '#4a4a4a' }}>
          {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
            <label style={{ fontSize: isMobile ? '14px' : '16px', color: '#4a4a4a' }}>Time:</label>
            <span style={{ marginLeft: '8px', fontSize: isMobile ? '14px' : '16px', color: '#4a4a4a' }}>{currentTime}</span>
          </div>
        </h1>
        <div style={{ display: 'flex', gap: '8px', marginTop: isMobile ? '16px' : '0' }}>
          <button onClick={handlePrevMonth} style={buttonStyle}>←</button>
          <button onClick={handleNextMonth} style={buttonStyle}>→</button>
          <button onClick={handleAddEvent} style={{ ...buttonStyle, backgroundColor: '#1d4ed8', color: '#fff', padding: '12px 20px' }}>
            Add New Event
          </button>
        </div>
      </div>

      {/* Event Legend */}
      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h4 style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px', marginBottom: '12px' }}>Event Legend</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(eventTypeColors).map(([type, color]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: color, borderRadius: '50%' }}></div>
              <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#4a4a4a', textTransform: 'capitalize' }}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div style={{ marginTop: '24px', padding: isMobile ? '8px' : '16px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', borderBottom: '1px solid #e5e5e5' }}>
          {weekdays.map(day => (
            <div key={day} style={{ padding: '8px', textAlign: 'center', fontWeight: '500', fontSize: isMobile ? '12px' : '14px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '12px' }}>
          {calendarDays.map((week, wIdx) => week.map((cell, cIdx) => (
            <div key={`${wIdx}-${cIdx}`} style={{
              minHeight: isMobile ? '64px' : '96px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: cell ? '#f9f9f9' : 'transparent',
              cursor: cell ? 'pointer' : 'default',
              transition: 'all 0.3s ease'
            }}
              onClick={() => {
                if (!cell) return;
                if (cell.events.length > 0) {
                  handleEventClick(cell.events[0]);
                } else {
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth() + 1;
                  const day = cell.day;
                  setNewEvent({
                    title: '',
                    type: 'meeting',
                    date: formatDateForInput(year, month, day),
                    description: '',
                    id: null
                  });
                  setShowModal(true);
                }
              }}
            >
              {cell && (
                <>
                  <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold', color: '#1d4ed8' }}>{cell.day}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                    {cell.events.map((event, eIdx) => (
                      <div key={eIdx} style={{
                        padding: '4px 8px',
                        backgroundColor: eventTypeColors[event.eventType] || '#808080',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {event.eventTitle}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '20px', borderRadius: '8px',
            width: isMobile ? '80%' : '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '16px', fontSize: isMobile ? '20px' : '24px', color: '#333' }}>
              {newEvent.id ? 'Edit Event' : 'Add Event'}
            </h2>
            <form onSubmit={handleSaveEvent}>
              {['title', 'description', 'date', 'type'].map((field, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', display: 'block', color: '#4a4a4a' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {field === 'description' ? (
                    <textarea name={field} value={newEvent[field]} onChange={handleEventChange} style={inputStyle} />
                  ) : field === 'type' ? (
                    <select name={field} value={newEvent[field]} onChange={handleEventChange} style={inputStyle}>
                      <option value="meeting">Meeting</option>
                      <option value="holiday">Holiday</option>
                      <option value="birthday">Birthday</option>
                      <option value="training">Training</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <input
                      type={field === 'date' ? 'date' : 'text'}
                      name={field}
                      value={newEvent[field]}
                      onChange={handleEventChange}
                      style={inputStyle}
                      required
                    />
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button type="button" onClick={handleCloseModal} style={{ ...buttonStyle, backgroundColor: '#f5f5f5', color: '#000' }}>Cancel</button>
                <button type="submit" style={{ ...buttonStyle, backgroundColor: '#1d4ed8', color: 'white' }}>Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: '#f5f5f5',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '1px solid #e5e5e5'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
  border: '1px solid #e5e5e5',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  outline: 'none'
};

export default Calendar;
