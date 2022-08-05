import VueAcl from 'vue-browser-acl';
// import {} from 'browser-acl'

export default () => {
  const can = (...args: any[]) => true;
  return {
    $can: can,
  };
};
