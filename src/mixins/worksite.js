import { colors, templates } from '@/icons/icons_templates';

export const WorksitesMixin = {
  methods: {
    getWorktypeSVG(worktype, size = '53') {
      const template = templates[worktype.work_type] || templates.unknown;
      const { fillColor, strokeColor } = this.getWorktypeColors(worktype);
      const svg = template
        .replaceAll('{{fillColor}}', fillColor)
        .replaceAll('{{strokeColor}}', strokeColor)
        .replaceAll(/(width="[1-99]+")/g, `width="${size}"`)
        .replaceAll(/(height="[1-99]+")/g, `height="${size}"`);
      return svg;
    },
    getWorktypeColors(worktype) {
      const colorsKey = `${worktype.status}_${
        worktype.claimed_by ? 'claimed' : 'unclaimed'
      }`;
      return colors[colorsKey] || colors.open_assigned_unclaimed;
    },
  },
};
