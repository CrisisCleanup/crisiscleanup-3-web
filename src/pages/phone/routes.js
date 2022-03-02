import { useRouter } from '@u3u/vue-hooks';
import { BannerTypes } from '@/store/modules/ui/types';
import BetaBanner from '@/components/notifications/BetaBanner.vue';
import PhoneLayout from './Index.vue';
import PhoneNew from './PhoneNew.vue';

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
      translations={{
        onError: 'info.error_unable_switch_phone_system',
      }}
    />
  );
};

const routes = [
  {
    path: '/phone',
    component: PhoneNew,
    name: 'nav.phone',
    meta: {
      layout: 'authenticated',
    },
  },
];

export default routes;
