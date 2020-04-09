<template>
  <div class="resources flex flex-grow flex-col">
    <div v-for="r in resources" :key="r.id" class="resources--section">
      <div class="header">
        <base-text variant="h3">
          {{ $t('~~External') }}
        </base-text>
      </div>
      <div class="items">
        <div
          @click="() => selectItem(r.id)"
          :class="`item flex shadow ${selected === r.id ? 'active' : ''}`"
        >
          <div class="icon">
            <ccu-icon :type="icons.call" />
          </div>
          <div class="body flex flex-col">
            <base-text variant="body" weight="600">
              {{ r.name_t }}
            </base-text>
            <base-text variant="bodyxsm">
              {{ r.dnis }}
            </base-text>
          </div>
        </div>
      </div>
    </div>
    <div class="resources--actions">
      <base-button :disabled="selected === -1" variant="solid" size="large">
        {{ $t('~~Start Conference') }}
      </base-button>
    </div>
  </div>
</template>

<script>
import PhoneResource from '@/models/PhoneResource';
import { IconsMixin, ValidateMixin } from '@/mixins';
export default {
  name: 'PhoneResources',
  mixins: [IconsMixin, ValidateMixin],
  methods: {
    selectItem(id) {
      if (this.selected === id) {
        this.selected = -1;
        return;
      }
      this.selected = id;
    },
  },
  data() {
    return {
      selected: -1,
    };
  },
  computed: {
    resources() {
      return PhoneResource.all();
    },
  },
};
</script>

<style lang="scss" scoped>
.resources {
  @apply bg-white p-3;
  &--actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    align-items: center;
  }

  &--section {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    @apply px-6;
    .header {
      @apply py-6;
    }
    .items {
      display: flex;
      .item {
        align-items: center;
        @apply p-2;
        justify-content: space-around;
        border-color: #dadada;
        border-radius: 2px;
        background-color: #f6f8f9;
        border: 1px solid;
        cursor: pointer;
        p {
          @apply text-crisiscleanup-dark-500;
          cursor: pointer;
        }
        .body {
          @apply px-3;
        }
        transition: 300ms ease;
        &.active {
          @apply border-primary-light;
        }
        &.active,
        &:hover {
          background-color: fade-out(#f6f8f9, 0.7);
          @apply shadow-xl;
        }
      }
    }
  }
}
</style>
