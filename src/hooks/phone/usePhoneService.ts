import PhoneService from '../../services/phone.service';

export default (function () {
  const instance: PhoneService = new PhoneService();

  return () => {
    return instance;
  };
})();
