<template>
    <div class="flex flex-col h-full">
        <div class="p-2 px-4">
            Filters {{filtersCount}}
        </div>
        <div class="applied-filters flex flex-wrap justify-start bg-gray-100 p-1 px-2">
            <template v-for="(value, key) in filters.fields">
                <tag :closeable="true" v-if="value" class="m-1" @closed="removeField(key)">{{key}}: {{value}}</tag>
            </template>
            <template v-for="(value, key) in filters.statuses">
                <tag :closeable="true" v-if="value" class="m-1" @closed="removeStatus(key)">{{key}}: {{value}}</tag>
            </template>
        </div>
        <div class="flex flex-grow h-full">
            <div class="w-1/4 border-r">
                <div @click="currentSection = 'general'" class="p-3 px-4 border-b cursor-pointer" :class="{'border-l-8 border-l-black': currentSection === 'general'}">General</div>
                <div class="p-3 px-4 border-b cursor-pointer">Personal Info</div>
                <div class="p-3 px-4 border-b cursor-pointer" @click="currentSection = 'work'" :class="{'border-l-8 border-l-black': currentSection === 'work'}">Work</div>
            </div>
            <div class="w-3/4 ml-4 mt-2 flex-grow" style="height: 450px; overflow:auto">
                <div v-if="currentSection === 'general'" class="flex flex-col">
                    <base-checkbox class="block m-0" v-model="filters.statuses['unclaimed']" @change="updateFilters">Unclaimed</base-checkbox>
                    <base-checkbox class="block m-0" v-model="filters.statuses['claimed_by_org']" @change="updateFilters">Claimed By My Organization</base-checkbox>
                    <base-checkbox class="block m-0" v-model="filters.statuses['reported_by_org']" @change="updateFilters">Reported By My Organization</base-checkbox>
                    <base-checkbox class="block m-0" v-model="filters.statuses['open']" @change="updateFilters">Open</base-checkbox>
                    <base-checkbox class="block m-0" v-model="filters.statuses['closed']" @change="updateFilters">Closed</base-checkbox>
                </div>
                <div v-if="currentSection === 'work'" :header="f.name_t" :key="f.key" v-for="f in incidentTypes" class="p-2 px-4 mb-2 bg-gray-100">
                    <div class="flex items-center justify-between">
                        <base-checkbox v-model="filters.fields[f.key]" @change="updateFilters">{{f.name_t}}</base-checkbox>
                        <font-awesome-icon class="cursor-pointer" v-if="filters.fields[f.key]" size="md" :icon="expanded[f.key] ? 'caret-up': 'caret-down'" @click="expandSection(f.key)"/>
                    </div>
                    <div v-if="expanded[f.key]">
                        <template v-for="field in getFieldsForType(f.key)">
                            <div :key="field.field_key" class="border-b py-3">
                                <template v-if="field.html_type === 'select'">
                                    <div class="font-bold">
                                        {{field.label_t}}
                                    </div>
                                    <div>
                                    <a-row>
                                        <a-col :span="8"  v-if="Boolean(option.value)" :key="option.value" v-for="option in field.values">
                                            <base-checkbox :value="option.value">
                                                {{option.name_t}}
                                            </base-checkbox>
                                        </a-col>
                                    </a-row>
                                    </div>
                                </template>
                                <template v-if="field.html_type === 'multiselect'">
                                    <div class="font-bold">
                                        {{field.label_t}}
                                    </div>
                                    <div>
                                        <a-row>
                                            <a-col :span="8"  v-if="Boolean(option.value)" :key="option.value" v-for="option in field.values">
                                                <base-checkbox :value="option.value" >
                                                    {{option.name_t}}
                                                </base-checkbox>
                                            </a-col>
                                        </a-row>
                                    </div>
                                </template>
                                <template v-if="field.html_type === 'checkbox'">
                                    <div class="flex">
                                        <span class="font-bold w-1/2">
                                        {{field.label_t}}
                                        </span>
                                        <div class="flex justify-around w-1/2">
                                            <base-checkbox>Yes</base-checkbox>
                                            <base-checkbox>No</base-checkbox>
                                            <base-checkbox>Maybe</base-checkbox>
                                        </div>
                                    </div>
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
            incident: Object,
            filters: Object
        },
        mounted() {
          for (let type of this.incidentTypes) {
              this.filters.sub_fields[type.key] = {};
          }
        },
        data() {
          return {
              currentSection: 'general',
              expanded: {

              }
          }
        },
        methods: {
            updateFilters() {
                this.$emit('updatedFilters', {
                    fields: { ...this.filters.fields },
                    statuses: { ...this.filters.statuses }
                })

                for (let [key, value] of Object.entries(this.filters.fields)) {
                    if (!value) {
                        this.expanded[key] = false;
                    }
                }
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
            removeField(key) {
                delete this.filters.fields[key];
                this.updateFilters()
            },
            removeStatus(key) {
                delete this.filters.statuses[key];
                this.updateFilters()
            }
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
            },
            filtersCount() {
                return Object.keys(this.filters.fields).length + Object.keys(this.filters.statuses).length
            }
        }
    }
</script>

<style scoped>

</style>