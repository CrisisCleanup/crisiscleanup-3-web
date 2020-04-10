<template>
  <div class="resources flex flex-grow flex-col">
    <div
      v-for="[category, items] in resources"
      :key="category"
      class="resources--section"
    >
      <div class="header">
        <base-text variant="h3">
          {{ category }}
        </base-text>
      </div>
      <div class="items">
        <div
          v-for="r in items"
          :key="r.id"
          :class="`item flex ${selected === r.id ? 'active' : ''}`"
        >
          <div class="card shadow">
            <div class="body flex flex-col">
              <base-text variant="body" weight="600">
                {{ r.name_t }}
              </base-text>
              <base-text variant="bodyxsm">
                {{ r.dnis }}
              </base-text>
            </div>
          </div>
          <div class="action">
            <div class="icon">
              <ccu-icon
                @click.native="() => conferenceCall(r)"
                size="md"
                :type="icons.call"
              />
            </div>
          </div>
        </div>
      </div>
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
    async conferenceCall(resource) {
      this.selected = resource.id;
      this.$log.debug('adding external resource:', resource);
      this.$store.dispatch('phone/addContact', resource.dnis);
    },
  },
  data() {
    return {
      selected: -1,
    };
  },
  computed: {
    resources() {
      const resources = PhoneResource.all();
      const resourceGroups = new Map();
      resources.forEach((r) => {
        let group = [];
        if (resourceGroups.has(r.category_t)) {
          group = resourceGroups.get(r.category_t);
        }
        group.push(r);
        return resourceGroups.set(r.category_t, group);
      });
      return resourceGroups.entries();
    },
  },
};
</script>

<style lang="scss" scoped>
.resources {
  @apply bg-white py-3;

  &--section {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    @apply px-3;
    .header {
      @apply py-6;
    }
    .items {
      display: flex;
      flex-direction: column;
      .item {
        display: flex;
        flex-grow: 1;
        justify-content: space-between;
        align-items: center;
        @apply px-2;
      }
      .item .card {
        display: flex;
        flex-grow: 1;
        @apply p-2 my-2;
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
          background-color: fade-out(#f6f8f9, 0.7);
          @apply shadow-xl border-primary-light;
        }
      }
      .item .action {
        display: flex;
        @apply pl-3;
        .icon {
          @apply bg-crisiscleanup-grey-100 p-2;
          border-radius: 100%;
          transition: 300ms ease;
          cursor: pointer;
          &:hover {
            transform: translateY(-1px);
            filter: drop-shadow(0 0 0.1rem fade-out(#818181, 0.1));
          }
        }
      }
    }
  }
}
</style>
