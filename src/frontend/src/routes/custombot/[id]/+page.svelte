<script>
    import { fade } from 'svelte/transition'; 
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import Footer from '../../Footer.svelte'
    import NavBar2 from '../../NavBar2.svelte';
    import { onMount } from 'svelte';
    import { config } from '$lib/config.js'

    //Load info
    const token = $page.url.pathname.split("/");
    const assistantID = token.at(-1);
    let fulfilled = false;
    let botInfo;
    let usage = 0;
    let name = "";
    let instructions = "";
    let recommendations = [];
    let files = [];
    let isInitial = false;

    let initialBotId = "";
    let isAdmin = false;

    let username = "";
    let password = "";
    let authkey = "";

    onMount(() => {
        if (!localStorage.username) {
            goto("/../../login");
        }

        username = localStorage.username;
        password = localStorage.password;
        authkey = localStorage.authkey;

        console.log(username, password, authkey);

        (async function() {
            let errorMessage = "An unknown error occurred.";

            const response = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "getChatBotInfo",
                    params: {
                        username,
                        password,
                        authkey,
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

                botInfo = responseBody.payload.botInfo;
                usage = responseBody.payload.usage;
                instructions = botInfo.instructions;
                name = botInfo.name;
                recommendations = responseBody.payload.recommendations;

                while (recommendations.length < 3) {
                    recommendations.push("");
                }
                recommendations = recommendations;

                const fileIds = botInfo.file_ids;
                for (const fileId of fileIds) {
                    files.push(await getFileInfo(fileId));
                }
                files = files;

                await verifyAdmin();

                fulfilled = true;
            } else {
                // Fail
                const responseBody = await response.json();
            
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

            await getInitialBotId();

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
            isInitial = initialBotId === assistantID;
        } else {
            // Fail
            const responseBody = await response.json();
        
            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;   
            }

            console.log(errorMessage);
        }
    }


    //Get file info
    async function getFileInfo(fileId) {
        let errorMessage = "An unknown error occurred.";

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "getFileInfo",
                params: {
                    username,
                    password,
                    authkey,
                    fileId
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            // Success
            const responseBody = await response.json();

            return responseBody.payload.file;
        } else {
            // Fail
            const responseBody = await response.json();
        
            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;   
            }

            throw new Message(errorMessage);
        }
    }

    //Upload file
    let chosenFile =[];
    let loadingUploadFile= false;
    let maxFileError = false;
    async function uploadFile() {
        loadingUploadFile= true;
        if (chosenFile.length === 0) return;
        
        
        const file = chosenFile[0];

        if (file.size > 100 * 1024 * 1024) {
            maxFileError = true;
            return;
        } 


        // Initiate file upload
        const tokens = file.name.split(".");
        let format = tokens.length < 2 ? ".txt" : "." + tokens.at(-1);
        let fileKey = "";

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "uploadFile",
                params: {
                    username,
                    password,
                    authkey,
                    flag: "stream",
                    format
                }
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            const responseBody = await response.json();

            fileKey = responseBody.payload.fileKeyCreated;
        } else {
            const responseBody = await response.json();
        
            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;   
            }

            throw new Error(errorMessage);
        }

        // Actually upload data
        await new Promise((resolve, reject) => {
            const fileReader = new FileReader();

            fileReader.onload = async (evt) => {
                // Progressively add data to file
                let fileData = evt.target.result;

                while ((new Uint8Array(fileData)).length !== 0) {
                    // Get 4 mb chunk
                    const chunk = "0x" + arrayToHex(new Uint8Array(fileData.slice(0, 4194304)));

                    console.log(fileData);

                    const response = await fetch(config.rpcUrl, {
                        method: "POST",
                        body: JSON.stringify({
                            method: "streamAdd",
                            params: {
                                username,
                                password,
                                authkey,
                                fileKey,
                                chunk
                            }
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    
                    if (!response.ok) {
                        const responseBody = await response.json();
                    
                        if (responseBody.error && responseBody.error.message) {
                            errorMessage = responseBody.error.message;   
                        }

                        throw new Error(errorMessage);
                    }

                    fileData = fileData.slice(4194304);
                }

                resolve();
            };

            fileReader.readAsArrayBuffer(file);
        });

        // Upload file
        await (async () => {
            const response = await fetch(config.rpcUrl, {
                method: "POST",
                body: JSON.stringify({
                    method: "streamFinish",
                    params: {
                        username,
                        password,
                        authkey,
                        fileKey
                    }
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (response.ok) {
                const responseBody = await response.json();

                files.push(responseBody.payload.file);

                files = files;
            } else {
                const responseBody = await response.json();
            
                if (responseBody.error && responseBody.error.message) {
                    errorMessage = responseBody.error.message;   
                }

                throw new Error(errorMessage);
            }
        })();
        loadingUploadFile= false;
        maxFileError = false;
        console.log(files);
    }

    //Modify chatbot
    async function modifyChatBot(name, instructions, recommendations, fileIds) {
        let errorMessage = "An unknown error occurred.";

        const response = await fetch(config.rpcUrl, {
            method: "POST",
            body: JSON.stringify({
                method: "modifyChatBot",
                params: {
                    username,
                    password,
                    authkey,
                    name,
                    instructions,
                    recommendations,
                    fileIds,
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
        } else {
            // Fail
            const responseBody = await response.json();
        
            if (responseBody.error && responseBody.error.message) {
                errorMessage = responseBody.error.message;   
            }

            console.log(errorMessage);

            // Lam gi day o day
        }
    }

    //Save changes
    async function save() {
        const fileIds = files.map(file => file.id);

        console.log(name, instructions, recommendations, fileIds);

        await modifyChatBot(name, instructions, recommendations, fileIds);

        location.reload();
    }





    //Caculate size
    function getSizeAsString(size) {
        if (size < 1024) { // Byte
            return size.toFixed(2) + " B";
        } else if (size < 1024 * 1024) { // Kilobyte
            return (size / 1024).toFixed(2) + " KB";
        } else if (size < 1024 * 1024 * 1024) { // Megabyte
            return (size / 1024 / 1024).toFixed(2) + " MB";
        } else { // Gigabyte and above
            return (size / 1024 / 1024 / 1024).toFixed(2) + " GB";
        }
    }

    function arrayToHex(array) {
        return Array.from(array)
            .map((i) => i.toString(16).padStart(2, '0'))
            .join('');
    }

    function removeFromFileList(indexToDelete) {
        files = files.filter((file, index) => index !== indexToDelete);
    }

    //Edit name
    let nameEditable = false;
</script>

<div class="bg-dark w-full">
    <!--Done Loading user info-->
    {#if fulfilled === true}
        <div class="flex-col flex max-w-screen-md mx-auto gap-10" in:fade={{ duration: 300 }} >
            <!--Header-->
            <NavBar2/>
            <!--Your bot info container-->
            <div class="flex items-center flex-col w-full gap-6 bg-lightDark text-white py-[30px] px-6 rounded-lg shadow-lg">
                <div class="flex items-center sm:flex-row flex-col w-full gap-6">
                    <!--Customize your logo-->
                    {#if isInitial === true}
                        <img src='/logo.svg' class="md:h-[120px] md:w-[120px]  w-[160px] "/>
                    {:else}
                        <img src='/customBot.svg' class="max-h-[120px] min-h-[120px] max-w-[120px] min-w-[120px]"/>
                    {/if}
                    <!--Container-->
                    <div class="flex flex-col rounded-lg shadow-lg w-full">
                        <!--Customize ava + upgrade plan Container-->
                        <div class="flex flex-col px-4 py-2 gap-1 bg-lightDark border border-purple rounded-t-lg text-xl font-bold text-lg">
                            <!--Customize your chatbot name-->
                            <div class="flex gap-2">
                                <span class="text-gray-500">Name:</span>
                                <div class="flex items-center justify-between w-full">
                                    <!--Edit your name-->
                                    <input class="{nameEditable === true?"border border-purple bg-dark rounded-lg px-2":"bg-lightDark rounded-lg px-2"}" bind:value={name} disabled={!nameEditable}/>
                                    {#if isInitial === false}
                                        <!--Edit button-->
                                        <button class="stroke-sea hover:stroke-purple" on:click={()=>{nameEditable = !nameEditable}}>
                                            <svg class="h-[20px] fill-none stroke-inherit"  viewBox="0 0 24 24">
                                                <path class="stroke-inherit" d="M22.0835 5.88111L11.7033 16.2596C10.6697 17.2931 7.6013 17.7718 6.91582 17.0864C6.23034 16.4011 6.69821 13.3332 7.73187 12.2997L18.1229 1.91024C18.3792 1.63071 18.6894 1.40602 19.0349 1.24969C19.3804 1.09335 19.754 1.00861 20.1332 1.00062C20.5123 0.992647 20.8892 1.06155 21.241 1.20321C21.5928 1.34487 21.9122 1.55635 22.18 1.82485C22.4478 2.09334 22.6584 2.41329 22.7991 2.7654C22.9398 3.11753 23.0078 3.49448 22.9988 3.87356C22.9897 4.25264 22.9039 4.626 22.7467 4.97103C22.5893 5.31606 22.3638 5.62566 22.0835 5.88111Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path class="stroke-inherit" d="M10.8814 3.2373H5.39171C4.22695 3.2373 3.10998 3.69999 2.28637 4.5236C1.46277 5.34722 1 6.46426 1 7.62902V18.6083C1 19.7731 1.46277 20.8901 2.28637 21.7137C3.10998 22.5374 4.22695 23 5.39171 23H17.4689C19.8953 23 20.7627 21.0237 20.7627 18.6083V13.1187"  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </button>
                                    {/if}
                                </div>
                                
                            </div>
                            <!--Your plan-->
                            <div class="flex justify-between items-center ">
                                <!--Your current plan-->
                                <div class="flex gap-2">
                                    <span class="text-gray-500">Plan:</span>
                                    {#if !isAdmin}
                                        <span>Free</span>
                                    {:else}
                                        <span>Admin</span>
                                    {/if}
                                    
                                </div>
                                {#if !isInitial}
                                    <!--Upgrade plan-->
                                    <button class="py-0.5 px-1 text-sm bg-purple text-white rounded-lg shadow-md font-semibold" on:click={() =>goto(`/pricing`)} >
                                        Upgrade plan
                                    </button>
                                {/if}

                            </div>
                        </div>
                        <!--Cap Container-->
                        <div class="flex flex-col h-full px-4 bg-dark border border-purple rounded-b-lg gap-0.5 py-1 font-thin ">
                            <!--Your cap-->
                            <div class="flex justify-between gap-2 text-white border-b border-purple pb-1">
                                <span>Your cap:</span>
                                <span>
                                    {#if isInitial === true}
                                        <span>{usage}/unlimited</span>
                                    {:else}
                                        <span>{usage}/1500</span>
                                        <span>responses</span>
                                    {/if}
                                </span>
                            </div>

                            <!--Your Cap per hour-->
                            <div class="flex justify-between gap-2 text-white">
                                <span>
                                    Cap per hour:               
                                </span>
                                <span>
                                    None
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="sm:text-base text-sm p-2 border border-purple rounded-lg">
                    This chatbot is trained by administrators and experts in the Areon ecosystem. 
                    Any changes you make will affect all projects embedding this AIREGION. 
                    <span class="font-semibold">To modify it, you need an admin account.</span>
                </span> 
            </div>


            
            <!--content-->
            <div class="relative flex flex-col  rounded-lg shadow-lg text-white bg-lightDark">
                <!--Hide if you are not an admin-->
                {#if !isAdmin && isInitial}
                    <div class="absolute flex flex-col items-center inset-0 bg-black bg-opacity-80 z-30 w-full h-full text-2xl text-white font-semibold rounded-lg shadow-lg">
                        <span class="mt-[200px]">Only admins can modify this AIREGION</span>
                    </div>
                {/if}

                <!--Sample question container-->  
                <div class="flex flex-col gap-4 mt-6 mx-6 ">
                    <span class="text-xl font-semibold">
                        Sample question on Widget
                    </span>
                    <!--Question 1-->
                    <div class="flex gap-4">
                        <input bind:value={recommendations[0]} class=" shadow-sm rounded-lg h-[30px] w-full px-4 bg-dark text-darkGray" placeholder="Enter your sample question 1"/>
                        <!--Delete question button-->                        
                        <button on:click={()=>{recommendations[0] = ""}}>
                            <svg class="h-6 hover:fill-sea" viewBox="0 0 408.483 408.483" xml:space="preserve">
                                <g>
                                    <g>
                                        <path d="M87.748,388.784c0.461,11.01,9.521,19.699,20.539,19.699h191.911c11.018,0,20.078-8.689,20.539-19.699l13.705-289.316
                                            H74.043L87.748,388.784z M247.655,171.329c0-4.61,3.738-8.349,8.35-8.349h13.355c4.609,0,8.35,3.738,8.35,8.349v165.293
                                            c0,4.611-3.738,8.349-8.35,8.349h-13.355c-4.61,0-8.35-3.736-8.35-8.349V171.329z M189.216,171.329
                                            c0-4.61,3.738-8.349,8.349-8.349h13.355c4.609,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.737,8.349-8.349,8.349h-13.355
                                            c-4.61,0-8.349-3.736-8.349-8.349V171.329L189.216,171.329z M130.775,171.329c0-4.61,3.738-8.349,8.349-8.349h13.356
                                            c4.61,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.738,8.349-8.349,8.349h-13.356c-4.61,0-8.349-3.736-8.349-8.349V171.329z"/>
                                        <path d="M343.567,21.043h-88.535V4.305c0-2.377-1.927-4.305-4.305-4.305h-92.971c-2.377,0-4.304,1.928-4.304,4.305v16.737H64.916
                                            c-7.125,0-12.9,5.776-12.9,12.901V74.47h304.451V33.944C356.467,26.819,350.692,21.043,343.567,21.043z"/>
                                    </g>
                                </g>
                            </svg>
                        </button>
                    </div>
                    {#if recommendations[0] !== ""}
                        <!--Question 2-->
                        <div class="flex gap-4">
                            <input bind:value={recommendations[1]}  class="border-2 shadow-sm rounded-lg h-[30px] w-full px-4 bg-dark text-darkGray" placeholder="Enter your sample question 2"/>
                            <!--Delete question button-->                        
                            <button on:click={()=>{recommendations[1] = ""}}>
                                <svg class="h-6 hover:fill-pink" viewBox="0 0 408.483 408.483" xml:space="preserve">
                                    <g>
                                        <g>
                                            <path d="M87.748,388.784c0.461,11.01,9.521,19.699,20.539,19.699h191.911c11.018,0,20.078-8.689,20.539-19.699l13.705-289.316
                                                H74.043L87.748,388.784z M247.655,171.329c0-4.61,3.738-8.349,8.35-8.349h13.355c4.609,0,8.35,3.738,8.35,8.349v165.293
                                                c0,4.611-3.738,8.349-8.35,8.349h-13.355c-4.61,0-8.35-3.736-8.35-8.349V171.329z M189.216,171.329
                                                c0-4.61,3.738-8.349,8.349-8.349h13.355c4.609,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.737,8.349-8.349,8.349h-13.355
                                                c-4.61,0-8.349-3.736-8.349-8.349V171.329L189.216,171.329z M130.775,171.329c0-4.61,3.738-8.349,8.349-8.349h13.356
                                                c4.61,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.738,8.349-8.349,8.349h-13.356c-4.61,0-8.349-3.736-8.349-8.349V171.329z"/>
                                            <path d="M343.567,21.043h-88.535V4.305c0-2.377-1.927-4.305-4.305-4.305h-92.971c-2.377,0-4.304,1.928-4.304,4.305v16.737H64.916
                                                c-7.125,0-12.9,5.776-12.9,12.901V74.47h304.451V33.944C356.467,26.819,350.692,21.043,343.567,21.043z"/>
                                        </g>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    {/if}
                    <!--Question 3-->
                    {#if recommendations[1] !== ""}
                        <div class="flex gap-4">
                            <input bind:value={recommendations[2]}  class="border-2 shadow-sm rounded-lg h-[30px] w-full px-4 bg-dark text-darkGray" placeholder="Enter your sample question 3"/>
                            <!--Delete question button-->                        
                            <button on:click={()=>{recommendations[2] = ""}}>
                                <svg class="h-6 hover:fill-pink" viewBox="0 0 408.483 408.483" xml:space="preserve">
                                    <g>
                                        <g>
                                            <path d="M87.748,388.784c0.461,11.01,9.521,19.699,20.539,19.699h191.911c11.018,0,20.078-8.689,20.539-19.699l13.705-289.316
                                                H74.043L87.748,388.784z M247.655,171.329c0-4.61,3.738-8.349,8.35-8.349h13.355c4.609,0,8.35,3.738,8.35,8.349v165.293
                                                c0,4.611-3.738,8.349-8.35,8.349h-13.355c-4.61,0-8.35-3.736-8.35-8.349V171.329z M189.216,171.329
                                                c0-4.61,3.738-8.349,8.349-8.349h13.355c4.609,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.737,8.349-8.349,8.349h-13.355
                                                c-4.61,0-8.349-3.736-8.349-8.349V171.329L189.216,171.329z M130.775,171.329c0-4.61,3.738-8.349,8.349-8.349h13.356
                                                c4.61,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.738,8.349-8.349,8.349h-13.356c-4.61,0-8.349-3.736-8.349-8.349V171.329z"/>
                                            <path d="M343.567,21.043h-88.535V4.305c0-2.377-1.927-4.305-4.305-4.305h-92.971c-2.377,0-4.304,1.928-4.304,4.305v16.737H64.916
                                                c-7.125,0-12.9,5.776-12.9,12.901V74.47h304.451V33.944C356.467,26.819,350.692,21.043,343.567,21.043z"/>
                                        </g>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    {/if}
                </div>

                <!--instruction container-->
                <div class="flex flex-col gap-4 mt-6 mx-6">
                    <div>
                        <span class="text-xl font-semibold">
                            Instruction
                        </span>
                        <span class="text-sm text-gray-400" maxlength="1000">
                            (Max 1000 characters)
                        </span>
                    </div>
                    <!--Instruction-->
                    <textarea bind:value={instructions} class="bg-dark text-darkGray border rounded-lg h-[320px] shadow-lg p-4" placeholder="How does your bot answer Areon questions? What does it avoid doing? Or anything you train it for?"></textarea>
                </div>  

                <!--Resources container-->
                <div class="flex flex-col gap-1 mt-6 mx-6">
                    <div class="flex flex-col justify-between ">
                        <div class="flex flex-col">
                            <span class="text-xl font-semibold">
                                Resources
                            </span>
                            <span class="text-gray-400 text-sm mb-2">Upload resources for your bot to learn</span>
                        </div>

                        <!--Add file Button-->
                        
                        <div class="flex flex-col gap-2 p-2 h-fit w-fit bg-dark text-darkGray">
                            <!--Choose file-->
                            <input bind:files={chosenFile} type="file"/>
                            <!--Upload file-->
                            {#if chosenFile.length !== 0 }
                                <button
                                on:click={() => uploadFile()}
                                class="flex w-fit px-2 gap-1 border bg-gray-200 border border-black hover:bg-black hover:text-white items-center hover:fill-white">
                                    <span>
                                        Upload files                                                 
                                    </span>
                                    <svg class="h-[30px] fill-inherit" viewBox="0 0 312.602 312.602" xml:space="preserve">
                                        <path d="M251.52,137.244c-3.966,0-7.889,0.38-11.738,1.134c-1.756-47.268-40.758-85.181-88.448-85.181
                                            c-43.856,0-80.964,32.449-87.474,75.106C28.501,129.167,0,158.201,0,193.764c0,36.106,29.374,65.48,65.48,65.48h54.782
                                            c4.143,0,7.5-3.357,7.5-7.5c0-4.143-3.357-7.5-7.5-7.5H65.48c-27.835,0-50.48-22.645-50.48-50.48c0-27.835,22.646-50.48,50.48-50.48
                                            c1.367,0,2.813,0.067,4.419,0.206l7.6,0.658l0.529-7.61c2.661-38.322,34.861-68.341,73.306-68.341
                                            c40.533,0,73.51,32.977,73.51,73.51c0,1.863-0.089,3.855-0.272,6.088l-0.983,11.968l11.186-4.367
                                            c5.356-2.091,10.99-3.151,16.747-3.151c25.409,0,46.081,20.672,46.081,46.081c0,25.408-20.672,46.08-46.081,46.08
                                            c-0.668,0-20.608-0.04-40.467-0.08c-19.714-0.04-39.347-0.08-39.999-0.08c-4.668,0-7.108-2.248-7.254-6.681v-80.959l8.139,9.667
                                            c2.667,3.17,7.399,3.576,10.567,0.907c3.169-2.667,3.575-7.398,0.907-10.567l-18.037-21.427c-2.272-2.699-5.537-4.247-8.958-4.247
                                            c-3.421,0-6.686,1.548-8.957,4.247l-18.037,21.427c-2.668,3.169-2.262,7.9,0.907,10.567c1.407,1.185,3.121,1.763,4.826,1.763
                                            c2.137,0,4.258-0.908,5.741-2.67l7.901-9.386v80.751c0,8.686,5.927,21.607,22.254,21.607c0.652,0,20.27,0.04,39.968,0.079
                                            c19.874,0.041,39.829,0.081,40.498,0.081c33.681,0,61.081-27.4,61.081-61.08C312.602,164.644,285.201,137.244,251.52,137.244z"/>
                                    </svg>
                                    {#if loadingUploadFile === true && !maxFileError}
                                        <img class="h-[20px] inline-block" src="/gif/loading2.gif"/>
                                    {/if}
                                </button>
                            {/if }
                            {#if maxFileError=== true }
                                <span class="text-red-500">You can not upload file higher than 100mb</span>
                            {/if }
                    
                        </div>
                    </div>

                    <!--Table Container-->
                    <div class="my-4 h-[300px]  overflow-y-auto bg-dark text-darkGray shadow-md rounded-md">
                        <table class="text-md w-full border border-darkGray rounded-md  ">
                            <!--Table Header Container-->
                            <thead>
                                <tr>
                                    <th class="text-gray-500 text-left font-normal pl-4 py-1 border-b border-darkGray">Title</th>
                                    <th class="text-gray-500 text-left font-normal px-1 py-1 border-b border-darkGray">Size</th>
                                    <th class="text-gray-500 text-left font-normal px-1 py-1 border-b border-darkGray">Action</th>
                                </tr>
                            </thead>
                            <!--Storage info Container-->
                            <tbody >
                                {#each files as file, index}
                                    <tr>
                                        <!--Title-->
                                        <td class="text-left w-2/3 font-semibold pl-2 py-1 border-b border-darkGray">
                                            <div class="flex items-center">
                                                <svg class="h-[30px] inline-block m-2" viewBox="0 0 251 254" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M247.109 48.9631L202.295 4.14917C199.884 1.73538 196.672 0.40625 193.261 0.40625H73.6417C66.5942 0.40625 60.8618 6.13865 60.8618 13.1861V240.526C60.8618 247.574 66.5942 253.306 73.6417 253.306H238.072C245.119 253.306 250.854 247.574 250.854 240.526V58C250.854 54.5859 249.522 51.374 247.109 48.9631ZM201.022 14.7963L236.459 50.236H204.61C202.632 50.236 201.025 48.6258 201.025 46.6476L201.022 14.7963ZM238.072 244.876H73.6417C71.242 244.876 69.2918 242.926 69.2918 240.526V13.1861C69.2918 10.7864 71.242 8.83625 73.6417 8.83625H192.595V46.6476C192.595 53.2736 197.984 58.666 204.61 58.666H242.424V240.526C242.424 242.926 240.471 244.876 238.072 244.876Z" fill="#00FDEE"/>
                                                    <path d="M221.029 94.0325H146.887C144.557 94.0325 142.672 92.147 142.672 89.8175C142.672 87.488 144.557 85.6025 146.887 85.6025H221.029C223.355 85.6025 225.244 87.488 225.244 89.8175C225.244 92.147 223.355 94.0325 221.029 94.0325Z" fill="#00FDEE"/>
                                                    <path d="M126.228 94.0325H90.6842C88.3547 94.0325 86.4692 92.147 86.4692 89.8175C86.4692 87.488 88.3547 85.6025 90.6842 85.6025H126.228C128.557 85.6025 130.443 87.488 130.443 89.8175C130.443 92.147 128.557 94.0325 126.228 94.0325Z" fill="#00FDEE"/>
                                                    <path d="M148.264 58.6663H90.6842C88.3547 58.6663 86.4692 56.7808 86.4692 54.4513C86.4692 52.1218 88.3547 50.2363 90.6842 50.2363H148.267C150.596 50.2363 152.482 52.1218 152.482 54.4513C152.482 56.7808 150.593 58.6663 148.264 58.6663Z" fill="#00FDEE"/>
                                                    <path d="M221.029 124.943H90.6842C88.3547 124.943 86.4692 123.057 86.4692 120.728C86.4692 118.398 88.3547 116.513 90.6842 116.513H221.032C223.358 116.513 225.247 118.398 225.247 120.728C225.247 123.057 223.356 124.943 221.029 124.943Z" fill="#00FDEE"/>
                                                    <path d="M164.823 155.853H90.6842C88.3547 155.853 86.4692 153.965 86.4692 151.638C86.4692 149.311 88.3547 147.423 90.6842 147.423H164.826C167.153 147.423 169.041 149.311 169.041 151.638C169.041 153.965 167.153 155.853 164.823 155.853Z" fill="#00FDEE"/>
                                                    <path d="M221.029 155.853H185.485C183.158 155.853 181.27 153.965 181.27 151.638C181.27 149.311 183.158 147.423 185.485 147.423H221.029C223.355 147.423 225.244 149.311 225.244 151.638C225.244 153.965 223.355 155.853 221.029 155.853Z" fill="#00FDEE"/>
                                                    <path d="M221.029 186.763H90.6842C88.3547 186.763 86.4692 184.875 86.4692 182.548C86.4692 180.221 88.3547 178.333 90.6842 178.333H221.032C223.358 178.333 225.247 180.221 225.247 182.548C225.247 184.875 223.356 186.763 221.029 186.763Z" fill="#00FDEE"/>
                                                    <path d="M221.029 217.672H185.485C183.158 217.672 181.27 215.784 181.27 213.457C181.27 211.131 183.158 209.242 185.485 209.242H221.029C223.355 209.242 225.244 211.131 225.244 213.457C225.244 215.784 223.355 217.672 221.029 217.672Z" fill="#00FDEE"/>
                                                </svg>
                                                <!--Display maximum 20 character-->
                                                {file.filename.length > 20 ? `${file.filename.substring(0, 20)}...` : file.filename}
                                            </div>
                                        </td>
                                        <!--Size-->
                                        <td class="text-left px-1 py-1 border-b border-darkGray">
                                            {getSizeAsString(file.bytes)}
                                        </td>
                                        <!--Action-->
                                        <td class="text-left font-normal px-1 py-1 border-b border-darkGray">                                 
                                            <button
                                            on:click={() => removeFromFileList(index)}
                                            class=" text-indigo-700 underline">
                                                Delete
                                            </button>                       
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>  
                <button class="py-2 px-10 text-xl bg-purple font-semibold text-white w-fit mx-auto rounded-xl shadow-lg my-4 hover:bg-black"
                on:click={()=>{save()}}>
                    Save
                </button>
            </div>
            <Footer/>

        </div>
    <!--Loading user info-->
    {:else}
        <div class="h-screen flex flex-col" in:fade={{ duration: 300 }} >
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
            <span class="text-4xl italic font-semibold mx-auto mt-4 text-sea">
                Loading...
            </span>

        </div>
    {/if}

</div>

