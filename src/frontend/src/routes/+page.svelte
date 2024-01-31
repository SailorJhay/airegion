<script>
    import NavBar from './NavBar.svelte'
    import Footer from './Footer.svelte'
    import { goto } from '$app/navigation';
</script>
<!--Static Landing Page-->
<div class="relative flex flex-col max-w-screen-2xl mx-auto text-white bg-dark">
    <NavBar/>
    <!--Page1-->
    <div class="relative flex w-full md:justify-start justify-center  h-fit">
        <!--Page 1 Intro Container-->
        <div class="flex flex-col xl:max-w-[830px] xl:pr-[30px] xl:pl-[200px] xl:mt-[200px] xl:py-[2rem] z-10 bg-[#3C4083] bg-opacity-80 sm:border border-sea md:rounded-r-xl rounded-xl
                    lg:max-w-[730px] lg:pr-[20px] lg:pl-[200px] lg:mt-[300px] lg:py-[2rem]
                    md:max-w-[530px] md:pr-[20px] md:pl-[50px] md:mt-[180px] md:py-[1rem]
                    sm:max-w-[530px] sm:px-2 sm:mt-[230px] sm:py-[1rem]
                    max-w-[530px] px-2 mt-[180px] py-[1rem]"
                    >
            <!--Header-->
            <div class="flex flex-col gap-2">
                <span class="sm:text-5xl text-3xl font-bold">
                    AI CHATBOT
                </span>
                <span class="sm:text-2xl text-xl font-semibold border-b border-black pb-2">
                    FOR <span class="text-sea font-bold">AREON ECOSYSTEM</span>
                </span>
            </div>
            <!--Description-->
            <div class="pt-4">
            AIRegion, an AI chatbot management dApp, integrates Areon resources to create AI-powered chatbots  to answer questions related to the Areon ecosystem. It features an embeddable chat widget for any website and allows customization and training with personal instructions and resources.            
            </div>

            <!--Button Container-->
            <div class="grid sm:grid-cols-2 grids-col-1 gap-4 my-4 mx-1">
                <button  on:click={() =>window.open(`/test`)} class="w-full py-2 border text-sea border-sea font-semibold hover:bg-black hover:text-white shadow-lg rounded-lg">
                    Try our demo
                </button>

                <button class="w-full py-2 bg-purple font-semibold hover:bg-black hover:text-white shadow-lg rounded-lg" on:click={() =>goto(`/login`)}>
                    Integrate to your site
                </button>
            </div>
        </div>

        <!--Background-->
        <div class="absolute md:right-0 lg:mr-[10rem] lg:mt-[50px] lg:max-w-[42rem] 
            md:mr-[3rem] md:mt-[50px] md:max-w-[32rem] 
            sm:mt-[20px] sm:max-w-[32rem]
            mt-[22px] max-w-full overflow-hidden">
            <img src="/bgAI.png" class=" md:right-0 lg:mr-[10rem] lg:mt-[50px] lg:max-w-[42rem] 
            md:mr-[3rem] md:mt-[50px] md:max-w-[32rem] 
            sm:mt-[20px] sm:max-w-[32rem]
            mt-[22px] max-w-[30rem] object-contain" viewBox="0 0 2026 1646" alt="bg" fill="none"/>
        </div>
    </div>
    <!--Page2-->
    <div class="relative self-center flex lg:flex-row flex-col w-full justify-center items-center h-fit lg:mt-[350px] mt-[100px] xl:gap-20 gap-6 md:px-[80px] px-[10px]">
        <img class="xl:h-[400px] lg:h-[300px] md:h-[300px] h-[300px] w-fit lg:order-1 order-2" src="/page2xx.png"/>
        <div class="flex flex-col lg:order-2 order-1 w-fit">
            <span class="sm:text-4xl lg:text-5xl text-3xl font-bold">
                SIMPLY EMBED
            </span>
            <span class="sm:text-2xl text-xl text-sea font-semibold border-b border-black pb-2">
                INTO ANY WEBSITE
            </span>
            <code class="w-fit border rounded-lg text-white bg-gray-600 p-1 mt-4 md:text-base text-xs">
                By simply adding 1 line code on <span class="font-semibold">&lt;head&gt; </span> section of your website's HTML
            </code>
        </div>
   

    </div>


    <!--Page 3-->
    <div class="relative self-center flex lg:flex-row flex-col w-full justify-center items-center h-fit lg:mt-[200px] mt-[100px] mb-[100px]  xl:gap-20 gap-6 md:px-[80px] px-[10px]">
        <img class="xl:h-[400px] lg:h-[300px] md:h-[300px] h-[300px] w-fit lg:order-1 order-2" src="/page3.png"/>
        <div class="flex flex-col lg:order-2 order-1 w-fit">
            
            <span class="sm:text-5xl text-3xl font-bold">
                TRAIN YOUR AIREGION
            </span>
            <span class="sm:text-2xl text-xl font-semibold border-b border-black pb-2">
                WITH <span class="text-sea font-bold">YOUR RESOURCES</span>
            </span>
            <code class="w-fit border rounded-lg text-white bg-gray-600 p-1 mt-4 md:text-base text-xs">
                Creating your own AI Chatbot that fit your need
            </code>

        </div>


    </div>

    <Footer/>
</div>