import React, { useState, useEffect } from 'react';
import apiCalls from 'apicall';
import ToastComponent, { showToast } from 'utils/toast-component';
import dayjs from 'dayjs';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [activeTab, setActiveTab] = useState('calendar');
  const [holidays, setHolidays] = useState([]);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [weekOffs, setWeekOffs] = useState([]);
  const [todayBirthdays, setTodayBirthdays] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [birthdayEvents, setBirthdayEvents] = useState([]);

  // Local storage values
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loginUserName] = useState(localStorage.getItem('userName'));
  const [branchCode] = useState(localStorage.getItem('branchCode'));
  const [branchName] = useState(localStorage.getItem('branch'));
  const [department] = useState(localStorage.getItem('department'));
  const [empCode] = useState(localStorage.getItem('employeeCode'));
  const [empName] = useState(localStorage.getItem('employeeName'));
  const [weekOff, setWeekOff] = useState([]);

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
    description: '',
    startTime: '',
    endTime: ''
  });

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    return Math.ceil((date.getDate() + firstDayOfWeek) / 7);
  };

  useEffect(() => {
    const updateCalendar = () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const days = [];
      const firstDayIndex = startOfMonth.getDay();
      const totalDays = endOfMonth.getDate();
      const combinedEvents = [...calendarEvents, ...holidays, ...birthdayEvents];

      let dayCount = 1;
      for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
          if (i === 0 && j < firstDayIndex) {
            week.push(null);
          } else if (dayCount > totalDays) {
            break;
          } else {
            const currentDay = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              dayCount
            );

            const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
            const weekNumber = getWeekNumber(currentDay);

            const isWeekOff = weekOffs.some(off => {
              if (off.weekOffDays.toUpperCase() !== dayName) return false;
              if (off.weekNumbers.includes(-1)) return true;
              return off.weekNumbers.includes(weekNumber);
            });

            const dayWithEvents = {
              day: dayCount,
              date: currentDay,
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
              }),
              isWeekOff
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
  }, [currentDate, calendarEvents, holidays, weekOffs, birthdayEvents]);

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
          empName: event.empName || empName,
          branchName: event.branchName || branchName,
          department: event.department || department,
          startTime: event.fromTime || '',
          endTime: event.toTime || ''
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
          isHoliday: true,
          startTime: '',
          endTime: ''
        }));
        setHolidays(transformed);
      }
    } catch (err) {
      showToast('error', 'Error fetching holidays');
    }
  };

  const getCompanyWeekOff = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/company/${orgId}`);
      const weekOffConfig = result.paramObjectsMap.companyVO[0].companyWeekOffVO || [];

      const transformedWeekOffs = weekOffConfig.map(off => ({
        weekOffDays: off.weekOffDays.toUpperCase(),
        weekNumbers: off.weekNumbers || [-1]
      }));

      setWeekOffs(transformedWeekOffs);

    } catch (error) {
      console.error('Error fetching week off:', error);
      showToast('error', 'Failed to load week-off configuration');
    }
  };

  const fetchBirthdayData = async () => {
    try {
      const result = await apiCalls('get', `/basicmaster/getEmpDob?orgId=${orgId}`);

      if (!result?.status) {
        console.error('API error:', result?.message);
        showToast('error', 'Failed to fetch birthday data');
        return;
      }

      const allBirthdays = result?.paramObjectsMap?.empDob ||
        result?.data?.empDob ||
        result?.empDob ||
        [];

      if (allBirthdays.length === 0) {
        console.log('No birthday data available');
        return;
      }

      const today = dayjs();
      const todayFormatted = today.format('MM-DD');
      const nextWeek = today.add(7, 'day');

      const todayList = [];
      const upcomingList = [];

      allBirthdays.forEach(emp => {
        if (!emp.dob || !emp.empName) return;

        try {
          const dob = dayjs(emp.dob, ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'], true);
          if (!dob.isValid()) return;

          const birthdayThisYear = dayjs()
            .year(today.year())
            .month(dob.month())
            .date(dob.date());

          if (dob.format('MM-DD') === todayFormatted) {
            todayList.push({
              name: emp.empName,
              date: birthdayThisYear.format('YYYY-MM-DD'),
              department: emp.department || 'N/A'
            });
          }
          else if (birthdayThisYear.isAfter(today) && birthdayThisYear.isBefore(nextWeek)) {
            upcomingList.push({
              name: emp.empName,
              date: birthdayThisYear.format('YYYY-MM-DD'),
              department: emp.department || 'N/A'
            });
          }
        } catch (error) {
          console.error('Error processing birthday:', emp, error);
        }
      });

      setTodayBirthdays(todayList);
      setUpcomingBirthdays(upcomingList);

      const events = [
        ...todayList.map(bd => ({
          eventTitle: `${bd.name}'s Birthday 🎂`,
          eventType: 'birthday',
          date: bd.date,
          description: `Wish ${bd.name} a happy birthday!`,
          id: `birthday-${bd.name.replace(/\s+/g, '-')}-${bd.date}`,
          isBirthday: true,
          startTime: '',
          endTime: ''
        })),
        ...upcomingList.map(bd => ({
          eventTitle: `${bd.name}'s Birthday (Upcoming)`,
          eventType: 'birthday',
          date: bd.date,
          description: `Upcoming birthday on ${bd.date}`,
          id: `birthday-upcoming-${bd.name.replace(/\s+/g, '-')}-${bd.date}`,
          isBirthday: true,
          startTime: '',
          endTime: ''
        }))
      ];

      setBirthdayEvents(events);
    } catch (error) {
      console.error('Birthday data fetch failed:', error);
      showToast('error', 'Failed to load birthday data');
    }
  };

  useEffect(() => {
    getAllCalendarByOrgId();
    getAllHolidaysByOrgId();
    getCompanyWeekOff();
    fetchBirthdayData();
  }, []);

  // Event handlers
  const handleAddEvent = () => {
    const today = new Date();
    setNewEvent({
      eventTitle: '',
      eventType: 'meeting',
      date: formatDateForInput(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      description: '',
      startTime: '',
      endTime: '',
      id: null
    });
    setShowModal(true);
  };

  const handleEventClick = (event) => {
    setNewEvent({
      id: event.id,
      eventTitle: event.eventTitle || '',
      eventType: event.eventType || 'meeting',
      date: event.date || '',
      description: event.description || '',
      isHoliday: event.eventType === 'holiday',
      startTime: event.startTime || event.fromTime || '',
      endTime: event.endTime || event.toTime || ''
    });
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.eventTitle?.trim()) {
      showToast('error', 'Event title is required');
      return;
    }

    if (!newEvent.date) {
      showToast('error', 'Event date is required');
      return;
    }

    const saveData = {
      branchCode: branchCode,
      branchName: branchName,
      createdBy: loginUserName,
      date: newEvent.date,
      department: department,
      description: newEvent.description || '',
      eventTitle: newEvent.eventTitle.trim(),
      eventType: newEvent.eventType,
      fromTime: newEvent.startTime || '',
      toTime: newEvent.endTime || '',
      orgId: orgId,
      empCode: empCode,
      empName: loginUserName
    };

    try {
      const result = await apiCalls('put', '/basicmaster/createUpdateCalendar', saveData);

      if (result?.status) {
        showToast('success', 'Event saved successfully');
        setShowModal(false);
        await getAllCalendarByOrgId();
      } else {
        showToast('error', result?.message || 'Failed to save event');
      }
    } catch (err) {
      console.error('Save Error:', err);
      showToast('error', 'Error saving event. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!newEvent.id || newEvent.isHoliday) {
      showToast('error', 'Cannot delete this event');
      return;
    }

    try {
      const result = await apiCalls('delete',
        `/basicmaster/deleteCalendarById?orgId=${orgId}&id=${newEvent.id}`
      );

      if (result?.status) {
        showToast('success', 'Event deleted successfully');
        setShowModal(false);
        await getAllCalendarByOrgId();
      } else {
        showToast('error', result?.message || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      showToast('error', 'Error deleting event. Please try again.');
    }
  };

  // Helper functions
  const formatDateForInput = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // UI components
  const EventLegend = () => (
    <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
      <h5 style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Calendar Legend</h5>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(eventTypeColors).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: '50%' }} />
            <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const CalendarGrid = () => (
    <div style={{
      marginTop: 12,
      padding: isMobile ? 4 : 10,
      backgroundColor: '#fff',
      borderRadius: 6,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      border: '1px solid #e0e0e0',
      fontSize: 12,
      overflowX: isMobile ? 'auto' : 'hidden'
    }}>
      <div style={{ minWidth: isMobile ? '500px' : 'auto' }}>
        {/* Weekdays Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          borderBottom: '1px solid rgb(179, 18, 18)',
          paddingBottom: 4,
          marginBottom: 4
        }}>
          {weekdays.map(day => (
            <div key={day} style={{
              padding: '4px 0',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 11,
              color: '#333',
              backgroundColor: 'rgb(214, 220, 226)',
              borderRadius: 4,
              border: '1px solid #d1d5db'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: isMobile ? 4 : 5
        }}>
          {calendarDays.map((week, wIdx) =>
            week.map((cell, cIdx) => (
              <div
                key={`${wIdx}-${cIdx}`}
                style={{
                  minHeight: isMobile ? 44 : 60,
                  padding: 4,
                  borderRadius: 5,
                  backgroundColor: cell?.isWeekOff ? '#ffeaea' : (cell ? '#fdfdfd' : 'transparent'),
                  border: `1px solid ${cell?.isWeekOff ? '#ff6666' : '#dcdcdc'}`,
                  cursor: cell ? 'pointer' : 'default',
                  position: 'relative'
                }}
                onClick={() => {
                  if (!cell) return;

                  if (cell.events.length > 0) {
                    handleEventClick(cell.events[0]);
                  } else {
                    const dateStr = formatDateForInput(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      cell.day
                    );
                    setNewEvent({
                      eventTitle: '',
                      eventType: 'meeting',
                      date: dateStr,
                      description: '',
                      id: null,
                      startTime: '',
                      endTime: ''
                    });
                    setShowModal(true);
                  }
                }}
              >
                {cell && (
                  <>
                    {/* Date Number */}
                    <div style={{
                      color: cell.isWeekOff ? '#d32f2f' : '#1976d2',
                      fontWeight: 'bold',
                      fontSize: 11
                    }}>
                      {cell.day}
                    </div>

                    {/* Week Off Label */}
                    {cell.isWeekOff && (
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        fontSize: 9,
                        color: ' #fff',
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(70, 5, 15, 0.7)',
                        padding: '1px 3px',
                        borderRadius: 3,
                        border: '1px solid #ffcdd2'
                      }}>
                        Week OFF
                      </div>
                    )}

                    {/* Events */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      marginTop: 2
                    }}>
                      {cell.events.slice(0, 2).map((event, eIdx) => (
                        <div key={eIdx}
                          title={`Date: ${event.date}\n${event.startTime ? `Time: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}\n` : ''}Type: ${event.eventType}\nBranch: ${event.branchName || branchName}\nDepartment: ${event.department || department}\nCreated by: ${event.empName || empName}\n\n${event.description}`}
                          style={{
                            padding: '1px 4px',
                            backgroundColor: eventTypeColors[event.eventType],
                            color: '#fff',
                            borderRadius: 4,
                            fontSize: 9,
                            fontWeight: event.eventType === 'holiday' ? 'bold' : 'normal',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                          }}>
                          {event.eventTitle}
                          {event.startTime && (
                            <div style={{ fontSize: 8, marginTop: 1 }}>
                              {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                            </div>
                          )}
                        </div>
                      ))}
                      {cell.events.length > 2 && (
                        <div style={{ fontSize: 9, color: '#666' }}>
                          +{cell.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const EventListView = () => (
    <div style={{ marginTop: 16, maxHeight: 400, overflowY: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16
        }}
      >
        {[...calendarEvents].map((event, index) => (
          <div
            key={index}
            onClick={() => handleEventClick(event)}
            title={`${event.eventTitle}\nDate: ${event.date}\n${event.description || ''}`}
            style={{
              padding: 16,
              borderRadius: 10,
              border: '1px solid #e0e0e0',
              backgroundColor: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: eventTypeColors[event.eventType]
                }}
              />
              <h4 style={{ fontSize: 14, margin: 0 }}>{event.eventTitle}</h4>
            </div>
            <div style={{ color: '#555', fontSize: 12 }}>
              {new Date(event.date).toLocaleDateString()}
              {(event.startTime || event.endTime) && (
                <span> • {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>
              )}
            </div>
          </div>
        ))}
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
    setNewEvent(prev => ({
      ...prev,
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
      startTime: '',
      endTime: '',
      id: null
    });
  };

  return (
    <div style={{ margin: '0 auto', padding: isMobile ? 16 : '10px 24px 24px 24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 10,
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <div className='d-flex gap-3'>
          <div>
            <button
              onClick={() => setActiveTab('calendar')}
              style={tabStyle(activeTab === 'calendar')}
            >
              Calendar View
            </button>
          </div>
          <div>
            <button
              onClick={() => setActiveTab('events')}
              style={tabStyle(activeTab === 'events')}
            >
              Events List
            </button>
          </div>
        </div>
      </div>
      {activeTab === 'calendar' ? (
        <>
          {/* Calendar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 'bold', color: '#4a4a4a' }}>
                {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <label style={{ fontSize: isMobile ? '14px' : '14px', color: '#4a4a4a' }}>Time:</label>
                  <span style={{ marginLeft: '8px', fontSize: isMobile ? '14px' : '16px', color: '#4a4a4a' }}>{currentTime}</span>
                </div>
              </h1>
            </div>

            {/* Add New Event */}
            <div>
              <div style={{ display: 'flex', gap: '6px', marginTop: isMobile ? '12px' : '0' }}>
                <button onClick={handlePrevMonth} style={smallButtonStyle}>←</button>
                <button onClick={handleNextMonth} style={smallButtonStyle}>→</button>
                <button
                  onClick={handleAddEvent}
                  style={{
                    ...smallButtonStyle,
                    backgroundColor: '#1d4ed8',
                    color: '#fff',
                    padding: '6px 12px',
                    fontWeight: 500
                  }}
                >
                  Add Event
                </button>
              </div>
            </div>
            <EventLegend />
          </div>

          <CalendarGrid />
        </>
      ) : (
        <EventListView />
      )}

      {showModal && (
        <div style={{
          position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 8,
            width: isMobile ? '90%' : 360,
            maxWidth: '100%',
            fontSize: 13
          }}>
            <h3 style={{ marginBottom: 8, fontSize: 16 }}>
              {newEvent.isHoliday ? '🎉 Holiday Details' : newEvent.id ? 'Edit Event' : 'New Event'}
            </h3>

            {newEvent.isHoliday && (
              <div style={{
                padding: 10,
                marginBottom: 8,
                backgroundColor: '#fff3cd',
                borderRadius: 6,
                fontSize: 12
              }}>
                <strong>Official Organization Holiday</strong>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }}>
              <div style={{ marginBottom: 6 }}>
                <label>Title</label>
                <input
                  name="eventTitle"
                  value={newEvent.eventTitle}
                  onChange={handleEventChange}
                  disabled={newEvent.isHoliday}
                  style={inputStyleSmall}
                />
              </div>

              <div style={{ marginBottom: 6 }}>
                <label>Date</label>
                {newEvent.isHoliday ? (
                  <div style={{
                    padding: 8,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 6,
                    fontSize: 13
                  }}>
                    {new Date(newEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                ) : (
                  <input
                    type="date"
                    name="date"
                    value={newEvent.date}
                    onChange={handleEventChange}
                    style={inputStyleSmall}
                  />
                )}
              </div>

              <div style={{ marginBottom: 6 }}>
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={newEvent.startTime}
                  onChange={handleEventChange}
                  disabled={newEvent.isHoliday}
                  style={inputStyleSmall}
                />
              </div>

              <div style={{ marginBottom: 6 }}>
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={newEvent.endTime}
                  onChange={handleEventChange}
                  disabled={newEvent.isHoliday}
                  style={inputStyleSmall}
                />
              </div>

              <div style={{ marginBottom: 6 }}>
                <label>Type</label>
                <select
                  name="eventType"
                  value={newEvent.eventType}
                  onChange={handleEventChange}
                  disabled={newEvent.isHoliday}
                  style={inputStyleSmall}
                >
                  <option value="meeting">Meeting</option>
                  <option value="birthday">Birthday</option>
                  <option value="training">Training</option>
                  <option value="holiday">Holiday</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={newEvent.description}
                  onChange={handleEventChange}
                  disabled={newEvent.isHoliday}
                  rows={3}
                  style={inputStyleSmall}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={buttonStyleSmall}
                >
                  Cancel
                </button>

                <div>
                  {/* {!newEvent.isHoliday && newEvent.id && (
                    <button
                      type="button"
                      onClick={handleDeleteEvent}
                      style={{
                        ...buttonStyleSmall,
                        backgroundColor: '#dc3545',
                        color: 'white',
                        marginRight: 8
                      }}
                    >
                      Delete
                    </button>
                  )} */}

                  {!newEvent.isHoliday && (
                    <button
                      type="submit"
                      style={{
                        ...buttonStyleSmall,
                        backgroundColor: '#1d4ed8',
                        color: 'white'
                      }}
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Style constants
const tabStyle = (isActive) => ({
  padding: '4px 10px',
  fontSize: 12,
  borderRadius: 6,
  border: `1px solid ${isActive ? '#1976d2' : '#ccc'}`,
  backgroundColor: isActive ? '#1976d2' : '#f9f9f9',
  color: isActive ? '#fff' : '#333',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  minWidth: 100,
  textAlign: 'center'
});

const smallButtonStyle = {
  padding: '4px 8px',
  fontSize: 12,
  borderRadius: 6,
  border: '1px solid #ccc',
  backgroundColor: '#f5f5f5',
  color: '#333',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const inputStyleSmall = {
  width: '100%',
  padding: '6px 10px',
  fontSize: 13,
  borderRadius: 6,
  border: '1px solid #ccc',
  boxSizing: 'border-box',
  marginTop: 4
};

const buttonStyleSmall = {
  padding: '6px 12px',
  fontSize: 13,
  borderRadius: 6,
  border: '1px solid #ccc',
  backgroundColor: '#f5f5f5',
  color: '#333',
  cursor: 'pointer'
};

export default Calendar;