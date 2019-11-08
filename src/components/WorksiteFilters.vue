<template>
    <div>
        <div>
            Filters
        </div>
        <div class="flex">
            <div class="w-full">
                <div :header="f.name_t" :key="f.key" v-for="f in incidentTypes" class="p-4 my-2 border">
                    <div class="flex items-center justify-between">
                        <a-checkbox v-model="fields[f.key]" @change="updateFilters">{{f.name_t}}</a-checkbox>
                        <font-awesome-icon class="cursor-pointer" v-if="fields[f.key]" size="md" :icon="expanded[f.key] ? 'caret-up': 'caret-down'" @click="expandSection(f.key)"/>
                    </div>
                    <div v-if="expanded[f.key]">
                        <template v-for="field in getFieldsForType(f.key)">
                            <div :key="field.field_key" class="border-b py-3">
                                <template v-if="field.html_type === 'select'">
                                    <div class="font-bold">
                                        {{field.label_t}}
                                    </div>
                                    <div>
                                        <a-checkbox-group @change="(values) => { setSubFields(f.key, field.field_key, values) }">
                                            <a-row>
                                                <a-col :span="8"  v-if="Boolean(option.value)" :key="option.value" v-for="option in field.values">
                                                    <a-checkbox :value="option.value">
                                                        {{option.name_t}}
                                                    </a-checkbox>
                                                </a-col>
                                            </a-row>
                                        </a-checkbox-group>

                                    </div>
                                </template>
                                <template v-if="field.html_type === 'multiselect'">
                                    <div class="font-bold">
                                        {{field.label_t}}
                                    </div>
                                    <div>
                                        <a-checkbox-group>
                                            <a-row>
                                                <a-col :span="8"  v-if="Boolean(option.value)" :key="option.value" v-for="option in field.values">
                                                    <a-checkbox :value="option.value" >
                                                        {{option.name_t}}
                                                    </a-checkbox>
                                                </a-col>
                                            </a-row>
                                        </a-checkbox-group>
                                    </div>
                                </template>
                                <template v-if="field.html_type === 'checkbox'">
                                    <div class="font-bold">
                                        {{field.label_t}}
                                    </div>
                                    <a-checkbox v-decorator="[`${field.field_key}`, { initialValue: false, valuePropName: 'checked' }]">Yes</a-checkbox>
                                    <a-checkbox v-decorator="[`${field.field_key}`, { initialValue: false, valuePropName: 'checked' }]">No</a-checkbox>
                                    <a-checkbox v-decorator="[`${field.field_key}`, { initialValue: false, valuePropName: 'checked' }]">Maybe</a-checkbox>
                                </template>
                            </div>
                        </template>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import WorkType from "@/models/WorkType";

    export default {
        name: "WorksiteFilters",
        props: {
            incident: Object
        },
        mounted() {
          for (let type of this.incidentTypes) {
              this.sub_fields[type.key] = {};
          }
        },
        data() {
          return {
              fields: {

              },
              sub_fields: {

              },
              expanded: {

              }
          }
        },
        methods: {
            updateFilters() {
                this.$emit('updatedFilters', { ...this.fields })
            },
            expandSection(key) {
                this.expanded[key] = !this.expanded[key];
                this.expanded = { ...this.expanded }
            },
            setSubFields(work_type, field, values) {
                this.sub_fields[work_type][field] = values
            },
            getFieldsForType(work_type) {
                if (this.incident && this.incident.form_fields) {
                    return this.incident.form_fields.filter((field)=> {
                        let parent = this.incident.form_fields.find((element) => {
                            return element.field_key === field.field_parent_key;
                        });

                        let if_selected_then_work_type = field.if_selected_then_work_type;
                        if (parent) {
                            if_selected_then_work_type = parent.if_selected_then_work_type
                        }
                        return if_selected_then_work_type === work_type;
                    })
                }
                return [];
            },
        },
        computed: {
            incidentTypes() {
                if (this.incident && this.incident.form_fields) {
                    const fieldsWithTypes =  this.incident.form_fields.filter((field)=> {
                        return Boolean(field.if_selected_then_work_type)
                    })

                    return new Set(fieldsWithTypes.map((field) => {
                        let work_types = WorkType.query().where('key', field.if_selected_then_work_type).get();
                        return work_types[0]
                    }))
                }
                return []
            }
        }
    }
</script>

<style scoped>

</style>