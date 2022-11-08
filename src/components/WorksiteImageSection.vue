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
        :image-list="worksite.id ? worksite.files : imageList"
        :disable-modal="disableModal"
        @removeImage="deleteFile"
        @image-click="imageClick"
        @change-image="changeImage"
        ref="imageModal"
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
import { uploadFile } from '@/utils/file';

export default {
  name: 'WorksiteImageSection',
  components: { DragDrop, ImageModal },
  data() {
    return {
      uploading: false,
      imageList: [],
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
    changeImage(image) {
      this.$emit('changeImage', image);
    },
    moveImage(updateAmount) {
      this.$refs.imageModal.moveImage(updateAmount);
    },
    imageClick(image) {
      console.log(image);
      this.$emit('image-click', image);
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
        const result = await uploadFile(formData);
        const file = result.data.id;
        this.$emit('updateFiles', result.data);
        if (this.worksite.id) {
          await this.saveToWorkSite(
            file,
            this.worksite.id,
            this.worksite.token,
          );
        } else {
          this.imageList.push(result.data);
        }
        this.$emit('photosChanged');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.uploading = false;
      }
    },
    async saveToWorkSite(file, id, token) {
      if (this.isPrintToken) {
        await Worksite.api().addFileWithToken(token, file);
      } else if (this.isSurvivorToken) {
        await Worksite.api().addFileWithSurvivorToken(token, file);
      } else {
        await Worksite.api().addFile(id, file);
        await Worksite.api().fetch(id);
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
