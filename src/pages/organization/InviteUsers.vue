<template>
  <div>
    <base-button
      :text="$t('usersVue.invite_new_user')"
      :alt="$t('usersVue.invite_new_user')"
      variant="solid"
      size="medium"
      :action="
        () => {
          showInviteModal = true;
        }
      "
    />
    <modal
      v-if="showInviteModal"
      modal-classes="bg-white max-w-2xl shadow"
      :title="$t('usersVue.invite_user')"
      closeable
      @close="
        () => {
          usersToInvite = [];
          showInviteModal = false;
        }
      "
    >
      <div class="text-justify flex flex-col p-3 justify-center">
        <div class="my-3">
          {{ $t('inviteTeammates.invite_teammates_instructions') }}
        </div>
        <div>
          <tag-input
            v-model="emails"
            v-model:tags="usersToInvite"
            :placeholder="$t('usersVue.emails')"
            :validation="validation"
            :add-on-key="[13, 32, ',']"
            :separators="[';', ',', ', ']"
            @tags-changed="(newTags) => (usersToInvite = newTags)"
          />
        </div>
        <div v-if="isAdmin || currentOrganization.affiliates.length > 1">
          <OrganizationSearchInput
            class="w-108"
            :allowed-organization-ids="currentOrganization.affiliates"
            :is-admin="isAdmin"
            @selectedOrganization="selectedOrganization = $event.id"
          />
        </div>
      </div>
      <template #footer>
        <div class="p-3 flex justify-end">
          <base-button
            :text="$t('actions.cancel')"
            :alt="$t('actions.cancel')"
            class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
            :action="() => (showInviteModal = false)"
          />
          <base-button
            variant="solid"
            :action="() => inviteUsers()"
            :text="$t('actions.submit_invites')"
            :alt="$t('actions.submit_invites')"
            class="ml-2 p-3 px-6 text-xs"
          />
        </div>
      </template>
    </modal>
  </div>
</template>

<script lang="ts">
import type { TagInputData } from '@sipec/vue3-tags-input';
import { createTags } from '@sipec/vue3-tags-input';
import { computed, defineComponent, ref } from 'vue';
import _ from 'lodash';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import type { Collection } from '@vuex-orm/core';
import User from '@/models/User';
import Organization from '@/models/Organization';
import OrganizationSearchInput from '@/components/OrganizationSearchInput.vue';
import { getErrorMessage } from '@/utils/errors';
import { EMAIL_REGEX } from '@/utils/form';

export default defineComponent({
  name: 'InviteUsers',
  components: { OrganizationSearchInput },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const store = useStore();
    const { t } = useI18n();
    const $toasted = useToast();

    const emails = ref('');
    const usersToInvite = ref([]);
    const showInviteModal = ref(false);
    const selectedOrganization = ref(null);
    const organizationResults = ref<
      unknown[] | Collection<Organization> | undefined
    >([]);
    const validation = ref([
      {
        classes: 'email',
        rule: /[\w.!#$%&’*+/=?^`{|}~-]+@[a-zA-Z\d-]+(?:\.[a-zA-Z\d-]+)*/,
        disableAdd: true,
      },
    ]);

    const currentUser = computed(() => {
      // eslint-disable-next-line unicorn/no-array-callback-reference
      return User.find(store.getters['auth/userId']);
    });
    const currentOrganization = computed(() => {
      // eslint-disable-next-line unicorn/no-array-callback-reference
      return Organization.find(currentUser.value?.organization.id);
    });

    async function onOrganizationSearch(value: string) {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name&is_active=true`,
        { dataKey: 'results' },
      );
      organizationResults.value = results.entities?.organizations;
    }

    async function inviteUsers() {
      let tags: TagInputData[] = _.defaultTo([...usersToInvite.value], []);
      try {
        if (emails.value) {
          const emailList = emails.value.match(EMAIL_REGEX);
          let extTags = _.attempt(createTags, emailList);
          if (_.isError(extTags)) {
            extTags = [];
          }
          console.log('extTags', extTags);
          console.log('tags', tags);
          tags = _.uniqBy([...tags, ...extTags], 'text');
          console.log('tags', tags);
        }
        if (_.isEmpty(tags)) {
          await $toasted.error(t('inviteTeammates.provide_valid_email'));
          return;
        }
        const _emails = tags.map((value) => value.text);
        await Promise.all(
          _emails.map((email) =>
            User.api().inviteUser(email, selectedOrganization.value),
          ),
        );
        await $toasted.success(t('inviteTeammates.invites_sent_success'));
        showInviteModal.value = false;
        usersToInvite.value = [];
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    return {
      currentUser,
      currentOrganization,
      emails,
      usersToInvite,
      showInviteModal,
      selectedOrganization,
      organizationResults,
      validation,
      onOrganizationSearch,
      inviteUsers,
    };
  },
});
</script>

<style lang="postcss" scoped>
.vue-tags-input {
  @apply h-auto w-full mb-2;
}
.vue-tags-input .ti-input {
  @apply h-auto;
}
</style>
