<template>
  <autocomplete
    class="form-field"
    icon="search"
    :suggestions="userResults"
    display-property="full_name"
    :placeholder="placeholder"
    clear-on-selected
    @selected="$emit('selectedUser', $event)"
    @search="onUserSearch"
  />
</template>

<script>
import User from '@/models/User';
export default {
  name: 'UserSearchInput',
  props: {
    placeholder: {
      type: String,
      default: '',
      required: false,
    },
  },
  data() {
    return { userResults: [] };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
  },
  methods: {
    async onUserSearch(value) {
      const results = await User.api().get(
        `/users?search=${value}&limit=10&&organization=${this.currentUser.organization.id}`,
        {
          dataKey: 'results',
        },
      );
      this.userResults = results.entities.users;
    },
  },
};
</script>

<style scoped></style>
