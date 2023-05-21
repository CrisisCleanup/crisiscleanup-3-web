<template>
  <form ref="form" class="flex flex-col mt-2 justify-between">
    <fieldset class="gap-3 flex flex-col">
      <base-input
        v-model="bug.title"
        placeholder="Title"
        type="text"
        required
      />
      <base-input
        v-model="bug.description"
        placeholder="Description"
        text-area
        required
        rows="5"
      ></base-input>

      <div class="flex gap-2">
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
        <div v-if="file" class="flex flex-wrap">
          <base-input
            size="small"
            class="w-full sm:w-64 mr-2"
            input-classes="text-xs"
            disabled
            :model-value="file.filename_original"
          ></base-input>
        </div>
      </div>
    </fieldset>

    <base-button
      variant="solid"
      :action="submitForm"
      class="p-3"
      :text="$t('actions.submit')"
    />
  </form>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { getErrorMessage } from '@/utils/errors';
import useCurrentUser from '@/hooks/useCurrentUser';
import useEmitter from '@/hooks/useEmitter';
import DragDrop from '@/components/DragDrop.vue';
import ImageModal from '@/components/ImageModal.vue';
import { uploadFile } from '@/utils/file';
import type { CCUFileItem } from '@/models/types';

export default {
  components: { DragDrop },
  props: {
    reportType: {
      type: String,
      default: 'phone',
    },
  },
  setup(props) {
    const ccuApi = useApi();
    const $toasted = useToast();
    const store = useStore();
    const { currentUser } = useCurrentUser();
    const { emitter } = useEmitter();
    const { t } = useI18n();

    const bug = ref({
      title: '',
      description: '',
    });

    const form = ref<HTMLFormElement | null>(null);
    const uploading = ref<boolean>(false);
    const file = ref<CCUFileItem | null>(null);

    async function addFile(id: string, file: number, type: string) {
      const { success } = ccuApi(`/bug_reports/${id}/files`, {
        method: 'POST',
        data: {
          file,
          type_t: type,
        },
      });

      const { error } = await success();

      if (error.value) {
        throw error.value;
      }
    }

    const submitForm = async () => {
      const isValid = form.value?.reportValidity();
      if (!isValid) {
        return;
      }

      const { success } = ccuApi('/bug_reports', {
        method: 'POST',
        data: {
          title: bug.value.title,
          description: bug.value.description,
          type: props.reportType,
          attr: store.state.phone,
          states: currentUser?.states,
          preferences: currentUser?.preferences,
        },
      });

      const { error, data } = await success();

      if (error.value) {
        return $toasted.error(getErrorMessage(error.value));
      }

      if (file.value) {
        try {
          await addFile(data.value.id, file.value.id, 'fileTypes.other_file');
        } catch (error) {
          return $toasted.error(getErrorMessage(error));
        }
      }

      $toasted.success(t('~~Created bug successfully'));
      return emitter.emit('modal_component:close', 'phone_bug_modal');
    };

    async function handleFileUpload(fileList: File[]) {
      if (fileList.length === 0) {
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[fileList.length - 1]);
      formData.append('type_t', 'fileTypes.other_file');
      uploading.value = true;
      try {
        const result = await uploadFile(formData);
        file.value = result.data as CCUFileItem;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        uploading.value = false;
      }
    }

    return {
      bug,
      submitForm,
      form,
      uploading,
      handleFileUpload,
      file,
    };
  },
};
</script>
