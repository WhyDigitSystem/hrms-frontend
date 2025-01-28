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

// const companySetup = {
//   id: 'basicMaster',
//   title: 'Setup',
//   //   caption: 'Pages Caption',
//   type: 'group',
//   children: [
//     {
//       id: 'company',
//       title: 'Company',
//       type: 'item',
//       url: '/company',
//       icon: icons.IconDashboard,
//       breadcrumbs: false
//     }
//   ]
// };

const companySetup = {
  id: 'companySetup',
  title: '',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'companySetup',
      title: 'Setup',
      type: 'collapse',
      icon: icons.IconCopyright,

      children: [
        {
          id: 'createCompany',
          title: 'Create Company',
          type: 'item',
          url: '/companysetup/createcompany',
          icon: icons1.IconSquareRoundedPlus
        },
        {
          id: 'company',
          title: 'Company Setup',
          type: 'item',
          url: '/companysetup/companysetup',
          icon: icons2.IconSettingsPlus
        },
        {
          id: 'finYear',
          title: 'FinYear',
          type: 'item',
          url: '/basicMaster/finYear',
          icon: icons3.IconCalendarDollar
        },

        {
          id: 'documentType',
          title: 'Document Type',
          type: 'item',
          url: '/finance/DocumentType/documentType',
          icon: icons4.IconFileTypeDoc
        },
        {
          id: 'documentTypeMaping',
          title: 'Document Type Mapping',
          type: 'item',
          url: '/finance/DocumentType/documentTypeMapping',
          icon: icons4.IconFileTypeDoc
        },
        {
          id: 'multipleDocumentIdGeneration',
          title: 'Multiple Document Id Generation',
          type: 'item',
          url: '/finance/DocumentType/multipleDocumentIdGeneration',
          icon: icons4.IconFileTypeDoc
        },
        {
          id: 'screenNames',
          title: 'Screen Names',
          type: 'item',
          url: '/basicMaster/ScreenNames',
          icon: icons5.IconAppWindow
        }
      ]
    }
  ]
};

export default companySetup;
