import admin from './admin';
import dashboard from './dashboard';
import companySetup from './companySetup';
import basicMaster from './basicMaster';
import employeeMaster from './employeeMaster';
import calendar from './calendar';
import me from './me';

// Function to get menu items based on localStorage value
const getMenuItems = () => {
  const localStorageValue = localStorage.getItem('userType');

  // Define default menu items
  const defaultMenuItems = {
    items: [dashboard, admin, companySetup, basicMaster,employeeMaster, calendar, me]
  };

  // Define menu items based on localStorage value
  switch (localStorageValue) {
    case 'ROLE_SUPER_ADMIN':
      return {
        items: [dashboard,basicMaster ]
      };
    case 'admin': // Correctly match the value
      return {
        items: [dashboard,admin,basicMaster]
      };
    // Add more cases as needed
    default:
      return defaultMenuItems; // Return default menu items if no match is found
  }
};

// Export default menu items
export default getMenuItems();
