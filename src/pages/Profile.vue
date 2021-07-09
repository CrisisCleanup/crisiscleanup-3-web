<template>
  <div style="height: 85%" class="h-full flex justify-center">
    <div class="h-full flex flex-col w-3/4 shadow my-6">
      <div class="h-full w-full bg-white flex flex-col">
        <div
          class="
            border-b
            px-4
            py-2
            font-semibold
            flex
            justify-between
            items-center
            h-16
          "
        >
          {{ currentUser.full_name }}
          <div class="flex justify-end">
            <base-button
              variant="solid"
              class="px-4 py-2"
              :text="$t('actions.save')"
              :alt="$t('actions.save')"
              :action="saveUser"
            />
          </div>
        </div>
        <div class="overflow-auto">
          <div class="flex">
            <div class="flex flex-col p-8 w-64 items-center">
              <Avatar
                :initials="currentUser.first_name"
                :url="currentUser.profilePictureUrl"
                class="p-1"
                size="large"
              />
              <DragDrop
                class="text-primary-dark cursor-pointer"
                :disabled="uploading"
                @files="handleProfilePictureUpload"
              >
                <base-button
                  class="text-center pb-4 cursor-pointer"
                  :show-spinner="uploading"
                  :disabled="uploading"
                  >{{ $t('actions.change_photo') }}
                </base-button>
              </DragDrop>

              <base-button variant="solid" class="py-2 px-4"
                >{{ $t('actions.view_id_badge') }}
              </base-button>
            </div>
            <div class="user-form p-8">
              <form ref="form" @submit.prevent="handleSubmit">
                <div class="user-details">
                  <div class="flex pb-4">
                    <base-input
                      class="mr-2 w-1/2"
                      size="large"
                      :value="currentUser.first_name"
                      :placeholder="$t('profileUser.first_name_placeholder')"
                      required
                      @input="
                        (value) => {
                          updateUser(value, 'first_name');
                        }
                      "
                    />
                    <base-input
                      class="w-1/2"
                      size="large"
                      :value="currentUser.mobile"
                      :placeholder="$t('profileUser.mobile_placeholder')"
                      required
                      :validator="validatePhoneNumber"
                      @input="
                        (value) => {
                          updateUser(value, 'mobile');
                        }
                      "
                    />
                  </div>
                  <div class="flex pb-4">
                    <base-input
                      class="mr-2 w-1/2"
                      size="large"
                      :value="currentUser.last_name"
                      :placeholder="$t('profileUser.last_name_placeholder')"
                      required
                      @input="
                        (value) => {
                          updateUser(value, 'last_name');
                        }
                      "
                    />
                    <base-input
                      class="w-1/2"
                      :value="currentUser.email"
                      size="large"
                      :placeholder="$t('profileUser.email_placeholder ')"
                      required
                      @input="
                        (value) => {
                          updateUser(value, 'email');
                        }
                      "
                    />
                  </div>
                </div>
                <hr class="p-2 m-auto" />
                <div class="flex pb-4">
                  <UserRolesSelect
                    class="
                      w-1/2
                      flex-grow
                      mr-2
                      border border-crisiscleanup-dark-100
                    "
                    :user="currentUser"
                  />
                  <form-select
                    v-model="currentUser.equipment"
                    class="w-1/2 flex-grow border border-crisiscleanup-dark-100"
                    :value="currentUser.equipment"
                    :options="[]"
                    item-key="value"
                    label="name_t"
                    size="large"
                    select-classes="bg-white border text-xs"
                  />
                </div>
                <div class="flex pb-4">
                  <form-select
                    class="w-1/2 flex-grow border border-crisiscleanup-dark-100"
                    :value="currentUser.languages"
                    multiple
                    :options="languages"
                    item-key="id"
                    label="name_t"
                    size="large"
                    select-classes="bg-white border text-xs p-1 profile-select"
                    :limit="2"
                    @input="
                      (value) => {
                        const [primary_language, secondary_language] = value;
                        updateUser(primary_language, 'primary_language');
                        updateUser(secondary_language, 'secondary_language');
                        if (!primary_language) {
                          updateUser(null, 'primary_language');
                        }
                        if (!secondary_language) {
                          updateUser(null, 'secondary_language');
                        }
                      }
                    "
                  />
                </div>
                <div class="mt-3">
                  <h3 class="text-base">{{ $t('profileUser.linkedin') }}</h3>
                  <div class="flex pb-4">
                    <div class="w-32 flex items-center">
                      <img
                        src="https://simpleicons.org/icons/facebook.svg"
                        class="w-8 mr-4"
                      />
                      <label class="pr-3">{{
                        $t('profileUser.facebook')
                      }}</label>
                    </div>
                    <base-input
                      :value="currentUser.facebook"
                      size="small"
                      :placeholder="$t('profileUser.facebook')"
                      @input="
                        (value) => {
                          const social = {
                            ...currentUser.social,
                            facebook: value,
                          };
                          updateUser(social, 'social');
                        }
                      "
                    />
                  </div>
                  <div class="flex pb-4">
                    <div class="w-32 flex items-center">
                      <img
                        src="https://simpleicons.org/icons/twitter.svg"
                        class="w-8 mr-2"
                      />
                      <label class="pr-3">{{
                        $t('profileUser.twitter')
                      }}</label>
                    </div>
                    <base-input
                      :value="currentUser.twitter"
                      size="small"
                      :placeholder="$t('profileUser.twitter')"
                      @input="
                        (value) => {
                          const social = {
                            ...currentUser.social,
                            twitter: value,
                          };
                          updateUser(social, 'social');
                        }
                      "
                    />
                  </div>
                </div>
                <hr class="my-3 m-auto" />
              </form>
              <div class="my-2">
                <base-button
                  variant="solid"
                  class="px-4 py-1"
                  :action="
                    () => {
                      $router.push(`/password/new?email=${currentUser.email}`);
                    }
                  "
                >
                  {{ $t('actions.change_password') }}
                </base-button>
              </div>
              <div class="mt-6">
                <h3>{{ $t('profileUser.your_organization') }}</h3>
                <div class="py-3 flex items-center">
                  <div
                    class="
                      w-8
                      h-8
                      rounded-full
                      bg-crisiscleanup-grey-300
                      border border-black
                    "
                  />
                  <span class="px-4">{{ currentUser.organization.name }}</span>
                </div>
                <div class="my-2">
                  <base-button
                    variant="solid"
                    class="px-4 py-1"
                    :action="
                      () => {
                        showChangeOrganizationModal = true;
                      }
                    "
                  >
                    {{ $t('profileUser.change_organization') }}
                  </base-button>
                  <ChangeOrganizationModal
                    v-if="showChangeOrganizationModal"
                    @cancel="showChangeOrganizationModal = false"
                  />
                </div>
              </div>
              <div class="mt-6">
                <h3>{{ $t('profileUser.notification_settings') }}</h3>
                <div class="flex flex-col py-3">
                  <base-radio
                    class="mb-2"
                    name="Yes"
                    type="boolean"
                    :value="currentUser.notificationSettings.has_notifications"
                    @click.native="
                      () => setNotifications('has_notifications', true)
                    "
                  />
                  <base-radio
                    class="mb-2"
                    name="No"
                    type="boolean"
                    :value="!currentUser.notificationSettings.has_notifications"
                    @click.native="
                      () => setNotifications('has_notifications', false)
                    "
                  />
                  <div
                    v-if="currentUser.notificationSettings.has_notifications"
                    class="flex justify-between flex-wrap"
                  >
                    <div
                      v-for="(value, key) in notifications"
                      :key="key"
                      class="flex w-1/2"
                    >
                      <base-checkbox
                        class="mr-1"
                        :value="currentUser.notificationSettings[key]"
                        @input="(value) => setNotifications(key, value)"
                      >
                      </base-checkbox>
                      {{ value }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-2">
                <h3 class="pb-4">{{ $t('profileUser.troubleshooting') }}</h3>
                <base-button
                  :text="$t('profileUser.reset_user_states')"
                  variant="solid"
                  class="px-4 py-1"
                  :action="resetStates"
                />
                <p class="my-3">
                  {{ $t('profileUser.clear_map_settings_viewport') }}
                </p>
                <base-button
                  :text="$t('profileUser.reset_user_preferences')"
                  variant="solid"
                  class="px-4 py-1"
                  :action="resetPreferences"
                />
                <p class="my-3">
                  {{ $t('profileUser.clear_favorites_user_settings') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { size } from 'lodash';
import { mapMutations } from 'vuex';
import detectBrowserLanguage from 'detect-browser-language';
import User from '@/models/User';
import Role from '@/models/Role';
import Language from '@/models/Language';
import { i18nService } from '@/services/i18n.service';
import DragDrop from '@/components/DragDrop';
import UserRolesSelect from '@/components/UserRolesSelect';
import { ValidateMixin } from '@/mixins';
import { getErrorMessage } from '../utils/errors';
import ChangeOrganizationModal from '../components/ChangeOrganizationModal';
import Avatar from '../components/Avatar';

export default {
  name: 'Profile',
  components: { Avatar, ChangeOrganizationModal, DragDrop, UserRolesSelect },
  mixins: [ValidateMixin],
  mounted() {
    if (this.$route.query.move) {
      this.showChangeOrganizationModal = true;
    }
  },
  data() {
    return {
      mode: 'view',
      uploading: false,
      showChangeOrganizationModal: false,
      notifications: {
        new_incident: this.$t('profileUser.notification_new_incident'),
        request_work_type: this.$t('profileUser.notification_request_work'),
        new_or_move_user: this.$t('profileUser.notification_new_moving_user'),
        affiliate_requests: this.$t('profileUser.notification_affiliate'),
        periodic_reports: this.$t('profileUser.notification_periodic_reports'),
        custom_reports: this.$t('profileUser.notification_custom_reports'),
        organization_registration: this.$t(
          'profileUser.notification_org_registration',
        ),
        location_approval: this.$t(
          'profileUser.notification_location_approval',
        ),
        move_user_to_organization: this.$t(
          'profileUser.notification_moving_users',
        ),
        incident_access_approval: this.$t(
          'profileUser.notification_incident_access',
        ),
        user_role_approval: this.$t('profileUser.notification_user_roles'),
        organization_role_approval: this.$t(
          'profileUser.notification_org_roles',
        ),
        phone_volunteer_needs: this.$t('profileUser.notification_phone_needs'),
      },
      nav: {
        request_reset_password: '/password/new',
      },
    };
  },
  computed: {
    name() {
      if (this.currentUser) {
        return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
      }
      return '';
    },
    roles() {
      return Role.all();
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    userRoles() {
      return Role.query().whereIdIn(this.currentUser.roles).get();
    },
    languages() {
      return Language.all();
    },
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
    },
    setNotifications(key, value) {
      if (this.currentUser.preferences) {
        const preferences = {
          ...this.currentUser.preferences,
          notification_settings: {
            ...this.currentUser.preferences.notification_settings,
            [key]: value,
          },
        };
        this.updateUser(preferences, 'preferences');
      } else {
        this.updateUser(
          {
            notification_settings: {
              [key]: value,
            },
          },
          'preferences',
        );
      }
    },
    async handleProfilePictureUpload(fileList) {
      if (fileList.length === 0) {
        this.uploading = false;
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[0]);
      formData.append('type_t', 'fileTypes.user_profile_picture');
      this.uploading = true;
      try {
        const result = await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        const file = result.data.id;

        const profilePictures = this.currentUser.files.filter(
          (picture) => picture.file_type_t === 'fileTypes.user_profile_picture',
        );

        const oldImages = profilePictures.map((picture) =>
          User.api().deleteFile(this.currentUser.id, picture.file),
        );
        await Promise.all(oldImages);

        await User.api().addFile(this.currentUser.id, file);
        await User.api().get('/users/me', {});
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.uploading = false;
      }
    },

    updateUser(value, key) {
      User.update({
        where: this.currentUser.id,
        data: {
          [key]: value,
        },
      });
    },
    async updateUserLanguage() {
      let currentLanguage = detectBrowserLanguage();
      const userLanguage =
        Language.find(this.currentUser.primary_language) ||
        Language.find(this.currentUser.secondary_language);
      if (userLanguage) {
        currentLanguage = userLanguage.subtag;
      }

      this.setLanguage(currentLanguage);

      if (currentLanguage !== this.$i18n.locale) {
        try {
          const data = await i18nService.getLanguage(currentLanguage);
          const { translations } = data;
          if (size(translations) > 0) {
            this.$i18n.setLocaleMessage(currentLanguage, translations);
            this.$i18n.locale = currentLanguage;
            this.$http.defaults.headers.common['Accept-Language'] =
              currentLanguage;
            document
              .querySelector('html')
              .setAttribute('lang', currentLanguage);
          }
        } catch (e) {
          this.$log.error(e);
        }
      }
    },
    ...mapMutations('locale', ['setLanguage']),
    async saveUser() {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }
      try {
        await User.api().patch(`/users/${this.currentUser.id}`, {
          ...this.currentUser.$toJson(),
          preferences: { ...this.currentUser.preferences, ...{} },
          states: { ...this.currentUser.states, ...{} },
        });
        await this.$toasted.success(this.$t('profileUser.save_user_success'));
        this.mode = 'view';
        this.updateUserLanguage();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    async resetStates() {
      await User.api().clearUserStates();
    },
    async resetPreferences() {
      await User.api().clearUserPreferences();
    },
  },
};
</script>

<style scoped>
.user-form {
  width: 48rem;
}
.profile-image {
  height: 175px;
  width: 175px;
}
</style>

<style>
.profile-select .vs__selected {
  @apply text-xs bg-white !important;
}
</style>
