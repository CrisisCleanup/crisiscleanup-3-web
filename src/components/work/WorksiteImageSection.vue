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
        :image-list="worksite.files ? worksite.files : imageList"
        :disable-modal="disableModal"
        @removeImage="deleteFile"
      />
    </div>
  </section>
</template>

<script lang="ts">
import _ from 'lodash';
import DragDrop from '../../components/DragDrop.vue';
import Worksite from '../../models/Worksite';
import { getErrorMessage } from '../../utils/errors';
import ImageModal from '../../components/ImageModal.vue';
import { uploadFile } from '../../utils/file';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';

export default defineComponent({
  name: 'WorksiteImageSection',
  components: {
    DragDrop,
    ImageModal,
  },
  props: {
    worksite: {
      type: Object,
    },
    isPrintToken: {
      type: Boolean,
    },
    isSurvivorToken: {
      type: Boolean,
    },
    disableModal: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const uploading = ref(false);
    const imageList = ref(props.worksite.files ?? []);
    const $toasted = useToast();

    function changeImage(image) {
      emit('changeImage', image);
    }
    function imageClick(image) {
      emit('image-click', image);
    }
    async function saveToWorkSite(file, id, token) {
      if (props.isPrintToken) {
        await Worksite.api().addFileWithToken(token, file);
      } else if (props.isSurvivorToken) {
        await Worksite.api().addFileWithSurvivorToken(token, file);
      } else {
        await Worksite.api().addFile(id, file);
        await Worksite.api().fetch(id);
      }
    }
    async function handleFileUpload(fileList) {
      if (fileList.length === 0) {
        uploading.value = false;
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[0]);
      uploading.value = true;
      try {
        const result = await uploadFile(formData);
        const file = result.data.id;
        emit('updateFiles', result.data);
        if (props.worksite.id || props.worksite.token) {
          await saveToWorkSite(file, props.worksite.id, props.worksite.token);
        } else {
          imageList.value.push(result.data);
        }
        emit('photosChanged');
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        uploading.value = false;
      }
    }
    async function deleteFile(fileId, id) {
      if (props.worksite.id) {
        if (props.isSurvivorToken) {
          await Worksite.api().deleteFileWithSurvivorToken(
            props.worksite.token,
            fileId,
          );
        } else {
          await Worksite.api().deleteFile(props.worksite.id, fileId);
          await Worksite.api().fetch(props.worksite.id);
        }
      } else {
        const i = _.findIndex(imageList.value, (c) => {
          return c.id === id;
        });
        imageList.value.splice(i, 1);
        emit('popLocal', imageList.value);
      }
      emit('photosChanged');
    }

    return {
      imageList,
      uploading,
      changeImage,
      imageClick,
      handleFileUpload,
      saveToWorkSite,
      deleteFile,
    };
  },
});
</script>
