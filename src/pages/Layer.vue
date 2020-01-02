<template>
  <div class="flex h-full relative">
    <div
      v-if="loading"
      style="z-index: 1001;"
      class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center"
    >
      <spinner />
    </div>
    <div v-else class="w-84 mx-2 flex flex-col">
      <div class="h-16 flex items-center justify-between">
        <div class="font-bold">New Layer</div>
        <div class="flex">
          <ccu-icon
            alt="Edit Layer"
            size="small"
            class="p-1 py-2"
            type="edit"
            @click.native="() => {}"
          />
          <ccu-icon
            alt="Download Layer as Shapefile"
            size="small"
            class="p-1 py-2"
            type="download"
            @click.native="() => {}"
          />
          <ccu-icon
            alt="Share Layer"
            size="small"
            class="p-1 py-2"
            type="share"
          />
          <ccu-icon
            alt="Delete"
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
        class="form flex-grow flex flex-col justify-between"
        @submit.prevent="saveLayer"
      >
        <div class="flex flex-col">
          <base-input
            v-model="currentLayer.title"
            type="text"
            class="input form-field"
            size="large"
            placeholder="Layer Name"
          />
          <form-select
            v-model="currentLayer.type"
            :options="layerTypes"
            placeholder="Layer Type"
          />
          <textarea
            v-model="currentLayer.description"
            class="text-base form-field border outline-none p-2 resize-none"
            rows="4"
            placeholder="Description"
          />
          <div>
            <div class="mt-8 text-base">Access</div>
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
            text="Reset"
            class="border-2 border-black mx-2 p-2 px-4"
          />
          <base-button text="Save Layer" class="mx-2 p-2 px-4" type="primary" />
        </div>
      </form>
    </div>
    <div class="flex-grow flex flex-col">
      <CustomLayersTool
        v-if="currentLayer"
        ref="layerTool"
        class="h-full"
        :locations="currentLayer.locations"
      />
    </div>
  </div>
</template>

<script>
import * as circleToPolygon from 'circle-to-polygon';
import * as L from 'leaflet';
import CustomLayersTool from '@/components/CustomLayersTool';
import Layer from '@/models/Layer';
import Location from '@/models/Location';

export default {
  name: 'Layer',
  components: { CustomLayersTool },
  data() {
    return {
      currentLayer: null,
      loading: false,
      layerName: '',
      layerDescription: '',
      layerType: '',
      layerAccess: 'Private',
      layerTypes: ['Primary Response Area', 'Incident Extent'],
    };
  },
  async mounted() {
    this.loading = true;
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
    async saveLayer() {
      this.loading = true;
      const locationPromises = [];

      this.$refs.layerTool.drawnItems.getLayers().forEach(location => {
        const data = {};
        this.$log.debug(location.toGeoJSON());
        let { geometry } = location.toGeoJSON();
        if (location instanceof L.Circle) {
          const radius = location.getRadius();
          const { coordinates } = geometry;
          const numberOfEdges = 32;

          geometry = circleToPolygon(coordinates, radius, numberOfEdges);
        }
        if (geometry.type === 'Point') {
          data.point = geometry;
        } else if (geometry.type === 'Polygon') {
          data.poly = geometry;
        }
        locationPromises.push(Location.api().post('/locations', data));
      });

      try {
        const locationResults = await Promise.all(locationPromises);
        const locations = locationResults.map(result => {
          return result.entities.locations[0].id;
        });

        const layerResult = await Layer.api().post('/layers', {
          ...this.currentLayer,
          locations,
        });
        this.$log.debug(layerResult.entities.layers[0].id);
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
