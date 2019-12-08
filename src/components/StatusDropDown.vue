<template>
    <v-popover popoverClass="status-dropdown" placement="bottom-end" class="text-xs">
        <div class="badge-holder rounded-lg px-2" :style="dropdownStyle">
            <div>{{defaultValue | getStatusName}}</div>
            <font-awesome-icon class="mx-1" size='sm' icon='chevron-down'/>
        </div>
        <div slot="popover" class="bg-white border outline-none h-64 overflow-auto">
            <div :key="status.status" v-for="status in statuses" :value="status.status" class="cursor-pointer py-1 hover:bg-gray-100">
                <div class="badge-holder text-xs" @click="() => { onSelect(status.status) }">
                    <badge class="mx-1" :color="getColorForStatus(status.status)"/>
                    <div>{{status.status_name_t}}</div>
                </div>
            </div>
        </div>
    </v-popover>
</template>

<script>
    import Status from "@/models/Status";
    import { getColorForStatus } from "@/filters";
    export default {
        name: "StatusDropDown",
        props: {
            onSelect: Function,
            defaultValue: String,
        },
        data() {
          return {
              getColorForStatus
          }
        },
        computed: {
            statuses () {
                return Status.all()
            },
            dropdownStyle() {
                return {
                    color: getColorForStatus(this.defaultValue),
                    backgroundColor: `${getColorForStatus(this.defaultValue)}3D`,
                }
            }
        }
    }
</script>

<style scoped>
    .badge-holder {
        @apply flex items-center cursor-pointer
    }

    .status-dropdown {
        @apply text-xs outline-none !important;
    }
</style>