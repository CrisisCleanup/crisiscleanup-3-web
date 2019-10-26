<template>
    <a-form :form="form" @submit="handleSubmit" layout="vertical" class="bg-white flex flex-col h-full">
        <div class="intake-form p-3 flex-grow">
            <template v-for="field in this.fields">
                <div :key="field.field_key" v-if="showAllFields || getValue(field.field_key)">
                    <template v-if="['h4'].includes(field.html_type)">
                        <component :is="field.html_type" :key="field.field_key"
                                   class="py-3 m-1 border-t border-b flex items-center justify-between">
                            <div class="flex items-center">
                                <a-badge :count="field.list_order" :numberStyle="{backgroundColor: '#FECE09', color: '#000000'}" class="mr-2"/>
                                {{field.label_t}}
                            </div>
                            <a-tooltip>
                                <template slot="title">
                                    <span v-html="field.help_t"></span>
                                </template>
                                <a-icon type="question-circle-o"/>
                            </a-tooltip>
                        </component>
                    </template>
                    <template v-if="['h5'].includes(field.html_type)">
                        <component :is="field.html_type" :key="field.field_key">
                            {{field.label_t}}
                        </component>
                    </template>
                    <template v-if="field.html_type === 'select'">
                        <a-form-item :key="field.field_key">
                          <span slot="label">
                            {{field.label_t}}
                            <a-tooltip>
                                <template slot="title">
                                    <span v-html="field.help_t"></span>
                                </template>
                              <a-icon type="question-circle-o"/>
                            </a-tooltip>
                          </span>
                            <a-select v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]" size="large">
                                <a-select-option :key="key" :value="key" v-for="(key, value) in field.values_default">
                                    {{value}}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'multiselect'">
                        <a-form-item :key="field.field_key">
                  <span slot="label">
                    {{field.label_t}}
                    <a-tooltip>
                        <template slot="title">
                            <span v-html="field.help_t"></span>
                        </template>
                      <a-icon type="question-circle-o"/>
                    </a-tooltip>
                  </span>
                            <a-select v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]" mode="multiple" size="large">
                                <a-select-option :key="key" :value="key" v-for="(key, value) in field.values_default">
                                    {{value}}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'text'">
                        <a-form-item :key="field.field_key">
                            <a-input v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]" size="large" :placeholder="field.placeholder_t">
                                <a-tooltip slot="addonAfter">
                                    <template slot="title">
                                        <span v-html="field.help_t"></span>
                                    </template>
                                    <a-icon type="question-circle-o"/>
                                </a-tooltip>
                            </a-input>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'suggest'">
                        <a-form-item :key="field.field_key">
                            <a-auto-complete :placeholder="field.placeholder_t" v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]">
                                <a-tooltip slot="addonAfter">
                                    <template slot="title">
                                        <span v-html="field.help_t"></span>
                                    </template>
                                    <a-icon type="question-circle-o"/>
                                </a-tooltip>
                            </a-auto-complete>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'textarea'">
                        <a-form-item :key="field.field_key">
                  <span slot="label">
                    {{field.label_t}}
                    <a-tooltip>
                        <template slot="title">
                            <span v-html="field.help_t"></span>
                        </template>
                      <a-icon type="question-circle-o"/>
                    </a-tooltip>
                  </span>
                            <a-textarea :placeholder="field.placeholder_t" rows="4" v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]"/>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'checkbox'">
                        <a-form-item :key="field.field_key">
                            <a-checkbox v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]">{{field.label_t}}</a-checkbox>
                            <a-tooltip>
                                <template slot="title">
                                    <span v-html="field.help_t"></span>
                                </template>
                                <a-icon type="question-circle-o"/>
                            </a-tooltip>
                        </a-form-item>
                    </template>
                </div>
            </template>
        </div>
        <div style="background-color: white" class="p-3 border border-r-0 border-gray-300 card-footer flex justify-between">
            <a-button size="large" class="flex-grow m-1" @click="resetForm">Reset</a-button>
            <a-button size="large" type="primary" class="flex-grow m-1 text-black">Save</a-button>
            <a-button size="large" type="primary" class="flex-grow m-1 text-black">Claim & Save</a-button>
        </div>
    </a-form>
</template>

<script>
    export default {
        props: {
            fields: Array,
            worksite: Object,
        },
        name: "CaseForm",
        methods: {
            handleSubmit() {

            },
            resetForm() {
                console.log(this.form.getFieldsValue())
            },
            getValue(field_key) {
                if (!this.worksite) {
                    return ''
                }

                let key = this.worksite.form_data.find((element) => {
                    return element.field_key === field_key;
                });
                if (key) {
                    return key['field_value']
                }
                return ''
            },
        },
        data() {
            return {
                form: this.$form.createForm(this),
                showAllFields: true,
                spinning: false,
            };
        }
    }
</script>

<style scoped>
    .ant-form-item {
        padding-top: 10px;
        margin: 0;
    }

    .intake-form {
        height: 600px;
        overflow: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .intake-form::-webkit-scrollbar { /* WebKit */
        width: 0;
        height: 0;
    }

    .card-footer {
        min-height: 80px;
    }

    h4 {
        font-size: 16px;
        font-weight: bold;
    }

    h5 {
        font-size: 12px;
        font-weight: bold;
    }
</style>