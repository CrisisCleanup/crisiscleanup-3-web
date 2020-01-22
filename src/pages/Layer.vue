<template>
  <div class="flex h-full relative">
    <div
      v-if="loading"
      style="z-index: 1001;"
      class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center"
    >
      <spinner />
    </div>
    <div v-else class="mx-2 flex flex-col">
      <div class="h-16 flex items-center justify-between">
        <div class="font-bold">{{ $t('actions.new_layer') }}</div>
        <div class="flex">
          <ccu-icon
            alt="$t('actions.edit_layer')"
            size="small"
            class="p-1 py-2"
            type="edit"
            @click.native="() => {}"
          />
          <ccu-icon
            alt="$t('layerVue.download_as_shapefile')"
            size="small"
            class="p-1 py-2"
            type="download"
            @click.native="() => {}"
          />
          <ccu-icon
            alt="$t('actions.share_layer')"
            size="small"
            class="p-1 py-2"
            type="share"
          />
          <ccu-icon
            alt="$t('actions.delete')"
            size="small"
            class="p-1 py-2"
            type="trash"
            @click.native="() => {}"
          />
        </div>
      </div>
      <form
        v-if="currentLayer"
        ref="form"
        class="form flex-grow flex flex-col justify-between w-84"
        @submit.prevent="saveLayer"
      >
        <div class="flex flex-col">
          <base-input
            v-model="currentLayer.title"
            type="text"
            class="input form-field"
            size="large"
            placeholder="$t('layerVue.layer_name')"
          />
          <form-select
            v-if="!loading"
            v-model="currentLayer.type"
            :options="locationTypes"
            item-key="id"
            label="name_t"
            select-classes="bg-white border w-full h-12"
          />
          <textarea
            v-model="currentLayer.description"
            class="text-base form-field border outline-none p-2 resize-none"
            rows="4"
            placeholder="Description"
          />
          <div>
            <div class="mt-8 text-base">{{ $t('layerVue.access') }}</div>
            <div class="flex mt-2">
              <base-radio
                class="mr-6"
                name="Private"
                label="Private"
                :value="layerAccess"
                @change="layerAccess = $event"
              />
              <base-radio
                class="mr-6"
                name="Public"
                label="Public"
                :value="layerAccess"
                @change="layerAccess = $event"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end h-16">
          <base-button
            text="$t('actions.reset')"
            class="border-2 border-black mx-2 p-2 px-4"
          />
          <base-button
            text="$t('actions.save_layer')"
            class="mx-2 p-2 px-4"
            type="primary"
            :action="saveLayer"
          />
        </div>
      </form>
    </div>
    <div class="flex-grow flex flex-col">
      <LayerTool
        v-if="currentLayer"
        class="h-full"
        :locations="currentLayer.locations"
        @changed="setCurrentLocation"
      />
    </div>
  </div>
</template>

<script>
import Layer from '@/models/Layer';
import Location from '@/models/Location';
import LocationType from '@/models/LocationType';
import LayerTool from '../components/LayerTool';

export default {
  name: 'Layer',
  components: { LayerTool },
  data() {
    return {
      currentLayer: null,
      currentLocation: null,
      loading: false,
      layerName: '',
      layerDescription: '',
      layerType: '',
      layerAccess: 'Private',
      layerTypes: [$t('locationTypes.org_primary_response_area'), $t('locationTypes.incident_primary_damaged_area')],
    };
  },
  computed: {
    locationTypes() {
      return LocationType.all();
    },
  },
  async mounted() {
    this.loading = true;
    await LocationType.api().get('/location_types', {
      dataKey: 'results',
    });
    if (this.$route.params.layer_id) {
      try {
        await Layer.api().fetchById(this.$route.params.layer_id);
        this.currentLayer = Layer.find(this.$route.params.layer_id);
      } catch (e) {
        this.currentLayer = new Layer();
        await this.$router.replace(`/layers/new`);
      } finally {
        this.loading = false;
      }
    } else {
      this.currentLayer = new Layer();
    }
    this.loading = false;
  },
  methods: {
    setCurrentLocation(location) {
      this.currentLocation = location;
    },
    async saveLayer() {
      this.loading = true;
      const locationPromises = [];

      const data = {};
      let { geometry } = this.currentLocation.toGeoJSON();
      const { type, features } = this.currentLocation.toGeoJSON();
      if (type === 'FeatureCollection') {
        const [feature] = features;
        geometry = feature.geometry;
      }

      if (geometry.type === 'Point') {
        data.point = geometry;
      } else if (geometry.type === 'Polygon') {
        data.poly = geometry;
      } else if (geometry.type === 'MultiPolygon') {
        data.geom = geometry;
      }

      locationPromises.push(Location.api().post('/locations', data));

      try {
        const locationResults = await Promise.all(locationPromises);
        const locations = locationResults.map(result => {
          return result.entities.locations[0].id;
        });
        let layerResult;
        if (this.currentLayer.id) {
          layerResult = await Layer.api().put(
            `/layers/${this.currentLayer.id}`,
            {
              ...this.currentLayer,
              locations,
            },
          );
        } else {
          layerResult = await Layer.api().post('/layers', {
            ...this.currentLayer,
            locations,
          });
        }
        await this.$router.push(`/layers/${layerResult.entities.layers[0].id}`);
      } catch (e) {
        this.$log.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.form-field {
  @apply my-2;
}
</style>
