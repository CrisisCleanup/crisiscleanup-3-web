<template>
  <component
    :is="cardType"
    v-bind="$attrs"
    :case-number="caseNumber"
    :address="address"
    :full-address="fullAddress"
    :state="state"
    :worktype="worktype"
    :worktypes="worktypes"
    :svg="svg"
    :active="active"
    :type="type"
    v-on="$listeners"
  />
</template>

<script>
import VueTypes from 'vue-types';
import { WorksitesMixin } from '@/mixins';
import CaseCard from '@/components/cards/case/CaseCard.vue';
import CaseTile from '@/components/cards/case/CaseTile.vue';

export default {
  name: 'CaseItem',
  mixins: [WorksitesMixin],
  data() {
    return {
      svg: '',
    };
  },
  mounted() {
    if (this.worktype) {
      this.svg = this.getWorktypeSVG(this.worktype, this.svgSize);
    }
    if (this.worktypes && this.worktypes.length) {
      this.svg = this.getWorktypeSVG(this.worktypes[0], this.svgSize);
    }
  },
  props: {
    id: VueTypes.oneOfType([VueTypes.number, VueTypes.string]),
    caseNumber: VueTypes.string,
    address: VueTypes.string,
    state: VueTypes.string,
    /* Primary worktype. */
    worktype: VueTypes.string,
    /* List of worktypes to display. */
    worktypes: VueTypes.arrayOf(VueTypes.object),
    fullAddress: VueTypes.string,
    tile: VueTypes.bool.def(false),
    active: VueTypes.bool.def(false),
    type: VueTypes.string,
  },
  computed: {
    cardType() {
      return this.tile ? CaseTile : CaseCard;
    },
    svgSize() {
      return this.tile ? '32' : '46';
    },
  },
};
</script>

<style></style>
