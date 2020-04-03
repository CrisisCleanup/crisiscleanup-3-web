import { colors, templates } from '@/icons/icons_templates';

export const WorksitesMixin = {
  methods: {
    getWorktypeSVG(type, status, size = '53') {
      const template = templates[type] || templates.unknown;
      const color = this.worksiteColorLegend[status];
      const svg = template
        .replace('{{fillColor}}', color)
        .replace('{{strokeColor}}', '#fff')
        .replace(/(width="[1-99]+")/g, `height="${size}"`)
        .replace(/(height="[1-99]+")/g, `width="${size}"`);
      return svg;
    },
  },
  computed: {
    worksiteColorLegend() {
      return {
        [this.$t('worksiteMap.unclaimed')]: colors.open_unassigned_unclaimed
          .fillColor,
        [this.$t('worksiteMap.claimed_not_started')]: colors
          .open_unassigned_claimed.fillColor,
        [this.$t('worksiteMap.in_progress')]: colors.open_assigned_claimed
          .fillColor,
        [this.$t('worksiteMap.partially_completed')]: colors[
          'open_partially-completed_claimed'
        ].fillColor,
        [this.$t('worksiteMap.needs_follow_up')]: colors[
          'open_needs-follow-up_claimed'
        ].fillColor,
        [this.$t('worksiteMap.completed')]: colors.closed_completed_claimed
          .fillColor,
        [this.$t('worksiteMap.done_by_others_no_help_wanted')]: colors[
          'closed_done-by-others_unclaimed'
        ].fillColor,
        [this.$t('worksiteMap.out_of_scope_duplicate_unresponsive')]: colors
          .open_unresponsive_unclaimed.fillColor,
      };
    },
  },
};
