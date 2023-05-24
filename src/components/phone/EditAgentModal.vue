<template>
  <modal
    modal-classes="bg-white max-w-md shadow"
    :closeable="true"
    @close="$emit('cancel')"
  >
    <template #header>
      <div class="text-lg border-b p-3" data-testid="testUpdateAgentDiv">
        {{ $t('editAgentModal.update_agent') }}
      </div>
    </template>

    <div class="p-5">
      <div class="section flex flex-col justify-around">
        <!-- Phone # -->
        <base-text
          :weight="200"
          class="section-header"
          data-testid="testPhoneNumberContent"
        >
          {{ $t('editAgentModal.phone_number') }}
        </base-text>
        <base-input
          :model-value="phoneNumber"
          data-testid="testPhoneNumberTextInput"
          size="medium"
          placeholder="+1 (000) 000-0000"
          :validator="validatePhoneNumber"
          @update:modelValue="(value: string) => (phoneNumber = value)"
        />
      </div>
      <div class="section flex flex-col">
        <base-text
          :weight="200"
          class="section-header"
          data-testid="testLanguagesContent"
        >
          {{ $t('editAgentModal.languages') }}
        </base-text>
        <!-- Language -->
        <base-select
          class="flex-grow border border-crisiscleanup-dark-100"
          data-testid="testLanguagesSelect"
          :model-value="languages"
          multiple
          :options="supportedLanguages"
          item-key="id"
          label="name_t"
          size="large"
          select-classes="bg-white border text-xs p-1 profile-select"
          :limit="2"
          @update:modelValue="(value: string[]) => (languages = value)"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex p-3 my-6 justify-center mb-3 footer">
        <base-button
          variant="solid"
          data-testid="testSaveButton"
          size="large"
          :action="() => updateUserNeeded()"
          >{{ $t('actions.save') }}</base-button
        >
      </div>
    </template>
  </modal>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import Language from '../../models/Language';
import useCurrentUser from '../../hooks/useCurrentUser';
import useConnectFirst from '../../hooks/useConnectFirst';
import useValidation from '../../hooks/useValidation';

export default defineComponent({
  name: 'EditAgentModal',
  setup(props, context) {
    const number = ref('');
    const languages = ref<string[]>([]);
    const phoneNumber = ref('');
    const { currentUser, updateCurrentUser, saveCurrentUser } =
      useCurrentUser();
    const { loadAgent } = useConnectFirst(context);
    const { validatePhoneNumber } = useValidation();
    const $toasted = useToast();

    async function updateUserNeeded() {
      if (phoneNumber.value) {
        await updateCurrentUser(phoneNumber.value, 'mobile');
      }

      if (languages.value.length > 0) {
        await updateCurrentUser(null, 'primary_language');
        await updateCurrentUser(null, 'secondary_language');
        const [primary_language, secondary_language] = languages.value;
        await updateCurrentUser(primary_language, 'primary_language');
        await updateCurrentUser(secondary_language, 'secondary_language');
      }

      try {
        await saveCurrentUser();
        await loadAgent();
        context.emit('cancel');
      } catch (error: any) {
        // this.$log.error('Failed to save user', e);
        $toasted.error(error);
      }
    }

    const supportedLanguages = computed(() => {
      const languages = Language.all();
      const ids = new Set([2, 7]);
      return languages.filter((l) => ids.has(Number(l.id)));
    });

    onMounted(() => {
      phoneNumber.value = currentUser?.mobile || '';
      languages.value = currentUser?.languages.map((l) => l.id) || [];
    });

    return {
      number,
      languages,
      phoneNumber,
      updateUserNeeded,
      validatePhoneNumber,
      supportedLanguages,
    };
  },
  mounted() {},
});
</script>

<style scoped lang="scss">
.section {
  @apply py-1;
  &-header {
    @apply text-crisiscleanup-dark-400 py-1;
  }
}
.footer {
  @apply shadow-inner;
  position: relative;
  margin: 0;
}
</style>
