<template>
  <div>
    <div class="flex flex-wrap">
      <slot name="image-list">
        <div v-for="(image, idx) in imageList" :key="idx">
          <slot name="image">
            <div class="relative image-container w-24 h-24 mb-2">
              <img
                class="w-20 h-20 mx-2 cursor-pointer"
                :src="image.small_thumbnail_url"
                @click="appearModal(image, idx)"
              />
              <ccu-icon
                :alt="$t('actions.delete')"
                size="xs"
                type="trash"
                class="absolute right-0 top-0 m-1 mr-3 p-1 image-close bg-white"
                @click.native="$emit('removeImage', image.file, image.id)"
              />
            </div>
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>
<script>
import 'viewerjs/dist/viewer.css';
import _ from 'lodash';
import { api as viewerApi } from 'v-viewer';

export default {
  name: 'ImageModal',
  props: {
    imageList: {
      type: Array,
      default: () => [],
    },
    disableModal: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    images() {
      return this.imageList.map((image) => {
        return {
          src: image.small_thumbnail_url,
          'data-source': image.large_thumbnail_url,
        };
      });
    },
  },
  data() {
    return {
      showModal: false,
      numClicks: 0,
      scale: 1,
      selectedImage: '',
      imageIndex: -1,
    };
  },
  methods: {
    appearModal(image, idx) {
      const $viewer = viewerApi({
        options: {
          toolbar: true,
          url: 'data-source',
          initialViewIndex: idx,
        },
        images: this.images,
      });
    },
  },
};
</script>
<style scoped>
.image-container:hover .image-close {
  display: flex;
}
.image-close {
  display: none;
}
.modal {
  @apply relative;
  z-index: 10000;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.9);
}

.modal-content {
  @apply w-full flex items-center justify-center mt-80;
}
</style>
