<template>
    <modal v-if="true" modal-classes="bg-white max-w-2xl shadow" modal-style="min-height: 60%">
        <div class="flex flex-col h-full">
            <div class="p-2 px-4">
                Filters <span class="rounded-full px-1 bg-yellow-500 text-xs" v-if="filtersCount > 0">{{filtersCount}}</span>
            </div>
            <div class="flex items-center justify-between bg-gray-100 p-1 px-2">
                <div class="applied-filters flex flex-wrap justify-start bg-gray-100">
                    <template v-for="(value, key) in filters.fields">
                        <tag :key="key" :closeable="true" v-if="value" class="m-1" @closed="removeField(key)">
                            Work Type: {{key | getWorkTypeName}}
                        </tag>
                    </template>
                    <template v-for="(value, key) in filters.statuses">
                        <tag :key="key" :closeable="true" v-if="value" class="m-1" @closed="removeStatus(key)">
                            Status: {{key | snakeToTitleCase}}
                        </tag>
                    </template>
                </div>
                <div v-if="filtersCount > 0">
                    <base-button type="bare" class="text-yellow-500 text-underline w-32" :action="clearAllFilters">
                        Clear all filters
                    </base-button>
                </div>
            </div>

            <div class="flex flex-grow h-full">
                <div class="w-1/4 border-r">
                    <div @click="currentSection = 'general'" class="p-3 px-4 border-b cursor-pointer" :class="{'border-l-8 border-l-black': currentSection === 'general'}">
                        General <span class="rounded-full px-1 bg-black text-white text-xs" v-if="statusCount > 0">{{statusCount}}</span>
                    </div>
                    <div class="p-3 px-4 border-b cursor-pointer">
                        Personal Info
                    </div>
                    <div class="p-3 px-4 border-b cursor-pointer" @click="currentSection = 'work'" :class="{'border-l-8 border-l-black': currentSection === 'work'}">
                        Work <span class="rounded-full px-1 bg-black text-white text-xs" v-if="fieldsCount > 0">{{fieldsCount}}</span>
                    </div>
                </div>
                <div class="w-3/4 ml-4 mt-2 flex-grow" style="height: 450px; overflow:auto">
                    <div v-if="currentSection === 'general'" class="flex flex-col">
                        <base-checkbox class="block my-1" v-model="filters.statuses['unclaimed']">Unclaimed</base-checkbox>
                        <base-checkbox class="block my-1" v-model="filters.statuses['claimed_by_org']">Claimed By My Organization</base-checkbox>
                        <base-checkbox class="block my-1" v-model="filters.statuses['reported_by_org']">Reported By My Organization</base-checkbox>
                        <base-checkbox class="block my-1" v-model="filters.statuses['open']">Open</base-checkbox>
                        <base-checkbox class="block my-1" v-model="filters.statuses['closed']">Closed</base-checkbox>
                    </div>
                    <template v-if="currentSection === 'work'">
                        <div :header="f.name_t" :key="f.key" v-for="f in incidentTypes"
                             class="p-2 px-4 mb-2 bg-gray-100">
                            <div class="flex items-center justify-between">
                                <base-checkbox v-model="filters.fields[f.key]">{{f.name_t}}</base-checkbox>
                                <font-awesome-icon class="cursor-pointer" v-if="filters.fields[f.key]" size="md"
                                                   :icon="expanded[f.key] ? 'caret-up': 'caret-down'"
                                                   @click="expandSection(f.key)"/>
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
                                                    <a-col :span="8" v-if="Boolean(option.value)" :key="option.value"
                                                           v-for="option in field.values">
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
                                                    <a-col :span="8" v-if="Boolean(option.value)" :key="option.value"
                                                           v-for="option in field.values">
                                                        <base-checkbox :value="option.value">
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
                    </template>
                </div>
            </div>
        </div>
        <div slot="footer" class="flex items-center justify-center p-2 bg-white border-t">
            <base-button text="Cancel" size="medium" class="m-1 border-2 border-black px-6 py-2" :action="() => { $emit('closedFilters') }"/>
            <base-button text="Apply Filters" size="medium" class="m-1 p-3 px-6" type="primary" :action="updateFilters"/>
        </div>
    </modal>
</template>

<script>
    import WorkType from "@/models/WorkType";

    export default {
        name: "WorksiteFilters",
        props: {
            incident: Object,
            currentFilters: Object
        },
        created() {
            this.filters = {
                fields: { ...this.currentFilters.fields },
                statuses: { ...this.currentFilters.statuses },
                sub_fields: {},
            }
        },
        mounted() {
          for (let type of this.incidentTypes) {
              this.filters.sub_fields[type.key] = {};
          }
        },
        data() {
          return {
              filters: {
                  fields: {},
                  statuses: {},
                  sub_fields: {},
              },
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
            },
            removeStatus(key) {
                delete this.filters.statuses[key];
            },
            clearAllFilters() {
                this.filters = {
                    fields: {},
                    statuses: {},
                    sub_fields: {},
                }
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
            fieldsCount() {
                return Object.values(this.filters.fields).filter(field => Boolean(field)).length
            },
            statusCount() {
                return Object.values(this.filters.statuses).filter(field => Boolean(field)).length
            },
            filtersCount() {
                return this.fieldsCount + this.statusCount
            }
        }
    }
</script>

<style scoped>

</style>