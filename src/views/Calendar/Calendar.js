import React, { useState, useEffect } from 'react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'meeting', description: '' });
  const [calendarDays, setCalendarDays] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const eventTypes = {
    meeting: '#6b8e23', // Olive Green
    birthday: '#ff6347', // Tomato
    reminder: '#1e90ff', // Dodger Blue
    task: '#ffa500', // Orange
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const updateCalendar = () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const days = [];
      const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
      const firstDayIndex = startOfMonth.getDay();
      const lastDayIndex = endOfMonth.getDay();
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
            week.push({
              day: dayCount,
              events: [], // You can add logic to populate events
            });
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
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddEvent = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    // Handle event submission logic here
    setSuccessMessage('Event added successfully!');
    setShowModal(false);
  };

  return (
    <div style={{ margin: '0 auto', padding: isMobile ? '8px' : '16px', maxWidth: '100%' }}>
      {/* Calendar Header */}
      <div style={{ margin: '0 auto', padding: '0px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '16px', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: 'center' 
      }}>
        <h1  style={{ 
          fontSize: isMobile ? '20px' : '24px', 
          fontWeight: 'bold', 
          color: '#4a4a4a', 
          textAlign: 'center', 
          display:'flex',
          alignItems:'center',
        }}>
          {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', marginTop: '8px' }} className='ps-3'>
            <label style={{ fontSize: isMobile ? '14px' : '16px', color: '#4a4a4a' }}>Time: </label>
            <div style={{ fontSize: isMobile ? '14px' : '16px', color: '#4a4a4a', marginLeft: '8px' }}>{currentTime}</div>
          </div>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'center' }}>
            <button onClick={handlePrevMonth} style={{
              padding: '8px', borderRadius: '50%', backgroundColor: '#f5f5f5', cursor: 'pointer', width: '35px',
              transition: 'transform 0.3s ease'
            }}>
              ←
            </button>
            <button onClick={handleNextMonth} style={{
              padding: '8px', borderRadius: '50%', backgroundColor: '#f5f5f5', cursor: 'pointer', width: '35px',
              transition: 'transform 0.3s ease'
            }}>
              →
            </button>
            <button onClick={handleAddEvent} className='border' style={{
              padding: '8px 16px', backgroundColor: '#1d4ed8', color: 'white', borderRadius: '8px', cursor: 'pointer',
              transition: 'background-color 0.2s, transform 0.2s'
            }}>
              Add New Event
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#4caf50', color: 'white', padding: '8px', borderRadius: '4px', marginBottom: '16px',
          textAlign: 'center', fontWeight: '500', animation: 'fadeIn 0.5s ease-in-out'
        }}>
          {successMessage}
        </div>
      )}

      {/* Calendar Grid */}
      <div style={{
        backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: isMobile ? '8px' : '16px', animation: 'fadeIn 1s ease-in-out'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', borderBottom: '1px solid #e5e5e5' }}>
          {weekdays.map((day) => (
            <div key={day} style={{ padding: '8px', textAlign: 'center', fontWeight: '500', color: '#6b7280', fontSize: isMobile ? '12px' : '14px' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', transition: 'all 0.3s ease-in-out',
          animation: 'fadeIn 1s ease-in-out'
        }}>
          {calendarDays.map((week, index) => (
            week.map((cell, i) => (
              <div key={`${index}-${i}`} style={{
                minHeight: isMobile ? '64px' : '96px', padding: '8px', border: '1px solid #e5e5e5', cursor: 'pointer',
                backgroundColor: cell ? '#f9fafb' : '', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                transition: 'background-color 0.2s ease, transform 0.2s ease-in-out',
                animation: 'fadeIn 0.5s ease-in-out'
              }}>
                {cell ? (
                  <>
                    <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: isMobile ? '12px' : '14px' }}>{cell.day}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {cell.events.map(event => (
                        <div key={event.id} style={{
                          padding: '4px', fontSize: isMobile ? '10px' : '12px', borderRadius: '4px', border: `1px solid ${eventTypes[event.type]}`,
                          backgroundColor: eventTypes[event.type].split(' ')[0], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          transition: 'background-color 0.3s ease, transform 0.3s ease-in-out'
                        }} title={`${event.title}\n${event.description}`}>
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: '0', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', padding: '16px', animation: 'fadeIn 0.5s ease-in-out'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: isMobile ? '90%' : '500px',
            animation: 'zoomIn 0.5s ease-in-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold' }}>Add New Event</h2>
            </div>
            <form onSubmit={handleSubmitEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#4a4a4a', marginBottom: '4px' }}>Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleEventChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                />
              </div>
              <div>
                <label style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#4a4a4a', marginBottom: '4px' }}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleEventChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                />
              </div>
              <div>
                <label style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#4a4a4a', marginBottom: '4px' }}>Event Type</label>
                <select
                  name="type"
                  value={newEvent.type}
                  onChange={handleEventChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                >
                  <option value="meeting">Meeting</option>
                  <option value="birthday">Birthday</option>
                  <option value="reminder">Reminder</option>
                  <option value="task">Task</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', color: '#4a4a4a', marginBottom: '4px' }}>Description</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleEventChange}
                  rows="3"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className='border' onClick={handleCloseModal} style={{
                  padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#6b7280', borderRadius: '8px', cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" className='border' style={{
                  padding: '8px 16px', backgroundColor: '#1d4ed8', color: 'white', borderRadius: '8px', cursor: 'pointer'
                }}>
                  Add New Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;