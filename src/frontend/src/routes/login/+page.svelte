<script>
    import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
    import { config } from '$lib/config.js';
    import { onMount } from 'svelte';
    import { ethers } from "ethers";
    
    let connectToAreon;

    onMount(() => {
        // Utilities
        function arrayToHex(array) {
            return Array.from(array)
                .map((i) => i.toString(16).padStart(2, '0'))
                .join('');
        }

        let provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : undefined, signer;

        // Sign message for authentication
        async function sign() {
            if (!signer) {
                alert("No sign message");
                return;
            }

            // Generate salt
            const randomValue = new Uint8Array(32);
            window.crypto.getRandomValues(randomValue);
            const salt = arrayToHex(randomValue);

            const messageHash = ethers.utils.solidityKeccak256(["string"], ["AIREGION_AUTH_MESSAGE" + salt]);

            const flatSig = await signer.signMessage(ethers.utils.arrayify(messageHash));

            // Get authkey
            let errorMessage = "An unknown error occurred.";

            const response = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "getAuthKey",
                    params: {
                        username: await signer.getAddress(),
                        sig: flatSig,
                        salt
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (response.ok) {
                // Success
                const responseBody = await response.json();

                localStorage.username = await signer.getAddress();
                localStorage.password = "";
                localStorage.authkey = responseBody.payload.authkey;

                goto("../control");
            } else {
                // Fail
                const responseBody = await response.json();
            
                if (responseBody.error && responseBody.error.message) {
                    errorMessage = responseBody.error.message;   
                }

                console.log(errorMessage);
            }
        }
        
        // Connect to metamask
        connectToAreon = async function() {
            // Handle the case where user might not have an Areon EVM wallet installed
            if (!window.ethereum) {
                window.open("https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn", "_blank");
                return;
            }

            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: "0x1ce",
                    rpcUrls: ["https://testnet-rpc.areon.network"],
                    chainName: "Areon Network Testnet",
                    nativeCurrency: {
                        name: "TAREA",
                        symbol: "TAREA",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://areonscan.com/"]
                }]
            });

            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

            if (accounts.length) {
                signer = provider.getSigner();
                await sign();
            }
        }
    });




    let showRegister = false;
    let rePasswordInput;
    let reUsernameInput;
    let reRePasswordInput;

    async function register() {
        let errorMessage = "An unknown error occurred.";

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "register",
                params: {
                    username: reUsernameInput,
                    password: rePasswordInput
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
        } else {
            // Fail
            const responseBody = await response.json();
        
            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;   
            }

            console.log(errorMessage);
        }
    }
    //front-end stuff
    let isShowLoginWithAccount = false;

    let usernameInput = "";
    let passwordInput = "";

    import NavBar from '../NavBar.svelte';
    import Footer from '../Footer.svelte';
    
    async function verifyPassword(username, password) {
        let errorMessage = "An unknown error occurred.";

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "listChatBots",
                params: {
                    username,
                    password
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    }
    

    let isLogin = true;
    let isPopUpMetamask = false;
</script>
<style>
    .linear-pink2-text {
    background: linear-gradient(to right, #E6449A, #9E00FF);
    -webkit-background-clip: text;
    -moz-background-clip: text;
    background-clip: text;
    color: transparent;
    }

    .shrink-on-hover {
    vertical-align: middle;
    -webkit-transform: perspective(1px) translateZ(0);
    transform: perspective(1px) translateZ(0);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0);
    -webkit-transition-duration: 0.3s;
    transition-duration: 0.3s;
    -webkit-transition-property: transform;
    transition-property: transform;
    }
    .shrink-on-hover:hover, .shrink-on-hover:focus, .shrink-on-hover:active {
    -webkit-transform: scale(1.1);
    transform: scale(1.05);
}
</style>
    <div class="relative flex w-full md:justify-start justify-center bg-dark">
        <div class="min-h-screen justify-between w-full flex flex-col max-w-screen-2xl mx-auto bg-no-repeat	bg-cover" style="background-image: url(./loginBg1.png)">
            <NavBar/>
            <!--Login Container-->
            <div class=" flex flex-col my-24 items-center mx-auto w-fit gap-y-1 mb-32 bg-lightDark py-6 px-4 border border-sea shadow-lg rounded-lg gap-[20px]" in:fade={{ duration: 300 }}>
                <img class="w-[330px] inline-block" src="/loginBanner.png"/>
                <!-- 
                <div class="flex justify-center items-center text-white w-[330px]  shadow-lg bg-pink  rounded-lg mt-6">
                    <button class="mr-1 font-semibold border rounded-lg px-1 my-2 ml-2 text-lg ">
                        Sign in with Areon Wallet
                    </button>
                </div> Sign in with Areon Wallet Container
                -->
                <!--Display login with Account Button-->
                <div class="flex shrink-on-hover justify-center items-center text-white w-[330px]  shadow-lg border border-sea  rounded-lg">
                    <!--Account Address-->
                    <button on:click={()=>{connectToAreon()}} class="flex mr-1 font-semibold border border-sea rounded-lg px-6 my-2 ml-2 text-lg text-sea" >
                        Sign in with Metamask
                        <img class="inline-block h-6 mx-2" src="/metamask.svg"/>
                    </button>
                </div>
                <!--Display login with Account Button-->
                <div class="shrink-on-hover flex justify-center items-center text-white w-[330px]  shadow-lg border border-purple rounded-lg">
                    <!--Account Address-->
                    <button class="mr-1 font-semibold border border-purple rounded-lg px-1 my-2 ml-2 text-lg text-purple" 
                    on:click={()=>{isShowLoginWithAccount = !isShowLoginWithAccount}}>
                        Sign in with Account & Password
                    </button>
                </div> 

                <!--Display login with Account & Password-->
                {#if isShowLoginWithAccount === true}
                    <!--Account Input Container-->
                    <div class="flex flex-col gap-3 mx-auto my-1" in:fade={{ duration: 300 }}>
                        <div class="flex w-fit">
                            <input bind:value={usernameInput}
                                class="border rounded-lg h-8 w-80 pl-2 bg-dark border-purple text-purple" 
                                placeholder="                       Enter account"
                            />
                        </div>
                    </div>

                    <!--Password Input Container-->
                    <div class="flex flex-col gap-3 mx-auto my-1" in:fade={{ duration: 300 }}>
                        <div class="flex w-fit">
                            <input bind:value={passwordInput}
                                class="border rounded-lg h-8 w-80 pl-2 bg-dark border-purple text-purple" 
                                type="password"
                                placeholder="                       Enter password"
                            />
                        </div>
                        <!--Error Message for login with password-->
                            
                        {#if !isLogin}
                            <span class="text-red-500">Error</span>
                        {/if}
                    </div>

                    <!--Sign in Button-->
                    <button on:click={async () => {
                        if (await verifyPassword(usernameInput, passwordInput)) {
                            localStorage.username = usernameInput;
                            localStorage.password = passwordInput;
                            localStorage.authkey = "";

                            goto("../control");
                        } else {
                            isLogin = false;
                        }
                    }} class=" bg-purple hover:bg-black py-1 w-fit rounded-lg px-4 mb-2 mt-4 self-center">
                        <span class="text-white text-lg font-semibold">Sign in</span>
                    </button>

                {/if}

            

            </div>

            <Footer/>
        </div>
    </div>

