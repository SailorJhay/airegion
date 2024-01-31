<script>
    import { page } from '$app/stores';
    import { getCode } from '$lib/embed.js'
    import { config } from '$lib/config.js'
    import { fade } from 'svelte/transition'; 
    import { goto } from '$app/navigation';
    import Footer from '../Footer.svelte'
    import NavBar2 from '../NavBar2.svelte'
    import { get } from 'svelte/store';
    import { onMount } from 'svelte';

    let errorCreateBotMessage = "";
    let displayIntegrate = false;
    let displayId = "";

    //load bot
    let fulfilled = false;

    //Check bot existed
    let customChatBotExisted = false;
    let customChatBotID = "";

    let customBotUsage = 0;
    let customBotLimit = 1500;
    let initialBotUsage = 0;

    let isAdmin = false;

    let username = "";
    let password = "";
    let authkey = "";

    onMount(() => {
        if (!localStorage.username) {
            goto("/../../login");
        }

        console.log(username, password, authkey);

        username = localStorage.username;
        password = localStorage.password;
        authkey = localStorage.authkey;

        console.log(username, password, authkey);

        (async function() {
            let errorMessage = "An unknown error occurred.";

            const response = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "listChatBots",
                    params: {
                        username,
                        password,
                        authkey
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (response.ok) {
                // Success
                const responseBody = await response.json();

                console.log(responseBody.payload.chatBots[0]);

                if (responseBody.payload.chatBots[0]) {
                    customChatBotExisted = true;
                    customChatBotID = responseBody.payload.chatBots[0];
                }

                await getInitialBotId();

                await verifyAdmin();

                [ customBotUsage, customBotLimit] = await getBotUsage(customChatBotID);
                [ initialBotUsage, ] = await getBotUsage(initialBotId);

                fulfilled = true;
            } else {
                // Fail
                const responseBody = await response.json();
            
                console.log(responseBody);

                if (responseBody.error && responseBody.error.message) {
                    errorMessage = responseBody.error.message;
                }

                console.log(errorMessage);

                // Lam gi day o day
            }
        })();
    });

    // Verify admin
    async function verifyAdmin() {
        let errorMessage = "An unknown error occurred.";

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "listChatBots",
                params: {
                    username,
                    password,
                    authkey
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            // Success
            const responseBody = await response.json();

            isAdmin = responseBody.payload.chatBots.includes(initialBotId);

            fulfilled = true;
        } else {
            // Fail
            const responseBody = await response.json();
        
            console.log(responseBody);

            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;
            }

            console.log(errorMessage);

            // Lam gi day o day
        }
    };

    //Load Initial bot
    let initialBotId = "";

    async function getInitialBotId() {
        let errorMessage = "An unknown error occurred.";

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "getInitialBotId",
                params: {}
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            // Success
            const responseBody = await response.json();

            initialBotId = responseBody.payload.id;
        } else {
            // Fail
            const responseBody = await response.json();
        
            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;   
            }

            console.log(errorMessage);
        }
    }

    // get bot info
    async function getBotUsage(assistantID) {
        console.log(assistantID);

        let errorMessage = "An unknown error occurred.";

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "getChatBotInfo",
                params: {
                    assistantID
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            // Success
            const responseBody = await response.json();

            return [ responseBody.payload.usage, responseBody.payload.limit ];
        } else {
            // Fail
            const responseBody = await response.json();
        
            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;   
            }

            console.log(errorMessage);

            return [];
        }
    }

    //create Chat Bot
    let loadCreateChatBot = false;
    async function createChatBot(username, password, authkey) {
        loadCreateChatBot = true;
        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "createChatBot",
                params: {
                    username,
                    password,
                    authkey
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            // Success
            const responseBody = await response.json();
            errorCreateBotMessage = "";
            customChatBotExisted = true;
            customChatBotID = responseBody.payload.botInfo.id;

            console.log(responseBody.payload);

            location.reload();
        } else {    
            // Fail
            const responseBody = await response.json();
        
            if (responseBody.error && responseBody.error.message) {
                errorCreateBotMessage = responseBody.error.message;   
            }

            console.log(errorCreateBotMessage);
            

            // Lam gi day o day
        }

        loadCreateChatBot = false;
    }

    //Delete Chat Bot
    async function deleteChatBot() {
        let errorMessage = "An unknown error occurred.";

        console.log(customChatBotID);

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "deleteChatBot",
                params: {
                    username,
                    password,
                    authkey,
                    assistantID: customChatBotID
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            // Success
            const responseBody = await response.json();

            console.log(responseBody);

            location.reload();
        } else {
            // Fail
            const responseBody = await response.json();
        
            console.log(responseBody);

            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;   
            }

            console.log(errorMessage);

            // Lam gi day o day
        }
    }

    function formatAddress(address) {
			return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
		}
</script>




<div class="relative bg-dark w-full">
    <div class="flex-col flex max-w-screen-md mx-auto gap-10  px-4">
        <!--Nav bar-->
        <NavBar2/>
        
        <!--Account & Add button Container-->
        <div class="flex flex-col w-full gap-4 bg-lightDark text-white py-[20px] px-6 rounded-2xl shadow-lg" in:fade={{ duration: 300 }}>
            <!--Account stuffs-->
            <div class="flex sm:flex-row flex-col justify-between items-center gap-2  text-base font-semibold border-b border-darkGray pb-2">
                <!--Account Container-->
                <div class="flex gap-6 items-center"> 
                    <span class="hidden sm:flex text-darkGray">
                        Account
                    </span>
                    <!---->
                    <div class="flex p-1 border border-sea rounded-xl gap-4">
                        <!--Your Account Name / Wallet-->
                        <span class="ml-2">
                            {#if username.length > 16}
                                {formatAddress(username)}
                            {:else}
                                {username}
                            {/if}
                        </span>
                        <!--Verified status-->
                        {#if isAdmin === true}
                            <span class="font-normal text-xs bg-purple text-white py-0.5 px-1 rounded-lg mb-[1px]">
                                Admin
                            </span>
                        {:else if customBotLimit === 150000}
                            <button class="font-normal text-xs bg-purple text-white py-0.5 px-1 rounded-lg mb-[1px]" on:click={()=>{goto("/pricing")}}>
                                Advanced plan
                            </button>
                        {:else}
                            <button class="font-normal text-xs bg-lightDark text-darkGray py-0.5 px-1 rounded-lg mb-[1px]" on:click={()=>{goto("/pricing")}}>
                                Free plan
                            </button>
                        {/if}
                    </div>
                </div> 

                <button class="flex justify-center items-center font-semibold sm:w-fit w-[220px] sm:border-0 p-1 border rounded-lg font-normal sm:text-base text-xs sm:text-red-600 sm:fill-red-500 hover:fill-purple hover:text-purple fill-red-500"
                on:click={()=>{localStorage.username = ""; localStorage.password = ""; localStorage.authkey = ""; goto("../login")}}>
                    Log out
                    <svg class="sm:h-6 h-4 mx-2 fill-inherit inline-block" viewBox="0 0 490.3 490.3" xml:space="preserve">
                            <g>
                                <g>
                                    <path d="M0,121.05v248.2c0,34.2,27.9,62.1,62.1,62.1h200.6c34.2,0,62.1-27.9,62.1-62.1v-40.2c0-6.8-5.5-12.3-12.3-12.3
                                        s-12.3,5.5-12.3,12.3v40.2c0,20.7-16.9,37.6-37.6,37.6H62.1c-20.7,0-37.6-16.9-37.6-37.6v-248.2c0-20.7,16.9-37.6,37.6-37.6h200.6
                                        c20.7,0,37.6,16.9,37.6,37.6v40.2c0,6.8,5.5,12.3,12.3,12.3s12.3-5.5,12.3-12.3v-40.2c0-34.2-27.9-62.1-62.1-62.1H62.1
                                        C27.9,58.95,0,86.75,0,121.05z"/>
                                    <path d="M385.4,337.65c2.4,2.4,5.5,3.6,8.7,3.6s6.3-1.2,8.7-3.6l83.9-83.9c4.8-4.8,4.8-12.5,0-17.3l-83.9-83.9
                                        c-4.8-4.8-12.5-4.8-17.3,0s-4.8,12.5,0,17.3l63,63H218.6c-6.8,0-12.3,5.5-12.3,12.3c0,6.8,5.5,12.3,12.3,12.3h229.8l-63,63
                                        C380.6,325.15,380.6,332.95,385.4,337.65z"/>
                                </g>
                            </g>
                    </svg>
                </button>
            </div>
            
            <!--Temporary limit each user create only 1 chatbot/admin can not create chatbot-->
            {#if customChatBotExisted === false && isAdmin === false}
                <!--Add bot Button-->
                <button class="flex items-center sm:self-start self-center gap-2 w-fit border border-sea text-sea rounded-xl shadow-md px-2 py-1 text-xl"
                    on:click={()=>{ setTimeout(() => createChatBot(username, password, authkey), 500) }}>
                    <!--Loading create chat bot when it is existed-->
                    {#if loadCreateChatBot === true}
                        <img alt="loading" class="sm:h-8 h-6" src="/gif/loading2.gif"/>
                    {:else}
                        <img class="sm:h-8 h-6" src="/addBot.svg"/>
                    {/if}    
                    <span class="pr-1 sm:text-base text-sm">
                        Create your custom chat bot
                    </span>
                </button>
            {:else}
                <!--Message when chat bot is existed-->
                {#if isAdmin}
                    <span class="text-sm sm:mx-0 mx-auto">Admin account can not create extra bot</span>
                {:else}
                    <span class="text-sm sm:mx-0 mx-auto">Currently for this MVP we only limit to create 1 custom bot</span>
                {/if}
            {/if}

            <!--Show error create bot message-->
            {#if errorCreateBotMessage !== ""}
                <span class="text-sm text-red-500">
                    {errorCreateBotMessage}
                </span>
            {/if}
        </div>
        <!--Render bot-->
        {#if fulfilled === true}
            <!--Check if user has created bot or not-->
            {#if customChatBotExisted === true && isAdmin === false}
                <!--Custom Bot-->
                <div class="flex flex-col w-full gap-4 bg-lightDark py-[20px] px-6 rounded-2xl shadow-lg text-white" in:fade={{ duration: 300 }}>
                    <!--Your bot's Logo & Plan & Cap container-->
                    <div class="flex sm:flex-row flex-col gap-2 justify-between items-center">
                        <!--Your bot's  Logo Container-->
                        <div class="flex sm:flex-row flex-col gap-2 items-center"> 
                            <!--Your bot's Logo-->
                            <img class="h-[40px] inline-block" src="/customBot.svg"/>
                            <div class="flex gap-3">
                                <!--Your bot's name-->
                                <span class="text-xl font-semibold">
                                    Your custom bot
                                </span>
                                <!--Plan status-->
                                {#if customBotLimit === 150000}
                                    <button class=" h-fit  text-xs bg-purple text-white p-1 rounded-lg mb-[1px]" on:click={()=>{goto("/pricing")}}>
                                        Advanced plan
                                    </button>
                                {:else}
                                    <button class=" h-fit text-xs bg-gray-600 text-white p-1 rounded-lg mb-[1px]" on:click={()=>{goto("/pricing")}}>
                                        Free plan
                                    </button>
                                {/if}
                            </div>
                        </div> 
                        <!--Cap Container-->
                        <div class="flex flex-col gap-1 min-w-[200px] pl-[14px] text-sm">
                            <!--Used Cap-->
                            <div class="flex gap-2">
                                <span>Used:</span>
                                <!--Cap value example-->
                                <span class="text-gray-600">{customBotUsage}/{customBotLimit} response</span>
                            </div>
                            <!-- Cap per hour-->
                            <div class="flex gap-2">
                                <span>Cap per hour:</span>
                                <!--Cap per hour value example-->
                                <span class="text-gray-600">No</span>
                            </div>

                        </div>
                    </div>
                    <!--Your bot's  Description-->
                    <span class="md:text-sm text-xs border rounded-lg p-2 text-white">
                        This bot can be changed and customized by you. Any changes you make will affect projects integrating your custom bot.
                    </span>
                    <div class="flex md:flex-row flex-col mx-auto gap-2">
                        <!--Embed bot Button-->
                        <button class="max-w-[230px] sm:text-base text-sm rounded-xl shadow-md px-2 py-1 bg-purple text-white"
                        on:click={()=>{displayIntegrate = true; displayId = customChatBotID}}>
                            Embed on your website
                        </button>
                        <!--Training bot Button-->
                        <button class="max-w-[230px] sm:text-base text-sm min-w-[230px] border border-sea text-sea rounded-xl shadow-md px-2 py-1"
                            on:click={() =>goto(`../custombot/${customChatBotID}`)}>
                            Training bot
                        </button>
                        <!--Delete bot Button-->
                        <button class="max-w-[230px] sm:text-base text-sm min-w-[230px] border-red-600 border text-red-600 rounded-xl shadow-md px-2 py-1"
                        on:click={()=>{deleteChatBot()}}>
                            Delete bot
                        </button>
                    </div>
                </div>
            {/if}

                <!--Default AIREGION-->
                <div class="flex flex-col w-full gap-4 bg-lightDark py-[20px] px-6 rounded-2xl shadow-lg" in:fade={{ duration: 300 }}>
                    <!--AIREGION Logo & Plan & Cap container-->
                    <div class="flex sm:flex-row flex-col gap-2 justify-between items-center">
                        <!--AIREGION Logo Container-->
                        <div class="flex gap-6 items-center"> 
                            <!--AI Dot Logo-->
                            <img class="h-[35px] inline-block" src="/logo.svg"/>
                        </div> 
                        <!--Cap Container-->
                        <div class="flex flex-col gap-1 min-w-[200px] pl-[14px] text-sm text-white">
                            <!--Used Cap-->
                            <div class="flex gap-2">
                                <span class="text-darkGray">Used:</span>
                                <!--Cap value example-->
                                <span class="text-gray-600">{initialBotUsage}/Unlimited</span>
                            </div>
                            <!-- Cap per hour-->
                            <div class="flex gap-2">
                                <span class="text-darkGray">Cap per hour:</span>
                                <!--Cap per hour value example-->
                                <span class="text-gray-600">No</span>
                            </div>

                        </div>
                    </div>
                    <!--AIREGION Description-->
                    <span class="md:text-sm text-xs border rounded-lg p-2 text-white">
                        This AIREGION bot integrates with all resources of the Areon ecosystem and can be only trained by administrators and experts within this ecosystem. 
                        Any changes you make will affect all projects embedding this AIREGION.
                        <span class="font-semibold">Only admins or verified accounts can contribute to or train this AIREGION.</span>
                    </span>
                    <div class="flex md:flex-row flex-col mx-auto gap-2">
                        <!--Embed bot Button-->
                        <button class="max-w-[200px] sm:text-base text-sm bg-purple rounded-xl shadow-md px-2 py-1 text-white"
                        on:click={()=>{displayIntegrate = true; displayId = initialBotId}}>
                            Embed on your website
                        </button>
                        <!--Training bot Button-->
                        <button
                        on:click={() =>goto(`../custombot/${initialBotId}`)}
                        class="max-w-[200px] sm:text-base text-sm min-w-[200px] border border-sea text-sea rounded-xl shadow-md px-2 py-1">
                            Training bot
                        </button>
                    </div>
                </div>
        {:else}
            <!--Loading gif-->
            <div class="h-screen flex flex-col" in:fade={{ duration: 300 }}>

            <svg class="h-[300px] mx-auto" version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
               <path fill="#00FDEE" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
                c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
                    <animateTransform 
                       attributeName="transform" 
                       attributeType="XML" 
                       type="rotate"
                       dur="2s" 
                       from="0 50 50"
                       to="360 50 50" 
                       repeatCount="indefinite" />
                </path>
               <path fill="#00FDEE" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
                c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
                    <animateTransform 
                       attributeName="transform" 
                       attributeType="XML" 
                       type="rotate"
                       dur="1s" 
                       from="0 50 50"
                       to="-360 50 50" 
                       repeatCount="indefinite" />
                </path>
               <path fill="#00FDEE" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
                L82,35.7z">
                    <animateTransform 
                       attributeName="transform" 
                       attributeType="XML" 
                       type="rotate"
                       dur="2s" 
                       from="0 50 50"
                       to="360 50 50" 
                       repeatCount="indefinite" />
                </path>
            </svg>
                <span class="text-3xl italic font-semibold mx-auto mt-4 text-sea">
                    Loading...
                </span>

            </div>
        {/if}      
        <Footer class="max-w-screen-md mx-auto"/>
        
        <!--Display integrate to website-->
        {#if displayIntegrate === true}
            <div class="absolute flex flex-col inset-0 bg-black bg-opacity-50 z-30 " in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
                <div class="flex flex-col mx-auto mt-[200px] bg-lightDark gap-4 rounded-lg shadow-md px-[30px] pb-[50px] pt-[10px] ">
                    <!--Close button-->
                    <button class="self-end"
                    on:click={()=>{displayIntegrate = false}}>
                        <img class=" h-[20px]" src="/close.svg"/>
                    </button>
                    <div class="flex items-center gap-1">
                        <img class="h-[18px] inline-block" src="/pointer.svg"/>
                        <span class="md:text-base text-sm text-white">
                            Copy the code below and insert it into the <span class="font-semibold">&lt;head&gt; </span> section of your website's HTML
                        </span>
                    </div>   
                    <code class="flex justify-center text-sea w-full mx-auto bg-gray-800 rounded-md p-2 text-xs">
                        {getCode(displayId)}
                    </code>
                </div>
            </div>
        {/if} 
    </div>
    
</div>

