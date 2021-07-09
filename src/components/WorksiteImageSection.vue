<template>
  <section class="px-3 pb-3 flex">
    <DragDrop
      class="w-20 h-20 border-solid border-2"
      :disabled="uploading"
      @files="handleFileUpload"
    >
      <div class="flex items-center justify-center">
        <font-awesome-icon v-if="uploading" size="lg" icon="spinner" spin />
        <font-awesome-icon v-else size="lg" icon="camera" />
      </div>
    </DragDrop>

    <div class="flex w-64 overflow-x-auto">
      <div
        v-for="file in worksite.files"
        :key="file"
        class="relative image-container"
        style="min-width: 90px"
      >
        <img
          class="image-box w-20 h-20 mx-2 cursor-pointer"
          :src="file.small_thumbnail_url"
          :alt="file.filename_original"
          :title="file.filename_original"
          @click="viewingImage = file"
        />
        <ccu-icon
          :alt="$t('actions.delete')"
          size="xs"
          type="trash"
          class="absolute right-0 top-0 m-1 mr-3 p-1 image-close bg-white"
          @click.native="deleteFile(file.file)"
        />
      </div>
    </div>
    <modal
      v-if="viewingImage"
      modal-classes="bg-white w-1/3 shadow"
      closeable
      @close="viewingImage = null"
    >
      <img
        :src="viewingImage.full_url"
        :alt="viewingImage.filename_original"
        :title="viewingImage.filename_original"
      />
      <div slot="footer"></div>
    </modal>
  </section>
</template>
<script>
import DragDrop from '@/components/DragDrop';
import VueTypes from 'vue-types';
import Worksite from '@/models/Worksite';
import { getErrorMessage } from '../utils/errors';

export default {
  name: 'WorksiteImageSection',
  components: { DragDrop },
  data() {
    return {
      uploading: false,
      viewingImage: null,
    };
  },
  props: {
    worksite: VueTypes.object,
  },
  methods: {
    async handleFileUpload(fileList) {
      if (fileList.length === 0) {
        this.uploading = false;
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[0]);
      this.uploading = true;
      try {
        const result = await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        const file = result.data.id;
        await Worksite.api().addFile(this.worksite.id, file);
        await Worksite.api().fetch(this.worksite.id);
        this.$emit('photosChanged');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.uploading = false;
      }
    },
    async deleteFile(fileId) {
      await Worksite.api().deleteFile(this.worksite.id, fileId);
      await Worksite.api().fetch(this.worksite.id);
      this.$emit('photosChanged');
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
</style>
