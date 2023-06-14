<script lang="ts" setup>
import axios from 'axios';
import _ from 'lodash';
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  ref,
  withDefaults,
} from 'vue';
import BaseText from '@/components/BaseText.vue';
// import MultiSelect from 'primevue/multiselect'
import BaseSelect from '@/components/BaseSelect.vue';
import TicketCards from '@/components/Tickets/TicketCards.vue';
import AdvancedTicketCards from '@/components/Tickets/AdvancedTicketCards.vue';
import BaseButton from '@/components/BaseButton.vue';
import card from '@/components/cards/Card.vue';

export interface Macro {
  label: string;
  value: string;
}
export interface Macros {
  macros: Macro[];
}
export interface Status {
  label: string;
  value: string;
}

export interface Statuses {
  statuses: Status[];
}

export interface Agent {
  label: string;
  value: string;
}

export interface Agents {
  agents: Agent[];
}

export interface Filter {
  label: string;
  agents?: Agent[];
  Statuses?: Status[];
}

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_API_BASE_URL}/zendesk`,
});
const userIdsFilter = ref();

const usersAndTicketsMerged = ref();
const usersRelatedToTickets = ref();
const requesterIdList = ref();
const ticketTotals = ref();
const isLoading = ref(false);
const macros = ref([]);
const tickets = ref([]);
const selectedFilters = ref([]);
const advancedTicketInfo = ref<boolean>(false);
const changeCardView = () => {
  advancedTicketInfo.value = !advancedTicketInfo.value;
};

const filters = ref([
  {
    label: 'Ticket Status',
    statuses: [
      { label: 'New', value: 'New' },
      { label: 'Open', value: 'Open' },
      { label: 'Pending', value: 'Pending' },
      { label: 'Solved', value: 'Solved' },
    ],
  },
  {
    label: 'Assigned Agents',
    agents: [
      { label: 'Triston', value: 'Triston' },
      { label: 'Braden', value: 'Braden' },
      { label: 'Ross', value: 'Ross' },
      { label: 'Deep', value: 'Deep' },
      { label: 'Angelo', value: 'Angelo' },
    ],
  },
]);

const selectedTicketStatusFilter = ref('');
const changeStatusFilter = (status: string) => {
  selectedTicketStatusFilter.value = status;
};

const parseUserIdsFromTickets = (tickets) => {
  try {
    requesterIdList.value = tickets.map((ticket) => ticket.requester_id);
    userIdsFilter.value = requesterIdList.value
      .map((id) => `user_ids=${id}`)
      .join('&');
  } catch (error) {
    console.log(error);
  }
};

const getUsersRelatedToTickets = () => {
  axiosInstance
    .get(`/users?${userIdsFilter.value}`, {
      param: {
        user_ids: [34_343, 343_434, 3434],
      },
    })
    .then((response) => {
      usersRelatedToTickets.value = response;
      console.log(usersRelatedToTickets.value);
    })
    .catch((error) => {
      console.error('Error fetching tickets:', error);
    });
};

const fetchTickets = () => {
  axiosInstance
    .get('/search', {
      params: {
        query: 'status<solved',
      },
    })
    .then((response) => {
      tickets.value = response.data.results;
      ticketTotals.value = _.countBy(response.data.results, 'status');
    })
    .then(() => {
      parseUserIdsFromTickets(tickets.value);
      getUsersRelatedToTickets();
    })
    .catch((error) => {
      console.error('Error fetching tickets:', error);
    });
};

const ticketStatusClasses = {
  '': 'bg-purple-200',
  new: 'border border-primary-light border-2',
  open: 'border border-primary-light border-2',
  pending: 'border border-primary-light border-2',
};

const getStatusFilterClass = (status) => {
  if (selectedTicketStatusFilter.value === status) {
    return ticketStatusClasses[selectedTicketStatusFilter.value];
  }

  return '';
};

const allowed = ref(['status']);

const computedTicketData = computed(() => {
  const raw = {
    status: selectedTicketStatusFilter.value,
  };

  const filtered = Object.keys(raw)
    .filter((key) => allowed.value.includes(key))
    .reduce((obj, key) => {
      obj[key] = raw[key];
      return obj;
    }, {});

  if (selectedTicketStatusFilter.value !== '') {
    return _.filter(tickets.value, filtered);
  }

  return tickets.value;
});

onMounted(() => {
  isLoading.value = true;
  fetchTickets();
  // window.zESettings.contactForm.fields = [
  //   { id: '360042012811', prefill: { '*': `test this` } },
  // ]
  isLoading.value = false;
});
</script>

<template>
  <div class="tickets__statusAndFilter">
    <div v-if="tickets" class="bg-purple-300 rounded-xl shadow-md">
      <div class="text-white grid grid-cols-5 p-2">
        <BaseText class="col-span-4"
          >Total Tickets: {{ tickets.data?.results?.length }}</BaseText
        >
        <div
          :class="
            selectedTicketStatusFilter === '' ? 'bg-purple-200' : 'bg-white'
          "
          class="rounded-md text-center text-black"
          @click="changeStatusFilter('')"
        >
          All
        </div>
      </div>
      <div v-if="ticketTotals" class="grid grid-cols-3 text-center">
        <div
          :class="[
            getStatusFilterClass('new'),
            'new rounded-bl-xl flex flex-col',
          ]"
          @click="changeStatusFilter('new')"
        >
          New <BaseText>{{ ticketTotals?.new || 0 }}</BaseText>
        </div>
        <div
          :class="[getStatusFilterClass('open'), 'open flex flex-col']"
          @click="changeStatusFilter('open')"
        >
          Open <BaseText>{{ ticketTotals?.open || 0 }}</BaseText>
        </div>
        <div
          :class="[getStatusFilterClass('pending'), 'pending flex flex-col']"
          @click="changeStatusFilter('pending')"
        >
          Pending <BaseText>{{ ticketTotals?.pending || 0 }}</BaseText>
        </div>
      </div>
    </div>
    <BaseSelect
      v-model="selectedFilters"
      :options="filters"
      display="chip"
      option-label="label"
      option-group-label="label"
      option-group-children="items"
      placeholder="Select a Filter"
    />

    <BaseButton
      :action="() => changeCardView()"
      class="md:col-span-4 bg-primary-light text-white"
      size="md"
    >
      <template #default>{{
        advancedTicketInfo ? 'Advanced' : 'Classic'
      }}</template>
    </BaseButton>
  </div>

  <div v-show="tickets && !advancedTicketInfo" class="tickets__container">
    <div v-for="(item, idx) in computedTicketData" :key="`${item.id}-${idx}`">
      <TicketCards
        v-if="item.description && usersRelatedToTickets"
        :key="`${item.id}-${idx}`"
        :users="usersRelatedToTickets.data"
        :ticket-data="item"
        @re-fetch-ticket="fetchTickets"
      />
    </div>
  </div>

  <!--  <div v-show="tickets && advancedTicketInfo" class="tickets__container-advanced">-->
  <!--    <div v-for="(item, idx) in computedTicketData" :key="`${item.id}-${idx}`">-->
  <!--    <AdvancedTicketCards-->
  <!--      v-if="item.description && usersRelatedToTickets"-->
  <!--      :key="`${item.id}-${idx}`"-->
  <!--      :users="usersRelatedToTickets.data"-->
  <!--      :ticket-data="item"-->
  <!--      @re-fetch-ticket="fetchTickets"-->
  <!--    />-->
  <!--    </div>-->
  <!--  </div>-->
</template>

<style lang="postcss" scoped>
.tickets__statusAndFilter {
  @apply p-4 m-4 gap-4 flex flex-col;
}
.tickets__container {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}
.tickets__container-advanced {
  @apply grid grid-cols-1;
}
.new {
  color: #c19700;
  background: #fff59c;
}

.open {
  color: #0042ed;
  background: #9cb8ff;
}

.solved {
  color: #f21b1b;
  background: #ffa296;
}

.pending {
  color: #6b6b6b;
  background: #e8e4e4;
}
</style>
