import BaseCheckbox from '@/components/BaseCheckbox';

export default { title: 'Basics|BaseCheckbox', component: BaseCheckbox };

export const withText = () => '<base-checkbox>Check Me</base-checkbox>';
export const disabled = () =>
  '<base-checkbox disabled>Disabled</base-checkbox>';
