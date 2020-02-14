<template>
  <div class="flex items-center justify-center" :style="{ padding: '24px' }">
    <div>
      <div v-if="isEditing" class="border">
        <div class="h-16 flex items-center justify-between px-4 py-4 border-b">
          <span class="text-base">{{ name }}</span>
          <ccu-icon
            :alt="$t('actions.cancel')"
            size="xs"
            class="p-1 py-2"
            type="cancel"
            @click.native="mode = 'view'"
          />
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="flex m-auto p-3 justify-start">
            <div class="flex flex-col p-8">
              <img
                class="rounded-full mx-auto p-1"
                src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80"
              />
              <a href="https://google.com" class="text-center pb-4">{{
                $t('actions.change_photo')
              }}</a>
              <base-button type="primary">{{
                $t('actions.view_id_badge')
              }}</base-button>
            </div>
            <div class="p-8 w-108">
              <div class="user-details">
                <div class="flex">
                  <div class="input-container m-1 mb-3">
                    <base-input
                      :value="currentUser.first_name"
                      size="large"
                      :placeholder="$t('activate.first_name_placeholder')"
                      required
                      @input="
                        value => {
                          updateUser(value, 'first_name');
                        }
                      "
                    />
                  </div>
                  <div class="input-container m-1 mb-3">
                    <base-input
                      :value="currentUser.mobile"
                      size="large"
                      :placeholder="$t('activate.mobile_placeholder')"
                      required
                      @input="
                        value => {
                          updateUser(value, 'mobile');
                        }
                      "
                    />
                  </div>
                </div>
                <div class="flex">
                  <div class="input-container m-1 mb-3">
                    <base-input
                      :value="currentUser.last_name"
                      size="large"
                      :placeholder="$t('activate.last_name_placeholder')"
                      required
                      @input="
                        value => {
                          updateUser(value, 'last_name');
                        }
                      "
                    />
                  </div>
                  <div class="input-container m-1 mb-3">
                    <base-input
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
              </div>
              <hr class="p-2 m-auto" />
              <div class="flex">
                <div class="p-1 flex-grow">
                  <div label="">
                    <form-select
                      v-model="currentUser.roles"
                      :value="currentUser.roles"
                      multiple
                      :options="[]"
                      item-key="value"
                      label="name_t"
                      select-classes="bg-white border"
                    />
                  </div>
                </div>
                <div class="p-1 flex-grow">
                  <div label="">
                    <form-select
                      v-model="currentUser.equipment"
                      :value="currentUser.equipment"
                      :options="[]"
                      item-key="value"
                      label="name_t"
                      select-classes="bg-white border"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3>{{ $t('profileVue.linkedin') }}</h3>
                <div class="flex py-3 items-center">
                  <div class="w-1/5 flex items-center">
                    <img
                      src="https://simpleicons.org/icons/facebook.svg"
                      class="w-8 mr-2"
                    />
                    <label class="pr-3">{{ $t('profileVue.facebook') }}</label>
                  </div>
                  <base-input
                    :value="currentUser.facebook"
                    size="large"
                    :placeholder="$t('activate.email_placeholder ')"
                    required
                    @input="
                      value => {
                        updateUser(value, 'facebook');
                      }
                    "
                  />
                </div>
                <div class="flex py-3 items-center">
                  <div class="w-1/5 flex items-center">
                    <img
                      src="https://simpleicons.org/icons/twitter.svg"
                      class="w-8 mr-2"
                    />
                    <label class="pr-3">{{ $t('profileVue.twitter') }}</label>
                  </div>
                  <base-input
                    :value="currentUser.twitter"
                    size="large"
                    :placeholder="$t('activate.email_placeholder ')"
                    required
                    @input="
                      value => {
                        updateUser(value, 'twitter');
                      }
                    "
                  />
                </div>
              </div>
              <hr class="p-4 m-auto" />
              <div>
                <h3>{{ $t('profileVue.your_organization') }}</h3>
                <div class="py-3 flex items-center">
                  <div class="w-8 h-8 rounded-full bg-crisiscleanup-grey-300" />
                  <span class="px-4">{{ currentUser.organization.name }}</span>
                </div>
                <div>
                  <base-button type="primary" class="px-4">
                    {{ $t('profileVue.change_organization') }}
                  </base-button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div v-else class="border">
        <div class="h-16 flex items-center justify-between px-4 py-4 border-b">
          <span class="text-base">{{ name }}</span>
          <div class="flex">
            <ccu-icon
              :alt="$t('actions.edit_alt')"
              size="small"
              class="p-1 py-2"
              type="edit"
              @click.native="startEditing"
            />
            <ccu-icon
              :alt="$t('actions.share_alt')"
              size="small"
              class="p-1 py-2"
              type="share"
            />
            <ccu-icon
              :alt="$t('actions.print_alt')"
              size="small"
              class="p-1 py-2"
              type="print"
            />
            <ccu-icon
              :alt="$t('actions.delete_alt')"
              size="small"
              class="p-1 py-2"
              type="trash"
            />
          </div>
        </div>
        <div class="flex m-auto p-3 justify-start">
          <div class="flex flex-col p-8">
            <img
              class="rounded-full mx-auto p-1"
              src="https://images.unsplash.com/photo-1569466896818-335b1bedfcce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=150&q=80"
            />
            <a href="https://google.com" class="text-center pb-4">{{
              $t('actions.change_photo')
            }}</a>
            <base-button type="primary">{{
              $t('actions.view_id_badge')
            }}</base-button>
          </div>
          <div style="min-width: 700px;" class="p-8 w-1/2">
            <h1 class="text-2xl">{{ name }}</h1>
            <div class="text-gray-500">{{ currentUser.roles[0].name_t }}</div>
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
            <div class="mt-4 text-gray-700">
              <div class="py-1">
                <font-awesome-icon size="lg" class="mr-3" icon="phone-alt" />
                {{ currentUser.mobile }}
              </div>
              <div class="py-1">
                <font-awesome-icon size="lg" class="mr-3" icon="envelope" />
                {{ currentUser.email }}
              </div>
            </div>
            <div class="mt-4">
              <h3>{{ $t('profileVue.assets') }}</h3>
              <div class="mt-2 flex">
                <tag class="mx-1">Van</tag>
                <tag class="mx-1">Trailer</tag>
                <tag class="mx-1">Compressor</tag>
                <tag class="mx-1">Bulldozer</tag>
              </div>
            </div>
            <div class="mt-8">
              <h3>{{ $t('profileVue.organization') }}</h3>
              <div class="py-3 flex items-center">
                <div class="w-8 h-8 rounded-full bg-crisiscleanup-grey-300" />
                <span class="px-4">{{ currentUser.organization.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import User from '@/models/User';

export default {
  name: 'Profile',
  data() {
    return {
      mode: 'view',
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
    isEditing() {
      return this.mode === 'edit';
    },
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
    },
    startEditing() {
      this.mode = 'edit';
    },
    updateUser(value, key) {
      User.update({
        where: this.currentUser.id,
        data: {
          [key]: value,
        },
      });
    },
  },
};
</script>

<style scoped>
.profile-actions .anticon {
  font-size: 20px;
  padding-left: 0.5em;
}
.ant-btn-primary {
  color: black;
}
.user-details .input-container {
}
.user-details label {
  color: #a0a0a0;
  font-weight: 200;
  font-size: small;
}
.user-details .ant-input {
  border: 0;
  padding: 0;
}
</style>
