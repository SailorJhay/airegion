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
<div class="flex justify-between items-center py-2 border-b border-sea max-w-screen-md bg-dark z-30 text-white">
    <button on:click={() =>goto(`/`)}>
        <img class="ml-8 h-8 hover:fill-black fill-pink" src="/logo.svg"/>
    </button>
    <!--Toggle button only display on sm-->
    <button class="sm:hidden flex mr-[20px]" on:click={()=>{navMenu = !navMenu}}>
        <svg class="h-6"  viewBox="0 -2 28 28">
            <path class="fill-white" d="m2.61 0h22.431c1.441 0 2.61 1.168 2.61 2.61s-1.168 2.61-2.61 2.61h-22.431c-1.441 0-2.61-1.168-2.61-2.61s1.168-2.61 2.61-2.61z"/>
            <path class="fill-white" d="m2.61 9.39h22.431c1.441 0 2.61 1.168 2.61 2.61s-1.168 2.61-2.61 2.61h-22.431c-1.441 0-2.61-1.168-2.61-2.61s1.168-2.61 2.61-2.61z"/>
            <path class="fill-white" d="m2.61 18.781h22.431c1.441 0 2.61 1.168 2.61 2.61s-1.168 2.61-2.61 2.61h-22.431c-1.441 0-2.61-1.168-2.61-2.61s1.168-2.61 2.61-2.61z"/>
        </svg>
    </button>
    <!--Other-->
    <div class="sm:flex hidden gap-10 mx-4">
        <button class="sm:flex hidden font-semibold hover:text-sea text-darkGray"  on:click={() =>window.open(`/test`)}>
            Try demo
        </button>
        <button class="sm:flex hidden font-semibold hover:text-sea text-darkGray" on:click={() =>goto(`/pricing`)}>
            Pricing
        </button>
        {#if isLogin}
            <button class="sm:flex hidden font-semibold hover:text-sea text-darkGray" on:click={() =>goto(`/control`)}>
                Account
            </button>
        {:else}
            <button class="sm:flex hidden font-semibold hover:text-sea text-darkGray" on:click={() =>goto(`/login`)}>
                Login
            </button>
        {/if}
    </div>
</div>

<!--Mobile Nav menu-->
{#if navMenu}
    <div class="absolute fixed font-semibold flex flex-col inset-0 bg-black text-white bg-opacity-60 z-20" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
        <div class="flex flex-col ">   
            <button class="px-2 bg-lightDark flex text-xl py-1 mt-[50px] flex justify-center "  on:click={() =>window.open(`/test`)} in:fade={{ duration: 400 }} out:fade={{ duration: 400 }}>
                Try demo
            </button>
            <button class="flex bg-lightDark text-xl py-1 flex justify-center " on:click={() =>goto(`/pricing`)} in:fade={{ duration: 500 }} out:fade={{ duration: 500 }}>
                Pricing
            </button>
            {#if isLogin}
                <button class="bg-lightDark text-sea flex text-xl py-1 flex justify-center " on:click={() =>goto(`/control`)} in:fade={{ duration: 600 }} out:fade={{ duration: 600 }}>
                    Account
                </button>
            {:else}
                <button class="bg-lightDark text-sea flex text-xl py-1 flex justify-center " on:click={() =>goto(`/login`)} in:fade={{ duration: 600 }} out:fade={{ duration: 600 }}>
                    Login
                </button>
            {/if}
        </div> 
    </div>
{/if}