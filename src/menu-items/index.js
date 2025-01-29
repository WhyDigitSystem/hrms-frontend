import admin from './admin';
import dashboard from './dashboard';

// Function to get menu items based on localStorage value
const getMenuItems = () => {
  const localStorageValue = localStorage.getItem('userType');

  // Define default menu items
  const defaultMenuItems = {
    items: [dashboard, admin]
  };

  // Define menu items based on localStorage value
  switch (localStorageValue) {
    case 'ROLE_SUPER_ADMIN':
      return {
        items: [dashboard, ]
      };
    case 'admin': // Correctly match the value
      return {
        items: [dashboard,admin]
      };
    // Add more cases as needed
    default:
      return defaultMenuItems; // Return default menu items if no match is found
  }
};

// Export default menu items
export default getMenuItems();
