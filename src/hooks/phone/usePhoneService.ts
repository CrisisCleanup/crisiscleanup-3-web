import PhoneService from '../../services/phone.service';

export default (function () {
  let instance: PhoneService = new PhoneService();

  return () => {
    return instance;
  };
})();
