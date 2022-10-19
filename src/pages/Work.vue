<template>
  <div class="work-page">
    <div class="work-page__main">
      <div class="work-page__main-header">
        <div class="flex py-3 px-2" style="min-width: 80px">
          <ccu-icon
            :alt="$t('casesVue.map_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingMap ? 'filter-yellow' : 'filter-gray'"
            type="map"
            ccu-event="user_ui-view-map"
            @click.native="showMap"
            data-cy="cases.mapButton"
          />
          <ccu-icon
            :alt="$t('casesVue.table_view')"
            size="medium"
            class="mr-4 cursor-pointer"
            :class="showingTable ? 'filter-yellow' : 'filter-gray'"
            type="table"
            ccu-event="user_ui-view-table"
            @click.native="showTable"
            data-cy="cases.tableButton"
          />
        </div>
        <span v-if="allWorksiteCount" class="font-thin">
          <span>
            {{ $t('casesVue.cases') }}
            {{ allWorksiteCount | numeral('0,0') }}
          </span>
        </span>
        <div class="flex justify-start w-auto">
          <WorksiteSearchInput
            width="300px"
            icon="search"
            :suggestions="[
              {
                name: 'worksites',
                data: searchWorksites || [],
                key: 'name',
              },
            ]"
            display-property="name"
            :placeholder="$t('actions.search')"
            size="medium"
            class="mx-2"
            @selectedExisting="
              (w) => {
                worksiteId = w.id;
                isViewing = true;
              }
            "
            @search="onSearch"
            @clear="onSearch"
          />
          <WorksiteActions
            :map="map"
            :current-incident-id="currentIncidentId"
            :filters="{}"
            @updatedQuery="onUpdateQuery"
          />
        </div>
        <Loader v-if="loading" class="ml-10" />
      </div>
      <div class="work-page__main-content">
        <div v-show="showingMap" class="work-page__main-content--map">
          <SimpleMap
            :map-loading="mapLoading"
            show-zoom-buttons
            @onZoomIn="() => map.zoomIn()"
            @onZoomOut="() => map.zoomOut()"
            @onZoomIncidentCenter="goToIncidentCenter"
            @onZoomInteractive="goToInteractive"
            :available-work-types="availableWorkTypes"
          />
          <div class="work-page__actions" ref="phoneButtons">
            <PhoneComponentButton
              name="chat"
              class="work-page__action"
              component-class="work-page__action-content work-page__action-content--chat"
              @open="
                () => {
                  // updateUserState({
                  //   chat_last_seen: $moment().toISOString(),
                  // });
                  // unreadChatCount = 0;
                  // unreadUrgentChatCount = 0;
                }
              "
            >
              <template v-slot:button>
                <div
                  class="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    relative
                  "
                >
                  <ccu-icon type="chat" class="p-1 ml-1.5" size="large" />
                </div>
              </template>
              <template v-slot:component>
                <Chat v-if="selectedChat" :chat="selectedChat" />
              </template>
            </PhoneComponentButton>
            <PhoneComponentButton
              name="news"
              class="work-page__action"
              component-class="work-page__action-content work-page__action-content--news"
              @open="
                () => {
                  // updateUserState({
                  //   news_last_seen: $moment().toISOString(),
                  // });
                  // unreadNewsCount = 0;
                }
              "
            >
              <template v-slot:button>
                <div
                  class="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    relative
                  "
                >
                  <ccu-icon type="news" class="p-1 ml-1.5" size="large" />
                </div>
              </template>
              <template v-slot:component>
                <PhoneNews :cms-tag="'work-news'" />
              </template>
            </PhoneComponentButton>
          </div>
        </div>
        <div v-show="showingTable" class="work-page__main-content--table">
          <WorksiteTable
            :worksite-query="worksiteQuery"
            @rowClick="loadCase"
            @selectionChanged="onSelectionChanged"
          />
        </div>
      </div>
    </div>
    <div class="work-page__form">
      <tabs
        ref="formTabs"
        class="absolute inset-0 flex flex-col"
        classes=""
        tab-classes="py-3"
        tab-active-classes="bg-gray-100 border-b-2 border-yellow-500"
        tab-details-classes="flex-grow relative"
      >
        <tab :name="$t('~~work.case_new')" ref="newCaseTab">
          <CaseForm
            ref="worksiteForm"
            :incident-id="String(currentIncidentId)"
            :worksite-id="worksiteId"
            :key="worksiteId"
            @jumpToCase="jumpToCase"
            :disable-claim-and-save="false"
            :is-editing="isEditing"
            @savedWorksite="
              (worksite) => {
                worksiteId = worksite.id;
                isEditing = true;
                router.push(
                  `/incident/${currentIncidentId.value}/work/${worksite.id}/edit`,
                );
              }
            "
            @closeWorksite="clearCase"
            class="border shadow"
            @navigateToWorksite="
              (id) => {
                worksiteId = id;
                isEditing = true;
                router.push(
                  `/incident/${currentIncidentId.value}/work/${worksite.id}/edit`,
                );
              }
            "
            @geocoded="addMarkerToMap"
            @image-click="showImage"
            @changeImg="changeImage"
          />
        </tab>
        <tab
          v-if="worksite"
          ref="caseInfoTab"
          :name="$t('~~work.case_view')"
          class="overflow-auto absolute inset-0"
        >
          <CaseHeader
            v-if="worksite"
            :worksite="worksite"
            class="p-2 border-l border-r"
            can-edit
            :is-viewing-worksite="isViewing"
            @onJumpToCase="jumpToCase"
            @onDownloadWorksite="downloadWorksites([worksite.id])"
            @onPrintWorksite="printWorksite"
            @onFlagCase="handleFlagCase"
            @onEditCase="handleEditCase"
            @onShowHistory="handleShowHistory"
          />
          <CaseHistory
            v-if="showHistory"
            :incident-id="currentIncidentId"
            :worksite-id="worksiteId"
          ></CaseHistory>
          <CaseFlag
            v-else-if="showFlags"
            :incident-id="currentIncidentId"
            :worksite-id="worksiteId"
            @reloadCase="
              () => {
                reloadCase();
                showFlags = false;
              }
            "
            @clearCase="clearCase"
          ></CaseFlag>
          <CaseView
            v-else-if="isViewing"
            :worksite-id="worksiteId"
            :incident-id="currentIncidentId"
            :key="worksiteId"
            :top-height="225"
            @closeWorksite="clearCase"
            @onResetForm="clearCase"
            @image-click="showImage"
            @changeImg="changeImage"
          />
        </tab>
      </tabs>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
  nextTick,
} from '@vue/composition-api';
import { useGetters, useMutations, useRouter, useState } from '@u3u/vue-hooks';
import { debounce } from 'lodash';
import * as L from 'leaflet';
import { Container } from 'pixi.js';
import useHttp from '@/use/useHttp';
import useToasted from '@/use/useToasted';
import usei18n from '@/use/usei18n';
import WorksiteSearchInput from '@/components/WorksiteSearchInput.vue';
import PhoneComponentButton from '@/components/phone/PhoneComponentButton.vue';
import SimpleMap from '@/components/SimpleMap.vue';
import Chat from '@/components/chat/Chat.vue';
import WorksiteTable from '@/components/WorksiteTable.vue';
import CaseHeader from '@/components/CaseHeader.vue';
import Worksite from '@/models/Worksite';
import CaseHistory from '@/pages/CaseHistory.vue';
import CaseForm from '@/pages/CaseForm.vue';
import { loadCasesCached } from '@/utils/worksite';
import {
  averageGeolocation,
  getMarkerLayer,
  mapAttribution,
  mapTileLayer,
} from '@/utils/map';
import WorksiteActions from '@/WorksiteActions.vue';
import CaseView from '@/pages/CaseView.vue';
import useDialogs from '@/use/useDialogs';
import User from '@/models/User';
import { forceFileDownload } from '@/utils/downloads';
import { getErrorMessage } from '@/utils/errors';
import Loader from '@/components/Loader.vue';
import Incident from '@/models/Incident';
import CaseFlag from '@/pages/CaseFlag.vue';
import PhoneNews from '@/components/phone/PhoneNews.vue';
import useRenderedMarkers from '@/use/worksites/useRenderedMarkers';

const INTERACTIVE_ZOOM_LEVEL = 12;

export default defineComponent({
  name: 'Work',
  components: {
    PhoneNews,
    CaseFlag,
    Loader,
    CaseView,
    WorksiteActions,
    CaseForm,
    CaseHistory,
    CaseHeader,
    WorksiteTable,
    Chat,
    SimpleMap,
    PhoneComponentButton,
    WorksiteSearchInput,
  },
  setup() {
    const { $http } = useHttp();
    const { route, router } = useRouter();
    const { $toasted } = useToasted();
    const { prompt } = useDialogs();
    const { $t } = usei18n();

    const { currentIncidentId } = useState('incident', ['currentIncidentId']);
    const { setCurrentIncidentId } = useMutations('incident', [
      'setCurrentIncidentId',
    ]);

    const { userId } = useGetters('auth', ['userId']);
    const currentUser = computed(() => User.find(userId.value));

    const showingMap = ref<Boolean>(true);
    const showingTable = ref<Boolean>(false);
    const showHistory = ref<Boolean>(false);
    const showFlags = ref<Boolean>(false);
    const showMobileMap = ref<Boolean>(false);
    const isEditing = ref<Boolean>(false);
    const isViewing = ref<Boolean>(false);
    const searchingWorksites = ref<Boolean>(false);
    const mapLoading = ref<Boolean>(false);
    const loading = ref<Boolean>(false);
    const allWorksiteCount = ref<Number>(0);
    const searchWorksites = ref<any[]>([]);
    const worksiteId = ref<any>(null);
    const imageUrl = ref<string>('');
    const map = ref<any>(null);
    const pixiContainer = ref<Container | null>(null);
    const selectedChat = ref<any>({ id: 2 });
    const filters = ref<any>({});
    const selectedTableItems = ref([]);
    const availableWorkTypes = ref({});

    // tab refs
    const formTabs = ref<any>(null);
    const caseInfoTab = ref<any>(null);
    const newCaseTab = ref<any>(null);

    const showTable = () => {
      showingTable.value = true;
      showingMap.value = false;
    };
    const showMap = () => {
      showingTable.value = false;
      showingMap.value = true;
    };

    const searchCases = (search, incident) => {
      return $http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites?fields=id,name,address,case_number,postal_code,city,state,incident,work_types&limit=5&search=${search}&incident=${incident}`,
      );
    };

    const onSearch = debounce(
      async function (search) {
        searchingWorksites.value = true;
        if (!search) {
          searchWorksites.value = [];
        }
        const searchData = await searchCases(search, currentIncidentId.value);
        searchWorksites.value = search ? searchData.data.results : [];
        searchingWorksites.value = false;
      },
      250,
      {
        leading: false,
        trailing: true,
      },
    );

    const worksiteQuery = computed<Record<any, any>>(() => {
      return {
        incident: currentIncidentId.value,
        ...filters.value,
      };
    });

    const showingDetails = computed<Boolean>(() => {
      return showHistory.value || showFlags.value;
    });

    const worksite = computed<Worksite | null>(() => {
      if (worksiteId.value) {
        return Worksite.find(worksiteId.value);
      }
      return null;
    });

    const workTypesClaimedByOrganization = computed<any>(() => {
      if (worksite.value) {
        return worksite.value.work_types.filter((type) =>
          currentUser?.value?.organization.affiliates.includes(type.claimed_by),
        );
      }
      return [];
    });

    const jumpToCase = async () => {
      showMap();

      if (map.value && worksite.value) {
        map.value.setView(
          [worksite.value.latitude, worksite.value.longitude],
          18,
        );
        const popup = L.popup({ className: 'pixi-popup' });
        popup
          .setLatLng([worksite.value.latitude, worksite.value.longitude])
          .setContent(
            `<b>${worksite.value.name} (${worksite.value.case_number}</b>)`,
          )
          .openOn(map.value);
        setTimeout(() => {
          map.value.closePopup();
        }, 5000);
      }
    };

    async function reloadCase() {
      return Worksite.api().fetch(
        worksite?.value?.id,
        currentIncidentId.value.id,
      );
    }

    function fitLocation(location) {
      if (map.value) {
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        const polygon = L.geoJSON(geojsonFeature, {
          weight: '1',
          onEachFeature(feature, layer) {
            layer.location_id = location.id;
          },
        });
        map.value.fitBounds(polygon.getBounds());
      }
    }

    function goToIncidentCenter() {
      const { locationModels } = Incident.find(
        currentIncidentId.value,
      ) as Incident;
      if (locationModels.length) {
        locationModels.forEach((location) => {
          fitLocation(location);
        });
      } else {
        const center = averageGeolocation(
          pixiContainer?.value?.children.map((marker) => [marker.x, marker.y]),
        );
        if (center.latitude && center.longitude) {
          map.value.setView([center.latitude, center.longitude], 6);
        }
      }
    }

    function goToInteractive() {
      const { locationModels } = Incident.find(
        currentIncidentId.value,
      ) as Incident;

      if (locationModels.length) {
        goToIncidentCenter();
        map.value.setZoom(INTERACTIVE_ZOOM_LEVEL);
      } else {
        const center = averageGeolocation(
          pixiContainer?.value?.children.map((marker) => [marker.x, marker.y]),
        );
        if (center.latitude && center.longitude) {
          map.value.setView(
            [center.latitude, center.longitude],
            INTERACTIVE_ZOOM_LEVEL,
          );
        }
      }
    }

    function onSelectionChanged(selectedItems) {
      selectedTableItems.value = selectedItems;
    }

    async function printWorksite() {
      loading.value = true;
      let file;
      if (workTypesClaimedByOrganization.value.length > 0) {
        file = await Worksite.api().printWorksite(worksite?.value?.id, '');
      } else {
        const result = await prompt({
          title: $t('actions.print_case'),
          content: $t('casesVue.please_claim_if_print'),
          actions: {
            cancel: {
              text: $t('actions.cancel'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            printNoClaim: {
              text: $t('actions.print_without_claiming'),
              type: 'solid',
              buttonClass:
                'border text-base p-2 px-4 mx-2 text-black border-primary-light',
            },
            claimAndPrint: {
              text: $t('actions.claim_and_print'),
              type: 'solid',
              buttonClass:
                'border text-base p-2 px-4 mx-2 text-black border-primary-light',
            },
          },
        });

        if (result.key === 'claimAndPrint') {
          file = await Worksite.api().printWorksite(worksite?.value?.id, '');
        }
        if (result.key === 'printNoClaim') {
          if (!result.response) {
            $toasted.error($t('casesVue.please_explain_why_no_claim'));
          } else {
            file = await Worksite.api().printWorksite(
              worksite?.value?.id,
              result.response,
            );
          }
        }
      }
      if (file) {
        forceFileDownload(file.response);
      }
      loading.value = false;
      await reloadCase();
    }

    async function downloadWorksites(ids) {
      loading.value = true;
      try {
        const response = await $http.get(
          `${process.env.VUE_APP_API_BASE_URL}/worksites_download/download_csv`,
          {
            params: {
              id__in: ids.join(','),
            },
            headers: { Accept: 'text/csv' },
            responseType: 'blob',
          },
        );
        forceFileDownload(response);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    }

    function selectCase(c) {
      if (c) {
        setCurrentIncidentId(c.incident);
        worksiteId.value = c.id;
      } else {
        worksiteId.value = null;
      }
    }

    function clearCase() {
      worksiteId.value = null;
      isEditing.value = false;
      isViewing.value = false;
    }

    async function addMarkerToMap(location) {
      let markerLocation = location;
      if (!markerLocation) {
        markerLocation = map.value.getCenter();
      }

      const marker = new L.marker(markerLocation, { draggable: 'true' }).addTo(
        map.value,
      );
      map.value.setView([markerLocation.lat, markerLocation.lng], 15);
      marker
        .bindTooltip($t('casesVue.drag_pin_to_correct_location'), {
          direction: 'top',
        })
        .openTooltip();
      showMap();
    }

    function showImage(image) {
      imageUrl.value = image.large_thumbnail_url;
    }

    function changeImage(image) {
      imageUrl.value = image.large_thumbnail_url;
    }

    async function getWorksites() {
      mapLoading.value = true;
      const response = await loadCasesCached({
        ...worksiteQuery.value,
      });
      mapLoading.value = false;
      allWorksiteCount.value = response.results.length;
      return response.results;
    }

    function loadCase(data) {
      isViewing.value = true;
      worksiteId.value = data.id;
      router.push(`/incident/${currentIncidentId.value}/work/${data.id}`);
    }

    function removeLayer(key) {
      map.value.eachLayer((layer) => {
        if (layer.key === key) {
          map.value.removeLayer(layer);
        }
      });
    }

    function loadMap(markers) {
      if (!map.value) {
        map.value = L.map('map', {
          zoomControl: false,
        }).fitBounds([
          [17.644022027872726, -122.78314470293876],
          [50.792047064406866, -69.87298845293874],
        ]);

        L.tileLayer(mapTileLayer, {
          attribution: mapAttribution,
          detectRetina: false,
          maxZoom: 18,
          noWrap: false,
        }).addTo(map.value);
      }

      removeLayer('marker_layer');
      const worksiteLayer = getMarkerLayer([], map, {});
      worksiteLayer.addTo(map.value);

      const { workTypes, findMarker } = useRenderedMarkers(map.value, markers);
      availableWorkTypes.value = workTypes.value;

      map.value.on('click', function (e) {
        const marker = findMarker(e.latlng);
        if (marker) {
          loadCase(marker);
        }
      });

      map.value.on(
        'mousemove',
        L.Util.throttle((e) => {
          const marker = findMarker(e.latlng) as any;
          if (marker) {
            L.DomUtil.addClass(worksiteLayer._container, 'cursor-pointer');
            worksiteLayer._container.setAttribute('title', marker.case_number);
          } else {
            L.DomUtil.removeClass(worksiteLayer._container, 'cursor-pointer');
            worksiteLayer._container.setAttribute('title', '');
          }
        }, 32),
      );

      nextTick(() => {
        // Add this slight pan to re-render map
        map.value.panBy([1, 0]);
      });
    }

    function onUpdateQuery(query) {
      filters.value = query;
    }

    function reloadMap() {
      if (map.value) {
        removeLayer('marker_layer');
        getWorksites().then((markers) => {
          loadMap(markers);
        });
      }
    }

    function handleFlagCase() {
      showFlags.value = true;
      showHistory.value = false;
    }

    function handleEditCase() {
      if (!worksite.value) {
        console.error('No worksite to edit');
        return;
      }
      isViewing.value = false;
      isEditing.value = true;
      router.push(
        `/incident/${currentIncidentId.value}/work/${worksite.value.id}/edit`,
      );
    }

    function handleShowHistory() {
      showFlags.value = false;
      showHistory.value = true;
    }

    watch(
      () => worksiteQuery.value,
      (value) => {
        if (value) {
          reloadMap();
        }
      },
    );

    watch(
      () => worksite.value,
      (value, oldValue) => {
        if (value && value.id !== oldValue?.id) {
          formTabs.value.selectTab(caseInfoTab.value);
        }
      },
    );

    watch(
      () => currentIncidentId.value,
      (value) => {
        if (value) {
          worksiteId.value = null;
          isEditing.value = false;
          isViewing.value = false;
          router.push(`/incident/${currentIncidentId.value}/work`);
        }
      },
    );

    onMounted(async () => {
      if (route.value.params.incident_id) {
        setCurrentIncidentId(route.value.params.incident_id);
      }
      if (route.value.params.id) {
        worksiteId.value = route.value.params.id;
        if (route?.value?.meta?.id === 'work_case_edit') {
          isEditing.value = true;
        } else {
          isViewing.value = true;
        }
      }
      const markers = await getWorksites();
      loadMap(markers);
    });

    return {
      showImage,
      changeImage,
      addMarkerToMap,
      clearCase,
      currentIncidentId,
      allWorksiteCount,
      isEditing,
      isViewing,
      onSearch,
      searchWorksites,
      showingTable,
      selectedChat,
      showingMap,
      mapLoading,
      formTabs,
      caseInfoTab,
      newCaseTab,
      showMap,
      showTable,
      router,
      worksite,
      worksiteId,
      worksiteQuery,
      jumpToCase,
      showHistory,
      map,
      showFlags,
      selectCase,
      showingDetails,
      showMobileMap,
      onUpdateQuery,
      loadCase,
      workTypesClaimedByOrganization,
      printWorksite,
      downloadWorksites,
      onSelectionChanged,
      selectedTableItems,
      loading,
      goToIncidentCenter,
      goToInteractive,
      reloadCase,
      availableWorkTypes,
      handleFlagCase,
      handleEditCase,
      handleShowHistory,
    };
  },
});
</script>

<style lang="postcss">
.work-page {
  &__action {
    &-content {
      @apply right-20 sm:right-12 h-auto;
      width: 35vw;

      &--caller {
        @apply h-full;
      }
      &--dialer {
        @apply h-full;
      }
      &--chat {
      }
      &--news {
        height: 60vh;
        width: 50vw;
      }
      &--history {
        @apply h-full;
        width: 50vw;
      }
      &--stats {
      }
      &--leaderboard {
        height: 60vh;
        width: 50vw;
      }
      &--reset {
        @apply h-full;
      }
    }
  }
}

@media screen and (max-width: theme('screens.sm')) {
  .work-page {
    &__action {
      &-content {
        width: 80vw;

        &--caller {
        }
        &--dialer {
        }
        &--chat {
        }
        &--news {
        }
        &--history {
        }
        &--stats {
        }
        &--leaderboard {
        }
        &--reset {
        }
      }
    }
  }
}
</style>

<style lang="postcss" scoped>
.work-page {
  @apply grid flex-grow h-full;
  grid-template-columns: auto 450px;

  &__actions {
    @apply absolute top-0 right-0 flex flex-col;
    z-index: 1004;
  }

  &__action {
    @apply shadow
   w-20
   h-20
   sm:w-12
   sm:h-12
   my-2
   sm:my-1
   bg-white
   cursor-pointer
   z-50;
  }

  /* Container for map */
  &__main {
    @apply flex flex-col;

    &-header {
      @apply flex items-center;
    }

    &-content {
      @apply flex-grow;

      &--map {
        @apply relative h-full select-none;
      }

      &--table {
        @apply p-2 h-full shadow;
      }
    }
  }

  /* Container for case form */
  &__form {
    @apply flex flex-col relative;

    &-header {
      @apply h-12 px-2 border flex items-center justify-between;
    }

    &-toggler {
      @apply flex items-center justify-between px-2;
    }

    &-body {
      @apply flex-grow relative h-full flex flex-col md:flex-row;
    }
  }
}

/* Mobile styles */
@media screen and (max-width: theme('screens.sm')) {
  .work-page {
    @apply flex flex-col;

    &__main {
      @apply h-1/3;
    }

    &__form {
      @apply h-2/3;
    }
  }
}
</style>
