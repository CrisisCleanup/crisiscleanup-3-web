import { BannerTypes } from '@/store/modules/ui/types';
import BetaBanner from '@/components/notifications/BetaBanner.vue';
import PhoneLayout from './Index.vue';

const routes = [
  {
    path: '/phone',
    component: PhoneLayout,
    name: 'nav.phone',
    meta: {
      layout: 'authenticated',
      can: 'phone_agent',
      fail: '$from',
      banner: {
        type: BannerTypes.INFO,
        enabled: true,
        component: {
          render() {
            return (
              <BetaBanner
                text={'~~Having issues? Switch back to the old system.'}
                beta-feature="aws_connect_phone"
              />
            );
          },
        },
      },
    },
  },
];

export default routes;
