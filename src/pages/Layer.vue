<template>
  <div class="flex h-full">
    <div class="w-84 mx-2 flex flex-col">
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
          <FormSelect
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
        class="h-full"
        :locations="currentLayer.locations"
      />
    </div>
  </div>
</template>

<script>
import CustomLayersTool from '@/components/CustomLayersTool';
import FormSelect from '@/components/FormSelect';
import Layer from '@/models/Layer';

export default {
  name: 'Layer',
  components: { FormSelect, CustomLayersTool },
  data() {
    return {
      currentLayer: null,
      layerName: '',
      layerDescription: '',
      layerType: '',
      layerAccess: 'Private',
      layerTypes: ['Primary Response Area', 'Incident Extent'],
    };
  },
  async mounted() {
    if (this.$route.params.layer_id) {
      try {
        await Layer.api().fetchById(this.$route.params.layer_id);
        this.currentLayer = Layer.find(this.$route.params.layer_id);
      } catch (e) {
        this.currentLayer = new Layer();
        await this.$router.replace(`/layers/new`);
      }
    } else {
      this.currentLayer = new Layer();
    }
  },
  methods: {
    saveLayer() {},
  },
};
</script>

<style scoped>
.form-field {
  @apply my-2;
}
</style>
