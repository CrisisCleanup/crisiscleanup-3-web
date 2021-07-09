<template>
  <Card :loading="loading" v-bind="$attrs">
    <template #header>
      <div class="left py-4 px-6">
        <slot name="left">
          <base-text variant="h3" bold>
            {{ $t(title) }}
          </base-text>
        </slot>
      </div>
      <slot name="right">
        <div class="right">
          <slot name="dropdown">
            <div v-if="hasDropdown" class="card__dropdown mx-3">
              <form-select
                ref="dropdown"
                :style="{
                  minWidth: `${dropdownWidth_}px`,
                  flexWrap: 'nowrap',
                }"
                :searchable="false"
                :clearable="false"
                @resize="calcDropdownWidth"
                @input="(payload) => $emit('update:dropdown', payload)"
                v-bind="dropdown"
              >
                <template #selected-option="{ option }">
                  <base-text
                    variant="h3"
                    class="text-crisiscleanup-dark-300"
                    regular
                  >
                    {{ option[dropdown.label] }}
                  </base-text>
                </template>
              </form-select>
            </div>
          </slot>
        </div>
      </slot>
    </template>
    <slot />
  </Card>
</template>

<script>
// @flow
import VueTypes from 'vue-types';
import _ from 'lodash';
import Card from './Card.vue';

export default {
  name: 'TitledCard',
  components: {
    Card,
  },
  props: ({
    title: VueTypes.string,
    loading: VueTypes.bool.def(false),
    dropdown: VueTypes.object.def({}),
  }: {
    title: string,
    loading: boolean,
    dropdown: any,
  }),
  data() {
    return {
      dropdownWidth_: 0,
    };
  },
  mounted() {
    this.$nextTick(() => this.calcDropdownWidth());
  },
  computed: {
    hasDropdown() {
      return !_.isEmpty(this.dropdown);
    },
  },
  methods: {
    calcDropdownWidth() {
      if (!this.$refs.dropdown) return;
      const elWidth = this.$refs.dropdown.$el.clientWidth;
      if (elWidth) {
        this.dropdownWidth_ = elWidth;
        const container = this.$refs.dropdown.$el.querySelector(
          '.vs__selected-options',
        );
        container.style.flexWrap = 'nowrap';
        container.style.flexDirection = 'row-reverse';
      }
    },
  },
};
</script>

<style lang="postcss" scoped>
.right,
.left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  p {
    @apply text-crisiscleanup-dark-400;
  }
}

.left {
  flex: 2;
}

.right {
  justify-content: flex-end;
  flex: 1;
}
</style>
