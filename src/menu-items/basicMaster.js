// assets
import { IconCashBanknote, IconDatabaseStar, IconBuildingFactory2, IconIdBadge2, IconMapQuestion, IconUsersGroup, IconWorld, IconMap, IconBuildingSkyscraper } from '@tabler/icons-react';

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


const userType = localStorage.getItem("userType")

const allowedScreens = JSON.parse(localStorage.getItem('screens')) || [];

const screenMapping = {
  COUNTRY: 'country',
  STATE: 'state',
  CITY: 'city',
  CURRENCY: 'currency',
  REGION: 'region',
  DEPARTMENT: 'department',
  DESIGNATION: 'designation',
  AppraisalPeroid: 'AppraisalPeroid',
  KRAKPI: 'KRAKPI',
  Weightage: "Weightage",
  Grade: "Grade",
  Goals: "Goals",
  Score: "Score"
};

const allScreens = [
  { id: 'country', title: 'Country', type: 'item', url: '/basicMaster/country', icon: icons.IconWorld },
  { id: 'state', title: 'State', type: 'item', url: '/basicMaster/state', icon: icons1.IconMap },
  { id: 'city', title: 'City', type: 'item', url: '/basicMaster/city', icon: icons2.IconBuildingSkyscraper },
  { id: 'currency', title: 'Currency', type: 'item', url: '/basicMaster/currency', icon: icons3.IconCashBanknote },
  { id: 'region', title: 'Region', type: 'item', url: '/basicMaster/RegionMaster', icon: icons7.IconMapQuestion },
  { id: 'department', title: 'Department', type: 'item', url: '/basicMaster/Department', icon: icons4.IconBuildingFactory2 },
  { id: 'designation', title: 'Designation', type: 'item', url: '/basicMaster/Designation', icon: icons6.IconIdBadge2 },
  { id: 'projectMaster', title: 'Project Master', type: 'item', url: '/basicMaster/ProjectMaster', icon: icons6.IconIdBadge2 },
  { id: 'shiftMaster', title: 'Project Master', type: 'item', url: '/basicMaster/ShiftMaster', icon: icons6.IconIdBadge2 },
  { id: 'overTimeMaster', title: 'OverTime Master', type: 'item', url: '/basicMaster/OverTimeMaster', icon: icons6.IconIdBadge2 },
  { id: 'overTime', title: 'OverTime', type: 'item', url: '/basicMaster/OverTimeScreen', icon: icons6.IconIdBadge2 },
  { id: 'AppraisalPeroid', title: 'Appraisal Peroid', type: 'item', url: '/basicMaster/AppraisalPeroid', icon: icons6.IconIdBadge2 },
  { id: 'KRAKPI', title: 'KRA KPI', type: 'item', url: '/basicMaster/KRAKPI', icon: icons6.IconIdBadge2 },
  { id: 'Weightage', title: 'Weightage', type: 'item', url: '/basicMaster/Weightage', icon: icons6.IconIdBadge2 },
  { id: 'Grade', title: 'Grade', type: 'item', url: '/basicMaster/Grade', icon: icons6.IconIdBadge2 },
  { id: 'Goals', title: 'Goals', type: 'item', url: '/basicMaster/Goals', icon: icons6.IconIdBadge2 },
  { id: 'Score', title: 'Score', type: 'item', url: '/basicMaster/Score', icon: icons6.IconIdBadge2 },
];

const allowedScreenIds = userType === "ADMIN"
  ? allScreens.map(screen => screen.id)
  : allowedScreens.map(screen => screenMapping[screen]).filter(Boolean);

const basicMaster = {
  id: 'basicMaster',
  // title: 'Basic Master',
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
          id: 'projectMaster',
          title: 'Project Master',
          type: 'item',
          url: '/basicMaster/ProjectMaster',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'shiftMaster',
          title: 'Shift Master',
          type: 'item',
          url: '/basicMaster/ShiftMaster',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'overTimeMaster',
          title: 'OverTime Master',
          type: 'item',
          url: '/basicMaster/OverTimeMaster',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'overTime',
          title: 'OverTime',
          type: 'item',
          url: '/basicMaster/OverTimeScreen',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'AppraisalPeroid',
          title: 'Appraisal Peroid',
          type: 'item',
          url: '/basicMaster/AppraisalPeroid',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'KRAKPI',
          title: 'KRA KPI',
          type: 'item',
          url: '/basicMaster/KRAKPI',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'Weightage',
          title: 'Weightage',
          type: 'item',
          url: '/basicMaster/Weightage',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'Grade',
          title: 'Grade',
          type: 'item',
          url: '/basicMaster/Grade',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'Goals',
          title: 'Goals',
          type: 'item',
          url: '/basicMaster/Goals',
          icon: icons6.IconIdBadge2
        },
        {
          id: 'Score',
          title: 'Score',
          type: 'item',
          url: '/basicMaster/Score',
          icon: icons6.IconIdBadge2
        }
      ].filter((item) => allowedScreenIds.includes(item.id))
    }
  ]
};

export default basicMaster;
