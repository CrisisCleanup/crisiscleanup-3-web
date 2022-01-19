<template>
  <div class="flex-grow page-grid h-full">
    <div class="flex flex-col">
      <div class="flex items-center">
        <div class="flex py-3 px-2" style="min-width: 80px">
          <ccu-icon
            :alt="$t('casesVue.map_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingMap ? 'filter-yellow' : 'filter-gray'"
            type="map"
            ccu-event="user_ui-view-map"
            @click.native="toggleView('showingMap')"
            data-cy="cases.mapButton"
          />
          <ccu-icon
            :alt="$t('casesVue.table_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingTable ? 'filter-yellow' : 'filter-gray'"
            type="table"
            ccu-event="user_ui-view-table"
            @click.native="toggleView('showingTable')"
            data-cy="cases.tableButton"
          />
        </div>
        <span v-if="allWorksiteCount" class="font-thin">
          <span>
            {{ $t('~~Number of Cases:') }}
            {{ allWorksiteCount | numeral('0,0') }}
          </span>
        </span>
        <div class="flex justify-start w-auto"></div>
      </div>
      <div class="flex-grow">
        <div v-show="showingMap" class="relative h-full select-none">
          <div
            id="map"
            ref="map"
            class="absolute top-0 left-0 right-0 bottom-0"
          ></div>
          <div
            v-if="mapLoading"
            style="z-index: 1001"
            class="
              absolute
              top-0
              left-0
              right-0
              bottom-0
              flex
              items-center
              justify-center
            "
          >
            <spinner />
          </div>
        </div>
        <div v-show="showingTable" class="p-2 h-full shadow">
          <AjaxTable
            :columns="columns"
            :url="tableUrl"
            :body-style="{ height: '100%' }"
            ref="table"
            class="mt-6 shadow-lg"
            :query="worksiteQuery"
            @row:click="
              (worksite) => {
                worksiteId = worksite.id;
                isEditing = true;
              }
            "
          >
            <template #work_types="slotProps">
              <div class="flex flex-col">
                <div
                  v-for="work_type in slotProps.item.work_types"
                  :key="`${work_type.id}`"
                  class="badge-holder flex items-center"
                >
                  <badge
                    class="mx-1"
                    :color="
                      getColorForStatus(
                        work_type.status,
                        Boolean(work_type.claimed_by),
                      )
                    "
                  />
                  {{ work_type.work_type | getWorkTypeName }}
                </div>
              </div>
            </template>
          </AjaxTable>
        </div>
      </div>
    </div>
    <div class="flex" @mouseover="hover = true" @mouseleave="hover = false">
      <case-form
        ref="worksiteForm"
        :incident-id="String(currentIncidentId)"
        :worksite-id="worksiteId"
        :key="worksiteId"
        disable-claim-and-save
        :data-prefill="() => {}"
        :is-editing="isEditing"
        @savedWorksite="() => {}"
        @closeWorksite="
          () => {
            isEditing = false;
            worksiteId = null;
          }
        "
        class="border shadow"
        @navigateToWorksite="
          (id) => {
            worksiteId = id;
            isEditing = true;
          }
        "
      />
      <transition name="slide-fade">
        <div
          class="absolute flex flex-col -ml-12 mt-12"
          style="z-index: 1002"
          v-if="hover"
        >
          <PhoneComponentButton class="phone-button">
            <template v-slot:button>
              <div class="w-full h-full flex items-center justify-center">
                <div
                  class="
                    bg-primary-light
                    h-7
                    w-7
                    rounded
                    flex
                    items-center
                    justify-center
                    relative
                  "
                >
                  {{ $t('~~GO') }}
                  <span class="absolute inset-0 top-0 left-0">
                    <div
                      :class="{
                        'bg-green-500': isTakingCalls,
                        'bg-red-500': isNotTakingCalls,
                      }"
                      class="
                        flex
                        items-center
                        justify-center
                        border border-white
                        rounded-full
                        w-3
                        h-3
                        -mt-1.5
                        -ml-1.5
                        p-1.5
                        leading-4
                      "
                    ></div>
                  </span>
                </div>
              </div>
            </template>
            <template v-slot:component>
              <AgentCalls />
            </template>
          </PhoneComponentButton>
          <PhoneComponentButton
            class="phone-button"
            icon="dialer"
            icon-size="small"
            icon-class="bg-black p-1"
          >
            <template v-slot:component>
              <ManualDialer
                class="bg-white w-72 p-2"
                style="z-index: 1002"
                @onDial="dialPhoneNumber"
              ></ManualDialer>
            </template>
          </PhoneComponentButton>
          <PhoneComponentButton class="phone-button"></PhoneComponentButton>
          <PhoneComponentButton class="phone-button"></PhoneComponentButton>
          <PhoneComponentButton class="phone-button"></PhoneComponentButton>
          <PhoneComponentButton class="phone-button"></PhoneComponentButton>
          <PhoneComponentButton class="phone-button"></PhoneComponentButton>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import * as L from 'leaflet';
import CaseForm from '@/pages/CaseForm';
import { getWorksiteLayer, mapAttribution, mapTileLayer } from '@/utils/map';
import PhoneComponentButton from '@/components/phone/PhoneComponentButton';
import ManualDialer from '@/components/phone/ManualDialer';
import { ConnectFirstMixin } from '@/mixins';
import AgentCalls from '@/components/phone/AgentCalls';
import AjaxTable from '@/components/AjaxTable';
import { getColorForStatus } from '@/filters';

export default {
  name: 'PhoneNew',
  components: {
    AjaxTable,
    AgentCalls,
    ManualDialer,
    PhoneComponentButton,
    CaseForm,
  },
  mixins: [ConnectFirstMixin],
  data() {
    return {
      worksiteId: null,
      isEditing: false,
      mapLoading: false,
      map: null,
      hover: false,
      showingMap: true,
      showingTable: false,
      allWorksiteCount: 0,
      getColorForStatus,
      viewCase: false,
    };
  },
  async mounted() {
    const markers = await this.getWorksites();
    this.loadMap(markers);
  },
  computed: {
    tableUrl() {
      return `${process.env.VUE_APP_API_BASE_URL}/worksites`;
    },
    worksiteQuery() {
      return {
        incident: this.currentIncidentId,
      };
    },
    columns() {
      return [
        {
          title: this.$t('casesVue.number_abbrev'),
          dataIndex: 'case_number',
          key: 'case_number',
          sortKey: 'id',
          width: '0.5fr',
          sortable: true,
        },
        {
          title: this.$t('casesVue.work_type'),
          dataIndex: 'work_types',
          key: 'work_types',
          scopedSlots: { customRender: 'work_types' },
          width: '1.5fr',
        },
        {
          title: this.$t('casesVue.name'),
          dataIndex: 'name',
          key: 'name',
          width: '1.5fr',
          sortable: true,
        },
        {
          title: this.$t('casesVue.full_address'),
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: this.$t('casesVue.city'),
          dataIndex: 'city',
          key: 'city',
          sortable: true,
        },
        {
          title: this.$t('casesVue.county_parish'),
          dataIndex: 'county',
          key: 'county',
          sortable: true,
        },
      ];
    },
  },
  methods: {
    toggleView(view) {
      this.showingMap = false;
      this.showingTable = false;
      this[view] = true;
    },
    onSelectMarker(marker) {
      this.isEditing = true;
      this.worksiteId = marker.id;
    },
    loadMap(markers) {
      if (!this.map) {
        this.map = L.map('map', {
          zoomControl: false,
        }).fitBounds([
          [17.644022027872726, -122.78314470293876],
          [50.792047064406866, -69.87298845293874],
        ]);

        L.tileLayer(mapTileLayer, {
          // tileSize: 512,
          // zoomOffset: -1,
          attribution: mapAttribution,
          detectRetina: false,
          maxZoom: 18,
          noWrap: false,
        }).addTo(this.map);
      }
      const worksiteLayer = getWorksiteLayer(markers, this.map, this, true);
      worksiteLayer.addTo(this.map);
    },
    async getWorksites() {
      this.mapLoading = true;
      const response = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites_all`,
        {
          params: {
            incident: this.currentIncidentId,
          },
        },
      );
      this.mapLoading = false;
      this.allWorksiteCount = response.data.results.length;
      return response.data.results;
    },
    async dialPhoneNumber(number) {
      const dnisResponse = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/phone_dnis?dnis__contains=${number}&sort=-created_at&limit=1`,
      );
      const [caller] = dnisResponse.data.results;
      this.setOutgoingCall({});
      this.setCaller(caller);
      await this.$phoneService.dial(number);
    },
  },
};
</script>

<style scoped>
.page-grid {
  display: grid;
  grid-template-columns: auto 350px;
}
.slide-fade-enter-active {
  transition: all 0.8s ease;
}
.slide-fade-leave-active {
  transition: all 0.8s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(3rem);
  opacity: 0;
}
.phone-button {
  @apply shadow w-12 h-12 my-1 bg-white cursor-pointer;
}
</style>
