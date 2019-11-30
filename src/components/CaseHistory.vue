<template>
    <div class="bg-white flex flex-col h-full">
        <div class="p-3 flex-grow intake-view">

            <div class="my-4 pb-6 border-b">
                <span>
                    <strong>WARNING: DO NOT SHARE THIS INFORMATION WITH SURVIVORS (This has already been a problem).</strong>
                    This information is for internal coordination use only. If you are not a member of a volunteers organization, you may not tell them what to do, or when to deploy. If you don‘t follow these instructions, we will have to take away your nice things and use paper plates instead of china.
                </span>
            </div>
            <div class="my-4" v-if="worksite.work_types.filter(work_type => Boolean(work_type.claimed_by)).length > 0">
                <label class="my-1 text-xs font-bold text-gray-600 block">Claimed By</label>
                <div v-for="org in organizationsWithClaims" class="my-1">{{getOrganizationName(org)}}</div>
            </div>
            <div class="">
                <div v-for="(events, user) in users" class="py-5 border-b">
                    <span class="text-yellow-600">{{getUserName(user)}}</span> made {{events.length}} edits
                    <div v-for="event in events">
                        {{ event.created_at | moment("MM/DD/YYYY, h:mm:ss A") }}: {{event.event.event_name_t}}
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
        organizationsWithClaims() {
            const claimed_ids =  this.worksite.work_types.filter(work_type => Boolean(work_type.claimed_by)).map(work_type => work_type.claimed_by);
            const id_set = new Set(claimed_ids);
            return Array.from(id_set);
        }
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
