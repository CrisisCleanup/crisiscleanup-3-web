<template>
    <div class="bg-white flex flex-col h-full">
        <div class="p-3 flex-grow intake-view">
            <div class="my-4">
                <label class="my-1 text-xs font-bold text-gray-600 block">Notes</label>
                <div class="bg-gray-200 flex justify-center">
                    <span>1 day ago: Neighbour will help with cleaning</span>
                </div>
                <BaseButton class="my-1" type="link" title="+ Add Note"></BaseButton>
            </div>
            <div class="my-4">
                <label class="my-1 text-xs font-bold text-gray-600 block">Full Address</label>
                <div>{{worksiteAddress}}</div>
            </div>

            <div class="my-4 border-t">
                <div v-if="Object.keys(workTypesClaimedByOthers).length > 0" class="my-4">
                    <div v-for="(work_types, organization) in workTypesClaimedByOthers">
                    <label class="my-4 text-xs font-bold text-gray-600">Claimed By {{getOrganizationName(organization)}}</label>
                        <template v-for="work_type in work_types">
                            <div :key="work_type.id" class="border-b py-4 flex justify-between items-center">
                                {{getWorkTypeName(work_type.work_type)}}
                                <div class="flex items-center">
                                    <StatusDropDown class="block" :default-value="work_type.status"
                                                        :on-select="(value) => {statusValueChange(value, work_type)}"></StatusDropDown>
                                        <BaseButton type="link" :action="() => { return requestWorkType(work_type) }"
                                                    title="Request" class="ml-2 p-1 px-2"></BaseButton>
                                </div>
                            </div>
                        </template>

                    </div>
                </div>
                <div v-if="workTypesClaimedByOrganization.length > 0" class="my-4">
                    <label class="my-4 text-xs font-bold text-gray-600">Claimed By My Organization</label>
                    <template v-for="work_type in workTypesClaimedByOrganization">
                        <div :key="work_type.id" class="border-b py-4 flex justify-between items-center">
                            {{getWorkTypeName(work_type.work_type)}}
                            <div class="flex items-center">
                                <StatusDropDown class="block" :default-value="work_type.status"
                                                    :on-select="(value) => {statusValueChange(value, work_type)}"></StatusDropDown>
                                    <BaseButton type="primary" :action="() => { return unclaimWorkType(work_type) }"
                                                title="Unclaim" class="ml-2 p-1 px-2"></BaseButton>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-if="workTypesUnclaimed.length > 0" class="my-4">
                    <label class="my-4 text-xs font-bold text-gray-600">Unclaimed Work Types</label>
                    <template v-for="work_type in workTypesUnclaimed">
                        <div :key="work_type.id" class="border-b py-4 flex justify-between items-center">
                            {{getWorkTypeName(work_type.work_type)}}
                            <div class="flex items-center">
                                <StatusDropDown class="block" :default-value="work_type.status"
                                                :on-select="(value) => {statusValueChange(value, work_type)}"></StatusDropDown>
                                <BaseButton type="primary" :action="() => { return claimWorkType(work_type) }"
                                            title="Claim" class="ml-2 p-1 px-2"></BaseButton>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="bg-white p-3 border border-r-0 border-gray-300 card-footer flex justify-between">
            <BaseButton size="medium" class="flex-grow m-1 text-black p-2 border-2 border-black" title="Unclaim" :action="() => { return unclaimWorkType() }"></BaseButton>
            <BaseButton size="medium" type="primary" class="flex-grow m-1 text-black p-2" title="Claim" :action="() => { return claimWorkType() }"></BaseButton>
        </div>
    </div>
</template>

<script>
    import StatusDropDown from "@/components/StatusDropDown"
    import User from "@/models/User";
    import Worksite from "@/models/Worksite";
    import WorkType from "@/models/WorkType";
    import BaseButton from "@/components/BaseButton";
    import { groupBy } from "@/utils/array";
    import Organization from "@/models/Organization";

    export default {
        name: 'CaseView',
        components: {BaseButton, StatusDropDown },
        props: {
            worksite: Object,
        },
        computed: {
            workTypesClaimedByOrganization() {
                return this.worksite.work_types.filter(type => type.claimed_by === this.currentUser.organization.id)
            },
            workTypesClaimedByOthers() {
                let list = this.worksite.work_types.filter(type => type.claimed_by && type.claimed_by !== this.currentUser.organization.id);
                let group = groupBy(list, 'claimed_by');
                return group
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
                try {
                    let work_types = [];
                    if (work_type) {
                        work_types.push(work_type.work_type)
                    }
                    await Worksite.api().claimWorksite(this.worksite.id, work_types);
                    let worksite = await Worksite.api().fetchById(this.worksite.id);
                    this.worksite = worksite.entities.worksites[0];
                } catch (error) {
                    await this.$message.error(error.response.data.errors[0].message[0]);
                }
            },
            async unclaimWorkType(work_type) {
                try {
                    let work_types = [];
                    if (work_type) {
                        work_types.push(work_type.work_type)
                    }
                    await Worksite.api().unclaimWorksite(this.worksite.id, work_types);
                    let worksite = await Worksite.api().fetchById(this.worksite.id);
                    this.worksite = worksite.entities.worksites[0];
                } catch (error) {
                    await this.$message.error(error.response.data.errors[0].message[0]);
                }
            },
            async requestWorkType(work_type) {
                try {
                    let work_types = [];
                    if (work_type) {
                        work_types.push(work_type.work_type)
                    }
                    await Worksite.api().requestWorksite(this.worksite.id, work_types);
                    let worksite = await Worksite.api().fetchById(this.worksite.id);
                    this.worksite = worksite.entities.worksites[0];
                } catch (error) {
                    await this.$message.error(error.response.data.errors[0].message[0]);
                }
            },
            getWorkTypeName(work_type) {
                let work_types = WorkType.query().where('key', work_type).get();
                return work_types[0].name_t
            },
            getOrganizationName(id) {
                let organization = Organization.find(id);
                return organization.name
            },
            statusValueChange(value, work_type) {
                alert(value + JSON.stringify(work_type))
            },

            getFieldsForType(work_type) {
                if (this.incident) {
                    let available_fields = this.worksite.form_data.map(data => data.field_key);
                    let fields = this.incident.form_fields.filter((field)=> {
                        let parent = this.incident.form_fields.find((element) => {
                            return element.field_key === field.field_parent_key;
                        });

                        let if_selected_then_work_type = field.if_selected_then_work_type;
                        if (parent) {
                            if_selected_then_work_type = parent.if_selected_then_work_type
                        }

                        return if_selected_then_work_type === work_type && available_fields.includes(field.field_key) && field.html_type === 'checkbox';
                    });
                    return fields
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
