import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { createI18n } from 'vue-i18n';
import FormTree from '@/components/form/FormTree.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseSelect from '@/components/BaseSelect.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import BaseInput from '@/components/BaseInput.vue';
import RecurringSchedule from '@/components/RecurringSchedule.vue';
import SectionHeading from '@/components/work/SectionHeading.vue';

describe('FormTree.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: {
        en: {},
      },
    });

    wrapper = mount(FormTree, {
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key: string) => i18n.global.t(key),
        },
      },
      components: {
        BaseButton,
        BaseSelect,
        BaseCheckbox,
        BaseInput,
        RecurringSchedule,
        SectionHeading,
        FormTree,
      },
      props: {
        worksite: {},
        dynamicFields: {},
        children: [],
        field: {
          children: [],
        },
      },
    });
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('renders a SectionHeading component when html_type is h4', async () => {
    await wrapper.setProps({
      field: {
        html_type: 'h4',
        label_t: 'Section Heading',
        children: [],
      },
    });

    expect(wrapper.findComponent(SectionHeading).exists()).toBe(true);
  });

  it('renders a base-checkbox component when html_type is h5', async () => {
    await wrapper.setProps({
      field: {
        html_type: 'h5',
        label_t: 'Checkbox Heading',
        children: [],
      },
    });

    expect(wrapper.findComponent(BaseCheckbox).exists()).toBe(true);
  });

  it('renders a base-select component when html_type is select', async () => {
    await wrapper.setProps({
      field: {
        html_type: 'select',
        label_t: 'Select Field',
        children: [],
        values_default_t: {
          option1: 'Option 1',
          option2: 'Option 2',
          option3: 'Option 3',
        },
      },
    });

    expect(wrapper.findComponent(BaseSelect).exists()).toBe(true);
  });

  it('renders a base-input component when html_type is text', async () => {
    await wrapper.setProps({
      field: {
        html_type: 'text',
        label_t: 'Text Field',
        children: [],
      },
    });

    expect(wrapper.findComponent(BaseInput).exists()).toBe(true);
  });

  it('renders a RecurringSchedule component when html_type is cronselect', async () => {
    await wrapper.setProps({
      field: {
        html_type: 'cronselect',
        label_t: 'Cron Select',
        children: [],
      },
    });

    expect(wrapper.findComponent(RecurringSchedule).exists()).toBe(true);
  });

  it('renders a base-input component with text-area when html_type is textarea', async () => {
    await wrapper.setProps({
      field: {
        html_type: 'textarea',
        label_t: 'Text Area',
        children: [],
      },
    });

    const baseInputComponent = wrapper.findComponent({ name: 'base-input' });
    expect(baseInputComponent.exists()).toBe(true);
    expect(baseInputComponent.props('textArea')).toBe(true);
  });

  it('renders a base-checkbox component when html_type is checkbox', async () => {
    await wrapper.setProps({
      field: {
        html_type: 'checkbox',
        label_t: 'Checkbox',
        children: [],
      },
    });

    expect(wrapper.findComponent(BaseCheckbox).exists()).toBe(true);
  });

  it('emits updateField event when text input is changed', async () => {
    const field = {
      field_key: 'test_key',
      html_type: 'text',
      label_t: 'Test Label',
    };

    await wrapper.setProps({
      field,
      worksite: {},
      dynamicFields: {},
    });

    const inputComponent = wrapper.find('input');
    expect(inputComponent.exists()).toBeTruthy();

    await inputComponent.setValue('New Text Value');

    expect(wrapper.emitted('updateField')).toBeTruthy();
    expect(wrapper.emitted('updateField')[0]).toEqual([
      { key: 'test_key', value: 'New Text Value' },
    ]);
  });
});
