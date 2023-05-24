<template>
  <div class="p-3">
    <div class="mb-2">
      <p>{{ $t('shareWorksite.share_via_email_phone_intro') }}</p>
    </div>
    <tag-input
      v-model="emails"
      v-model:tags="emailsToShare"
      data-testid="testManuallyEnterEmailsTextInput"
      :placeholder="$t('shareWorksite.manually_enter_emails')"
      :validation="emailValidation"
      :add-on-key="[13, 32, ',']"
      :separators="[';', ',', ', ']"
      @tags-changed="
        (newTags: TagInputData[]) => {
          emailsToShare = newTags;
          $emit('emailsUpdated', [
            ...new Set(emailsToShare.map((tag) => tag.text)),
          ]);
        }
      "
    />

    <UserSearchInput
      :placeholder="$t('shareWorksite.search_emails')"
      data-testid="testSearchEmailsSearch"
      class="my-1"
      @selectedUser="onSelectedUserEmail"
    />

    <div class="my-6"></div>

    <tag-input
      v-model="phoneNumbers"
      v-model:tags="phoneNumbersToShare"
      data-testid="testManuallyEnterPhonesTextInput"
      :placeholder="$t('shareWorksite.manually_enter_phones')"
      :validation="phoneValidation"
      :add-on-key="[13, 32, ',']"
      :separators="[';', ',', ', ']"
      @tags-changed="
        (newTags: TagInputData[]) => {
          phoneNumbersToShare = newTags;
          $emit('phoneNumbersUpdated', [
            ...new Set(phoneNumbersToShare.map((tag) => tag.text)),
          ]);
        }
      "
    />

    <UserSearchInput
      :placeholder="$t('shareWorksite.search_phones')"
      data-testid="testSearchPhonesSearch"
      class="my-1"
      display-prop="mobile"
      @selectedUser="onSelectedUserPhone"
    />

    <base-input
      :model-value="shareMessage"
      data-testid="testAddMessageToInviteTextarea"
      text-area
      :disabled="false"
      :rows="6"
      class="my-4"
      :placeholder="$t('shareWorksite.add_message')"
      @update:modelValue="
        (value: string) => {
          shareMessage = value;
          $emit('shareMessageUpdated', value);
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import type { TagInputData } from '@sipec/vue3-tags-input';
import { createTags } from '@sipec/vue3-tags-input';
import _ from 'lodash';
import UserSearchInput from '@/components/UserSearchInput.vue';
import type User from '@/models/User';

export default defineComponent({
  name: 'ShareWorksite',
  components: { UserSearchInput },
  emits: ['emailsUpdated', 'phoneNumbersUpdated', 'shareMessageUpdated'],
  setup(props, { emit }) {
    const emailValidation = [
      {
        classes: 'email',
        rule: /[\w.!#$%&’*+/=?^`{|}~-]+@[a-zA-Z\d-]+(?:\.[a-zA-Z\d-]+)*/,
        disableAdd: true,
      },
    ];
    const phoneValidation = [
      {
        classes: 'phone',
        rule: /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/,
        disableAdd: true,
      },
    ];
    const shareMessage = ref('');
    const emails = ref('');
    const emailsToShare = ref<TagInputData[]>([]);
    const phoneNumbers = ref('');
    const phoneNumbersToShare = ref<TagInputData[]>([]);

    function onSelectedUserEmail(user: User) {
      if (user.email) {
        const extTags = createTags([{ text: user.email, tiClasses: [] }]);
        emailsToShare.value = [...emailsToShare.value, ...extTags];
        emit('emailsUpdated', [
          ...new Set(emailsToShare.value.map((tag) => tag.text)),
        ]);
      }
    }

    function onSelectedUserPhone(user: User) {
      if (user.mobile) {
        const extTags = createTags([{ text: user.mobile, tiClasses: [] }]);
        phoneNumbersToShare.value = [...phoneNumbersToShare.value, ...extTags];
        emit('phoneNumbersUpdated', [
          ...new Set(phoneNumbersToShare.value.map((tag) => tag.text)),
        ]);
      }
    }

    return {
      shareMessage,
      emailValidation,
      emails,
      emailsToShare,
      phoneNumbers,
      phoneNumbersToShare,
      phoneValidation,
      onSelectedUserEmail,
      onSelectedUserPhone,
    };
  },
});
</script>

<style>
.vue-tags-input {
  max-width: none !important;
  @apply h-auto w-full mb-2 border;
}
.vue-tags-input .ti-input {
  @apply h-auto border-none text-lg;
}
</style>
