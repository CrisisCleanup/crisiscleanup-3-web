<template>
  <div class="flex flex-col w-3/4 m-auto">
    <div class="w-full bg-white shadow mt-6">
      <div
        class="border-b px-4 py-2 font-semibold flex justify-between items-center h-16"
      >
        {{ currentUser.full_name }}
        <div v-if="isEditing" class="flex justify-end">
          <base-button
            class="px-4 py-2 border border-black mr-1"
            :text="$t('actions.cancel')"
            :action="
              () => {
                mode = 'view';
              }
            "
          />
          <base-button
            type="primary"
            class="px-4 py-2"
            :text="$t('actions.save')"
            :action="saveUser"
          />
        </div>
        <div v-else class="flex">
          <ccu-icon
            :alt="$t('actions.edit')"
            size="small"
            class="p-1 py-2"
            type="edit"
            @click.native="mode = 'edit'"
          />
          <ccu-icon
            :alt="$t('actions.print')"
            size="small"
            class="p-1 py-2"
            type="print"
          />
          <ccu-icon
            :alt="$t('actions.share')"
            size="small"
            class="p-1 py-2"
            type="share"
          />
          <ccu-icon
            :alt="$t('actions.trash')"
            size="small"
            class="p-1 py-2"
            type="trash"
          />
        </div>
      </div>
      <div>
        <div class="flex">
          <div class="flex flex-col p-8 w-64 items-center">
            <img
              class="rounded-full p-1 profile-image"
              :src="profilePictureUrl"
              :alt="$t('Profile Picture')"
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
                >{{ $t('actions.change_photo') }}</base-button
              >
            </DragDrop>

            <base-button type="primary" class="py-2 px-4">{{
              $t('actions.view_id_badge')
            }}</base-button>
          </div>
          <div class="user-form p-8">
            <form v-if="isEditing" ref="form" @submit.prevent="handleSubmit">
              <div class="user-details">
                <div class="flex pb-4">
                  <base-input
                    class="mr-2 w-1/2"
                    size="large"
                    :value="currentUser.first_name"
                    :placeholder="$t('activate.first_name_placeholder')"
                    required
                    @input="
                      value => {
                        updateUser(value, 'first_name');
                      }
                    "
                  />
                  <base-input
                    class="w-1/2"
                    size="large"
                    :value="currentUser.mobile"
                    :placeholder="$t('activate.mobile_placeholder')"
                    required
                    @input="
                      value => {
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
                    :placeholder="$t('activate.last_name_placeholder')"
                    required
                    @input="
                      value => {
                        updateUser(value, 'last_name');
                      }
                    "
                  />
                  <base-input
                    class="w-1/2"
                    :value="currentUser.email"
                    size="large"
                    :placeholder="$t('activate.email_placeholder ')"
                    required
                    @input="
                      value => {
                        updateUser(value, 'email');
                      }
                    "
                  />
                </div>
              </div>
              <hr class="p-2 m-auto" />
              <div class="flex pb-4">
                <form-select
                  v-model="currentUser.roles"
                  class="w-1/2 flex-grow mr-2 border border-crisiscleanup-dark-100"
                  :value="currentUser.roles"
                  multiple
                  :options="[]"
                  item-key="value"
                  label="name_t"
                  size="large"
                  select-classes="bg-white border text-xs h-12"
                />
                <form-select
                  v-model="currentUser.equipment"
                  class="w-1/2 flex-grow border border-crisiscleanup-dark-100"
                  :value="currentUser.equipment"
                  :options="[]"
                  item-key="value"
                  label="name_t"
                  size="large"
                  select-classes="bg-white border text-xs h-12"
                />
              </div>
              <div class="flex pb-4">
                <form-select
                  class="w-1/2 flex-grow mr-2 border border-crisiscleanup-dark-100"
                  :value="currentUser.languages"
                  multiple
                  :options="languages"
                  item-key="id"
                  label="name_t"
                  size="large"
                  select-classes="bg-white border text-xs h-12"
                  :limit="2"
                  @input="
                    value => {
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
                <h3 class="text-base">{{ $t('profileVue.linkedin') }}</h3>
                <div class="flex pb-4">
                  <div class="w-32 flex items-center">
                    <img
                      src="https://simpleicons.org/icons/facebook.svg"
                      class="w-8 mr-4"
                    />
                    <label class="pr-3">{{ $t('profileVue.facebook') }}</label>
                  </div>
                  <base-input
                    :value="currentUser.facebook"
                    size="small"
                    :placeholder="$t('profileVue.facebook')"
                    @input="
                      value => {
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
                    <label class="pr-3">{{ $t('profileVue.twitter') }}</label>
                  </div>
                  <base-input
                    :value="currentUser.twitter"
                    size="small"
                    :placeholder="$t('profileVue.twitter')"
                    @input="
                      value => {
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
            <div v-else>
              <h1 class="text-2xl">{{ name }}</h1>
              <div class="text-crisiscleanup-grey-700">
                {{ currentUser.roles[0].name_t }}
              </div>
              <div class="flex mt-4">
                <img
                  src="https://simpleicons.org/icons/facebook.svg"
                  class="w-8 mr-2"
                />
                <img
                  src="https://simpleicons.org/icons/twitter.svg"
                  class="w-8 mr-2"
                />
              </div>
              <div class="mt-4 text-crisiscleanup-dark-400">
                <div class="py-1">
                  <font-awesome-icon size="lg" class="mr-3" icon="phone-alt" />
                  <a :href="`tel:${currentUser.mobile}`">{{
                    currentUser.mobile
                  }}</a>
                </div>
                <div class="py-1">
                  <font-awesome-icon size="lg" class="mr-3" icon="envelope" />
                  <a :href="`mailto:${currentUser.email}`">{{
                    currentUser.email
                  }}</a>
                </div>
              </div>
            </div>
            <div class="mt-6">
              <h3>{{ $t('profileVue.your_organization') }}</h3>
              <div class="py-3 flex items-center">
                <div
                  class="w-8 h-8 rounded-full bg-crisiscleanup-grey-300 border border-black"
                />
                <span class="px-4">{{ currentUser.organization.name }}</span>
              </div>
              <div class="my-2">
                <base-button type="primary" class="px-4 py-1">
                  {{ $t('profileVue.change_organization') }}
                </base-button>
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
import { getErrorMessage } from '../utils/errors';
import Language from '@/models/Language';
import { i18nService } from '@/services/i18n.service';
import DragDrop from '@/components/DragDrop';

export default {
  name: 'Profile',
  components: { DragDrop },
  data() {
    return {
      mode: 'view',
      uploading: false,
    };
  },
  computed: {
    name() {
      if (this.currentUser) {
        return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
      }
      return '';
    },
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    profilePictureUrl() {
      if (this.currentUser.files.length) {
        const profilePictures = this.currentUser.files.filter(
          file => file.file_type_t === 'fileTypes.user_profile_picture',
        );
        if (profilePictures.length) {
          return profilePictures[0].url;
        }
      }
      return '';
    },
    isEditing() {
      return this.mode === 'edit';
    },
    languages() {
      return Language.all();
    },
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
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
          picture => picture.file_type_t === 'fileTypes.user_profile_picture',
        );

        const oldImages = profilePictures.map(picture =>
          User.api().deleteFile(this.currentUser.id, picture.id),
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
            this.$http.defaults.headers.common[
              'Accept-Language'
            ] = currentLanguage;
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
        await this.$toasted.success(this.$t('profileVue.save_user_success'));
        this.mode = 'view';
        this.updateUserLanguage();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
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
