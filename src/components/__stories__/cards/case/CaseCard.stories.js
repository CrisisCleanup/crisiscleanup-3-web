import CaseCard from '@/components/cards/Case.vue';
import { colors, templates } from '@/icons/icons_templates';
import _ from 'lodash';
import Vuex from 'vuex';

export default {
  title: 'Elements/Cards/CaseCard',
  component: CaseCard,
  args: {
    caseNumber: 'X23',
    address: '123 New Street',
    state: 'NY',
    fullAddress: '123 New Street',
    worktype: {
      work_type: 'muck_out',
      status: 'open_unassigned',
      claimed_by: null,
    },
  },
};

export const Basic = (args, { argTypes }) => ({
  components: { CaseCard },
  props: Object.keys(argTypes),
  store: new Vuex.Store({
    modules: {
      enums: {
        namespaced: true,
        state() {
          return {
            statuses: [{ phases: [] }],
          };
        },
      },
    },
  }),
  template: `
    <div>
      <case-card
        tile
        :key="caseNumber"
        :case-number="caseNumber"
        :address="address"
        :full-address="fullAddress"
        :worktype="worktype"
        :worktypes="worktypes"
        :state="state"
      />
    </div>
  `,
});

export const WithWorkTypes = Basic.bind({});
WithWorkTypes.args = {
  ...Basic.args,
  worktype: null,
  worktypes: [
    {
      work_type: 'muck_out',
      status: 'open_unassigned',
      claimed_by: null,
    },
    {
      work_type: 'trees',
      status: 'open_unassigned',
      claimed_by: null,
    },
    {
      work_type: 'fire',
      status: 'closed_completed',
      claimed_by: true,
    },
    {
      work_type: 'fire',
      status: 'closed_completed',
      claimed_by: true,
    },
    {
      work_type: 'fire',
      status: 'closed_completed',
      claimed_by: true,
    },
  ],
};

export const AllWorkTypes = () => ({
  components: { CaseCard },
  data() {
    const worktypes = _.without(Object.keys(templates), 'plus', 'circle');
    const statuses = _.uniq(
      Object.keys(colors).map((c) =>
        c
          .split('_')
          .slice(0, c.split('_').length - 1)
          .join('_'),
      ),
    );
    const cards = [];
    let iter = 0;
    // eslint-disable-next-line array-callback-return
    worktypes.map((w) => {
      iter += 1;
      // eslint-disable-next-line array-callback-return
      statuses.map((s) => {
        iter += 1;
        cards.push({
          id: iter,
          caseNumber: `X${iter}`,
          address: '123 New Street',
          state: 'NY',
          fullAddress: '123 New Street',
          worktype: {
            work_type: w,
            claimed_by: false,
            status: s,
          },
        });
      });
    });

    return {
      cards,
    };
  },
  template: `
    <div class="flex flex-wrap overflow-scroll">
      <div v-for="c in cards" class="p-3">
        <case-card
          tile
          :key="c.id"
          v-bind="c"
        />
      </div>
    </div>
  `,
});
