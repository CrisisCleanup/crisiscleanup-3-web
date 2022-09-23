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

    <div class="flex flex-wrap">
      <ImageModal
        v-for="(file, idx) in worksite.files"
        :key="idx"
        :img-src="file.small_thumbnail_url"
        :modal-img="file.large_thumbnail_url"
        :disable-modal="disableModal"
        :img-index="idx"
        :img-list-length="worksite.files.length"
        @removeImage="deleteFile(file.file)"
        @image-click="
          $emit('image-click', file.large_thumbnail_url, idx, worksite.files)
        "
      />
    </div>
  </section>
</template>
<script>
import VueTypes from 'vue-types';
import DragDrop from '@/components/DragDrop';
import Worksite from '@/models/Worksite';
import { getErrorMessage } from '../utils/errors';
import ImageModal from '@/components/ImageModal';

export default {
  name: 'WorksiteImageSection',
  components: { DragDrop, ImageModal },
  data() {
    return {
      uploading: false,
    };
  },
  props: {
    worksite: VueTypes.object,
    isPrintToken: VueTypes.bool.def(false),
    isSurvivorToken: VueTypes.bool.def(false),
    disableModal: {
      type: Boolean,
      default: false,
    },
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
