<template>
  <component
    :is="cardType"
    :case-number="caseNumber"
    :address="address"
    :full-address="address"
    :state="state"
    :worktype="worktype"
    :svg="svg"
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
      '46',
    );
  },
  props: {
    caseNumber: VueTypes.string,
    address: VueTypes.string,
    state: VueTypes.string,
    worktype: VueTypes.string,
    tile: VueTypes.bool.def(false),
  },
  computed: {
    cardType() {
      return this.tile ? CaseTile : CaseCard;
    },
  },
};
</script>

<style></style>
