# Movelazy
The Movement extension 


# Vision  
I believe the team is young and needs time to grow with the product. That's why I will help, mentor, and inspire them. This plan focuses on three main goals: 
* Improving our product for the Move ecosystem,
* Developing our brand profile
* building a community of developers (focus Movement protocols)

<img width="1023" alt="image" src="https://github.com/user-attachments/assets/0cd09e12-c17c-49f9-9ab8-8441e232f2f6">


# Features
* Creat Account
* Check Balance
* Deploy Contract

# Discover how to use Movelazy and what all it offers:
### Open Movelazy extension: You can open by Command Palette if you're using on MacOS. Or you can click on the Movement logo in the sidebar/Activity Bar to open the extension.


# If you are a Aptos developer, please select the Aptos feature.
* Step 1: Create a Working Folder**
  Before you get started with Movelazy, you need to create an empty folder in your working directory. This is the first step to make sure that all the proper organization is done.
* Step 2: Open this folder in Visual Studio Code.**
* Step 3: Choose a Development Platform**
  In the Movelazy interface, you will see two main options: "Solidity" and "Aptos".
  If you want to develop Aptos platform, click on the "Aptos" option.

* Step 4: Click the "Initialize Aptos Project" button**
- When you click this button, Movelazy will do the following:
- Initialize a new npm project (if it doesn't exist yet).
Install Aptos and the dependencies needed to develop on the Aptos platform.
Create the initial project structure, prepare the development environment.
* Step 5: Configure the Compiler***

**Package Directory**:

- Use the command in the terminal to get the current path and fill it in here. Make sure that this path is the correct folder that you created in the first step.`pwd`
- If left empty, it will take the current directory.

**Chain Management**:

- Select one of the testnets:
    - Proto
    - Suzuka
    - Bardock

**Name module**:

- Enter the module name as, which is the name of the project that you created.`hello_blockchain`

**Move Version**:

- Select the version of Move that you want to use.

**Enable Optimizer**:

- If you want, you can enable this option to optimize compilation performance.

**Bytecode Hash**:

- Select the hash type that you want to use.
* Step 6: Compile the source code**
  You can write a smart contract for the compiler.
  Once the configuration is complete, click the "Compile" button to start the process of compiling the Aptos source code for the module.`hello_blockchain`
    
- **Step 7: Unit Testing Go to the Tests section:** 
Select the "Tester" tab in Movelazy Run Unit Tests: 
Click the "Tester" button to start running the test
- **Step 8: Deploy Smart Contract**
- Go to Deployment Settings:
Go to the "Deploy" tab in Movelazy
The system automatically creates an account for you
Account Management:
The account address has been created
Public Key and Private Key are automatically generated
Press "Connect" to create a new wallet if you want to deploy multiple times
Each time Connect will generate a new key
Prepare to deploy:
Check the address named: hello_blockchain
Press "Faucet" to receive testnet tokens
Wait for balance confirmation (Balance)
Deploy:
Press the "Deploy" button to develop the smart contract
Wait for the transaction to be confirmed
    
    Make sure to accept the transaction in the prompt. You can now check the status of your transaction using the Movement Explores.
    
- **Note:**
- If you use "Connect" to create a new wallet, remember to copy the Account Address, Public Key, and Private Key to the config.yaml file in the current directory for easy management.
Store the private key securely every time you create a new wallet.
Make sure you have enough balance to deploy.
Double check the information before deploying.
Remember the contract address after each successful deployment.
After copying to config.yaml, you must recompile to continue the deployment process.
