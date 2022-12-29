console.log("Entered firebase.js")

// helper functions
function ValidateEmail(input) {
    var validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (input.match(validRegex)) {return true;}
    else {return false;}
}

function resetSession() {
    fetch(baseURL+"resetSession",{method:'GET'})
    .then((res)=>{
        if (res.ok) {
            alert("You will been signed out!");
        } else {
            alert("Could not sign out.")
        }
    }).catch((error)=>{
        alert("An error "+error+" occured. Please contact Ike for assistance.");
    })
    window.location.href = "/";
    sessionStorage.clear();
}

function checkLength(value) {
    return value.length >= 8;
}

function checkCaps(value) {
    const caps = /[A-Z]/g;
    return value.match(caps);
}

function checkLow(value) {
    const low = /[a-z]/g;
    return value.match(low);
}

function checkNumber(value) {
    const numbers = /[0-9]/g;
    return value.match(numbers);
}

function clearProductSession(){
    sessionStorage.removeItem("title");
    sessionStorage.removeItem("desc");
    sessionStorage.removeItem("prices");
    sessionStorage.removeItem("filename");
    sessionStorage.removeItem("add-item");
}

function fileExists(url) {
    if(url){
        var req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.send()
        return req.status==200;
    } else {
        return false;
    }
}

function updateMenu(title,element,text_div) {
    fetch(baseURL+"admins", {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            option: "updateMenu",
            title: title
        })
    })
    .then((res)=> {
        if (res.ok) {return res.json()}
    })
    .then((status)=>{
        // Changed
        if (status.added === "false") {
            // removed from menu
            element.style.transition = "0.4s"
            element.classList.remove("in-menu");
            element.classList.add("no-menu");
            text_div.innerHTML = "Add to Menu";
            setTimeout(() => {
                element.style.transition = "0s";
            }, 500);
        } else {
            // added to menu
            element.style.transition = "0.4s"
            element.classList.remove("no-menu");
            element.classList.add("in-menu");
            setTimeout(() => {
                element.style.transition = "0s";
            }, 500);
            text_div.innerHTML = "Remove from Menu";
        }
    })
}

function gotoOrderPage(time,id,email,paid,order,date){
    sessionStorage.setItem("paynowItem-time",time);
    sessionStorage.setItem("paynowItem-id",id);
    sessionStorage.setItem("paynowItem-email",email);
    sessionStorage.setItem("paynowItem-paid",paid);
    sessionStorage.setItem("paynowItem-order",order);
    sessionStorage.setItem("paynowItem-date",date);
    window.location = "/admin/dashboard/order"
    // const result = await res.json();
    // if (result.status !== "true") {alert("An error has occured. Please try again later.")}
}

// ---------------------- CONNECTIONS TO BACKEND ---------------------- //

const curPage = window.location.pathname;
const baseURL = "/firebaseProcess/";

async function getCollection() {
    const res = await fetch(baseURL+"lastOrder", {method:'GET'});
    const data = await res.json();
    const ordering_text = document.querySelector("#collection-date");
    const col_text = document.querySelector("#collection-date-2");
    ordering_text.innerHTML = data.date;

    // gets details
    const day = data.date.split(" ")[0]
    const month = data.date.split(" ")[1]
    const year = data.date.split(" ")[2];

    col_text.innerHTML = `Collection date starts from ${parseInt(day)+1} to ${parseInt(day)+2} ${month} ${year}`

}

// Main page and Products
if (curPage === "/" || curPage === "/products") {
    async function get_allProducts() {
        const res = await fetch(baseURL+"get_allProducts/",
        {
            method:'GET'
        })
        
        const data = await res.json();
        
        // Home page
        if (curPage === "/") {
            // Initialise banner elements
            const itemBG = document.querySelector("#item");
            const itemContainer = itemBG.querySelector(".item-container");
            const itemBanner = itemBG.querySelector(".popup");
            const itemTitle = itemBanner.querySelector(".block-text h3");
            const itemDesc = itemBanner.querySelector(".block-text p");
            const itemPrices = itemBanner.querySelector(".block-quantity select");
            const itemQuantity = itemBanner.querySelector(".block-quantity input");
            const itemCancel = itemBanner.querySelector(".block-buttons .cancel");
            const itemX = itemBanner.querySelector(".close");
            const itemImage = itemBanner.querySelector(".block-popup .img-container");
    
            // Display Menu
            function displayMenu() {
                const product_container = document.querySelector("#menu #product-container");
                var count = 0;
    
                for (const [productName, productDetails] of Object.entries(data)) {
                    if (!data[productName].Menu) {
                        continue;
                    }
                    count += 1;
                    // Get details
                    const title = productName;
                    const lowestPrice = productDetails["Prices"].split(";")[0].split("-")[1];
                    // Create filename based on title
                    const filename = title.split(" ").join("-");
                    const filepath = `/resources/product-${filename}-1.png`;
                    
                    // Create elements
                    const product_item = document.createElement("div");
                    const image = document.createElement("img");
                    const product_details = document.createElement("div");
                    const title_h3 = document.createElement("h3");
                    const rating_div = document.createElement("div");
                    const star = document.createElement("i");
                    const price_text = document.createElement("h4");
                    const continue_button = document.createElement("i");
    
                    // Assign values
                    if (fileExists(filepath)) {
                        image.src = filepath;
                    } else {
                        image.src = 'resources/image-unavailable.png';
                    }
    
                    title_h3.innerHTML = title;
                    price_text.innerHTML = `From ${lowestPrice}`;
                    product_item.title = "Order Now";
    
                    // Add identifiers
                    product_item.classList.add('extra','product-item','hidden-left');
                    product_details.classList.add('product-details');
                    rating_div.classList.add("rating");
                    star.classList.add('fas','fa-star');
                    continue_button.classList.add('fas','fa-arrow-right','continue');
                    
                    // Add events
                    continue_button.addEventListener('click', () => {     
                        itemPrices.innerHTML = "";
                        itemQuantity.value = 1;
                        getProducts(title);
                    })
    
                    // Append Children
                    // Next time do proper rating
                    for (let i = 0; i < 5; i++) {
                        rating_div.appendChild(star.cloneNode(true));
                    }
    
                    product_details.appendChild(title_h3);
                    product_details.appendChild(rating_div);
                    product_details.append(price_text);
                    product_details.append(continue_button);
    
                    product_item.appendChild(image);
                    product_item.appendChild(product_details);
    
                    product_container.appendChild(product_item);                
                }
                animationIn();
                
                if (count === 0) {
                    const emptyBanner = document.querySelector("#menu .empty");
                    emptyBanner.style.display = "flex";
                }
               
            }
    
            // Initialise cart popup elements
            const cartPopup = document.querySelector("#popup-cart");
    
            // Hides banner
            function hideItemBanner (node) {
                // Animations to hide banner
                itemContainer.style.animation = "fade-out 400ms forwards";
                itemBanner.style.animation = "itemSlideOut 800ms forwards, fade-out 1000ms forwards";
                setTimeout(() => {
                    itemBG.style.visibility = "hidden";
                }, 500);
    
                // Clear click events of order button
                node.replaceWith(node.cloneNode(true));
            }
    
            // Show add to cart popup
            function showCartPopup () {
                // Animations to show popup
                cartPopup.style.visibility = "visible";
                cartPopup.style.animation = "fade-in 400ms forwards";
                setTimeout(() => {
                    cartPopup.style.animation = "fade-out 1000ms forwards";
                    setTimeout(() => {
                        cartPopup.style.visibility = "hidden";
                    }, 5000);
                }, 3500); // Timeout to delay hiding of popup
            }
    
            // Add to cart
            function addToCart(title, pack, quantity) {
                // console.log(`${title} ${pack} ${quantity}`);
                const packet = pack;
                const price = parseInt(pack.split(" - ")[1].substring(1));
                const storeName = `${title};${packet}`;
                const quantityPriceArr = [parseInt(quantity), price];
    
                // console.log(storeName);
                // console.log(quantityPriceArr)
                
                // For future use
                // var cartCount = parseInt(localStorage.getItem("cartCount"));
                // localStorage.setItem("cartCount",cartCount+1);
    
                var cartItems = JSON.parse(localStorage.getItem("cartItems"));
    
                if (storeName in cartItems) {
                    var currQuantityPriceArr = cartItems[storeName];
                    var currQuantity = parseInt(currQuantityPriceArr[0]);
                    currQuantity += parseInt(quantity);
                    
                    currQuantityPriceArr[0] = currQuantity;
                    cartItems[storeName] = currQuantityPriceArr;
                } else {
                    cartItems[storeName] = quantityPriceArr;
                }
    
                localStorage.setItem("cartItems", JSON.stringify(cartItems));
                // console.log("Logged from firebase.js")
                // console.log(localStorage.getItem("cartCount"));
                // console.log(JSON.parse(localStorage.getItem("cartItems")));
            }   
    
            // Display product details in #items banner
            function getProducts(title) {
    
                // Adds animations to item banner
                itemBG.style.visibility = "visible";
                itemContainer.style.animation = "fade-in 400ms forwards";
                itemBanner.style.animation = "itemSlideIn 800ms forwards, fade-in 1000ms forwards";
    
                // Assigns detail to respective element
                itemTitle.innerHTML = title;
                itemDesc.innerHTML = data[title]["Desc"];
    
                // Create filename based on title
                const filename = title.split(" ").join("-");
                const filepath = `../resources/product-${filename}-1.png`;
                itemImage.style.backgroundImage = `url(${filepath}`;
    
                // Add options to quantity selection
                const options = data[title]["Prices"].split(";");
                    options.forEach((price) => {
                        const option = document.createElement("option");
                        option.innerHTML = price;
                        option.value = price;
                        itemPrices.appendChild(option);
                    })
    
                // Cart
                const itemAddCart = itemBanner.querySelector(".order");
                itemAddCart.addEventListener('click', function() {
                    addToCart(title, itemPrices.value, itemQuantity.value);
                    showCartPopup();
                });
    
                // Handle exit banner events
                itemCancel.addEventListener('click', function() {
                    hideItemBanner(itemAddCart);
                });
    
                itemX.addEventListener('click', function() {
                    hideItemBanner(itemAddCart);
                });
    
            }
    
            // Add link for POPULAR product order button
            const orderNowButton = document.querySelector("#banner .order");
            orderNowButton.addEventListener('click', ()=> {
                itemPrices.innerHTML = "";
                itemQuantity.value = 1;
                getProducts("French Financiers"); // featured product name
            });
    
            displayMenu();
            getCollection();
        }
        else {
            // Product page
            getCollection();
            navEffects();
            const item_container = document.querySelector("#content #display");
        
            // get products from DB
            for (const [productName, productDetails] of Object.entries(data)) {
    
                // declare details
                const title = productDetails["Title"];
                const desc = productDetails["Desc"];
                const prices_list = productDetails["Prices"].split(";");
                
                // Create filename based on title
                const filename = title.split(" ").join("-");
                const filepath = `../resources/product-${filename}-1.png`;
    
                // New elements
                const product_container = document.createElement("div");
                const images_container = document.createElement("div");
                const block_text = document.createElement("div");
                const details_div = document.createElement("div");
                const title_h3 = document.createElement("h3");
                const desc_p = document.createElement("p");
                const price_div = document.createElement("div");
                const price_title = document.createElement("h4");
                const price_ul = document.createElement("ul");
    
                // Assign values
                title_h3.innerHTML = title;
                desc_p.innerHTML = desc;
                
                price_title.innerHTML = "Prices:";
    
                // check if image exists
                if (fileExists(filepath)) {
                    images_container.style.backgroundImage = `url(${filepath})`;
                } else {
                    images_container.style.backgroundImage = "url(../resources/image-unavailable.png)";
                }
    
                // Assign identities
                product_container.classList.add("product-container");
                images_container.classList.add("images-container");
                block_text.classList.add("block-text");
                details_div.classList.add("details");
    
                title_h3.classList.add("title");
                desc_p.classList.add("desc");
    
                price_div.classList.add("prices");
    
                // Add hidden animation
                product_container.classList.add("hidden");
                images_container.classList.add('hidden');
                block_text.classList.add('hidden');
                details_div.classList.add('hidden');
                title_h3.classList.add('hidden');
                desc_p.classList.add('hidden');
                price_div.classList.add('hidden');
                price_title.classList.add('hidden');
                price_ul.classList.add('hidden');
    
                // Append children
                details_div.appendChild(title_h3);
                details_div.appendChild(desc_p);
    
                price_div.appendChild(price_title);
                price_div.appendChild(price_ul);
    
                block_text.appendChild(details_div);
                block_text.appendChild(price_div);
    
                // Create price list
                prices_list.forEach((price) => {
                    const priceItem = document.createElement("li");
                    priceItem.innerHTML = price;
                    price_ul.appendChild(priceItem);                
                })
    
                product_container.appendChild(images_container);
                product_container.appendChild(block_text);
                item_container.appendChild(product_container);
            }
            animationIn();            
        }
    }
    get_allProducts();
}

// PayNow page
else if (curPage === "/paynow") {
    const agreement = document.querySelector("#agree-received");
    const buttonPay = document.querySelector("#pay-button");
    agreement.addEventListener('click',()=>{
        if (agreement.checked) {
            buttonPay.classList.remove("inactive");
            buttonPay.addEventListener('click',validatePaynow);
        } else {
            buttonPay.classList.add("inactive");
            buttonPay.removeEventListener('click',validatePaynow);
        }
    });

    function validatePaynow() {
        var emailcorrect = false;
        var idcorrect = false;

        const emailInput = document.querySelector("#input-email");
        const cfmEmailInput = document.querySelector("#input-email-cfm");
        const paynowInput = document.querySelector("#paynow-iden");
        const cfmPaynowInput = document.querySelector("#paynow-iden-cfm");
        const emailError = document.querySelector(".error.email p");
        const paynowError = document.querySelector(".error.paynow p");

        if (ValidateEmail(emailInput.value)) {
            emailInput.style.border = "none";
            if (cfmEmailInput.value === emailInput.value) {
                emailcorrect = true;
                cfmEmailInput.style.border = "none";
                emailError.innerHTML = "ERROR";
                emailError.style.visibility = "hidden";
            } else {
                emailcorrect = false;
                cfmEmailInput.style.border = "1px solid rgb(255, 74, 74)";
                emailError.style.visibility = "visible";
                emailError.innerHTML = "Emails do not match."
            }
        } else {
            emailInput.style.border = "1px solid rgb(255, 74, 74)";
            emailError.style.visibility = "visible";
            emailError.innerHTML = "Please enter a valid email."
            emailcorrect = false;
        }

        if (paynowInput.value === "") {
            idcorrect = false;
            paynowError.style.visibility = "visible";
            paynowError.innerHTML = "Enter a valid PayNow identification."
            paynowInput.style.border = "1px solid rgb(255, 74, 74)";
        } else {
            paynowInput.style.border = "none";
            if (paynowInput.value === cfmPaynowInput.value) {
                idcorrect = true;
                cfmPaynowInput.style.border = "none";
                paynowInput.style.border = "none";
                paynowError.innerHTML = "ERROR";
                paynowError.style.visibility = "hidden";
            } else {
                idcorrect = false;
                paynowError.style.visibility = "visible";
                paynowError.innerHTML = "PayNow identifications do not match."
                cfmPaynowInput.style.border = "1px solid rgb(255, 74, 74)";
            }
        }

        if (idcorrect && emailcorrect) {
            const loadingIcon = document.querySelector(".loading-icon");
            const continueIcon = document.querySelector(".continue-icon");
            loadingIcon.style.display = "block";
            continueIcon.style.display = "none";

            const currentdate = new Date(); 
            const curDay = currentdate.getDate() + "-"
                            + (currentdate.getMonth()+1)  + "-" 
                            + currentdate.getFullYear();
            var curTime = currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();
            
            const cartOBJ = JSON.parse(localStorage.getItem("cartItems"));
            var cartString = "| "

            for (const [key, value] of Object.entries(cartOBJ)) {
                cartString += key + " | ";
            }
            
            async function add_Paynow() {
                const res = await fetch(baseURL+"paynow",
                {
                    method:'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        curDay: curDay,
                        curTime: curTime,
                        email: emailInput.value,
                        id: paynowInput.value,
                        cart: cartString,
                        paid: localStorage.getItem("totalPrice")
                    })
                })

                const status = await res.json();
                console.log(status);
                if (status.status === "success") {
                    window.location.href = "/success";
                } else {
                    alert("Error");
                }
            }

            add_Paynow();
        }
    }
}

// Log in admin page
else if (curPage === "/admin/login") {
    
    async function authenticate() {
        // console.log("auth");
        const res = await fetch(baseURL+"authenticate",{method:'GET'});
        if (res.ok) {
            const data = await res.json();
            if (data.allow === "true") {
                window.location.href = "dashboard";
            }
            else {
                alert("You are not authorised past this page.")
                window.location.href = "/";
            }
        }
    }

    authenticate();
    
    // console.log("login");
    const loginButton = document.querySelector("#admin-login");

    function attemptLog() {
        const emailInput = document.querySelector("#admin-user").value;
        const passInput = document.querySelector("#admin-pass").value;
        
        fetch(baseURL+`login`,
        {
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                email: emailInput,
                pass: passInput
            })
        })
        .then((res) => {
            if (res.ok) {
                // console.log("logged into dashboard");
                authenticate();
            } else {
                alert("Invalid email/password.")
            }
        })   
    }

    loginButton.addEventListener("click",attemptLog);
    loginButton.addEventListener('keydown',function(e) {
        if (e.code === "Enter") {
            attemptLog();
        }
    })
}

else if (curPage === "/admin/dashboard") {
    // Dashboard pages
    document.body.style.visibility = "hidden";
    try {
        // helper
        clearProductSession();
    } catch (error) {
        console.log(`ERROR: ${error.code}: ${error.message}`);
    }
    
    async function authenticate() {
        const res = await fetch(baseURL+"authenticate",{method:'GET'});
        if (res.ok) {
            const result = await res.json();
            if (result.allow === "true") {
                const user = result.id;
                const userEmail = result.email;
                const uid = result.uid;
                document.body.style.visibility = "visible";
                setUp(user);
                showAnnouncements();
                showProducts();
                showOrders();
                showNewsletter();
                showAdmin(user, uid, userEmail);
                showDates();
            }
            else {
                alert("You are not authorised to this page.")
                window.location.href = "/";
            }
        } else {
            window.location.href="login";
        }
    }

    authenticate();

    // Set up basic events
    function setUp(user) {
        // Header
        const returnHomepage = document.querySelector("#return-homepage");
        returnHomepage.addEventListener('click',resetSession);

        // Signout button
        const signoutButton = document.querySelector("#signout-button");
        signoutButton.addEventListener('click',()=>{
            fetch(baseURL+"admins", {
                method:'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    option: "logoff"
                })
            }).then((res)=> {
                if (res.ok) {
                    alert("You have been signed out!");
                    sessionStorage.clear();
                    window.location.href="login"
                } else {
                    const status = res.json();
                    alert(`ERROR ${status.code}: ${status.msg}. Please try again later.`)
                }
            })            
        })
        // Greeting
        const greeting = document.querySelector("#header h2");
        greeting.innerHTML = `Welcome to your dashboard, ${user}.`;
    }

    // Show any announcements
    function showAnnouncements() {
        
        fetch(baseURL+"admins",{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                option: "announce"
            })
        })
        .then((res) => {
            if (res.ok) {
                 // received
                return res.json()
            } else {
                const error = res.json();
                console.log("her");
                alert(`ERROR ${error.code}: ${error.msg}`)
            }
        })
        .then((res)=> {
                const announcementList = res;
                const section_announce = document.querySelector("#announcements .container");

                for (const [dateRec, valueRec] of Object.entries(announcementList)) {
                    if (parseInt(dateRec) <= 1) {continue;} // for firebase storage
    
                    // Details
                    const date = dateRec;
                    const text = valueRec;
    
                    // New element
                    const title = document.createElement("h4");
                    const details = document.createElement("p");
    
                    title.innerHTML = date;
                    details.innerHTML = text;
    
                    title.classList.add("heading");
    
                    section_announce.appendChild(title);
                    section_announce.appendChild(details);
                }
        })          
    }
    
    // Show paynow orders
    function showOrders() {

        fetch(baseURL+"admins",{
            method: 'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                option: "orders"
            })
        })
        .then((res) =>{
            if (res.ok) {return res.json()}
        })
        .then((orderList)=>{
            // Get elements
            const section_orders = document.querySelector("#paynowOrders .items");
            const heading_orders = document.querySelector("#paynowOrders .heading h3");
            const heading_prices = document.querySelector("#paynowOrders .heading .total");
            
            var total_earnings = 0;
            var totalOrders = 0;

            if (!orderList) { // if no orders
                section_orders.classList.add("empty");
                const emptyDiv = document.querySelector("#paynowOrders .items > .empty");
                emptyDiv.style.display = "block";
                heading_prices.innerHTML = `Total Earnings: SGD ${total_earnings}`;
                heading_orders.innerHTML = `PayNow Orders (${totalOrders})`;
                return
            }

            for (const [dateRec, ordersOnDateRec] of Object.entries(orderList)) {
                const date = dateRec;
                const ordersOnDate = ordersOnDateRec;
                
                var orderCountDate = 0;

                // New date tag
                const dateElement = document.createElement("p");
                dateElement.classList.add("date");

                // Append date tag
                section_orders.appendChild(dateElement);

                // Iterate through orders on particular date
                for (const [orderTimeRec, orderDetailsRec] of Object.entries(ordersOnDate)) {
                    orderCountDate += 1;

                    // Details
                    const time = orderTimeRec;
                    const id = orderDetailsRec["id"];
                    const email = orderDetailsRec["email"];
                    const paid = orderDetailsRec["paid"];
                    const order = orderDetailsRec["cart"];

                    // New elements
                    const itemDiv = document.createElement("div");
                        const detailsDiv = document.createElement("div");
                            const timeElement = document.createElement("p");
                            const idElement = document.createElement("h4");
                            const emailElement = document.createElement("p");
                        const paidElement = document.createElement("h4");

                    // Assign identities
                    itemDiv.classList.add("container");
                    itemDiv.classList.add("item");
                    itemDiv.classList.add("orders");

                    detailsDiv.classList.add("block-text");

                    timeElement.classList.add("time");
                    emailElement.classList.add("email");

                    // Assign values
                    timeElement.innerHTML = time;
                    idElement.innerHTML = id;
                    emailElement.innerHTML = email;
                    paidElement.innerHTML = `SGD ${paid}`;

                    // Add events
                    idElement.addEventListener('click',function() {
                        gotoOrderPage(time,id,email,paid,order,date);
                    })

                    // Calculate total
                    total_earnings += parseInt(paid);

                    // Append children
                    detailsDiv.appendChild(timeElement);
                    detailsDiv.appendChild(idElement);
                    detailsDiv.appendChild(emailElement);

                    itemDiv.appendChild(detailsDiv);
                    itemDiv.appendChild(paidElement);

                    section_orders.appendChild(itemDiv);
                }
                
                totalOrders += orderCountDate;

                dateElement.innerHTML = `${date} (${orderCountDate})`;    
                
                const orderChildrenList = document.querySelectorAll("#paynowOrders .items .container.item");
                // Adds animation to each product block
                orderChildrenList.forEach((item, index) => {
                    item.style.animationDelay = `${index*100+100}ms`;
                })
            }
            
            heading_prices.innerHTML = `Total Earnings: SGD ${total_earnings}`;
            heading_orders.innerHTML = `PayNow Orders (${totalOrders})`;    
        })
        .catch((error)=>{
            alert(error);
        })
    }

    // Show products and menu
    function showProducts() {
        // Get elements
        const section_products = document.querySelector("#products .items");
        const heading_products = document.querySelector("#products .heading h3");
        
        // Show Product data
        async function get_allProducts() {
            const res = await fetch(baseURL+"get_allProducts/",
            {
                method:'GET'
            })
            
            var count = 0;
            const productList = await res.json();
            for (const [key, value] of Object.entries(productList)) {
                count += 1;
                // Details
                const title = value["Title"];
                const desc = value["Desc"];
                const priceList = value["Prices"].split(";");
                const filepath = value["File"];

                var prices = "";
                
                priceList.forEach((price)=>{
                    prices += price + ", ";
                })
                
                prices = prices.substring(0, prices.length-2);

                // New element
                const newItem = document.createElement("div");
                const flex_div = document.createElement("div");
                const image = document.createElement("img");
                const block = document.createElement("div");
                const titleElement = document.createElement("h4");
                const priceElement = document.createElement("p");
                const button_div = document.createElement("div");
                const text_div = document.createElement("div");

                // Assign identities
                newItem.classList.add("container");
                newItem.classList.add("item");

                flex_div.classList.add("flex");

                block.classList.add("block-text");

                button_div.classList.add("button");
                button_div.classList.add("update-menu");
                button_div.dataset.productName = title;

                text_div.classList.add("text");

                // Append children
                block.appendChild(titleElement);
                block.appendChild(priceElement);

                flex_div.appendChild(image);
                flex_div.appendChild(block);                

                button_div.appendChild(text_div);

                newItem.append(flex_div);
                newItem.appendChild(button_div)
                
                // Add click event
                titleElement.addEventListener('click',() => {
                    sessionStorage.setItem("title",title);
                    sessionStorage.setItem("desc",desc);
                    sessionStorage.setItem("prices",value["Prices"]);
                    sessionStorage.setItem("filepath",filepath);
                    window.location.href = "dashboard/product"
                })

                // Assign values
                // if (fileExists(filepath)) {
                console.log(filepath);
                image.src = filepath;
                // } else {
                //     image.src = '../resources/image-unavailable.png';
                // }
                titleElement.innerHTML = title;
                priceElement.innerHTML = prices;
                section_products.appendChild(newItem);

                if (value["Menu"]) {
                    text_div.innerHTML = "Remove from Menu"
                    newItem.classList.add("in-menu");
                } else {
                    text_div.innerHTML = "Add To Menu";
                    newItem.classList.add("no-menu");
                }

                button_div.addEventListener('click',function() {
                    updateMenu(title,newItem,text_div);
                })
            }

            if (count > 4) {
                section_products.style.overflowY = "scroll";
            }
            // Adds animation to each product block
            const productChildrenList = document.querySelectorAll("#products .items .container.item");
            productChildrenList.forEach((item, index) => {
                item.style.animationDelay = `${index*100+100}ms`;
            })
            heading_products.innerHTML = `All Products (${count})`;
        }

        get_allProducts();
        
        const addProduct_button = document.querySelector("#products #add-product");
        addProduct_button.addEventListener('click',()=> {
            sessionStorage.setItem("add-item","true");
            window.location.href = "dashboard/product"
        })

    }

    // Show newsletter emails
    function showNewsletter() {

        fetch(baseURL+"admins",{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({option:'newsletter'})
        })
        .then((res)=>{if (res.ok) {return res.json()}})
        .then((newsLetterList)=>{
            // Show newsletters
            const section_newsletter = document.querySelector("#newsletter .items");
            const heading_newsletter = document.querySelector("#newsletter .heading h3");

            if (!newsLetterList) {
                // Empty
                section_newsletter.classList.add("empty");
                const emptyDiv = document.querySelector("#newsletter .items > .empty");
                emptyDiv.style.display = "block";
            }

            var totalPeople = 0;

            for (const [emailRec, statusRec] of Object.entries(newsLetterList)) {
                totalPeople += 1;

                // Details
                var email = "";
                for (let i = 0; i < emailRec.length; i++) {
                    if (emailRec.charAt(i) === "-") {
                        email += "@";
                    }
                    else if (emailRec.charAt(i) === "_") {
                        email += ".";
                    }
                    else {
                        email += emailRec.charAt(i);
                    }
                }

                var status = "";
                for (const [typeRec, typeStatusRec] of Object.entries(statusRec)) {
                    status += `${typeRec}: ${typeStatusRec}`;
                }
                
                
                // New elements
                const itemDiv = document.createElement("div");
                    const detailsDiv = document.createElement("div");
                        const emailElement = document.createElement("h4");
                        const statusElement = document.createElement("p");

                // Assign identities
                itemDiv.classList.add("container");
                itemDiv.classList.add("item");

                detailsDiv.classList.add("block-text");

                // Assign values
                emailElement.innerHTML = email;
                statusElement.innerHTML = status;

                // Append children
                detailsDiv.appendChild(emailElement);
                detailsDiv.appendChild(statusElement);

                itemDiv.appendChild(detailsDiv);

                section_newsletter.appendChild(itemDiv);
            }
            
            heading_newsletter.innerHTML = `Newsletter Emails (${totalPeople})`;    
            
            if (totalPeople > 5) {
                section_newsletter.style.overflowY = "scroll";
            }

            const newsChildrenList = document.querySelectorAll("#newsletter .items .container.item");
            // Adds animation to each product block
            newsChildrenList.forEach((item, index) => {
                item.style.animationDelay = `${index*100+100}ms`;
            })
        })
        
    }

    // Admin stuff
    function showAdmin(user, uid, userEmail) {
        const changeEmailButton = document.querySelector(".button#change-email");
        const changePassButton = document.querySelector(".button#change-pass");

        changeEmailButton.addEventListener('click', () => {
            // Get elements
            const curEmailInput = document.querySelector("#email-cur");
            const newEmailInput = document.querySelector("#email-new");
            const newEmailCfmInput = document.querySelector("#email-new-cfm");

            // Error box
            const errorBox = document.querySelector("#email-error")
            const errorEmail = document.querySelector("#email-wrong");
            const errorInvalidEmail = document.querySelector("#email-invalid");
            const errorInvalidEmailCfm = document.querySelector("#email-mismatch");

            errorBox.style.display = "flex";

            var correctCurrentEmail = false;
            var validNewEmail = false
            var validNewEmailCfm = false;

            // Validation
            if (curEmailInput.value !== userEmail) {
                errorEmail.style.display = "list-item";
                curEmailInput.style.border = "1px solid rgb(255, 74, 74)";
                correctCurrentEmail = false;
            } else {
                curEmailInput.style.border = "none";
                errorEmail.style.display = "none";
                correctCurrentEmail = true;
            }

            if (!ValidateEmail(newEmailInput.value)) {
                errorInvalidEmail.style.display = "list-item";
                newEmailInput.style.border = "1px solid rgb(255, 74, 74)";
                validNewEmail = false;
            } else {
                errorInvalidEmail.style.display = "none";
                newEmailInput.style.border = "none";
                validNewEmail = true;
            }

            if (newEmailCfmInput.value !== newEmailInput.value) {
                errorInvalidEmailCfm.style.display = "list-item";
                newEmailCfmInput.style.border = "1px solid rgb(255, 74, 74)";
                validNewEmailCfm = false;
            } else {
                errorInvalidEmailCfm.style.display = "none";
                newEmailCfmInput.style.border = "none";
                validNewEmailCfm = true;
            }

            // Change email firebase
            if (correctCurrentEmail && validNewEmail && validNewEmailCfm) {
                errorBox.style.display = "none";
                const buttonIcon = document.querySelector("#change-email .button-icon");
                const loadingIcon = document.querySelector("#admin #change-email .loading-icon");
                buttonIcon.style.display = "none";
                loadingIcon.style.display = "block";
                
                fetch(baseURL+"admins",{
                    method:'POST',
                    headers: {
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        option: "admin",
                        new_email: newEmailCfmInput.value
                    })
                })
                .then((res)=>{
                    if (res.ok) {
                        alert(`Email address has been changed to: ${newEmailCfmInput.value}.\n\nPlease sign in again using this new email address.`);
                        window.location.href = "login";
                    }
                })
                .catch((error)=>{
                    alert(error);
                })
            } else {
                errorBox.style.display = "flex";
            }
        })

        changePassButton.addEventListener('click', () => {
            // Get elements
            const curPassInput = document.querySelector("#pass-cur");
            const newPassInput = document.querySelector("#pass-new");
            const newPassCfm = document.querySelector("#pass-new-cfm");

            // Error bpx
            const errorBox = document.querySelector("#pass-error");
            const error_Wrong = document.querySelector("#pass-wrong");
            const error_Length = document.querySelector("#pass-short");
            const error_Caps = document.querySelector("#pass-caps");
            const error_Low = document.querySelector("#pass-low");
            const error_Num = document.querySelector("#pass-num");
            const error_mismatch = document.querySelector("#pass-mismatch");

            var status_curPass = false;
            var status_Length = false;
            var status_Caps = false;
            var status_Low = false;
            var status_Num = false;
            var status_newCfmPass = false;

            fetch(baseURL+"admins",{
                method:'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    option:"admin"
                })
            })
            .then((res) => {if (res.ok) {return res.json()}})
            .then((data) => {
                const passwordRec = data.status;
                if (curPassInput.value !== passwordRec) {
                    error_Wrong.style.display = "list-item";
                    curPassInput.style.border = "1px solid rgb(255, 74, 74)";
                    status_curPass = false
                } else {
                    error_Wrong.style.display = "none";
                    curPassInput.style.border = "none";
                    status_curPass = true
                }

                if (!checkLength(newPassInput.value)) {
                    error_Length.style.display = "list-item";
                    newPassInput.style.border = "1px solid rgb(255, 74, 74)";
                    status_Length = false
                } else {
                    error_Length.style.display = "none";
                    newPassInput.style.border = "none";
                    status_Length = true
                }

                if (!checkCaps(newPassInput.value)) {
                    error_Caps.style.display = "list-item";
                    newPassInput.style.border = "1px solid rgb(255, 74, 74)";
                    status_Caps = false
                } else {
                    error_Caps.style.display = "none";
                    newPassInput.style.border = "none";
                    status_Caps = true
                }

                if (!checkLow(newPassInput.value)) {
                    error_Low.style.display = "list-item";
                    newPassInput.style.border = "1px solid rgb(255, 74, 74)";
                    status_Low = false
                } else {
                    error_Low.style.display = "none";
                    newPassInput.style.border = "none";
                    status_Low = true
                }

                if (!checkNumber(newPassInput.value)) {
                    error_Num.style.display = "list-item";
                    newPassInput.style.border = "1px solid rgb(255, 74, 74)";
                    status_Num = false
                } else {
                    error_Num.style.display = "none";
                    newPassInput.style.border = "none";
                    status_Num = true
                }

                if (newPassInput.value !== newPassCfm.value) {
                    error_mismatch.style.display = "list-item";
                    newPassCfm.style.border = "1px solid rgb(255, 74, 74)";
                    status_newCfmPass = false
                } else {
                    error_mismatch.style.display = "none";
                    newPassCfm.style.border = "none";
                    status_newCfmPass = true
                }

                if (status_curPass && status_newCfmPass && status_Caps && status_Length && status_Low && status_Num) {
                    errorBox.style.display = "none";
                    
                    fetch(baseURL+"admins",{
                        method:'POST',
                        headers: {
                            'Content-Type':'application/json'
                        },
                        body: JSON.stringify({
                            option: "admin",
                            new_pass: newPassCfm.value
                        })
                    })
                    .then((res)=>{
                        if (res.ok) {
                            alert(`Password has been changed.\n\nPlease sign in again using this new password.`);
                            window.location.href = "login";
                        }
                    })
                    .catch((error)=>{
                        alert(error);
                    })
                
                } else {
                    errorBox.style.display = "flex";
                }
            })
        })
    }

    function showDates() {
        const dateInput = document.querySelector("#collection-date");
        const manual = document.querySelector("#manual-update");
        const automatic = document.querySelector("#auto-update");
        const updateButton = document.querySelector("#update-button");

        function resetButton(current, target) {
            current.classList.add('inactive');
            target.classList.remove('inactive');
        }

        // Get dates data
        fetch(baseURL+"admins",{
            method:'POST',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                option:"dates",
            })
        })
        .then((res)=>{if (res.ok) {return res.json()}
        })
        .then((data)=>{
            const col_date = data.Collection;
            const auto = data.Auto;

            dateInput.value = col_date;

            if (auto === "true") {
                dateInput.disabled = true;
                sessionStorage.setItem("auto-date","true");
                resetButton(automatic, manual);
            } else {
                dateInput.disabled = false;
                sessionStorage.setItem("auto-date","false");
                resetButton(manual, automatic);
            }
        })
        .catch((error)=>{
            alert(error);
        })

        automatic.addEventListener('click',function() {
            resetButton(automatic,manual);
            dateInput.disabled = true;
            sessionStorage.setItem("auto-date","true");
        })

        manual.addEventListener('click',function() {
            resetButton(manual,automatic);
            dateInput.disabled = false;
            sessionStorage.setItem("auto-date","false");
        });

        updateButton.addEventListener('click',function() {
            const status = sessionStorage.getItem("auto-date");
            const date = dateInput.value;
            
            fetch(baseURL+"admins",{
                method:'POST',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({
                    option:"dates",
                    auto:status,
                    dateinput:date
                })
            })
            .then((res)=>{
                if (res.ok){
                    alert("Updated Successfully.")
                    window.location.href = "dashboard"
                }
            })
            .catch((error)=>{
                alert(`ERROR ${error.code}: ${error.message}`);
            })
        })
    }

}

// Product page
else if (curPage === "/admin/dashboard/product") {
    // Update products
    const save_button = document.querySelector("#product .heading #save-button");
    const del_button = document.querySelector("#product #delete-button");
    const error_container = document.querySelector("#product .error-container");
    const return_dash = document.querySelector("#product #return-button"); 
    var addItem = sessionStorage.getItem("add-item") === "true";
    // Input fields
    const titleInput = document.querySelector("#product-title");
    const descInput = document.querySelector("#product-desc");
    const pricesInput = document.querySelector("#product .prices .price-container")


    // Events
    return_dash.addEventListener('click',()=>{
        window.location.href = "../dashboard";
    })

    save_button.addEventListener('click',()=>{

        // Validate
        var title_status = false;
        var desc_status = false;
        var price_status = false;

        if (titleInput.value === "") {
            titleInput.style.border = "1px solid rgb(255, 74, 74)";
            title_status = false;
        } else {
            title_status = true;
            titleInput.style.border = "none";
        }

        if (descInput.value === "") {
            descInput.style.border = "1px solid rgb(255, 74, 74)";
            desc_status = false;
        } else {
            descInput.style.border = "none";
            desc_status = true;
        }

        if (!sessionStorage.getItem("prices")) {
            pricesInput.style.border = "1px solid rgb(255, 74, 74)";
            price_status = false;
        } else {
            pricesInput.style.border = "none";
            price_status = true;
        }

        if (price_status && desc_status && title_status) {
            
            fetch(baseURL+"get_allProducts",{method:'GET'})
            .then((res)=>{if (res.ok){return res.json()}})
            .then((products)=>{
                var loop_check = true;
                for (const [titleRec, detailsRec] of Object.entries(products)) {

                    // Check if adding new item
                    if (addItem) {
                        if (titleInput.value === titleRec) {
                            alert("Name already exists. Please choose a different product name");
                            titleInput.style.border = "1px solid rgb(255, 74, 74)";
                            loop_check = false;
                            break
                        }
                    }
                    // Check if overlaps another current item
                    else {
                        if (sessionStorage.getItem("title") == titleRec) {
                            continue;
                        }
                        if (titleInput.value === titleRec) {
                            alert("Name already exists. Please choose a different product name");
                            titleInput.style.border = "1px solid rgb(255, 74, 74)";
                            loop_check = false;
                            break
                        }
                    }
                }
                if (loop_check) {
                    error_container.style.display = "none";

                    // New Item
                    if (addItem) {
                        // Add to firebase DB
                        fetch(baseURL+`newproduct/new?title=${titleInput.value}&desc=${descInput.value}&prices=${sessionStorage.getItem("prices")}`,{method:'GET'})
                        .then((res)=>{
                            if (res.ok) {
                                alert(`Item "${titleInput.value}" added.`);
                                clearProductSession();
                            }else {
                                alert("An error has occured. Please try again later.")
                            }
                            window.location.href = "../dashboard";
                        })
                        .catch((error)=>{
                            alert(`ERROR ${error.code}: ${error.message}`);
                        })

                    } else {
                        fetch(baseURL+`newproduct/new?title=${titleInput.value}&desc=${descInput.value}&prices=${sessionStorage.getItem("prices")}&updatestatus=true`,{method:'GET'})
                        .then((res)=>{
                            if (res.ok) {
                                alert(`Item "${titleInput.value}" updated.`);
                                clearProductSession();
                            }else {
                                alert("An error has occured. Please try again later.")
                            }
                            window.location.href = "../dashboard";
                        })
                        .catch((error)=>{
                            alert(`ERROR ${error.code}: ${error.message}`);
                        })
                    }    
                } else {
                    error_container.style.display = "block";
                }
            })
            .catch((error) => {
                alert(`ERROR: ${error.code}: ${error.message}`);
            })            
        } else {
            error_container.style.display = "block";
        }
    })

    if (addItem) {
        del_button.classList.add("inactive");
    } else {
        titleInput.readOnly = true;
        titleInput.addEventListener('click',()=>{
            alert("Product name cannot be changed. Please create a new product instead or contact Ike for further assistance.");
        });
        del_button.addEventListener('click',()=>{
            if (confirm(`Are you sure you want to delete ${sessionStorage.getItem("title")}? This cannot be undone!`)) {
                fetch(baseURL+`newproduct/new?deleteRec=${sessionStorage.getItem("title")}`,{method:'GET'})
                .then((res)=>{
                    if (res.ok) {
                        alert(`${sessionStorage.getItem("title")} successfully removed.`);
                    }
                    else {
                        alert("An error has occured. Please try again later.")
                    }
                    window.location.href = "../dashboard";
                })
                .catch((error) => {
                    alert(`ERROR ${error.code}: ${error.message}`);
                })
            }
        })
    }   
}

else if (curPage === "/cart") {
    navEffects();
}

// Newsletter
try {
    const newsLetterButton = document.querySelector("#footer #newsletter .continue");
    const emailAddress = document.querySelector("#footer #newsletter .email");
    const feedback = document.querySelector("#newsletter .block-text .feedback");

    async function addNewsLetter(input, user) {
        const res = await fetch(baseURL+"newsletter",
            {
                method: 'POST',
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    parcel: input
                })
            });

        const result = await res.json();

        if (result.status === "success") {
            feedback.innerHTML = `${user} has been added to our mailing list!`;
            feedback.classList.add("active");      
            setTimeout(() => {
                feedback.classList.remove("active");
            }, 2000);   
        } else {
            alert("An error has occured. Please try again later.")
        }
    }
    newsLetterButton.addEventListener('click',function() {
        console.log("clicked");
        const inputted = emailAddress.value;
        if (ValidateEmail(inputted)) {
            var email = "";

            const prefix_split = inputted.split("@")
            const prefix = prefix_split[0];
            email += prefix + "-";

            const domain_split = prefix_split[1].split(".");
            
            domain_split.forEach((name) => {
                email += name + "_";
            })

            const trimmed = email.substring(0, email.length-1);
        
            addNewsLetter(trimmed, inputted);
        } else {
            feedback.innerHTML = "Please enter a valid email!";
            feedback.classList.add("invalid");
        
            setTimeout(() => {
                feedback.classList.remove("invalid");
            }, 2000);
        }
    });
} catch (error) {}
    



// --------- Animations --------- //

// Helpers
function vh(percent) {
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return (percent * h) / 100;
}

// -- Main Functions -- //
// Navigation Bar Effects
function navEffects() {
    var clicked = false; // fixes line bouncing bug
    gsap.registerPlugin(Flip);
    const navLinks = document.querySelectorAll(".nav-item li a");
    const activeNav = document.querySelector(".active-nav");
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            clicked = true; // fixes line bouncing bug
            
            // Turn navs blue
            gsap.to(navLinks, {color:"rgb(0, 0, 105)"});
            if (document.activeElement === link) {
                gsap.to(link, {color: "rgb(75, 75, 223)"});
            }
            
            // Move line
            const state = Flip.getState(activeNav);
            link.appendChild(activeNav);
            Flip.from(state, {
                duration:0.5,
                absolute:true,
                ease: 'elastic.out(0.5,0.5)'
            });

            setTimeout(() => {
                clicked = false;
            }, 1000); // fixes line bouncing bug
        });
        link.addEventListener('mouseover', ()=> {
            link.style.color = "rgb(75, 75, 223)";
        })
        link.addEventListener('mouseout', () => {
            link.style.color = "rgb(0, 0, 105)";
        })
    });
    
    // Hamburger
    const hamburger = document.querySelector("#hamburger");
    const navBar = document.querySelector("#navbar");
    const navLinksA = document.querySelectorAll(".nav-item li");
    
    hamburger.addEventListener('click', () => {
        navBar.classList.toggle("active");
        navLinksA.forEach((linkA, index) => {
            if (linkA.style.animation) {
                linkA.style.animation = '';
            } else {
                linkA.style.animation = `fade-right 0.3s ease ${index / 7 + 2}s;`
            }
        })
    
        hamburger.classList.toggle("toggle");
    });  
}

// Scroll animation Effects
function scrollAnimation() {
    var clicked = false;
    gsap.registerPlugin(Flip);

    // Smooth scrolls on main page
    if (!curPage.includes("cart") && !curPage.includes("/products")){
        const smoothScrolls = () => {

            function smoothScrollHelper(target, duration) {
                var target = document.getElementById(target);
                var targetPosition = target.getBoundingClientRect().top - vh(12);
                var startPosition = window.scrollY;
                var startTime = null;
    
    
                function animation(currentTime) {
                    if (startTime === null) startTime = currentTime;
                    var timeElapsed = currentTime - startTime;
                    var run = ease(timeElapsed, startPosition, targetPosition, duration);
                    window.scrollTo(0,run);
                    if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                    }
                }
    
                function ease (t, b, c, d) {
                    t /= d/2;
                    if (t < 1) return c/2*t*t + b;
                    t--;
                    return -c/2 * (t*(t-2) - 1) + b;
    
                };
                requestAnimationFrame(animation);
            }
    
            const navLinks = document.querySelectorAll(".nav-item li a");
            navLinks.forEach(link => {
                if (link.innerHTML === "Home") {
                    link.addEventListener('click',function() {
                        smoothScrollHelper("banner",1000);
                    })
                }
                else if (link.innerHTML === "About") {
                    link.addEventListener('click',function() {
                        smoothScrollHelper("about",1000);
                    })
                }
                else if (link.innerHTML === "Menu") {
                    link.addEventListener('click',function() {
                        smoothScrollHelper("menu",1000);
                    })
                }
                else if (link.innerHTML === "Ordering") {
                    link.addEventListener('click',function() {
                        smoothScrollHelper("ordering",1000);
                    })
                }
            })
    
            // Move bar while scrolling
    
            const navHome = document.querySelector("#nav-home");
            const navAbout = document.querySelector("#nav-about");
            const navMenu = document.querySelector("#nav-menu");
            const navOrdering = document.querySelector("#nav-ordering");
            const activeNav = document.querySelector(".active-nav");
    
            
            window.onscroll = function() {
                if (!clicked) { // solves line movement bug
                    var top = window.scrollY;
                    const state = Flip.getState(activeNav);
                    if (top >= vh(310)){
                        navMenu.appendChild(activeNav);
                        Flip.from(state, {
                            duration:0.5,
                            absolute:true,
                            ease: 'elastic.out(0.5,0.5)'
                        });
                        navHome.style = "color: rgb(0, 0, 105)";
                        navMenu.style = "color: rgb(75, 75, 223)";
                        navAbout.style = "color: rgb(0, 0, 105)";
                        navOrdering.style = "color: rgb(0, 0, 105)";

                    }
                    else if (top >=vh(185)) {
                        navOrdering.appendChild(activeNav);
                        Flip.from(state, {
                            duration:0.5,
                            absolute:true,
                            ease: 'elastic.out(0.5,0.5)'
                        });
                        navHome.style = "color: rgb(0, 0, 105)";
                        navOrdering.style = "color: rgb(75, 75, 223)";
                        navAbout.style = "color: rgb(0, 0, 105)";
                        navMenu.style = "color: rgb(0, 0, 105)";
                    }
                    else if (top >= vh(90)) {
                        navAbout.appendChild(activeNav);
                        Flip.from(state, {
                            duration:0.5,
                            absolute:true,
                            ease: 'elastic.out(0.5,0.5)'
                        });
                        navHome.style = "color: rgb(0, 0, 105)";
                        navAbout.style = "color: rgb(75, 75, 223)";
                        navMenu.style = "color: rgb(0, 0, 105)";
                        navOrdering.style = "color: rgb(0, 0, 105)";
                    } else {
                        navHome.appendChild(activeNav);
                        Flip.from(state, {
                            duration:0.5,
                            absolute:true,
                            ease: 'elastic.out(0.5,0.5)'
                        });
                        navAbout.style = "color: rgb(0, 0, 105)";
                        navHome.style = "color: rgb(75, 75, 223)";
                        navMenu.style = "color: rgb(0, 0, 105)";
                        navOrdering.style = "color: rgb(0, 0, 105)";
                    }
                }
            }
            
        }
        smoothScrolls();
    }
    animationIn();
}

// Fade in animations
function animationIn() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add("show");
                    entry.target.style.transitionDelay = `${index*150}ms`;
                    setTimeout(() => {
                        entry.target.style.transitionDelay = "";
                    }, 500);
                }, 500);
                setTimeout(() => {
                    entry.target.classList.remove("extra");
                }, 1500);
            } else {
                // entry.target.classList.remove("show");
            }
        })
    })

    const hiddenElements = document.querySelectorAll(".hidden");
    hiddenElements.forEach((el) => {
        observer.observe(el);
    })

    const hiddenLeftElements = document.querySelectorAll(".hidden-left");
    hiddenLeftElements.forEach((el) => {
        observer.observe(el);
    })

    const hiddenRightElements = document.querySelectorAll(".hidden-right");
    hiddenRightElements.forEach((el) => {
        observer.observe(el);
    })
}

function animations() {
    navEffects();
    scrollAnimation();
}