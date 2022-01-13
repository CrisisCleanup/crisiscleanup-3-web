<template>
  <section class="flex">
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

    <vue-easy-lightbox
      :visible="viewingImage"
      :imgs="worksite.files.map((file) => file.large_thumbnail_url)"
      :index="index"
      @hide="handleHide"
    ></vue-easy-lightbox>

    <div class="flex flex-wrap">
      <div
        v-for="(file, idx) in worksite.files"
        :key="idx"
        class="relative image-container mb-2"
      >
        <img
          class="image-box w-20 h-20 mx-2 cursor-pointer"
          :src="file.small_thumbnail_url"
          :alt="file.filename_original"
          :title="file.filename_original"
          @click="() => showImg(idx)"
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
  </section>
</template>
<script>
import VueTypes from 'vue-types';
import DragDrop from '@/components/DragDrop';
import Worksite from '@/models/Worksite';
import { getErrorMessage } from '../utils/errors';

export default {
  name: 'WorksiteImageSection',
  components: { DragDrop },
  data() {
    return {
      uploading: false,
      viewingImage: false,
      index: null,
    };
  },
  props: {
    worksite: VueTypes.object,
    isPrintToken: VueTypes.bool.def(false),
    isSurvivorToken: VueTypes.bool.def(false),
  },
  methods: {
    showImg(index) {
      this.index = index;
      this.viewingImage = true;
    },
    handleHide() {
      this.viewingImage = false;
    },
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
        if (this.isPrintToken) {
          await Worksite.api().addFileWithToken(this.worksite.token, file);
        } else if (this.isSurvivorToken) {
          await Worksite.api().addFileWithSurvivorToken(
            this.worksite.token,
            file,
          );
        } else {
          await Worksite.api().addFile(this.worksite.id, file);
          await Worksite.api().fetch(this.worksite.id);
        }
        this.$emit('photosChanged');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.uploading = false;
      }
    },
    async deleteFile(fileId) {
      if (this.isSurvivorToken) {
        await Worksite.api().deleteFileWithSurvivorToken(
          this.worksite.token,
          fileId,
        );
      } else {
        await Worksite.api().deleteFile(this.worksite.id, fileId);
        await Worksite.api().fetch(this.worksite.id);
      }
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
