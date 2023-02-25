<template>
  <div class="p-3">
    <div class="mb-2">
      <p>
        {{
          $t(
            '~~Please enter emails and phone numbers of users you would like to share this case with.',
          )
        }}
      </p>
    </div>
    <tag-input
      v-model="emails"
      v-model:tags="emailsToShare"
      :placeholder="$t('~~Emails to share case with')"
      :validation="emailValidation"
      :add-on-key="[13, 32, ',']"
      :separators="[';', ',', ', ']"
      @tags-changed="
        (newTags) => {
          emailsToShare = newTags;
          $emit('emailsUpdated', [
            ...new Set(emailsToShare.map((tag) => tag.text)),
          ]);
        }
      "
    />

    <UserSearchInput
      :placeholder="$t('~~Search for user emails')"
      class="my-1"
      @selectedUser="onSelectedUserEmail"
    />

    <div class="my-6"></div>

    <tag-input
      v-model="phoneNumbers"
      v-model:tags="phoneNumbersToShare"
      :placeholder="$t('~~Phone numbers to share case with')"
      :validation="phoneValidation"
      :add-on-key="[13, 32, ',']"
      :separators="[';', ',', ', ']"
      @tags-changed="
        (newTags) => {
          phoneNumbersToShare = newTags;
          $emit('phoneNumbersUpdated', [
            ...new Set(phoneNumbersToShare.map((tag) => tag.text)),
          ]);
        }
      "
    />

    <UserSearchInput
      :placeholder="$t('~~Search for user phone numbers')"
      class="my-1"
      display-prop="mobile"
      @selectedUser="onSelectedUserPhone"
    />

    <base-input
      :model-value="shareMessage"
      text-area
      :disabled="false"
      :rows="6"
      class="my-4"
      :placeholder="
        $t(
          '~Please include a message to send to users you will be sharing this case with',
        )
      "
      @update:modelValue="
        (value) => {
          shareMessage = value;
          $emit('shareMessageUpdated', value);
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { createTags } from '@sipec/vue3-tags-input';
import _ from 'lodash';
import UserSearchInput from '@/components/UserSearchInput.vue';
import type User from '@/models/User';

export default {
  name: 'ShareWorksite',
  components: { UserSearchInput },
  emits: ['emailsUpdated', 'phoneNumbersUpdated', 'shareMessageUpdated'],
  setup(props: never, { emit }) {
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
    const emailsToShare = ref<any[]>([]);
    const phoneNumbers = ref('');
    const phoneNumbersToShare = ref<any[]>([]);

    function onSelectedUserEmail(user: User) {
      if (user.email) {
        let extTags = createTags([{ text: user.email, tiClasses: [] }]);
        emailsToShare.value = [...emailsToShare.value, ...extTags];
        emit('emailsUpdated', [
          ...new Set(emailsToShare.value.map((tag) => tag.text)),
        ]);
      }
    }

    function onSelectedUserPhone(user: User) {
      if (user.mobile) {
        let extTags = createTags([{ text: user.mobile, tiClasses: [] }]);
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
};
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
