<template>
  <div style="height: 85%" class="h-full flex justify-center">
    <div class="h-full flex flex-col w-11/12 sm:w-3/4 shadow my-6">
      <div class="h-full w-full bg-white flex flex-col">
        <div
          class="border-b px-4 py-2 font-semibold flex justify-between items-center h-16"
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
          <div class="flex sm:flex-row flex-col">
            <div class="flex flex-col p-8 sm:w-64 items-center">
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
            <div class="user-form p-10 sm:p-8">
              <form ref="form" @submit.prevent="handleSubmit">
                <div class="user-details">
                  <div class="flex pb-4">
                    <div class="form-field mr-2">
                      <label for="first_name">{{
                        $t('profileUser.first_name_placeholder')
                      }}</label>
                      <base-input
                        name="first_name"
                        size="large"
                        :model-value="currentUser.first_name"
                        :placeholder="$t('profileUser.first_name_placeholder')"
                        required
                        @update:modelValue="
                          (value) => {
                            updateUser(value, 'first_name');
                          }
                        "
                      />
                    </div>
                    <div class="form-field">
                      <label for="mobile">{{
                        $t('profileUser.mobile_placeholder')
                      }}</label>
                      <base-input
                        name="mobile"
                        size="large"
                        :model-value="currentUser.mobile"
                        :placeholder="$t('profileUser.mobile_placeholder')"
                        required
                        :validator="validatePhoneNumber"
                        @update:modelValue="
                          (value) => {
                            updateUser(value, 'mobile');
                          }
                        "
                      />
                    </div>
                  </div>
                  <div class="flex pb-4">
                    <div class="form-field mr-2">
                      <label for="last_name">{{
                        $t('profileUser.last_name_placeholder')
                      }}</label>
                      <base-input
                        name="last_name"
                        size="large"
                        :model-value="currentUser.last_name"
                        :placeholder="$t('profileUser.last_name_placeholder')"
                        required
                        @update:modelValue="
                          (value) => {
                            updateUser(value, 'last_name');
                          }
                        "
                      />
                    </div>
                    <div class="form-field">
                      <label for="email">{{
                        $t('profileUser.email_placeholder')
                      }}</label>
                      <base-input
                        name="email"
                        :model-value="currentUser.email"
                        size="large"
                        :placeholder="$t('profileUser.email_placeholder ')"
                        required
                        @update:modelValue="
                          (value) => {
                            updateUser(value, 'email');
                          }
                        "
                      />
                    </div>
                  </div>
                </div>
                <hr class="p-2 m-auto" />
                <div class="flex flex-col sm:flex-row pb-4">
                  <div class="sm:w-1/2 mr-2">
                    <p>{{ $t('profileUser.user_roles') }}</p>
                    <UserRolesSelect
                      class="w-full flex-grow border border-crisiscleanup-dark-100"
                      :user="currentUser"
                    />
                  </div>
                  <div class="w-1/2">
                    <p>{{ $t('profileUser.equipment') }}</p>
                    <base-select
                      v-model="currentUser.equipment"
                      :model-value="currentUser.equipment"
                      :options="[]"
                      item-key="value"
                      label="name_t"
                      size="large"
                    />
                  </div>
                </div>
                <div>{{ $t('profileUser.languages') }}</div>
                <div class="flex pb-4">
                  <base-select
                    :model-value="currentUser.languageIds"
                    multiple
                    :options="languages"
                    item-key="id"
                    label="name_t"
                    size="large"
                    class="w-full"
                    @update:modelValue="
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
                      :model-value="currentUser.facebook"
                      size="small"
                      :placeholder="$t('profileUser.facebook')"
                      @update:modelValue="
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
                      :model-value="currentUser.twitter"
                      size="small"
                      :placeholder="$t('profileUser.twitter')"
                      @update:modelValue="
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
                    class="w-8 h-8 rounded-full bg-crisiscleanup-grey-300 border border-black"
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
                    :model-value="
                      currentUser.notificationSettings.has_notifications
                    "
                    @click="() => setNotifications('has_notifications', true)"
                  />
                  <base-radio
                    class="mb-2"
                    name="No"
                    type="boolean"
                    :model-value="
                      !currentUser.notificationSettings.has_notifications
                    "
                    @click="() => setNotifications('has_notifications', false)"
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
                        :model-value="currentUser.notificationSettings[key]"
                        @update:modelValue="
                          (value) => setNotifications(key, value)
                        "
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

                <div v-if="false" class="extra-settings">
                  <base-checkbox
                    v-model="currentUser.preferences.enable_worksite_caching"
                  >
                    {{ $t('profileUser.enable_worksite_caching') }}
                  </base-checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { getErrorMessage } from '@/utils/errors';
import Avatar from '@/components/Avatar.vue';
import User from '@/models/User';
import Role from '@/models/Role';
import Language from '@/models/Language';
import DragDrop from '@/components/DragDrop.vue';
import UserRolesSelect from '@/components/UserRolesSelect.vue';
import useSetupLanguage from '@/hooks/useSetupLanguage';
import useValidation from '@/hooks/useValidation';
import ChangeOrganizationModal from '@/components/modals/ChangeOrganizationModal.vue';

export default defineComponent({
  name: 'Profile',
  components: { Avatar, ChangeOrganizationModal, DragDrop, UserRolesSelect },
  setup() {
    const $toasted = useToast();
    const route = useRoute();
    const store = useStore();
    const { validatePhoneNumber } = useValidation();
    const { t } = useI18n();
    const form = ref(null);
    const state = reactive({
      mode: 'view',
      uploading: false,
      showChangeOrganizationModal: false,
      notifications: {
        new_incident: t('profileUser.notification_new_incident'),
        request_work_type: t('profileUser.notification_request_work'),
        new_or_move_user: t('profileUser.notification_new_moving_user'),
        affiliate_requests: t('profileUser.notification_affiliate'),
        periodic_reports: t('profileUser.notification_periodic_reports'),
        custom_reports: t('profileUser.notification_custom_reports'),
        organization_registration: t(
          'profileUser.notification_org_registration',
        ),
        location_approval: t('profileUser.notification_location_approval'),
        move_user_to_organization: t('profileUser.notification_moving_users'),
        incident_access_approval: t('profileUser.notification_incident_access'),
        user_role_approval: t('profileUser.notification_user_roles'),
        organization_role_approval: t('profileUser.notification_org_roles'),
        phone_volunteer_needs: t('profileUser.notification_phone_needs'),
      },
      nav: {
        request_reset_password: '/password/new',
      },
    });
    const currentUser = computed(() => User.find(store.getters['auth/userId']));

    const name = computed(() => {
      if (currentUser.value) {
        return `${currentUser.value.first_name} ${currentUser.value.last_name}`;
      }

      return '';
    });

    const roles = computed(() => {
      return Role.all();
    });

    const languages = computed(() => {
      return Language.all();
    });

    const userRoles = computed(() => {
      return Role.query().whereIdIn(currentUser.value.roles).get();
    });

    function handleSubmit(e) {
      e.preventDefault();
    }

    function setNotifications(key, value) {
      if (currentUser.value.preferences) {
        const preferences = {
          ...currentUser.value.preferences,
          notification_settings: {
            ...currentUser.value.preferences.notification_settings,
            [key]: value,
          },
        };
        updateUser(preferences, 'preferences');
      } else {
        updateUser(
          {
            notification_settings: {
              [key]: value,
            },
          },
          'preferences',
        );
      }
    }

    async function handleProfilePictureUpload(fileList) {
      if (fileList.length === 0) {
        state.uploading = false;
        return;
      }

      const formData = new FormData();
      formData.append('upload', fileList[0]);
      formData.append('type_t', 'fileTypes.user_profile_picture');
      state.uploading = true;
      try {
        const result = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        const file = result.data.id;

        const profilePictures = currentUser.value.files.filter(
          (picture) => picture.file_type_t === 'fileTypes.user_profile_picture',
        );

        const oldImages = profilePictures.map((picture) =>
          User.api().deleteFile(currentUser.value.id, picture.file),
        );
        await Promise.all(oldImages);

        await User.api().addFile(currentUser.value.id, file);
        await User.api().get('/users/me', {});
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        state.uploading = false;
      }
    }

    function updateUser(value, key) {
      User.update({
        where: currentUser.value.id,
        data: {
          [key]: value,
        },
      });
    }

    async function updateUserLanguage() {
      const { setupLanguage } = useSetupLanguage();
      await setupLanguage();
    }

    async function saveUser() {
      const isValid = form.value.reportValidity();
      if (!isValid) {
        return;
      }

      try {
        await User.api().patch(`/users/${currentUser.value.id}`, {
          ...User.find(currentUser.value.id).$toJson(),
          preferences: { ...currentUser.value.preferences },
          states: { ...currentUser.value.states },
        });
        await $toasted.success(t('profileUser.save_user_success'));
        state.mode = 'view';
        await updateUserLanguage();
        window.location.reload();
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    async function resetStates() {
      await User.api().clearUserStates();
    }

    async function resetPreferences() {
      await User.api().clearUserPreferences();
    }

    onMounted(() => {
      if (route.query.move) {
        state.showChangeOrganizationModal = true;
      }
    });

    const stateRefs = toRefs(state);
    return {
      ...stateRefs,
      name,
      roles,
      languages,
      userRoles,
      currentUser,
      handleSubmit,
      setNotifications,
      handleProfilePictureUpload,
      updateUser,
      saveUser,
      resetPreferences,
      resetStates,
      validatePhoneNumber,
      form,
    };
  },
});
</script>

<style scoped>
.user-form {
  .form-field {
    @apply flex flex-col w-1/2 ml-0;
  }
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
