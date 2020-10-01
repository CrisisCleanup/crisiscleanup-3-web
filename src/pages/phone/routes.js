import { BannerTypes } from '@/store/modules/ui/types';
import BetaBanner from '@/components/notifications/BetaBanner.vue';
import { useRouter } from '@u3u/vue-hooks';
import PhoneLayout from './Index.vue';

const NewSystemBetaBanner = () => {
  const { router } = useRouter();
  const onToggle = () => router.push({ name: 'nav.dashboard' });
  return () => (
    <BetaBanner
      text={'~~Having issues? Switch back to the old system.'}
      beta-feature="aws_connect_phone"
      vOn:change={onToggle}
    />
  );
};

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
        component: NewSystemBetaBanner,
      },
    },
  },
];

export default routes;
