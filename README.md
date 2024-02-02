## Basic Information
#### Project Introduction
AIRegion, an AI chatbot management dApp, integrates Areon resources to create AI-powered chatbots to answer questions related to the Areon ecosystem. It features an embeddable chat widget for any website and allows customization and training with personal instructions and resources.            
* [Website](http://airegion.xyz).
* Video: https://youtu.be/yIm0Ug2kzCI
* Source code: https://github.com/laashad/airegion
* PDF doc: https://github.com/laashad/airegion/blob/main/docs/AIRegion.pdf
  
#### Problems Identified in the Areon Ecosystem:

* Complexity of Information: Areon technologies can be complex and challenging for new users to understand.
* Accessibility of Information: Users might find it difficult to locate specific information about Areon.
* User Support: Providing timely and accurate support to users with questions can be resource-intensive.

#### Solutions Implemented with AIRegion:

* AI-Powered Chatbot Integration: AIRegion, as an AI chatbot, addresses the complexity of information by offering real-time, easy-to-understand answers to user queries.
* Seamless Integration with Website: By embedding AIRegion as a chat widget on any website, it ensures that users have immediate access to assistance while they are navigating through the information.
* Training and customization: AIRegion can be trained and updated with your specific instructions and resources.
* Multi device support: The chat widget embedded on any website is responsive and supports multiple devices, including PCs, tablets, phones, etc.


## Project Demo

### Demo + setup

* [Website](http://airegion.xyz).
* Video: https://youtu.be/yIm0Ug2kzCI
* Source code: https://github.com/laashad/airegion
* PDF doc: https://github.com/laashad/airegion/blob/main/docs/AIRegion.pdf
* [Control Panel to customize AI](http://airegion.xyz/control) (Login with Areon Tesnet)
* [Simple website that embeds AIRegion chat bot](http://airegion.xyz/test) + [its source code](https://github.com/laashad/airegion/blob/main/src/frontend/src/routes/test/test.html).
* [Setup](https://github.com/laashad/airegion/blob/main/docs/setup.md).
* [RPC Docs](https://github.com/laashad/airegion/blob/main/docs/rpc.md).

### Showcase
* **Control Panel**:

![controlPanel.PNG](https://cdn.dorahacks.io/static/files/18d606f051fd1cbbe78dce7463ea178c.PNG)

* **Login**:

![login.PNG](https://cdn.dorahacks.io/static/files/18d606f63e629192ad4262c41cb860b1.PNG)

* **Train bot**:

![train.PNG](https://cdn.dorahacks.io/static/files/18d607025ee9b464c2f68e64ea5a0048.PNG)

* **Embed AIRegion to any website**:

![integrate.PNG](https://cdn.dorahacks.io/static/files/18d6070a1d6c02e0c3c73224792a36d7.PNG)

* **Buy plan**:

![buyPlan.PNG](https://cdn.dorahacks.io/static/files/18d6070cc3ea49ad75f19c04c27b9402.PNG)

### Technical Architecture

AIRegion is split into **four main components**:

* **The AI**: The powerhouse of AIRegion. It is trained with preloaded Areon datasets, but projects can easily load additional data to train their custom AI however they want at ease through AIRegion Control Panel.
* **The Server Infrastructure**: The bridge between applications and AIRegion. AIRegion's server provides simple-to-use APIs that applications can utilize to have more access in managing/using AIRegion.
* **Embeddable Chat Widget**: Embed the AIRegion chat widget UI on your site by simply adding 1 line of code to your website's html head. 
* **User-friendly AI Control Panel**: An user-friendly control panel for users to create, modify and manage their AIRegion chat bots.
* **Plan scupcription with AREA** Utilize the $AREA token to purchase a plan that fits your needs. 

For further customizations and specific uses, AIRegion provides APIs to seemlessly interact with users' custom chat bots.


## Items Completed During the Hackathon

**Server/AI Side**

* An AI chat bot that can handle Areon questions well.
* Ability to create multiple custom chat bots.
* Ability to load additional resources to train chat bots how users like.
* An RPC server that exports APIs for applications to integrate.
* Generate code embed for developers to easily integrate AIRegion chat bot into their website through a simple html tag.
* $AREA subscription-based model for AIRegion usage.
* Login/Purchase plan with Areon Testnet.

**Client Side**

* Chat Widget UI that is embeddable into any front-end.
* AI Control Panel to create, train, modify, and manage AIRegion chat bots.
* Account management.
* Connect with AI through RPC APIs.
* $AREA subscription-based model for AIRegion usage.
* Login/Purchase plan with Areon Testnet.

## Items Planned to be Completed *After* the Hackathon

* Pull and combine resources from multiple LLMs.
* Integrate decentralized oracles into AIRegion as data sources. 
* Optimize AIRegion for even higher accuracy and performance.


## Team Member Information

Our team consists of 2 people:

* Quan Nguyen Phu:
  * Role: Product Owner, Full-stack Developer, Smart Contract Developer. 
* Anh Tuan Kim:
  * Role: Smart Contract Developer, Blockchain Infrastructure Developer, Full-stack Developer
