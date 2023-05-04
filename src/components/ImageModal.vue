<template>
  <div>
    <div class="flex flex-wrap">
      <slot name="image-list">
        <div v-for="(image, idx) in imageList" :key="idx">
          <slot name="image">
            <div class="relative image-container w-24 h-24 mb-2">
              <div
                v-if="image.filename.endsWith('.pdf')"
                class="w-20 h-20 mx-2 cursor-pointer flex flex-col items-center justify-center gap-2"
                :title="image.filename_original"
                @click="appearPdf(image)"
              >
                <font-awesome-icon
                  icon="file-pdf"
                  size="3x"
                  class="cursor-pointer"
                />
              </div>
              <img
                v-else
                class="w-20 h-20 mx-2 cursor-pointer"
                :src="image.small_thumbnail_url"
                @click="appearModal(image, idx)"
              />
              <ccu-icon
                :alt="$t('actions.delete')"
                size="xs"
                type="trash"
                class="absolute right-0 top-0 m-1 mr-3 p-1 image-close bg-white"
                @click="$emit('removeImage', image.file, image.id)"
              />
            </div>
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { api as viewerApi } from 'v-viewer';
import { computed } from 'vue';
import useDialogs from '@/hooks/useDialogs';
import PdfViewer from '@/components/PdfViewer.vue';

export default defineComponent({
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
  setup(props) {
    const { component } = useDialogs();

    const images = computed(() => {
      return props.imageList.map((image) => {
        return {
          src: image.small_thumbnail_url,
          'data-source': image.large_thumbnail_url,
        };
      });
    });
    async function appearPdf(file) {
      await component({
        title: file.filename_original,
        component: PdfViewer,
        classes: 'w-full h-144 overflow-auto p-3',
        modalClasses: 'bg-white max-w-4xl shadow',
        props: {
          pdf: file,
        },
      });
    }

    function appearModal(image, idx) {
      viewerApi({
        options: {
          toolbar: true,
          url: 'data-source',
          initialViewIndex: idx,
        },
        images: images.value,
      });
    }

    return {
      images,
      appearModal,
      appearPdf,
    };
  },
});
</script>

<style src="viewerjs/dist/viewer.css"></style>

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
