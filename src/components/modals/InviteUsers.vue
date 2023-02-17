<template>
  <div>
    <base-button
      :text="$t('usersVue.invite_new_user')"
      :alt="$t('usersVue.invite_new_user')"
      variant="solid"
      class="mx-1 px-3 py-1"
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
          emails = [];
          showInviteModal = false;
        }
      "
    >
      <div class="text-justify flex flex-col p-3 justify-center">
        <div class="my-3">
          {{ $t('inviteTeammates.invite_teammates_instructions') }}
        </div>
        <div class="mb-4">
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
            @selectedOrganization="(id) => (selectedOrganization = id)"
            class="w-108"
            :allowed-organization-ids="currentOrganization.affiliates"
            :is-admin="isAdmin"
          />
        </div>
      </div>
      <div slot="footer" class="p-3 flex justify-end">
        <base-button
          :text="$t('actions.cancel')"
          :alt="$t('actions.cancel')"
          class="ml-2 p-3 px-6 mr-1 text-xs border border-black"
          :action="
            () => {
              showInviteModal = false;
            }
          "
        />
        <base-button
          variant="solid"
          :action="() => inviteUsers()"
          :text="$t('actions.submit_invites')"
          :alt="$t('actions.submit_invites')"
          class="ml-2 p-3 px-6 text-xs"
        />
      </div>
    </modal>
  </div>
</template>
<script>
import _ from 'lodash';
import Multiselect from '@vueform/multiselect';
import { computed, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { createTags } from '@sipec/vue3-tags-input';
import User from '../../models/User';
import Organization from '../../models/Organization';
import OrganizationSearchInput from '../OrganizationSearchInput.vue';
import { getErrorMessage } from '../../utils/errors';
import useCurrentUser from '../../hooks/useCurrentUser';

const EMAIL_REGEX = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;

export default {
  name: 'InviteUsers',
  components: { OrganizationSearchInput, Multiselect },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const $toasted = useToast();
    const { t } = useI18n();

    const validation = [
      {
        classes: 'email',
        rule: /[\w.!#$%&’*+/=?^`{|}~-]+@[a-zA-Z\d-]+(?:\.[a-zA-Z\d-]+)*/,
        disableAdd: true,
      },
    ];
    const emails = ref('');
    const usersToInvite = ref([]);
    const multiselect = ref(null);
    const showInviteModal = ref(false);
    const selectedOrganization = ref(null);
    const organizationResults = ref([]);
    const { currentUser } = useCurrentUser();
    const currentOrganization = computed(() =>
      Organization.find(currentUser?.organization?.id),
    );

    async function onOrganizationSearch(value) {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name&is_active=true`,
        {
          dataKey: 'results',
        },
      );
      organizationResults.value = results.entities.organizations;
    }
    const inviteUsers = async () => {
      let tags = _.defaultTo([...usersToInvite.value], []);
      try {
        if (emails.value) {
          const emailList = emails.value.match(EMAIL_REGEX);
          let extTags = _.attempt(createTags, emailList);
          if (_.isError(extTags)) {
            extTags = [];
          }
          tags = _.uniqBy([...tags, ...extTags], 'text');
        }
        if (_.isEmpty(tags)) {
          await $toasted.error(t('inviteTeammates.provide_valid_email'));
          return;
        }
        const emailsGroup = tags.map((value) => value.text);
        await Promise.all(
          emailsGroup.map((email) =>
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
      validation,
      emails,
      showInviteModal,
      currentUser,
      currentOrganization,
      onOrganizationSearch,
      selectedOrganization,
      organizationResults,
      inviteUsers,
      multiselect,
      usersToInvite,
    };
  },
};
</script>

<style>
.vue-tags-input {
  @apply h-auto w-full mb-2;
}
.vue-tags-input .ti-input {
  @apply h-auto;
}
</style>
