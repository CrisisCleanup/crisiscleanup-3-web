<template>
  <div>
    <div
      v-if="showingLegend"
      data-testid="testShowingLegendDiv"
      style="z-index: 1001"
      class="legend absolute legend-landscape bottom-0 w-72 bg-white border-2 p-2"
    >
      <div class="flex items-center justify-between">
        <div class="text-base font-bold my-1">
          {{ $t('worksiteMap.legend') }}
        </div>
        <font-awesome-icon
          icon="chevron-down"
          data-testid="testHideLegendIcon"
          size="1x"
          class="cursor-pointer"
          :title="$t('worksiteMap.hide_legend')"
          @click="() => toggleLegend(false)"
        ></font-awesome-icon>
      </div>
      <div class="flex flex-wrap justify-between">
        <div
          v-for="entry in displayedWorkTypeSvgs"
          :key="entry.key"
          class="flex items-center w-1/2 mb-1"
        >
          <div class="map-svg-container" v-html="entry.svg"></div>
          <span class="text-xs ml-1">{{ getWorkTypeName(entry.key) }}</span>
        </div>
        <div
          v-for="entry in defaultWorkTypeSvgs"
          :key="entry.name"
          class="flex items-center w-1/2 mb-1"
        >
          <div class="map-svg-container" v-html="entry.svg"></div>
          <span class="text-xs ml-1">{{ entry.name }}</span>
        </div>
      </div>
      <div class="text-base font-bold my-1">
        {{ $t('worksiteMap.case_status') }}
      </div>
      <div class="flex flex-wrap">
        <div
          v-for="(value, key) in legendColors"
          :key="key"
          class="flex items-start w-1/2 mb-1"
        >
          <span class="w-4 mt-1">
            <badge class="mx-1" :color="value" />
          </span>
          <div class="text-xs ml-1">{{ key }}</div>
        </div>
        <div class="flex items-center w-1/2 mb-1">
          <span class="w-5 h-5" v-html="templates.plus" />
          <div class="text-xs ml-1">
            {{ $t('worksiteMap.multiple_work_types') }}
          </div>
        </div>
        <div class="w-full flex justify-between">
          <span></span>
          <a
            class="w-32 block md:self-end mt-3"
            data-testid="testAwsLink"
            target="_blank"
            href="https://aws.amazon.com/government-education/nonprofits/disaster-response/"
            ><img
              src="@/assets/powered_by_aws.png"
              data-testid="testAwsImgIcon"
          /></a>
        </div>
      </div>
    </div>
    <div
      v-else
      style="z-index: 1001"
      class="legend absolute legend-landscape bottom-0 w-22 bg-white border-2 p-2 flex justify-center items-center"
    >
      <div class="text-base font-bold my-1 mr-2">
        {{ $t('worksiteMap.legend') }}
      </div>
      <font-awesome-icon
        icon="chevron-up"
        size="1x"
        :title="$t('worksiteMap.show_legend')"
        class="cursor-pointer"
        @click="() => toggleLegend(true)"
      ></font-awesome-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { colors, templates } from '../icons/icons_templates';
import User from '../models/User';
import useCurrentUser from '../hooks/useCurrentUser';
import { getWorkTypeName } from '../filters/index';

export default defineComponent({
  name: 'WorksiteLegend',
  props: {
    availableWorkTypes: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const { t } = useI18n();
    const { currentUser } = useCurrentUser();

    const showingLegend = ref(true);
    const displayedWorkTypeSvgs = computed(() => {
      return Object.keys(props.availableWorkTypes).map((workType) => {
        const template = templates[workType] || templates.unknown;
        const svg = template
          .replaceAll('{{fillColor}}', 'black')
          .replaceAll('{{strokeColor}}', 'black')
          .replaceAll('{{multiple}}', '');
        return {
          svg,
          key: workType,
        };
      });
    });
    const defaultWorkTypeSvgs = [
      {
        svg: templates.important.replaceAll('{{fillColor}}', 'black'),
        name: t(`worksiteMap.high_priority`),
      },
      {
        svg: templates.favorite.replaceAll('{{fillColor}}', 'black'),
        name: t(`worksiteMap.member_of_my_organization`),
      },
    ];
    const legendColors = {
      [t('worksiteMap.unclaimed')]: colors.open_unassigned_unclaimed.fillColor,
      [t('worksiteMap.claimed_not_started')]:
        colors.open_unassigned_claimed.fillColor,
      [t('worksiteMap.in_progress')]: colors.open_assigned_claimed.fillColor,
      [t('worksiteMap.partially_completed')]:
        colors['open_partially-completed_claimed'].fillColor,
      [t('worksiteMap.needs_follow_up')]:
        colors['open_needs-follow-up_claimed'].fillColor,
      [t('worksiteMap.completed')]: colors.closed_completed_claimed.fillColor,
      [t('worksiteMap.done_by_others_no_help_wanted')]:
        colors['closed_done-by-others_unclaimed'].fillColor,
      [t('worksiteMap.out_of_scope_duplicate_unresponsive')]:
        colors.open_unresponsive_unclaimed.fillColor,
    };

    function toggleLegend(status) {
      showingLegend.value = status;
      User.api().updateUserState({ showingLegend: status }, {});
    }

    onMounted(() => {
      showingLegend.value = currentUser
        ? currentUser.states.showingLegend
        : true;
    });

    return {
      showingLegend,
      toggleLegend,
      displayedWorkTypeSvgs,
      legendColors,
      defaultWorkTypeSvgs,
      templates,
      getWorkTypeName,
    };
  },
});
</script>

<style>
.map-svg-container svg {
  width: 18px;
  height: 18px;
}
</style>
