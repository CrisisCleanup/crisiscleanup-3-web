import Index from '@/pages/phone_legacy/Index';
import ConnectFirstIntegration from '@/pages/phone_legacy/ConnectFirstIntegration';
import { BannerTypes } from '@/store/modules/ui/types';
import BetaBanner from '@/components/notifications/BetaBanner';
import { useRouter } from '@u3u/vue-hooks';

const LegacyBetaBanner = () => {
  const { router } = useRouter();
  const onToggle = async () => {
    await router.push({ name: 'nav.phone' });
    window.location.reload();
  };
  return () => (
    <BetaBanner
      text={'info.banner_try_new_phone_system'}
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
    path: '/caller',
    component: Index,
    name: 'nav.caller',
    redirect: '/phone',
    meta: {
      id: 'caller',
      layout: 'authenticated',
      can: 'phone_agent',
      fail: '$from',
      banner: {
        type: BannerTypes.INFO,
        enabled: true,
        component: LegacyBetaBanner,
      },
    },
  },
  {
    path: '/connect_first',
    component: ConnectFirstIntegration,
    name: 'nav.connect_first',
    meta: {
      id: 'connect_first',
      layout: 'authenticated',
      can: 'phone_agent',
      fail: '$from',
    },
  },
];

export default routes;
