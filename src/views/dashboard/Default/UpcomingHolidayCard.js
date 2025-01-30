import React from 'react';
import holidayImage from '../../../assets/images/vecteezy_abstract-white-luxury-style-background_25374760.jpg'; // Ensure the correct path

const UpcomingHolidayCard = () => {
  const holiday = {
    name: "Valentine's Day",
    date: "February 14, 2025",
  };

  const cardStyles = {
    position: 'relative',
    width: '100%',
    height: '275px',
    backgroundImage: `url(${holidayImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    alignItems: 'flex-end',
    padding: '20px',
    color: 'black',
    fontFamily: 'Arial, sans-serif',
  };

  const uh = {
    fontSize: '32px',  // Slightly larger header
    fontWeight: '700',  // Bolder header text
    fontFamily: "'Lora', serif",  // Lora for elegant header
  };

  return (
    <div>
      <div style={cardStyles} className="upcoming-holiday-card p-5">
        <div className="text-center p-5" style={uh}>Upcoming Holiday</div>
      </div>

      <style jsx>
        {`
          /* Default styling */
          .upcoming-holiday-card {
            position: relative;
            width: 100%;
            height: 300px;
            background-size: cover;
            background-position: center;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            align-items: flex-end;
            padding: 20px;
            color: black;
            font-family: 'Arial', sans-serif;
          }

          /* Mobile view styling */
          @media (max-width: 768px) {
            .upcoming-holiday-card {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              z-index: 1000;
              width: 100%;
              height: 100px;  /* Adjusted height for mobile */
              box-shadow: none; /* Remove shadow on mobile */
            }
            .text-center {
              font-size: 16px; /* Adjust font size for mobile */
              padding: 10px;   /* Adjust padding for mobile */
            }
          }
        `}
      </style>
    </div>
  );
};

export default UpcomingHolidayCard;
