export default function useNavigation() {
  const FooterNavigation = [
    // {
    //   key: 'demo',
    // },
    {
      key: 'contact',
      route: 'https://crisiscleanup.zendesk.com/hc/en-us/requests/new',
      external: true,
    },
    {
      key: 'terms',
      route: '/terms',
    },
    {
      key: 'privacy',
      route: '/privacy',
    },
  ];

  const HomeNavigation = [
    {
      key: 'home',
      route: '/login',
    },
    {
      key: 'aboutUs',
      route: '/about',
    },
    {
      key: 'blog',
      route: 'http://blog.crisiscleanup.org',
      external: true,
    },
    {
      key: 'map',
      route: '/map',
    },
    {
      key: 'training',
      route: '/training',
    },
    {
      key: 'survivor',
      route: '/survivor',
    },
    {
      key: 'contact',
      route: 'https://crisiscleanup.zendesk.com/hc/en-us/requests/new',
      external: true,
    },
  ];

  return {
    FooterNavigation,
    HomeNavigation,
  };
}
