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
            :tags.sync="usersToInvite"
            :placeholder="$t('usersVue.emails')"
            :validation="validation"
            :add-on-key="[13, 32, ',']"
            :separators="[';', ',', ', ']"
            @tags-changed="(newTags) => (usersToInvite = newTags)"
          />
        </div>
        <div v-if="isAdmin || currentOrganization.affiliates.length > 1">
          <OrganizationSearchInput
            @selectedOrganization="selectedOrganization = $event.id"
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
import { createTags } from '@johmun/vue-tags-input';
import _ from 'lodash';
import User from '@/models/User';
import Organization from '@/models/Organization';
import OrganizationSearchInput from '@/components/OrganizationSearchInput';
import { getErrorMessage } from '../../utils/errors';

const EMAIL_REGEX = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/;

export default {
  name: 'InviteUsers',
  components: { OrganizationSearchInput },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    currentOrganization() {
      return Organization.find(this.currentUser?.organization.id);
    },
  },
  data() {
    return {
      emails: '',
      usersToInvite: [],
      showInviteModal: false,
      selectedOrganization: null,
      organizationResults: [],
      validation: [
        {
          classes: 'email',
          rule: /[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/,
          disableAdd: true,
        },
      ],
    };
  },
  methods: {
    async onOrganizationSearch(value) {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name&is_active=true`,
        {
          dataKey: 'results',
        },
      );
      this.organizationResults = results.entities.organizations;
    },
    async inviteUsers() {
      let tags = _.defaultTo(this.usersToInvite.slice(), []);
      try {
        if (this.emails) {
          const emailList = this.emails.match(EMAIL_REGEX);
          let extTags = _.attempt(createTags, emailList);
          if (_.isError(extTags)) {
            extTags = [];
          }
          tags = _.uniqBy(tags.concat(extTags), 'text');
        }
        if (_.isEmpty(tags)) {
          await this.$toasted.error(
            this.$t('inviteTeammates.provide_valid_email'),
          );
          return;
        }
        const emails = tags.map((value) => value.text);
        await Promise.all(
          emails.map((email) =>
            User.api().inviteUser(email, this.selectedOrganization),
          ),
        );
        await this.$toasted.success(
          this.$t('inviteTeammates.invites_sent_success'),
        );
        this.showInviteModal = false;
        this.usersToInvite = [];
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
  },
};
</script>

<style>
.vue-tags-input {
  @apply h-8 w-108 mb-2;
}

.vue-tags-input .ti-input {
  @apply h-8;
}
</style>
