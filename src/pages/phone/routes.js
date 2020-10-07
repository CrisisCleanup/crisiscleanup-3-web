import { BannerTypes } from '@/store/modules/ui/types';
import BetaBanner from '@/components/notifications/BetaBanner.vue';
import { useRouter } from '@u3u/vue-hooks';
import PhoneLayout from './Index.vue';

const NewSystemBetaBanner = () => {
  const { router } = useRouter();
  const onToggle = async () => {
    await router.push({ name: 'nav.dashboard' });
    window.location.reload();
  };
  return () => (
    <BetaBanner
      text={'info.banner_problems_switch_back'}
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
