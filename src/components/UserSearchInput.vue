<template>
  <base-select
    v-model="selectedUser"
    :placeholder="placeholder"
    :options="onUserSearch"
    :min-chars="1"
    :add-option-on="['enter', 'tab']"
    value-prop="id"
    object
    searchable
  >
    <template #option="{ option }">
      <div class="flex items-center">
        <div class="flex flex-col">
          <span class="text-sm">{{ option.full_name }}</span>
          <span class="text-xs">{{ option.email }}</span>
        </div>
      </div>
    </template>
  </base-select>
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
  emits: ['selectedUser'],
  setup(props, { emit }) {
    const store = useStore();
    const userResults = ref<User[]>([]);
    const currentUser = computed(() => User.find(store.getters['auth/userId']));
    const selectedUser = ref<unknown>();

    async function onUserSearch(value: string) {
      const _results = await User.api().get(
        `/users?search=${value}&limit=10&&organization=${currentUser.value.organization.id}`,
        { dataKey: 'results' },
      );
      const results = (_results.entities?.users || []) as User[];
      userResults.value = results;
      return results;
    }

    watch(
      () => selectedUser.value,
      (value) => {
        emit('selectedUser', value);
      },
    );

    return {
      selectedUser,
      userResults,
      onUserSearch,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
