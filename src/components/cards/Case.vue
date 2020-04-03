<template>
  <component
    :is="cardType"
    :case-number="caseNumber"
    :address="address"
    :full-address="fullAddress"
    :state="state"
    :worktype="worktype"
    :svg="svg"
    :active="active"
    :type="type"
  />
</template>

<script>
import { WorksitesMixin } from '@/mixins';
import VueTypes from 'vue-types';
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
    this.svg = this.getWorktypeSVG(
      this.worktype,
      this.$t('worksiteMap.unclaimed'),
      this.svgSize,
    );
  },
  props: {
    id: VueTypes.string,
    caseNumber: VueTypes.string,
    address: VueTypes.string,
    state: VueTypes.string,
    worktype: VueTypes.string,
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
      return this.tile ? '26' : '46';
    },
  },
};
</script>

<style></style>
