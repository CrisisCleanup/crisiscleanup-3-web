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

<script lang="ts">
import User from '@/models/User';

export default defineComponent({
  name: 'UserSearchInput',
  props: {
    placeholder: {
      type: String,
      default: '',
      required: false,
    },
  },
  setup(props) {
    const store = useStore();
    const userResults = ref<unknown[]>([]);
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const currentUser = computed(() => User.find(store.getters['auth/userId']));

    async function onUserSearch(value: string) {
      const results = await User.api().get(
        `/users?search=${value}&limit=10&&organization=${currentUser.organization.id}`,
        { dataKey: 'results' },
      );
      userResults.value = results.entities?.users || [];
    }

    return {
      userResults,
      onUserSearch,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
