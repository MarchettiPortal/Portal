<template>
    <!-- Div Mãe -->
    <div class="w-full bg-red-700 border-b h-14 flex items-center px-4  ">
        <NavTitlePage/>
        <NavNotification/>
        <NavUserProfile/>

    </div>

</template>

<script lang="ts">
import NavNotification from './UI/Navbar/NavNotification.vue';
import NavUserProfile from './UI/Navbar/NavUserProfile.vue';
import NavTitlePage from './UI/Navbar/NavTitlePage.vue';

export default {
    components: {
        NavNotification,
        NavUserProfile,
        NavTitlePage,
    }
}
</script>