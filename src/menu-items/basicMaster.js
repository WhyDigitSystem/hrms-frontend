// assets
import { IconCashBanknote, IconDatabaseStar, IconBuildingFactory2, IconIdBadge2,IconMapQuestion, IconUsersGroup, IconWorld ,IconMap ,IconBuildingSkyscraper } from '@tabler/icons-react';

// constant
const icons = {
  IconWorld
};

const icons1 = {
  IconMap
};

const icons0 = {
  IconDatabaseStar
};
const icons2 = {
  IconBuildingSkyscraper
};
const icons3 = {
  IconCashBanknote
};
const icons4 = {
  IconBuildingFactory2 
};
const icons6 = {
  IconIdBadge2
};
const icons7 = {
  IconMapQuestion 
};
const icons8 = {
  IconUsersGroup 
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const basicMaster = {
  id: 'basicMaster',
  title: '',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'basicMaster',
      title: 'Basic Master',
      type: 'collapse',
      icon: icons0.IconDatabaseStar,

      children: [
        {
          id: 'country',
          title: 'Country',
          type: 'item',
          url: '/basicMaster/country',
          icon: icons.IconWorld
        },
        {
          id: 'state',
          title: 'State',
          type: 'item',
          url: '/basicMaster/state',
          icon: icons1.IconMap
        },
        {
          id: 'city',
          title: 'City',
          type: 'item',
          url: '/basicMaster/city',
          icon: icons2.IconBuildingSkyscraper
        },
        {
          id: 'currency',
          title: 'Currency',
          type: 'item',
          url: '/basicMaster/currency',
          icon: icons3.IconCashBanknote
        },
        {
          id: 'region',
          title: 'Region',
          type: 'item',
          url: '/basicMaster/RegionMaster',
          icon: icons7.IconMapQuestion 
        },
        {
          id: 'department',
          title: 'Department',
          type: 'item',
          url: '/basicMaster/Department',
          icon: icons4.IconBuildingFactory2 
        },
        {
          id: 'designation',
          title: 'Designation',
          type: 'item',
          url: '/basicMaster/Designation',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'role',
          title: 'Role',
          type: 'item',
          url: '/basicMaster/Role',
          icon: icons8.IconUsersGroup
        },
        // {
        //   id: 'employee',
        //   title: 'Employee',
        //   type: 'item',
        //   url: '/basicMaster/employee',
        //   icon: icons5.IconUserPlus
        // }
      ]
    }
  ]
};

export default basicMaster;
