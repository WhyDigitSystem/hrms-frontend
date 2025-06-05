// assets
import {
  IconCash,
  IconReceipt,
  IconFileInvoice,
  IconWallet,
  IconCoin
} from '@tabler/icons-react';

// constant
const icons = {
  IconCash,
  IconReceipt,
  IconFileInvoice,
  IconWallet,
  IconCoin
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Appraisal = {
  id: 'Appraisal',
  type: 'group',
  children: [
    {
      id: 'Appraisal',
      title: 'Appraisal',
      type: 'collapse',
      icon: icons.IconCash,
      children: [
        {
          id: 'Appraisee',
          title: 'Appraisee',
          type: 'item',
          url: '/Appraisal/Appraisee',
          icon: icons.IconReceipt
        },
        {
          id: 'Appraiser',
          title: 'Appraiser',
          type: 'item',
          url: '/Appraisal/Appraiser',
          icon: icons.IconReceipt
        },
        {
          id: 'AdditionalGoals',
          title: 'Additional Goals',
          type: 'item',
          url: '/Appraisal/AdditionalGoals',
          icon: icons.IconReceipt
        },
        {
          id: 'PreGoals',
          title: 'Pre Goals',
          type: 'item',
          url: '/Appraisal/PreGoals',
          icon: icons.IconReceipt
        },
        {
          id: 'PreGoalsApproval',
          title: 'Pre Goals Approval',
          type: 'item',
          url: '/Appraisal/PreGoalsApproval',
          icon: icons.IconReceipt
        },
        {
          id: 'SelfGoals',
          title: 'Self Goals',
          type: 'item',
          url: '/Appraisal/SelfGoals',
          icon: icons.IconReceipt
        },
      ]
    }
  ]
};

export default Appraisal;
