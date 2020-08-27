<template>
  <ul class="tree-menu text-sm" :class="`ml-${indent * 2}`">
    <base-checkbox
      @input="
        (value) => {
          if (value) {
            $emit('addUser', data.id);
          } else {
            $emit('removeUser', data.id);
          }
        }
      "
      :value="selectedUsers.includes(data.id)"
    >
      <div class="flex">
        <Avatar
          :initials="data.first_name"
          :url="profilePictureUrl"
          class="mb-4 mr-2"
        />
        {{ data.first_name }} {{ data.last_name }}
      </div>
    </base-checkbox>
    <li
      v-if="children.length"
      :class="`ml-${(indent + 1) * 2}`"
      class="pb-2 text-primary-dark"
    >
      <base-checkbox
        :value="children.every((child) => selectedUsers.includes(child.id))"
        @input="
          (value) => {
            if (value) {
              $emit('addUserTree', data.id);
            } else {
              $emit('removeUserTree', data.id);
            }
          }
        "
      >
        Add the whole {{ data.first_name }} branch
      </base-checkbox>
    </li>
    <li v-for="child in children">
      <tree-menu
        :children="child.children"
        :label="child.label"
        :key="child.id"
        :indent="indent + 1"
        :data="child"
        :selected-users="selectedUsers"
        @addUser="$emit('addUser', $event)"
        @addUserTree="$emit('addUserTree', $event)"
        @removeUser="$emit('removeUser', $event)"
        @removeUserTree="$emit('removeUserTree', $event)"
      >
      </tree-menu>
    </li>
  </ul>
</template>
<script>
import Avatar from './Avatar';
export default {
  components: { Avatar },
  props: ['label', 'children', 'indent', 'data', 'selectedUsers'],
  name: 'TreeMenu',
  computed: {
    profilePictureUrl() {
      if (this.data.files && this.data.files.length) {
        const profilePictures = this.data.files.filter(
          (file) => file.file_type_t === 'fileTypes.user_profile_picture',
        );
        if (profilePictures.length) {
          return profilePictures[0].url;
        }
      }
      return `https://api.adorable.io/avatars/285/ccu-user-${this.data.id}.png`;
    },
  },
};
</script>
