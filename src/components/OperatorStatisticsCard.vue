<template>
<div>
    <div class='bg-gray text-base font-semibold content-center m-2 p-2 h-8'>
    <header>My Statistics</header>
    </div>
    <div class='h-0 w-auto border shadow' />
    <div class='flex-col p-2'>
    <div class='justify-between flex flex-row my-2'>
    <p class='text-sm'> Calls I have received</p>   
    <div class='font-semifold' :calls_received = 'calls_received'>{{calls_received}}</div>
    </div>
     <div class='h-0 w-auto border shadow' />
    <div class='justify-between flex flex-row my-2'>
     <p class='text-sm'> Calls I have made </p>
     <div class='font-semifold' :call_made = 'calls_made'>{{calls_made}}</div>
    </div>
     <div class='h-0 w-auto border shadow' />
    <div class='justify-between flex flex-row my-2'>
     <p class='text-sm'> Total Login Time this week </p>
     <div class='font-semibold' :call_made = 'Total_logged_time'>{{Total_logged_time}}</div>
    </div>
     <div class='h-0 w-auto border shadow' />
    <div class='justify-between flex flex-row my-2'>
     <p class='text-sm'> Total Talk Time this week </p>
     <div class='font-semibold' :call_made = 'Total_Conversation_time'>{{Total_Conversation_time}}</div>
    </div>
    </div>
</div>
</template>
<script>
export default {
    name: 'OPstats',
    props:{
     calls_received:{
        type: Number,
        default: 47
     },
     calls_made:{
         type:Number,
         default: 312
     },
     Total_logged_time:{
         type: Object,
         default: '12:34:56'
     },
     Total_Conversation_time:{
         type: Object,
         default: '12:23:43'
     }
    }
}
</script>
<style scoped>

</style>