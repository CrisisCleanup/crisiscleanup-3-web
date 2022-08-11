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
    <div v-if="showModal" class="modal">
      <font-awesome-icon
        @click="showModal = false"
        icon="times"
        class="
          text-white
          h-7
          w-7
          absolute
          top-3
          right-7
          cursor-pointer
          hover:text-primary-dark
        "
      />
      <font-awesome-icon
        class="
          text-white
          w-7
          h-7
          absolute
          right-7
          top-12
          hover:text-primary-dark
          cursor-pointer
        "
        icon="fa-solid fa-rotate"
        @click="rotateImg"
      />
      <img
        :src="worksite.files[index].large_thumbnail_url"
        class="modal-content"
        id="modal-content"
      />
    </div>

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
      showModal: false,
      numClicks: 0,
    };
  },
  props: {
    worksite: VueTypes.object,
    isPrintToken: VueTypes.bool.def(false),
    isSurvivorToken: VueTypes.bool.def(false),
  },
  methods: {
    rotateImg() {
      this.numClicks++;
      const img = document.getElementById('modal-content');
      img.style.transform = `rotate(${this.numClicks * 90}deg)`;
    },
    showImg(index) {
      this.numClicks = 0;
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

.modal {
  position: fixed;
  z-index: 1;
  padding-top: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.9);
}

.modal-content {
  margin: auto;
  display: block;
  width: 80%;
  max-width: 700px;
}
</style>
