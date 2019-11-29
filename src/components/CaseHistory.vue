<template>
    <div class="bg-white flex flex-col h-full">
        <div class="p-3 flex-grow intake-view">
            <div class="my-4" v-if="worksite.work_types.filter(work_type => Boolean(work_type.claimed_by)).length > 0">
                <label class="my-1 text-xs font-bold text-gray-600 block">Claimed By</label>
                <div v-for="work_type in worksite.work_types.filter(work_type => Boolean(work_type.claimed_by))" class="my-1">{{getOrganizationName(work_type.claimed_by)}}</div>
            </div>
            <div class="text-xs">
                <div v-for="(events, user) in users" class="py-1">
                    {{getUserName(user)}} made {{events.length}} edits
                    <div v-for="event in events">
                        {{ event.created_at | moment("MM/DD/YYYY, h:mm:ss A") }}: {{event.event_key}}
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-white p-3 border border-r-0 border-gray-300 card-footer flex justify-center items-center">
            <base-button size="medium" type="primary" class="m-1 text-black p-3 px-4" text="Done"
                         :action="() => { $emit('closeWorksite') }"/>
        </div>
    </div>
</template>

<script>
import User from "@/models/User";
import Organization from "@/models/Organization";
import {groupBy} from "@/utils/array";

export default {
    name: 'CaseHistory',
    props: {
        worksite: Object,
    },
    data() {
        return {

        }
    },
    computed: {
        currentUser() {
            return User.find(this.$store.getters['auth/userId'])
        },
        users() {
            return groupBy(this.worksite.events, 'user')
        },
    },
    methods: {
        getOrganizationName(id) {
            let organization = Organization.find(id);
            return organization.name
        },
        getUserName(id) {
            let user = User.find(id);
            return user.full_name;
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
