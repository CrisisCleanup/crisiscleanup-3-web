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

<script>
import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import { getErrorMessage } from '@/utils/errors';

export default {
  name: 'Editor',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      editor: null,
      uploading: false,
    };
  },
  methods: {
    async handleFileUpload(e) {
      const fileList = e.target.files;
      if (fileList.length === 0) {
        this.uploading = false;
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[fileList.length - 1]);
      formData.append('type_t', 'fileTypes.other_file');
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
        await this.$toasted.success(this.$t('info.upload_file_successful'));
        document.getElementsByClassName(
          'ql-editor',
        )[0].innerHTML += `<img src="${result.data.blog_url}" alt="${result.data.filename}"/>`;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.uploading = false;
      }
    },
    update() {
      this.$emit(
        'input',
        this.editor.getText() ? this.editor.root.innerHTML : '',
      );
    },
  },
  mounted() {
    this.editor = new Quill(this.$refs.editor, {
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

    this.editor.root.innerHTML = this.value;
    this.editor.getModule('toolbar').addHandler('image', () => {
      document.getElementById('getFile').click();
    });
    this.editor.on('text-change', () => this.update());
  },
};
</script>

<style scoped></style>
