<template>
  <div id="map" ref="map" class="absolute top-0 left-0 right-0 bottom-0">
    <div
      v-if="mapLoading"
      style="z-index: 1001"
      class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
    >
      <spinner show-quote />
    </div>
    <div
      v-if="showZoomButtons"
      class="flex flex-col absolute zoom-control-container"
      style="z-index: 1001; top: 10px; left: 10px"
    >
      <div class="zoom-control flex flex-col mb-5">
        <base-button
          text=""
          data-testid="testZoomInButton"
          icon="plus"
          icon-size="xs"
          ccu-event="user_ui-zoom-in"
          :title="$t('worksiteMap.zoom_in')"
          :alt="$t('worksiteMap.zoom_in')"
          :action="
            () => {
              $emit('onZoomIn');
            }
          "
          class="w-8 h-8 border-crisiscleanup-dark-100 border-t border-l border-r bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
        <base-button
          text=""
          data-testid="testZoomOutButton"
          icon="minus"
          icon-size="xs"
          ccu-event="user_ui-zoom-out"
          :title="$t('worksiteMap.zoom_out')"
          :alt="$t('worksiteMap.zoom_out')"
          :action="
            () => {
              $emit('onZoomOut');
            }
          "
          class="w-8 h-8 border border-crisiscleanup-dark-100 bg-white shadow-xl text-xl text-crisiscleanup-dark-400"
        />
      </div>
      <base-button
        v-tooltip="{
          content: $t('worksiteMap.zoom_to_make_interactive'),
          // show: showInteractivePopover,
          triggers: ['hover'],
          popperClass: 'interactive-tooltip',
          placement: 'right-start',
          html: true,
        }"
        data-testid="testZoomToMakeInteractiveButton"
        text=""
        :title="$t('worksiteMap.zoom_to_interactive')"
        :alt="$t('worksiteMap.zoom_to_interactive')"
        ccu-event="user_ui-zoom-details"
        :action="
          () => {
            $emit('onZoomInteractive');
          }
        "
        icon="tree"
        icon-size="lg"
        class="w-8 h-8 border my-1 border-crisiscleanup-dark-100 bg-white shadow-xl text-crisiscleanup-dark-400"
      />
      <base-button
        v-tooltip="{
          content: $t('worksiteMap.zoom_to_incident'),
          // show: showInteractivePopover,
          triggers: ['hover'],
          popperClass: 'interactive-tooltip',
          placement: 'right-start',
          html: true,
        }"
        data-testid="testZoomToIncidentButton"
        text=""
        :title="$t('worksiteMap.zoom_to_incident')"
        :alt="$t('worksiteMap.zoom_to_incident')"
        icon="search-minus"
        ccu-event="user_ui-zoom-all"
        icon-size="lg"
        :action="
          () => {
            $emit('onZoomIncidentCenter');
          }
        "
        class="w-8 h-8 border border-crisiscleanup-dark-100 my-1 bg-white shadow-xl text-crisiscleanup-dark-400"
      />
    </div>
    <WorksiteLegend
      v-if="showZoomButtons || showLegend"
      class="hidden md:block"
      data-testid="testShowLegendDiv"
      :key="availableWorkTypes"
      :available-work-types="availableWorkTypes"
    />
  </div>
</template>

<script lang="ts">
import WorksiteLegend from './WorksiteLegend.vue';

export default defineComponent({
  name: 'SimpleMap',
  components: { WorksiteLegend },
  props: {
    mapLoading: {
      type: Boolean,
    },
    showZoomButtons: {
      type: Boolean,
    },
    showLegend: {
      type: Boolean,
    },
    availableWorkTypes: {
      type: Object,
      default: () => ({}),
    },
  },
});
</script>
