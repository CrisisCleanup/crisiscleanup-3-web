<template>
    <div class="bg-white flex flex-col h-full">
        <div class="p-3 flex-grow intake-view">
            <div class="my-2">
                <label class="my-2 text-xs font-bold">Notes</label>
                <div class="bg-gray-200 flex justify-center">
                    <span>1 day ago: Neighbour will help with cleaning</span>
                </div>
                <a-button type="link">
                    + Add Note
                </a-button>
            </div>
            <div class="my-2">
                <label class="my-2 text-xs font-bold">Full Address</label>
                <div>{{worksiteAddress}}</div>
            </div>
            <div class="my-2 border-t">
                <div v-if="workTypesClaimedByOthers.length > 0" class="my-2">
                    <label class="my-2 text-xs font-bold">Work Type Claimed By Another Organization</label>
                    <template v-for="work_type in workTypesClaimedByOthers">
                        <div :key="work_type.id" class="border-b py-4">
                            <StatusDropDown class="block mb-2" :default-value="work_type.status"
                                            :on-select="(value) => {alert(value)}"></StatusDropDown>
                            <p-check class="p-svg p-round p-bigger text-base my-2" color="warning">
                                <svg slot="extra" class="svg svg-icon" viewBox="0 0 20 20">
                                    <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                                          style="stroke: white;fill:white"></path>
                                </svg>
                                {{work_type.work_type_name_t}}
                            </p-check>
                            <div class="ml-6" v-for="type in getFieldsForType">
                                {{type.label_t}}
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="workTypesClaimedByOrganization.length > 0" class="my-2">
                    <label class="my-2 text-xs font-bold">Work Type Claimed By My Organization</label>
                    <template v-for="work_type in workTypesClaimedByOrganization">
                        <div :key="work_type.id" class="border-b py-4">
                            <StatusDropDown class="block mb-2" :default-value="work_type.status"
                                            :on-select="(value) => {alert(value)}"></StatusDropDown>
                            <p-check class="p-svg p-round p-bigger text-base my-2" color="warning">
                                <svg slot="extra" class="svg svg-icon" viewBox="0 0 20 20">
                                    <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                                          style="stroke: white;fill:white"></path>
                                </svg>
                                {{work_type.work_type_name_t}}
                            </p-check>
                            <div class="ml-6" v-for="type in getFieldsForType">
                                {{type.label_t}}
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="workTypesUnclaimed.length > 0" class="my-2">
                    <label class="my-2 text-xs font-bold">Work Type Unclaimed</label>
                    <template v-for="work_type in workTypesUnclaimed">
                        <div :key="work_type.id" class="border-b py-4">
                            <StatusDropDown class="block mb-2" :default-value="work_type.status"
                                            :on-select="(value) => {alert(value)}"></StatusDropDown>
                            <div class="flex justify-between">
                                <p-check class="p-svg p-round p-bigger text-base my-2" color="warning">
                                    <svg slot="extra" class="svg svg-icon" viewBox="0 0 20 20">
                                        <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z"
                                              style="stroke: white;fill:white"></path>
                                    </svg>
                                    {{work_type.work_type_name_t}}
                                </p-check>
                                <a-button type="primary" @click="claimWorkType(work_type)">I'll Do it</a-button>
                            </div>
                            <div class="ml-6" v-for="type in getFieldsForType">
                                {{type.label_t}}
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="bg-white p-3 border border-r-0 border-gray-300 card-footer flex justify-between">
            <a-button size="large" class="flex-grow m-1 text-black">Unclaim All</a-button>
            <a-button size="large" type="primary" class="flex-grow m-1 text-black">Done</a-button>
        </div>
    </div>
</template>

<script>
    import StatusDropDown from "@/components/StatusDropDown"
    import User from "@/models/User";
    import Worksite from "@/models/Worksite";

    export default {
        name: 'CaseView',
        components: { StatusDropDown },
        props: {
            worksite: Object,
        },
        computed: {
            workTypesClaimedByOrganization() {
                return this.worksite.work_types.filter(type => type.claimed_by === this.currentUser.organization.id)
            },
            workTypesClaimedByOthers() {
                return this.worksite.work_types.filter(type => type.claimed_by && type.claimed_by !== this.currentUser.organization.id)
            },
            workTypesUnclaimed() {
                return this.worksite.work_types.filter(type => type.claimed_by === null)
            },
            worksiteAddress() {
                if (this.worksite) {
                    let { address, city, state, postal_code} = this.worksite;
                    return `${address}, ${city}, ${state} ${postal_code}`
                }
                return ''
            },
            currentUser() {
                return User.query().first()
            },
        },
        methods: {
            async claimWorkType(work_type) {
                await Worksite.api().claimWorksite(this.worksite.id, [work_type.work_type]);
                let worksite = await Worksite.api().fetchById(this.worksite.id);
                this.worksite = worksite.entities.worksites[0];
            },
            getFieldsForType(work_type) {
                if (this.incident) {
                    let available_fields = this.worksite.form_data.map(data => data.field_key);
                    return this.incident.form_fields.filter((field)=> {
                        let parent = this.incident.form_fields.find((element) => {
                            return element.field_key === field.field_parent_key;
                        });

                        let if_selected_then_work_type = field.if_selected_then_work_type;
                        if (parent) {
                            if_selected_then_work_type = parent.if_selected_then_work_type
                        }

                        return if_selected_then_work_type === work_type && available_fields.includes(field.field_key) && field.html_type === 'checkbox';
                    })
                }
                return [];
            },
        }
    }
</script>

<style scoped>
    .intake-view {
        height: 600px;
        overflow: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .intake-view::-webkit-scrollbar { /* WebKit */
        width: 0;
        height: 0;
    }
</style>
