// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const finalReport = {
  id: ' finalReport',
  title: 'Final Report',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'report',
      title: 'Report',
      type: 'collapse',
      icon: icons.IconKey,
      children: [
        {
          id: 'trailBalance',
          title: 'Trail Balance',
          type: 'item',
          url: '/finance/FinalReport/TrailBalance'
        },
        {
          id: 'profit',
          title: 'Profit & Loss',
          type: 'item',
          url: '/finance/FinalReport/TrailBalance'
        },
        {
          id: 'balanceSheet',
          title: 'Balance Sheet',
          type: 'item',
          url: '/finance/FinalReport/TrailBalance'
        }
      ]
    }
  ]
};

export default finalReport;
