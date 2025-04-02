// assets
import {
  IconAppWindow,
  IconCalendarDollar,
  IconCopyright,
  IconFileTypeDoc,
  IconSettingsPlus,
  IconSquareRoundedPlus
} from '@tabler/icons-react';

// constant
const icons = {
  IconCopyright
};

const icons1 = {
  IconSquareRoundedPlus
};
const icons2 = {
  IconSettingsPlus
};

const icons3 = {
  IconCalendarDollar
};

const icons4 = {
  IconFileTypeDoc
};

const icons5 = {
  IconAppWindow
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const finance = {
  id: 'finance',
  // title: 'Company Setup',
  type: 'group',
  children: [
    {
      id: 'finance',
      title: 'Finance',
      type: 'collapse',
      icon: icons.IconCopyright,

      children: [
        {
          id: 'createCompany',
          title: 'Payslip',
          type: 'item',
          url: '/companysetup/createcompany',
          icon: icons1.IconSquareRoundedPlus
        }
      ]
    }
  ]
};

export default finance;
