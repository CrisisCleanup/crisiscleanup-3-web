/**
 * Hook for generating case cards.
 */

import { ref, computed, watch, onMounted } from 'vue';
import _ from 'lodash';
import { wrap } from '@/utils/wrap';
import { CaseType } from '@/store/modules/phone/types';
import Pda from '@/models/Pda';
import Worksite from '@/models/Worksite';

type UseCaseCardsProps = {
  cases: CaseType[];
  addNew?: boolean;
};

type CaseCardType = {
  caseNumber: string;
  address: string;
  state: string;
  worktype: string;
  worktypes?: any[];
  fullAddress: string;
  id: number;
  type: CaseType;
};

export default ({ cases, addNew }: UseCaseCardsProps) => {
  const _cases = wrap(cases);
  const _addNew = wrap(addNew !== undefined ? addNew : false);

  const _cards = ref([]);

  const _generateCaseCards = () => {
    _cards.value = _cases.value.map((c) => ({
      caseNumber: c.case_number ? c.case_number : `PDA-${c.id}`,
      address: c.short_address,
      state: c.state,
      worktype:
        c instanceof Worksite
          ? _.get(
              Worksite.getWorkType(c.work_types, null, null),
              'work_type',
              'unknown',
            )
          : 'wellness_check',
      worktypes: _.get(c, 'work_types', []),
      fullAddress: c.full_address,
      id: c.id,
      type: c instanceof Worksite ? Worksite.entity : Pda.entity,
    }));
  };

  watch(
    () => _cases.value,
    () => _generateCaseCards(),
  );

  onMounted(() => _generateCaseCards());

  const newCard = {
    caseNumber: 'New Case',
    address: '123 Example Street',
    state: 'NY',
    worktype: 'unknown',
    id: -1,
    type: 'new',
  };

  const caseCards = computed(() => {
    let cards: any = _cards.value;
    if (_addNew.value) {
      cards = [..._cards.value, newCard];
    }
    return _.orderBy(cards, ['id'], ['desc']);
  });

  return {
    caseCards,
  };
};
