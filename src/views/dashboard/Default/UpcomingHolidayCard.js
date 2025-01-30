import React from 'react';

const UpcomingHolidayCard = () => {
  const holiday = {
    name: 'Valentine\'s Day',
    date: 'February 14, 2025',
    backgroundImage: 'url(../images/upcomming_holiday.webp)' // This will work if it's in the public folder.

  };

  const cardStyles = {
    position: 'relative',
    width: '100%',
    height: '300px',  // Adjust height as needed
    backgroundImage: `url(${holiday.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  };

  const contentStyles = {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    color: 'black',  // Changed text color to black
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyles = {
    fontSize: '36px',
    margin: 0,
  };

  const textStyles = {
    fontSize: '20px',
  };

  return (
    <div style={cardStyles}>
      <div style={contentStyles}>
        <h1 style={headingStyles}>{holiday.name}</h1>
        <p style={textStyles}>{holiday.date}</p>
      </div>
    </div>
  );
};

export default UpcomingHolidayCard;
