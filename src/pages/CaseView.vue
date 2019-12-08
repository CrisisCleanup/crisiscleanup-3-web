<template>
    <div class="bg-white flex flex-col h-full">
        <div class="p-3 flex-grow intake-view">
            <div class="my-4">
                <label v-if="worksite.notes.length > 0" class="my-1 text-xs font-bold text-gray-600 block">Notes</label>
                <div :key="note.id" v-for="note in worksite.notes" class="notes my-1 p-1 flex items-center">
                    <span class="text-gray-600 mr-3 notes-time">{{ note.created_at | moment("from", "now") }}:</span><span class="font-hairline">{{note.note}}</span>
                </div>
                <base-button v-if="!addingNotes" class="my-1" type="link" text="+ Add Note" :action="() => { this.addingNotes = true }"></base-button>
                <div v-if="addingNotes">
                    Note
                    <a-textarea rows="4" v-model="currentNote"/>
                    <div class="flex items-center justify-between">
                        <base-button class="my-1" type="bare" text="Cancel" :action="cancelNote"></base-button>
                        <base-button class="my-1" type="link" text="Save" :action="saveNote"></base-button>
                    </div>
                </div>
            </div>
            <div class="my-4">
                <label class="my-1 text-xs font-bold text-gray-600 block">Full Address</label>
                <div>{{worksiteAddress}}</div>
            </div>
            <div class="my-4" v-if="Object.keys(workTypesClaimedByOthers).length > 0">
                <label class="my-1 text-xs font-bold text-gray-600 block">Claimed By</label>
                <div v-for="organization in Object.keys(workTypesClaimedByOthers)" class="my-1">{{getOrganizationName(organization)}}</div>
            </div>

            <div class="my-4 border-t">
                <div v-if="Object.keys(workTypesClaimedByOthers).length > 0" class="my-4">
                    <div v-for="(work_types, organization) in workTypesClaimedByOthers">
                    <label class="my-4 text-xs font-bold text-gray-600">Claimed By {{getOrganizationName(organization)}}</label>
                        <template v-for="work_type in work_types">
                            <div :key="work_type.id" class="work_type_section">
                                <span class="text-sm">{{work_type.work_type | getWorkTypeName}}</span>
                                <StatusDropDown class="block" :default-value="work_type.status" :on-select="(value) => {statusValueChange(value, work_type)}"/>
                                <base-button type="link" :action="() => { return requestWorkType(work_type) }" text="Request" class="ml-2 p-1 px-3 text-xs"/>
                            </div>
                        </template>

                    </div>
                </div>
                <div v-if="workTypesClaimedByOrganization.length > 0" class="my-4">
                    <label class="my-4 text-xs font-bold text-gray-600">Claimed By My Organization</label>
                    <template v-for="work_type in workTypesClaimedByOrganization">
                        <div :key="work_type.id" class="work_type_section">
                            <span class="text-sm">{{work_type.work_type | getWorkTypeName}}</span>
                            <StatusDropDown class="block" :default-value="work_type.status" :on-select="(value) => {statusValueChange(value, work_type)}" />
                            <base-button type="primary" :action="() => { return unclaimWorkType(work_type) }" text="Unclaim" class="ml-2 p-1 px-3 text-xs"/>
                        </div>
                    </template>
                </div>
                <div v-if="workTypesUnclaimed.length > 0" class="my-4">
                    <label class="my-4 text-xs font-bold text-gray-600">Unclaimed Work Types</label>
                    <template v-for="work_type in workTypesUnclaimed">
                        <div :key="work_type.id" class="work_type_section">
                            <span class="text-sm">{{work_type.work_type | getWorkTypeName}}</span>
                            <StatusDropDown class="block" :default-value="work_type.status" :on-select="(value) => {statusValueChange(value, work_type)}" />
                            <base-button type="primary" :action="() => { return claimWorkType(work_type) }" text="Claim" class="ml-2 p-1 px-3 text-xs" />

                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="bg-white p-3 border border-r-0 border-gray-300 card-footer flex justify-center items-center">
            <base-button v-if="workTypesClaimedByOrganization.length > 0" size="medium" class="m-1 text-black p-3 px-4 border-2 border-black"
                         text="Unclaim" :action="() => { return unclaimWorkType() }"></base-button>
            <base-button v-if="workTypesUnclaimed.length > 0" size="medium" type="primary" class="m-1 text-black p-3 px-4"
                         text="Claim" :action="() => { return claimWorkType() }"></base-button>
            <base-button v-if="Object.keys(workTypesClaimedByOthers).length > 0" size="medium" class="m-1 text-black p-3 px-4 border-2 border-black"
                         text="Request" :action="() => { return requestWorkType() }"></base-button>
            <base-button size="medium" type="primary" class="m-1 text-black p-3 px-4" text="Done" :action="() => { $emit('closeWorksite') }"></base-button>
        </div>
    </div>
</template>

<script>
    import {getErrorMessage} from "@/utils/errors";
    import StatusDropDown from "@/components/StatusDropDown"
    import User from "@/models/User";
    import Worksite from "@/models/Worksite";
    import {groupBy} from "@/utils/array";
    import Organization from "@/models/Organization";

    export default {
    name: 'CaseView',
    components: {StatusDropDown},
    props: {
        worksite: Object,
    },
    data() {
        return {
            addingNotes: false,
            currentNote: ''
        }
    },
    computed: {
        workTypesClaimedByOrganization() {
            return this.worksite.work_types.filter(type => type.claimed_by === this.currentUser.organization.id)
        },
        workTypesClaimedByOthers() {
            let list = this.worksite.work_types.filter(type => type.claimed_by && type.claimed_by !== this.currentUser.organization.id);
            return groupBy(list, 'claimed_by')
        },
        workTypesUnclaimed() {
            return this.worksite.work_types.filter(type => type.claimed_by === null)
        },
        worksiteAddress() {
            if (this.worksite) {
                let {address, city, state, postal_code} = this.worksite;
                return `${address}, ${city}, ${state} ${postal_code}`
            }
            return ''
        },
        currentUser() {
            return User.find(this.$store.getters['auth/userId'])
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
                this.$emit('changed')
            } catch (error) {
                await this.$message.error(getErrorMessage(error));
            }
        },
        async unclaimWorkType(work_type) {
            try {
                let work_types = [];
                if (work_type) {
                    work_types.push(work_type.work_type)
                }
                await Worksite.api().unclaimWorksite(this.worksite.id, work_types);
                this.$emit('changed')
            } catch (error) {
                await this.$message.error(getErrorMessage(error));
            }
        },
        async requestWorkType(work_type) {
            try {
                let work_types = [];
                if (work_type) {
                    work_types.push(work_type.work_type)
                }
                await Worksite.api().requestWorksite(this.worksite.id, work_types);
                this.$emit('changed')
            } catch (error) {
                await this.$message.error(getErrorMessage(error));
            }
        },
        async saveNote() {
            try {
                await Worksite.api().addNote(this.worksite.id, this.currentNote);
                await Worksite.api().fetchById(this.worksite.id);
                this.worksite = Worksite.find(this.worksite.id);
                this.addingNotes = false;
                this.currentNote = '';
                this.$emit('changed')
            } catch (error) {
                await this.$message.error(getErrorMessage(error));
            }
        },
        cancelNote() {
            this.addingNotes = false;
            this.currentNote = '';
        },
        getOrganizationName(id) {
            let organization = Organization.find(id);
            return organization.name
        },
        async statusValueChange(value, work_type) {
            try {
                await Worksite.api().updateWorkTypeStatus(work_type.id, value);
            } catch (error) {
                await this.$message.error(getErrorMessage(error));
            } finally {
                this.$emit('changed')
            }
        },

        getFieldsForType(work_type) {
            if (this.incident) {
                let available_fields = this.worksite.form_data.map(data => data.field_key);
                let fields = this.incident.form_fields.filter((field) => {
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

    .notes {
        background-color: rgba(216, 216, 216, 0.15);
    }
    .notes-time {
        color: #848F99;
    }

    .work_type_section {
        @apply border-b py-4;
        display: grid;
        grid-template-columns: 1fr 2fr 0.5fr;
        justify-items: start;
        align-items: center;
    }
</style>
