import { exec, spawn } from "child_process";
import * as vscode from "vscode";
import { promisify } from "util";
import { TestArgs } from "../contract/aptos/types";
import path from "path";
import * as fs from "fs";
import { stderr } from "process";

const execAsync = promisify(exec);

async function CheckAptos(): Promise<Boolean> {
  try {
    // Run command "aptos --version"
    const { stdout } = await execAsync("aptos --version");

    // If has output, Aptos has been installed
    if (stdout.trim().length > 0) {
      return true;
    }

    // Other case, Aptos has not been installed
    return false;
  } catch (error) {
    return false;
  }
}

async function CheckAptosInit(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    // Get workspace path
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspacePath) {
      resolve(false);
      return;
    }

    const aptosProcess = spawn("aptos", ["init"], {
      cwd: workspacePath, // Set current working directory
      stdio: ["pipe", "pipe", "pipe"], // Connect stdin, stdout, stderr
    });

    // Listen output (stdout) from process
    aptosProcess.stdout.on("data", (data) => {
      const output = data.toString();

      // Check notify "Aptos already initialized for profile default"
      if (output.includes("Aptos already initialized for profile default")) {
        aptosProcess.kill(); // terminate process
        resolve(true); // Return true
      }

      // If have other input request, return false
      if (output.includes("Please choose a network")) {
        aptosProcess.kill(); // terminate process
        resolve(false); // Return false
      }
    });

    // Listen error (stderr)
    aptosProcess.stderr.on("data", (data) => {
      console.error("Error:", data.toString());
      aptosProcess.kill(); // Terminate process when error
      resolve(false); // Return false when error
    });

    // Listen when process end
    aptosProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Aptos process failed with exit code ${code}`);
        resolve(false); // Return false when process failed
      }
    });
  });
}

async function deleteAptosFolder() {
  const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

  if (!workspacePath) {
    vscode.window.showErrorMessage("Workspace path not found.");
    return;
  }

  const aptosFolderPath = path.join(workspacePath, ".aptos");

  try {
    // Kiểm tra xem thư mục .aptos có tồn tại không
    if (fs.existsSync(aptosFolderPath)) {
      // Xóa thư mục .aptos nếu tồn tại
      await fs.promises.rm(aptosFolderPath, { recursive: true, force: true });
    }
  } catch (error) {
    throw new Error("Failed to delete .aptos folder: " + error);
  }
}

async function AptosInit(
  webview: vscode.Webview,
  network: string = "devnet",
  endpoint: string,
  faucetEndpoint: string,
  privateKey: string
) {
  // Get workspace path
  const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspacePath) {
    throw new Error("Workspace path not found");
  }

  const isAptosInit = await CheckAptosInit();
  if (isAptosInit) {
    await deleteAptosFolder();
  }

  function custom(
    network: string,
    endpoint: string,
    faucetEndpoint: string,
    privateKey: string
  ) {
    const aptosProcess = spawn("aptos", ["init"], {
      cwd: workspacePath,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let outputData = "";
    aptosProcess.stderr.on("data", (data) => {
      const output = data.toString();

      if (output.includes("Choose network")) {
        aptosProcess.stdin.write(`${network}\n`);
      }

      if (output.includes("Enter your rest endpoint")) {
        aptosProcess.stdin.write(`${endpoint || ""}\n`);
      }

      if (output.includes("Enter your faucet endpoint")) {
        aptosProcess.stdin.write(`${faucetEndpoint || ""}\n`);
      }

      if (output.includes("Enter your private key as a hex literal")) {
        aptosProcess.stdin.write(`${privateKey || ""}\n`);
      }

      if (output.includes("creating it and funding it")) {
        console.log("Creating and funding account...");
        aptosProcess.stdin.write(`\n`);
      }

      if (output.includes("account") || output.includes("Account")) {
        outputData += output;
      }
    });

    aptosProcess.on("close", (code) => {
      if (code === 0) {
        webview.postMessage({
          type: "cliStatus",
          success: true,
          message: outputData,
        });
      } else {
        webview.postMessage({
          type: "cliStatus",
          success: false,
          message: `Aptos initialization failed with exit code ${code}`,
        });
      }
    });
  }

  function notCustom(network: string, privateKey: string) {
    console.log("Initializing Aptos CLI...");

    let isDevnet = network === "devnet";

    const aptosProcess = spawn("aptos", ["init"], {
      cwd: workspacePath,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let outputData = "";

    aptosProcess.stderr.on("data", (data) => {
      const output = data.toString();
      console.log("CLI Output:", output);

      if (output.includes("already initialized")) {
        console.log("Aptos already initialized, confirming overwrite...");
        aptosProcess.stdin.write("yes\n");
      } else if (output.includes("Choose network")) {
        console.log(`Selecting network: ${network}`);
        aptosProcess.stdin.write(`${network}\n`);
      } else if (output.includes("Enter your private key as a hex literal")) {
        console.log("Entering private key...");
        aptosProcess.stdin.write(`${privateKey || ""}\n`);
      } else if (
        output.includes("The account has not been created on chain yet")
      ) {
        if (network === "testnet") {
          webview.postMessage({
            type: "cliStatus",
            success: true,
            message: "Success initialized with network " + network + output,
          });
        } else if (network === "mainnet") {
          webview.postMessage({
            type: "cliStatus",
            success: true,
            message: "Success initialized with network " + network,
          });
        }

        aptosProcess.kill();
      } else {
        console.log("Skip init...");
        aptosProcess.stdin.write("\n");
        webview.postMessage({
          type: "cliStatus",
          success: true,
          message: outputData.trim(),
        });
      }

      if (output.match(/Account\s0x[a-fA-F0-9]+/)) {
        outputData += output;
      }
    });

    if (isDevnet) {
      aptosProcess.on("close", (code) => {
        if (code === 0) {
          webview.postMessage({
            type: "cliStatus",
            success: true,
            message: outputData.trim(),
          });
        } else {
          webview.postMessage({
            type: "cliStatus",
            success: false,
            message: `Aptos initialization failed with exit code ${code}`,
          });
        }
      });
    }
  }

  if (network === "custom") {
    custom(network, endpoint, faucetEndpoint, privateKey);
  } else {
    notCustom(network, privateKey);
  }
}

async function AptosInfo(webview: vscode.Webview) {
  const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspacePath) {
    throw new Error("Workspace path not found");
  }

  try {
    const { stdout, stderr } = await execAsync("aptos info", {
      cwd: workspacePath,
    });
    webview.postMessage({
      type: "cliStatus",
      success: true,
      message: stderr + stdout,
    });
  } catch (error) {
    webview.postMessage({
      type: "cliStatus",
      success: false,
      message: (error as Error).message,
    });
  }
}

async function cleanProjectFiles(workspacePath: string) {
  const dirsToClean = ["sources", "scripts", "tests"];
  const filesToClean = [".gitignore", "Move.toml"];

  try {
    // Clean directories
    for (const dir of dirsToClean) {
      const dirPath = path.join(workspacePath, dir);
      if (fs.existsSync(dirPath)) {
        await fs.promises.rm(dirPath, { recursive: true, force: true });
      }
    }

    // Clean files
    for (const file of filesToClean) {
      const filePath = path.join(workspacePath, file);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  } catch (error) {
    throw new Error(`Failed to clean project files: ${error}`);
  }
}

async function AptosMoveInit(
  webview: vscode.Webview,
  name: string,
  packageDir: string,
  namedAddresses: string,
  template: string,
  assumeYes: boolean,
  assumeNo: boolean,
  frameworkGitRev: string,
  frameworkLocalDir: string,
  skipFetchLatestGitDeps: boolean
) {
  if (!name || name.trim() === "") {
    webview.postMessage({
      type: "cliStatus",
      success: false,
      message: "Error: Project name is required",
    });
    return;
  }
  const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspacePath) {
    throw new Error("Workspace path not found");
  }

  const sourcesPath = path.join(workspacePath, "sources");
  if (fs.existsSync(sourcesPath)) {
    try {
      const files = await fs.promises.readdir(sourcesPath);
      if (files.length > 0) {
        // Send confirmation request to webview
        webview.postMessage({
          type: "cliStatus",
          success: false,
          message:
            "Sources directory already contains files. Delete to continue init?",
        });
        return; // Wait for user response before proceeding
      }
    } catch (error) {
      throw new Error("Failed to read sources directory: " + error);
    }
  }

  await cleanProjectFiles(workspacePath);

  let command = "aptos move init";
  if (name) {
    command += " --name " + name;
  }
  if (packageDir !== "") {
    command += " --package-dir " + packageDir;
  }
  if (namedAddresses !== "") {
    command += " --named-addresses " + namedAddresses;
  }
  if (
    template === "NFT_Marketplace" ||
    template === "moon_coin" ||
    template === "ToDo_list" ||
    template === "hello_prover" ||
    template === "hello-blockchain"
  ) {
    command += " --template hello-blockchain";
  }

  try {
    const { stdout, stderr } = await execAsync(command, { cwd: workspacePath });
    webview.postMessage({
      type: "cliStatus",
      success: true,
      message: stderr + stdout,
    });

    const sourcePath = path.join(workspacePath, "sources");
    const oldFile = path.join(sourcePath, "hello_blockchain.move");
    const moveTomlPath = path.join(workspacePath, "Move.toml");

    if (template === "moon_coin") {
      const newFile = path.join(sourcePath, "Coin.move");
      await fs.promises.rename(oldFile, newFile);

      const coinContent = `
module ${name}::moon_coin {
    struct MoonCoin {}

    fun init_module(sender: &signer) {
        aptos_framework::managed_coin::initialize<MoonCoin>(
            sender,
            b"Moon Coin",
            b"MOON",
            6,
            false,
        );
    }
}`;
      await fs.promises.writeFile(newFile, coinContent.trim());

      const moveTomlContent = await fs.promises.readFile(moveTomlPath, "utf8");
      await fs.promises.writeFile(
        moveTomlPath,
        moveTomlContent.replace(/hello_blockchain/g, name)
      );
    } else if (template === "NFT_Marketplace") {
      const newFile = path.join(sourcePath, "Marketplace_NFT.move");
      await fs.promises.rename(oldFile, newFile);

      const nftContent = `module ${name}::marketplace {
                use std::error;
                use std::signer;
                use std::option;
                use aptos_std::smart_vector;
                use aptos_framework::aptos_account;
                use aptos_framework::coin;
                use aptos_framework::object;

                #[test_only]
                friend marketplace_addr::test_marketplace;

                const APP_OBJECT_SEED: vector<u8> = b"MARKETPLACE";

                const ENO_LISTING: u64 = 1;
                const ENO_SELLER: u64 = 2;

                struct MarketplaceSigner has key {
                    extend_ref: object::ExtendRef,
                }

                struct Sellers has key {
                    addresses: smart_vector::SmartVector<address>
                }

                #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
                struct Listing has key {
                    object: object::Object<object::ObjectCore>,
                    seller: address,
                    delete_ref: object::DeleteRef,
                    extend_ref: object::ExtendRef,
                }

                #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
                struct FixedPriceListing<phantom CoinType> has key {
                    price: u64,
                }

                struct SellerListings has key {
                    listings: smart_vector::SmartVector<address>
                }

                fun init_module(deployer: &signer) {
                    let constructor_ref = object::create_named_object(
                        deployer,
                        APP_OBJECT_SEED,
                    );
                    let extend_ref = object::generate_extend_ref(&constructor_ref);
                    let marketplace_signer = &object::generate_signer(&constructor_ref);

                    move_to(marketplace_signer, MarketplaceSigner {
                        extend_ref,
                    });
                }

                public entry fun list_with_fixed_price<CoinType>(
                    seller: &signer,
                    object: object::Object<object::ObjectCore>,
                    price: u64,
                ) acquires SellerListings, Sellers, MarketplaceSigner {
                    list_with_fixed_price_internal<CoinType>(seller, object, price);
                }

                public entry fun purchase<CoinType>(
                    purchaser: &signer,
                    object: object::Object<object::ObjectCore>,
                ) acquires FixedPriceListing, Listing, SellerListings, Sellers {
                    let listing_addr = object::object_address(&object);

                    assert!(exists<Listing>(listing_addr), error::not_found(ENO_LISTING));
                    assert!(exists<FixedPriceListing<CoinType>>(listing_addr), error::not_found(ENO_LISTING));

                    let FixedPriceListing {
                        price,
                    } = move_from<FixedPriceListing<CoinType>>(listing_addr);

                    let coins = coin::withdraw<CoinType>(purchaser, price);

                    let Listing {
                        object,
                        seller,
                        delete_ref,
                        extend_ref,
                    } = move_from<Listing>(listing_addr);

                    let obj_signer = object::generate_signer_for_extending(&extend_ref);
                    object::transfer(&obj_signer, object, signer::address_of(purchaser));
                    object::delete(delete_ref);

                    let seller_listings = borrow_global_mut<SellerListings>(seller);
                    let (exist, idx) = smart_vector::index_of(&seller_listings.listings, &listing_addr);
                    assert!(exist, error::not_found(ENO_LISTING));
                    smart_vector::remove(&mut seller_listings.listings, idx);

                    if (smart_vector::length(&seller_listings.listings) == 0) {
                        let sellers = borrow_global_mut<Sellers>(get_marketplace_signer_addr());
                        let (exist, idx) = smart_vector::index_of(&sellers.addresses, &seller);
                        assert!(exist, error::not_found(ENO_SELLER));
                        smart_vector::remove(&mut sellers.addresses, idx);
                    };

                    aptos_account::deposit_coins(seller, coins);
                }

                public(friend) fun list_with_fixed_price_internal<CoinType>(
                    seller: &signer,
                    object: object::Object<object::ObjectCore>,
                    price: u64,        
                ): object::Object<Listing> acquires SellerListings, Sellers, MarketplaceSigner {
                    let constructor_ref = object::create_object(signer::address_of(seller));

                    let transfer_ref = object::generate_transfer_ref(&constructor_ref);
                    object::disable_ungated_transfer(&transfer_ref);

                    let listing_signer = object::generate_signer(&constructor_ref);

                    let listing = Listing {
                        object,
                        seller: signer::address_of(seller),
                        delete_ref: object::generate_delete_ref(&constructor_ref),
                        extend_ref: object::generate_extend_ref(&constructor_ref),
                    };
                    let fixed_price_listing = FixedPriceListing<CoinType> {
                        price,
                    };
                    move_to(&listing_signer, listing);
                    move_to(&listing_signer, fixed_price_listing);

                    object::transfer(seller, object, signer::address_of(&listing_signer));

                    let listing = object::object_from_constructor_ref(&constructor_ref);

                    if (exists<SellerListings>(signer::address_of(seller))) {
                        let seller_listings = borrow_global_mut<SellerListings>(signer::address_of(seller));
                        smart_vector::push_back(&mut seller_listings.listings, object::object_address(&listing));
                    } else {
                        let seller_listings = SellerListings {
                            listings: smart_vector::new(),
                        };
                        smart_vector::push_back(&mut seller_listings.listings, object::object_address(&listing));
                        move_to(seller, seller_listings);
                    };
                    if (exists<Sellers>(get_marketplace_signer_addr())) {
                        let sellers = borrow_global_mut<Sellers>(get_marketplace_signer_addr());
                        if (!smart_vector::contains(&sellers.addresses, &signer::address_of(seller))) {
                            smart_vector::push_back(&mut sellers.addresses, signer::address_of(seller));
                        }
                    } else {
                        let sellers = Sellers {
                            addresses: smart_vector::new(),
                        };
                        smart_vector::push_back(&mut sellers.addresses, signer::address_of(seller));
                        move_to(&get_marketplace_signer(get_marketplace_signer_addr()), sellers);
                    };

                    listing
                }

                #[view]
                public fun price<CoinType>(
                    object: object::Object<Listing>,
                ): option::Option<u64> acquires FixedPriceListing {
                    let listing_addr = object::object_address(&object);
                    if (exists<FixedPriceListing<CoinType>>(listing_addr)) {
                        let fixed_price = borrow_global<FixedPriceListing<CoinType>>(listing_addr);
                        option::some(fixed_price.price)
                    } else {
                        assert!(false, error::not_found(ENO_LISTING));
                        option::none()
                    }
                }

                #[view]
                public fun listing(object: object::Object<Listing>): (object::Object<object::ObjectCore>, address) acquires Listing {
                    let listing = borrow_listing(object);
                    (listing.object, listing.seller)
                }

                #[view]
                public fun get_seller_listings(seller: address): vector<address> acquires SellerListings {
                    if (exists<SellerListings>(seller)) {
                        smart_vector::to_vector(&borrow_global<SellerListings>(seller).listings)
                    } else {
                        vector[]
                    }
                }

                #[view]
                public fun get_sellers(): vector<address> acquires Sellers {
                    if (exists<Sellers>(get_marketplace_signer_addr())) {
                        smart_vector::to_vector(&borrow_global<Sellers>(get_marketplace_signer_addr()).addresses)
                    } else {
                        vector[]
                    }
                }

                #[test_only]
                public fun setup_test(marketplace: &signer) {
                    init_module(marketplace);
                }

                fun get_marketplace_signer_addr(): address {
                    object::create_object_address(&@0x1, APP_OBJECT_SEED)
                }

                fun get_marketplace_signer(marketplace_signer_addr: address): signer acquires MarketplaceSigner {
                    object::generate_signer_for_extending(&borrow_global<MarketplaceSigner>(marketplace_signer_addr).extend_ref)
                }

                inline fun borrow_listing(object: object::Object<Listing>): &Listing acquires Listing {
                    let obj_addr = object::object_address(&object);
                    assert!(exists<Listing>(obj_addr), error::not_found(ENO_LISTING));
                    borrow_global<Listing>(obj_addr)
                }
            }

            #[test_only]
            module ${name}::test_marketplace {
                use std::option;
                use aptos_framework::aptos_coin;
                use aptos_framework::coin;
                use aptos_framework::object;
                use aptos_token_objects::token;
                use marketplace_addr::marketplace;
                use marketplace_addr::test_utils;

                #[test(aptos_framework = @0x1, marketplace = @0x111, seller = @0x222, purchaser = @0x333)]
                fun test_fixed_price(
                    aptos_framework: &signer,
                    marketplace: &signer,
                    seller: &signer,
                    purchaser: &signer,
                ) {
                    let (_marketplace_addr, seller_addr, purchaser_addr) =
                        test_utils::setup(aptos_framework, marketplace, seller, purchaser);

                    let (token, listing) = fixed_price_listing(seller, 500);

                    let (listing_obj, seller_addr2) = marketplace::listing(listing);
                    assert!(listing_obj == object::convert(token), 0);
                    assert!(seller_addr2 == seller_addr, 0);
                    assert!(marketplace::price<aptos_coin::AptosCoin>(listing) == option::some(500), 0);
                    assert!(object::owner(token) == object::object_address(&listing), 0);

                    marketplace::purchase<aptos_coin::AptosCoin>(purchaser, object::convert(listing));

                    assert!(object::owner(token) == purchaser_addr, 0);
                    assert!(coin::balance<aptos_coin::AptosCoin>(seller_addr) == 10500, 0);
                    assert!(coin::balance<aptos_coin::AptosCoin>(purchaser_addr) == 9500, 0);
                }

                #[test(aptos_framework = @0x1, marketplace = @0x111, seller = @0x222, purchaser = @0x333)]
                #[expected_failure(abort_code = 0x10006, location = aptos_framework::coin)]
                fun test_not_enough_coin_fixed_price(
                    aptos_framework: &signer,
                    marketplace: &signer,
                    seller: &signer,
                    purchaser: &signer,
                ) {
                    test_utils::setup(aptos_framework, marketplace, seller, purchaser);

                    let (_token, listing) = fixed_price_listing(seller, 100000);

                    marketplace::purchase<aptos_coin::AptosCoin>(purchaser, object::convert(listing));
                }

                #[test(aptos_framework = @0x1, marketplace = @0x111, seller = @0x222, purchaser = @0x333)]
                #[expected_failure(abort_code = 0x60001, location = marketplace_addr::marketplace)]
                fun test_no_listing(
                    aptos_framework: &signer,
                    marketplace: &signer,
                    seller: &signer,
                    purchaser: &signer,
                ) {
                    let (_, seller_addr, _) = test_utils::setup(aptos_framework, marketplace, seller, purchaser);

                    let dummy_constructor_ref = object::create_object(seller_addr);
                    let dummy_object = object::object_from_constructor_ref<object::ObjectCore>(&dummy_constructor_ref);

                    marketplace::purchase<aptos_coin::AptosCoin>(purchaser, object::convert(dummy_object));
                }

                inline fun fixed_price_listing(
                    seller: &signer,
                    price: u64
                ): (object::Object<token::Token>, object::Object<marketplace::Listing>) {
                    let token = test_utils::mint_tokenv2(seller);
                    fixed_price_listing_with_token(seller, token, price)
                }

                inline fun fixed_price_listing_with_token(
                    seller: &signer,
                    token: object::Object<token::Token>,
                    price: u64
                ): (object::Object<token::Token>, object::Object<marketplace::Listing>) {
                    let listing = marketplace::list_with_fixed_price_internal<aptos_coin::AptosCoin>(
                        seller,
                        object::convert(token),
                        price,
                    );
                    (token, listing)
                }
            }`; // Your NFT marketplace content here
      await fs.promises.writeFile(newFile, nftContent);

      const moveTomlContent = await fs.promises.readFile(moveTomlPath, "utf8");
      await fs.promises.writeFile(
        moveTomlPath,
        moveTomlContent.replace(/hello_blockchain/g, name)
      );
    } else if (template === "ToDo_list") {
      const newFile = path.join(sourcePath, "AdvancedTodoList.move");
      await fs.promises.rename(oldFile, newFile);

      const todoContent = `module ${name}::advanced_todo_list {
                use std::bcs;
                use std::signer;
                use std::vector;
                use std::string::String;
                use aptos_std::string_utils;
                use aptos_framework::object;

                const E_TODO_LIST_DOSE_NOT_EXIST: u64 = 1;
                const E_TODO_DOSE_NOT_EXIST: u64 = 2;
                const E_TODO_ALREADY_COMPLETED: u64 = 3;

                struct UserTodoListCounter has key {
                    counter: u64,
                }

                struct TodoList has key {
                    owner: address,
                    todos: vector<Todo>,
                }

                struct Todo has store, drop, copy {
                    content: String,
                    completed: bool,
                }

                fun init_module(_module_publisher: &signer) {
                }

                public entry fun create_todo_list(sender: &signer) acquires UserTodoListCounter {
                    let sender_address = signer::address_of(sender);
                    let counter = if (exists<UserTodoListCounter>(sender_address)) {
                        let counter = borrow_global<UserTodoListCounter>(sender_address);
                        counter.counter
                    } else {
                        let counter = UserTodoListCounter { counter: 0 };
                        move_to(sender, counter);
                        0
                    };
                    let obj_holds_todo_list = object::create_named_object(
                        sender,
                        construct_todo_list_object_seed(counter),
                    );
                    let obj_signer = object::generate_signer(&obj_holds_todo_list);
                    let todo_list = TodoList {
                        owner: sender_address,
                        todos: vector::empty(),
                    };
                    move_to(&obj_signer, todo_list);
                    let counter = borrow_global_mut<UserTodoListCounter>(sender_address);
                    counter.counter = counter.counter + 1;
                }

                public entry fun create_todo(sender: &signer, todo_list_idx: u64, content: String) acquires TodoList {
                    let sender_address = signer::address_of(sender);
                    let todo_list_obj_addr = object::create_object_address(
                        &sender_address,
                        construct_todo_list_object_seed(todo_list_idx)
                    );
                    assert_user_has_todo_list(todo_list_obj_addr);
                    let todo_list = borrow_global_mut<TodoList>(todo_list_obj_addr);
                    let new_todo = Todo {
                        content,
                        completed: false
                    };
                    vector::push_back(&mut todo_list.todos, new_todo);
                }

                public entry fun complete_todo(sender: &signer, todo_list_idx: u64, todo_idx: u64) acquires TodoList {
                    let sender_address = signer::address_of(sender);
                    let todo_list_obj_addr = object::create_object_address(
                        &sender_address,
                        construct_todo_list_object_seed(todo_list_idx)
                    );
                    assert_user_has_todo_list(todo_list_obj_addr);
                    let todo_list = borrow_global_mut<TodoList>(todo_list_obj_addr);
                    assert_user_has_given_todo(todo_list, todo_idx);
                    let todo_record = vector::borrow_mut(&mut todo_list.todos, todo_idx);
                    assert!(todo_record.completed == false, E_TODO_ALREADY_COMPLETED);
                    todo_record.completed = true;
                }

                #[view]
                public fun get_todo_list_counter(sender: address): u64 acquires UserTodoListCounter {
                    if (exists<UserTodoListCounter>(sender)) {
                        let counter = borrow_global<UserTodoListCounter>(sender);
                        counter.counter
                    } else {
                        0
                    }
                }

                #[view]
                public fun get_todo_list_obj_addr(sender: address, todo_list_idx: u64): address {
                    object::create_object_address(&sender, construct_todo_list_object_seed(todo_list_idx))
                }

                #[view]
                public fun has_todo_list(sender: address, todo_list_idx: u64): bool {
                    let todo_list_obj_addr = get_todo_list_obj_addr(sender, todo_list_idx);
                    exists<TodoList>(todo_list_obj_addr)
                }

                #[view]
                public fun get_todo_list(sender: address, todo_list_idx: u64): (address, u64) acquires TodoList {
                    let todo_list_obj_addr = get_todo_list_obj_addr(sender, todo_list_idx);
                    assert_user_has_todo_list(todo_list_obj_addr);
                    let todo_list = borrow_global<TodoList>(todo_list_obj_addr);
                    (todo_list.owner, vector::length(&todo_list.todos))
                }

                #[view]
                public fun get_todo_list_by_todo_list_obj_addr(todo_list_obj_addr: address): (address, u64) acquires TodoList {
                    let todo_list = borrow_global<TodoList>(todo_list_obj_addr);
                    (todo_list.owner, vector::length(&todo_list.todos))
                }

                #[view]
                public fun get_todo(sender: address, todo_list_idx: u64, todo_idx: u64): (String, bool) acquires TodoList {
                    let todo_list_obj_addr = get_todo_list_obj_addr(sender, todo_list_idx);
                    assert_user_has_todo_list(todo_list_obj_addr);
                    let todo_list = borrow_global<TodoList>(todo_list_obj_addr);
                    assert!(todo_idx < vector::length(&todo_list.todos), E_TODO_DOSE_NOT_EXIST);
                    let todo_record = vector::borrow(&todo_list.todos, todo_idx);
                    (todo_record.content, todo_record.completed)
                }

                fun assert_user_has_todo_list(user_addr: address) {
                    assert!(
                        exists<TodoList>(user_addr),
                        E_TODO_LIST_DOSE_NOT_EXIST
                    );
                }

                fun assert_user_has_given_todo(todo_list: &TodoList, todo_id: u64) {
                    assert!(
                        todo_id < vector::length(&todo_list.todos),
                        E_TODO_DOSE_NOT_EXIST
                    );
                }

                fun get_todo_list_obj(sender: address, todo_list_idx: u64): object::Object<TodoList> {
                    let addr = get_todo_list_obj_addr(sender, todo_list_idx);
                    object::address_to_object(addr)
                }

                fun construct_todo_list_object_seed(counter: u64): vector<u8> {
                    bcs::to_bytes(&string_utils::format2(&b"{}_{}", @advanced_todo_list_addr, counter))
                }

                #[test_only]
                use std::string;
                #[test_only]
                use aptos_framework::account;
                #[test_only]
                use aptos_std::debug;

                #[test(admin = @0x100)]
                public entry fun test_end_to_end(admin: signer) acquires TodoList, UserTodoListCounter {
                    let admin_addr = signer::address_of(&admin);
                    let todo_list_idx = get_todo_list_counter(admin_addr);
                    assert!(todo_list_idx == 0, 1);
                    account::create_account_for_test(admin_addr);
                    assert!(!has_todo_list(admin_addr, todo_list_idx), 2);
                    create_todo_list(&admin);
                    assert!(get_todo_list_counter(admin_addr) == 1, 3);
                    assert!(has_todo_list(admin_addr, todo_list_idx), 4);

                    create_todo(&admin, todo_list_idx, string::utf8(b"New Todo"));
                    let (todo_list_owner, todo_list_length) = get_todo_list(admin_addr, todo_list_idx);
                    debug::print(&string_utils::format1(&b"todo_list_owner: {}", todo_list_owner));
                    debug::print(&string_utils::format1(&b"todo_list_length: {}", todo_list_length));
                    assert!(todo_list_owner == admin_addr, 5);
                    assert!(todo_list_length == 1, 6);

                    let (todo_content, todo_completed) = get_todo(admin_addr, todo_list_idx, 0);
                    debug::print(&string_utils::format1(&b"todo_content: {}", todo_content));
                    debug::print(&string_utils::format1(&b"todo_completed: {}", todo_completed));
                    assert!(!todo_completed, 7);
                    assert!(todo_content == string::utf8(b"New Todo"), 8);

                    complete_todo(&admin, todo_list_idx, 0);
                    let (_todo_content, todo_completed) = get_todo(admin_addr, todo_list_idx, 0);
                    debug::print(&string_utils::format1(&b"todo_completed: {}", todo_completed));
                    assert!(todo_completed, 9);
                }

                #[test(admin = @0x100)]
                public entry fun test_end_to_end_2_todo_lists(admin: signer) acquires TodoList, UserTodoListCounter {
                    let admin_addr = signer::address_of(&admin);
                    create_todo_list(&admin);
                    let todo_list_1_idx = get_todo_list_counter(admin_addr) - 1;
                    create_todo_list(&admin);
                    let todo_list_2_idx = get_todo_list_counter(admin_addr) - 1;

                    create_todo(&admin, todo_list_1_idx, string::utf8(b"New Todo"));
                    let (todo_list_owner, todo_list_length) = get_todo_list(admin_addr, todo_list_1_idx);
                    assert!(todo_list_owner == admin_addr, 1);
                    assert!(todo_list_length == 1, 2);

                    let (todo_content, todo_completed) = get_todo(admin_addr, todo_list_1_idx, 0);
                    assert!(!todo_completed, 3);
                    assert!(todo_content == string::utf8(b"New Todo"), 4);

                    complete_todo(&admin, todo_list_1_idx, 0);
                    let (_todo_content, todo_completed) = get_todo(admin_addr, todo_list_1_idx, 0);
                    assert!(todo_completed, 5);

                    create_todo(&admin, todo_list_2_idx, string::utf8(b"New Todo"));
                    let (todo_list_owner, todo_list_length) = get_todo_list(admin_addr, todo_list_2_idx);
                    assert!(todo_list_owner == admin_addr, 6);
                    assert!(todo_list_length == 1, 7);

                    let (todo_content, todo_completed) = get_todo(admin_addr, todo_list_2_idx, 0);
                    assert!(!todo_completed, 8);
                    assert!(todo_content == string::utf8(b"New Todo"), 9);

                    complete_todo(&admin, todo_list_2_idx, 0);
                    let (_todo_content, todo_completed) = get_todo(admin_addr, todo_list_2_idx, 0);
                    assert!(todo_completed, 10);
                }

                #[test(admin = @0x100)]
                #[expected_failure(abort_code = E_TODO_LIST_DOSE_NOT_EXIST, location = Self)]
                public entry fun test_todo_list_does_not_exist(admin: signer) acquires TodoList, UserTodoListCounter {
                    let admin_addr = signer::address_of(&admin);
                    account::create_account_for_test(admin_addr);
                    let todo_list_idx = get_todo_list_counter(admin_addr);
                    create_todo(&admin, todo_list_idx, string::utf8(b"New Todo"));
                }

                #[test(admin = @0x100)]
                #[expected_failure(abort_code = E_TODO_DOSE_NOT_EXIST, location = Self)]
                public entry fun test_todo_does_not_exist(admin: signer) acquires TodoList, UserTodoListCounter {
                    let admin_addr = signer::address_of(&admin);
                    account::create_account_for_test(admin_addr);
                    let todo_list_idx = get_todo_list_counter(admin_addr);
                    create_todo_list(&admin);
                    complete_todo(&admin, todo_list_idx, 1);
                }

                #[test(admin = @0x100)]
                #[expected_failure(abort_code = E_TODO_ALREADY_COMPLETED, location = Self)]
                public entry fun test_todo_already_completed(admin: signer) acquires TodoList, UserTodoListCounter {
                    let admin_addr = signer::address_of(&admin);
                    account::create_account_for_test(admin_addr);
                    let todo_list_idx = get_todo_list_counter(admin_addr);
                    create_todo_list(&admin);
                    create_todo(&admin, todo_list_idx, string::utf8(b"New Todo"));
                    complete_todo(&admin, todo_list_idx, 0);
                    complete_todo(&admin, todo_list_idx, 0);
                }
            }`; // Your Todo list content here
      await fs.promises.writeFile(newFile, todoContent);

      const moveTomlContent = await fs.promises.readFile(moveTomlPath, "utf8");
      await fs.promises.writeFile(
        moveTomlPath,
        moveTomlContent.replace(/hello_blockchain/g, name)
      );
    } else if (template === "hello_prover") {
      const newFile = path.join(sourcePath, "HelloProver.move");
      await fs.promises.rename(oldFile, newFile);

      const proverContent = `
module ${name}::prove {
    fun plus1(x: u64): u64 {
        x+1
    }
    spec plus1 {
        ensures result == x+1;
    }

    fun abortsIf0(x: u64) {
        if (x == 0) {
            abort(0)
        };
    }
    spec abortsIf0 {
        aborts_if x == 0;
    }
}`;
      await fs.promises.writeFile(newFile, proverContent.trim());

      const moveTomlContent = await fs.promises.readFile(moveTomlPath, "utf8");
      await fs.promises.writeFile(
        moveTomlPath,
        moveTomlContent.replace(/hello_blockchain/g, name)
      );
    }
  } catch (error) {
    throw new Error("Failed to execute template commands: " + error);
  }

  if (assumeYes) {
    command += " --assume-yes";
  }
  if (assumeNo) {
    command += " --assume-no";
  }
  if (frameworkGitRev !== "") {
    command += " --framework-git-rev " + frameworkGitRev;
  }
  if (frameworkLocalDir !== "") {
    command += " --framework-local-dir " + frameworkLocalDir;
  }
  if (skipFetchLatestGitDeps) {
    command += " --skip-fetch-latest-git-deps";
  }

  try {
    const { stdout, stderr } = await execAsync(command, { cwd: workspacePath });
    webview.postMessage({
      type: "cliStatus",
      success: true,
      message: stderr + stdout,
    });
  } catch (error) {
    webview.postMessage({
      type: "cliStatus",
      success: false,
      message: (error as Error).message,
    });
  }
}

async function MoveTest(webview: vscode.Webview, args: TestArgs) {
  const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspacePath) {
    throw new Error("Workspace path not found");
  }

  let command = "aptos move test";
  if (args.namedAddresses !== "") {
    command += " --named-addresses " + args.namedAddresses + "=default";
  }
  if (args.filter !== "") {
    command += " --filter " + args.filter;
  }
  if (args.ignoreCompileWarnings) {
    command += " --ignore-compile-warnings";
  }
  if (args.packageDir !== "") {
    command += " --package-dir " + args.packageDir;
  }
  if (args.outputDir !== "") {
    command += " --output-dir " + args.outputDir;
  }
  if (args.overrideStd !== "") {
    command += " --override-std " + args.overrideStd;
  }
  if (args.skipFetchLatestGitDeps) {
    command += " --skip-fetch-latest-git-deps";
  }
  if (args.skipAttributeChecks) {
    command += " --skip-attribute-checks";
  }
  if (args.dev) {
    command += " --dev";
  }
  if (args.checkTestCode) {
    command += " --check-test-code";
  }
  if (args.optimize !== "") {
    command += " --optimize " + args.optimize;
  }
  if (args.bytecodeVersion !== "") {
    command += " --bytecode-version " + args.bytecodeVersion;
  }
  if (args.compilerVersion !== "") {
    command += " --compiler-version " + args.compilerVersion;
  }
  if (args.languageVersion !== "") {
    command += " --language-version " + args.languageVersion;
  }
  if (args.moveVersion !== "") {
    command += " --move-version " + args.moveVersion;
  }
  if (args.instructions !== "") {
    command += " --instructions " + args.instructions;
  }
  if (args.coverage) {
    command += " --coverage";
  }
  if (args.dump) {
    command += " --dump";
  }

  try {
    const { stdout } = await execAsync(command, { cwd: workspacePath });
    webview.postMessage({
      type: "cliStatus",
      success: true,
      message: stdout,
    });
  } catch (error) {
    webview.postMessage({
      type: "cliStatus",
      success: false,
      message: (error as Error).message,
    });
  }
}

export {
  CheckAptos,
  CheckAptosInit,
  AptosInit,
  AptosMoveInit,
  AptosInfo,
  MoveTest,
};
