<template>
  <modal
    modal-classes="bg-white max-w-md shadow"
    :closeable="true"
    @close="$emit('cancel')"
  >
    <div slot="header" class="text-lg border-b p-3">
      {{ $t('~~Update Agent') }}
    </div>
    <div class="p-5">
      <div class="section flex flex-col justify-around">
        <!-- Phone # -->
        <base-text :weight="200" class="section-header">
          {{ $t('~~Phone Number') }}
        </base-text>
        <base-input
          :value="phoneNumber"
          size="medium"
          placeholder="+1 (000) 000-0000"
          :validator="validatePhoneNumber"
          @input="(value) => (phoneNumber = value)"
        />
      </div>
      <div class="section flex flex-col">
        <base-text :weight="200" class="section-header">
          {{ $t('~~Languages') }}
        </base-text>
        <!-- Language -->
        <form-select
          class="flex-grow border border-crisiscleanup-dark-100"
          :value="languages"
          multiple
          :options="supportedLanguages"
          item-key="id"
          label="name_t"
          size="large"
          select-classes="bg-white border text-xs p-1 profile-select"
          :limit="2"
          @input="(value) => (languages = value)"
        />
      </div>
    </div>
    <div slot="footer" class="flex p-3 my-6 justify-center mb-3 footer">
      <base-button
        variant="solid"
        size="large"
        :action="() => updateUserNeeded()"
        >{{ $t('~~Save') }}</base-button
      >
    </div>
  </modal>
</template>

<script>
import {
  LangMixin,
  UserMixin,
  ValidateMixin,
  ConnectFirstMixin,
} from '@/mixins';
import Language from '@/models/Language';

export default {
  name: 'EditAgentModal',
  mixins: [UserMixin, LangMixin, ValidateMixin, ConnectFirstMixin],
  data() {
    return {
      number: '',
      languages: [],
      phoneNumber: '',
    };
  },
  mounted() {
    this.phoneNumber = this.currentUser.mobile;
    this.languages = this.currentUser.languages.map((l) => l.id);
  },
  methods: {
    async updateUserNeeded() {
      if (this.phoneNumber) {
        await this.updateUser(this.phoneNumber, 'mobile');
      }
      if (this.languages.length >= 1) {
        this.updateUser(null, 'primary_language');
        this.updateUser(null, 'secondary_language');
        const [primary_language, secondary_language] = this.languages;
        this.updateUser(primary_language, 'primary_language');
        this.updateUser(secondary_language, 'secondary_language');
      }
      try {
        await this.saveUser();
        await this.loadAgent();
        this.$emit('cancel');
      } catch (e) {
        this.$log.error('Failed to save user', e);
        this.$toasted.error(e);
      }
    },
  },
  computed: {
    supportedLanguages() {
      const languages = Language.all();
      const ids = [2, 7];
      return languages.filter((l) => ids.includes(l.id));
    },
  },
};
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
