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
                ref="drop"
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
import _ from 'lodash';
import Card from './Card.vue';
import { computed, nextTick, onMounted, ref } from 'vue';

export default {
  name: 'TitledCard',
  components: {
    Card,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
    },
    dropdown: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const dropdownWidth_ = ref(0);
    const drop = ref(null);
    function calcDropdownWidth() {
      if (!drop.value) return;
      const elWidth = drop.value.$el.clientWidth;
      if (elWidth) {
        this.dropdownWidth_ = elWidth;
        const container = drop.value.$el.querySelector('.vs__selected-options');
        container.style.flexWrap = 'nowrap';
        container.style.flexDirection = 'row-reverse';
      }
    }

    const hasDropdown = computed(() => {
      return !_.isEmpty(props.dropdown);
    });

    onMounted(() => {
      nextTick(() => calcDropdownWidth());
    });
    return {
      dropdownWidth_,
      drop,
      calcDropdownWidth,
      hasDropdown,
    };
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
