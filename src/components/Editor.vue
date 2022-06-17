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
import { ref, defineComponent, onMounted } from '@vue/composition-api';
import { getErrorMessage } from '@/utils/errors';
import usei18n from '@/use/usei18n';
import useHttp from '@/use/useHttp';
import useToasted from '@/use/useToasted';

export default defineComponent({
  name: 'Editor',
  props: {
    value: {
      type: String,
      default: '',
    },
  },

  setup(props, context) {
    const { $t } = usei18n();
    const { $http } = useHttp();
    const { $toasted } = useToasted();

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
        const result = await $http.post(
          `${process.env.VUE_APP_API_BASE_URL}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        await $toasted.success($t('info.upload_file_successful'));
        document.getElementsByClassName(
          'ql-editor',
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
          'input',
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

      quillEditor.value.root.innerHTML = props.value;
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
