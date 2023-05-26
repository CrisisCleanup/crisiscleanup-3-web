<template>
  <base-select
    :model-value="selectedUser"
    :placeholder="placeholder"
    :options="onUserSearch"
    :min-chars="1"
    :add-option-on="['enter', 'tab']"
    data-testid="testUserSearchSelect"
    value-prop="id"
    object
    searchable
    @update:modelValue="onUserUpdate"
  >
    <template #option="{ option }">
      <div class="flex items-center">
        <div class="flex flex-col">
          <span class="text-sm">{{ option.full_name }}</span>
          <span class="text-xs">{{ option[displayProp] }}</span>
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
    displayProp: {
      type: String,
      default: 'email',
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
        `/users?search=${value}&limit=10&&organization=${currentUser?.value?.organization.id}`,
        { dataKey: 'results' },
      );
      const results = (_results.entities?.users || []) as User[];
      userResults.value = results;
      return results;
    }

    const onUserUpdate = (value: any) => {
      emit('selectedUser', value);
      selectedUser.value = value;
    };

    return {
      selectedUser,
      userResults,
      onUserSearch,
      onUserUpdate,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
