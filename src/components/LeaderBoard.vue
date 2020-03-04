<template>
 <div>
    <div class = 'mx-3 my-2 w-auto'>
     <div class='flex flex-row justify-between'>
     <h2 class='font-semibold text-base m-4'>Leaderboard</h2>
     <button type='button'>All Time</button>
     </div>
    </div>
    <div class='h-0 w-auto border' />
      <div class='flex flex-row justify-end text-xs mx-2 my-4'>
      <p class='opacity-1 mx-3'>intake</p>
      <p class='opacity-1'>Return</p>
     </div>
    <div class='flex flex-row justify-between content-center mx-1 my-1'>
    <div class='flex justify-between content-center px-2'>
    <img class='h-8 w-8 rounded-full mx-auto' src=""/>
    <div class='flex flex-col'>
       <p class='text-sm font-semibold justify-around' :userProfile = 'userProfile'>{{userProfile}}<font-awesome-icon class='' icon=''/></p>
       <div class='online flex flex-clumn'>{{userStatus}}</div>
       <p class='text-xs' :userGroup = 'userGroup'>{{userGroup}}</p>
    </div>
    </div>
    <div class='flex flex-row content-center'>
    <div class='mr-5' :intake = 'intake'>{{intake}}</div>
    <div class='mx-2' :Return = 'Return'>{{Return}}</div>
    </div>
    <div class='flex flex-row content-center'>
    </div>
   </div>
 </div>
</template>
<script>
export default { 
    name:'leaderBoard',
    props:{
        userProfile:{
            type: String,
            default:'Calvin Baker'
        },
        userStatus:{
            type: String,
            default:'online'
        },
        userGroup:{
            type: String,
            default: 'Frozen Titanium Simpletons'
        },
        intake:{
         type: Number,
         default: 56
        },
        Return:{
         type: Number,
         default: 144
        }
    }
}
</script>
<style scoped>
.online{
 color: #00A313;
}
.talking{
 color: #009BFF;
}
.offline{
 color: #ED4747;
}
.away{
 color: #F79820;
}
</style>