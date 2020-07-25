<template>
  <Loader
    :loading="false"
    class="h-full w-full bg-crisiscleanup-light-grey p-6 tools-grid"
  >
    <template #content>
      <div class="grid--header">
        <base-button
          variant="solid"
          icon-size="md"
          :ccu-icon="icons.back"
          size="medium"
          :action="() => $router.back()"
        >
          {{ $t('~~Back') }}
        </base-button>
      </div>
      <EventBuilder />
    </template>
  </Loader>
</template>

<script>
// @flow
import Loader from '@/components/Loader.vue';
import { IconsMixin } from '@/mixins';
import EventBuilder from '@/components/admin/EventBuilder.vue';

export default {
  name: 'AdminTools',
  components: { EventBuilder, Loader },
  mixins: [IconsMixin],
};
</script>

<style scoped lang="scss">
.tools-grid {
  display: grid;
  grid-auto-flow: row;
  grid-template-rows: auto 1fr;
  grid-row-gap: 1rem;
  .grid-- {
    &header {
      align-self: start;
    }
  }
}
</style>
