<script>
    import { fade } from 'svelte/transition'; 
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    let navMenu = false;

    let isLogin = false;

    onMount(() => {
        if (localStorage.username) {
            isLogin = true;
        }
    });
</script>
<!--Nav bar-->
<div class="flex justify-between items-center py-2 border-b border-sea z-30 bg-dark text-darkGray">
    <button on:click={() =>goto(`/`)}>
        <img src="/logo.svg" class="ml-8 h-8"/>
    </button>
    
    <!--PC screen size-->
    <div class="flex gap-[50px] sm:gap-20 md:mr-20 mr-10">
        <button class="sm:hidden flex" on:click={()=>{navMenu = !navMenu}}>
            <svg class="h-6 fill-white"  viewBox="0 -2 28 28">
                <path d="m2.61 0h22.431c1.441 0 2.61 1.168 2.61 2.61s-1.168 2.61-2.61 2.61h-22.431c-1.441 0-2.61-1.168-2.61-2.61s1.168-2.61 2.61-2.61z"/>
                <path d="m2.61 9.39h22.431c1.441 0 2.61 1.168 2.61 2.61s-1.168 2.61-2.61 2.61h-22.431c-1.441 0-2.61-1.168-2.61-2.61s1.168-2.61 2.61-2.61z"/>
                <path d="m2.61 18.781h22.431c1.441 0 2.61 1.168 2.61 2.61s-1.168 2.61-2.61 2.61h-22.431c-1.441 0-2.61-1.168-2.61-2.61s1.168-2.61 2.61-2.61z"/>
            </svg>
        </button>


        <button class="sm:flex hidden font-semibold text-darkGray hover:text-sea"  on:click={() =>window.open(`/test`)}>
            Try demo
        </button>
        <button class="sm:flex hidden font-semibold text-darkGray hover:text-sea" on:click={() =>goto(`/pricing`)}>
            Pricing
        </button>
        {#if isLogin}
            <button class="sm:flex hidden font-semibold text-darkGray hover:text-sea" on:click={() =>goto(`/control`)}>
                Account
            </button>
        {:else}
            <button class="sm:flex hidden font-semibold text-darkGray hover:text-sea" on:click={() =>goto(`/login`)}>
                Login
            </button>
        {/if}
    </div>
</div>
<!--Mobile Nav menu-->
{#if navMenu}
    <div class="absolute fixed font-semibold flex flex-col inset-0 bg-black bg-opacity-60 z-20 text-darkGray" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
        <button class="bg-lightDark flex text-xl py-1 bg-black mt-[50px] flex justify-center "  on:click={() =>window.open(`/test`)} in:fade={{ duration: 400 }} out:fade={{ duration: 400 }}>
            Try demo
        </button>
        <button class="bg-lightDark flex text-xl py-1 bg-black flex justify-center " on:click={() =>goto(`/pricing`)} in:fade={{ duration: 500 }} out:fade={{ duration: 500 }}>
            Pricing
        </button>
        {#if isLogin}
            <button class="bg-lightDark text-sea flex text-xl py-1 bg-black flex justify-center " on:click={() =>goto(`/control`)} in:fade={{ duration: 600 }} out:fade={{ duration: 600 }}>
                Account
            </button>
        {:else}
            <button class="bg-lightDark text-sea flex text-xl py-1 bg-black flex justify-center " on:click={() =>goto(`/login`)} in:fade={{ duration: 600 }} out:fade={{ duration: 600 }}>
                Login
            </button>
        {/if}
    </div>
{/if}