<template>
  <div
    class="profile-menu flex items-center header-item overflow-hidden h-full"
    :class="invert && '--invert'"
  >
    <v-popover
      popover-class="menu-popover"
      placement="bottom-end"
      data-cy="auth.userprofile"
    >
      <div class="profile-menu__body flex cursor-pointer items-center">
        <Avatar
          :initials="currentUser && currentUser.first_name"
          :url="currentUser && currentUser.profilePictureUrl"
          class="p-1"
          size="small"
        />
        <base-text variant="h3" class="p-3" regular :class="[...styles.title]">
          <span
            class="font-h3 text-h3 font-normal subpixel-antialiased"
            :class="styles.title"
            >{{ currentUser && currentUser.full_name }}
            <font-awesome-icon class="cursor-pointer" icon="caret-down" />
          </span>
        </base-text>
      </div>
      <div slot="popover" class="flex flex-col">
        <base-button
          data-cy="auth.userprofile.profile"
          class="text-base p-2 hover:bg-crisiscleanup-light-grey cursor-pointer"
          :text="$t('actions.profile')"
          :action="
            () => {
              $router.push(`/profile`);
            }
          "
        />
        <base-button
            data-cy="auth.userprofile.downloads"
            class="text-base p-2 hover:bg-crisiscleanup-light-grey cursor-pointer"
            :text="$t('actions.downloads')"
            :action="
              () => {
                $router.push(`/downloads`);
              }
            "
          />
        <base-button
          data-cy="auth.userprofile.logout"
          class="text-base p-2 hover:bg-crisiscleanup-light-grey cursor-pointer"
          :text="$t('actions.logout')"
          :action="() => $emit('auth:logout')"
        />
      </div>
    </v-popover>
  </div>
</template>
<script>
import Avatar from '@/components/Avatar';
import { UserMixin } from '@/mixins';

export default {
  name: 'UserProfileMenu',
  components: { Avatar },
  mixins: [UserMixin],
  props: {
    invert: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    styles() {
      return {
        title:
          this.invert === true
            ? ['text-white']
            : ['text-crisiscleanup-dark-300'],
      };
    },
  },
};
</script>

<style scoped lang="postcss"></style>
