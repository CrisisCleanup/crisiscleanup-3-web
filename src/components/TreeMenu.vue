<template>
  <ul class="tree-menu text-sm" :class="`ml-${indent * 2}`">
    <base-checkbox
      :model-value="selectedUsers.includes(data.id)"
      @update:modelValue="
        (value) => {
          if (value) {
            $emit('addUser', data.id);
          } else {
            $emit('removeUser', data.id);
          }
        }
      "
    >
      <div class="flex">
        <Avatar
          :initials="data.first_name"
          :url="profilePictureUrl"
          class="mb-4 mr-2"
          size="xsmall"
        />
        {{ data.first_name }} {{ data.last_name }}
      </div>
    </base-checkbox>
    <li
      v-if="children.length > 0"
      :class="`ml-${(indent + 1) * 2}`"
      class="pb-2 text-primary-dark"
    >
      <base-checkbox
        :model-value="
          children.every((child) => selectedUsers.includes(child.id))
        "
        @update:modelValue="
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
    <li v-for="child in children" :key="`${child.id}`">
      <tree-menu
        :children="child.children"
        :label="child.label"
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
import Avatar from '@/components/Avatar.vue';

export default {
  name: 'TreeMenu',
  components: { Avatar },
  props: ['label', 'children', 'indent', 'data', 'selectedUsers'],
  setup(props) {
    const profilePictureUrl = computed(() => {
      if (props.data.files && props.data.files.length > 0) {
        const profilePictures = props.data.files.filter(
          (file) => file.file_type_t === 'fileTypes.user_profile_picture',
        );
        if (profilePictures.length > 0) {
          return profilePictures[0].small_thumbnail_url;
        }
      }
      return `https://avatars.dicebear.com/api/bottts/${props.data.first_name}.svg`;
    });
  },
};
</script>
