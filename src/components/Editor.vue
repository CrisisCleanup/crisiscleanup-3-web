<template>
  <div>
    <div ref="editor"></div>
    <input
      type="file"
      id="getFile"
      class="hidden"
      @change="handleFileUpload($event)"
    />
  </div>
</template>

<script lang="ts">
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import { ref, defineComponent, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { getErrorMessage } from '../utils/errors';

export default defineComponent({
  name: 'Editor',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },

  setup(props, context) {
    const { t } = useI18n();
    const $toasted = useToast();

    const uploading = ref(false);
    const quillEditor = ref<Quill | null>(null);
    const editor = ref(null);

    async function handleFileUpload(e) {
      const fileList = e.target.files;
      if (fileList.length === 0) {
        uploading.value = false;
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[fileList.length - 1]);
      formData.append('type_t', 'fileTypes.other_file');
      uploading.value = true;
      try {
        const result = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        await $toasted.success(t('info.upload_file_successful'));
        document.querySelectorAll(
          '.ql-editor',
        )[0].innerHTML += `<img src="${result.data.blog_url}" alt="${result.data.filename}"/>`;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        uploading.value = false;
      }
    }
    function update() {
      if (quillEditor.value) {
        context.emit(
          'update:modelValue',
          quillEditor.value.getText() ? quillEditor.value.root.innerHTML : '',
        );
      }
    }

    onMounted(() => {
      quillEditor.value = new Quill(editor.value, {
        modules: {
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ header: 1 }, { header: 2 }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ script: 'sub' }, { script: 'super' }],
              [{ indent: '-1' }, { indent: '+1' }],
              [{ direction: 'rtl' }],
              [{ size: ['small', !1, 'large', 'huge'] }],
              [{ header: [1, 2, 3, 4, 5, 6, !1] }],
              [{ color: [] }, { background: [] }],
              [{ font: [] }],
              [{ align: [] }],
              ['clean'],
              ['link', 'image', 'video'],
            ],
          },
        },
        theme: 'snow',
        formats: ['bold', 'underline', 'header', 'italic'],
        placeholder: 'Type something in here!',
      });

      quillEditor.value.root.innerHTML = props.modelValue;
      quillEditor.value.getModule('toolbar').addHandler('image', () => {
        document?.getElementById('getFile')?.click();
      });
      quillEditor.value.on('text-change', () => update());
    });

    return {
      uploading,
      quillEditor,
      editor,
      handleFileUpload,
      update,
    };
  },
});
</script>

<style scoped></style>
