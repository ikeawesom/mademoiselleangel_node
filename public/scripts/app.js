console.log("Entered app.js");

// Local storages
if (!localStorage.getItem("cartCount")) {
    localStorage.setItem("cartCount",0);
    localStorage.setItem("cartItems",JSON.stringify({}));
    localStorage.setItem("totalPrice",0);
}

localStorage.setItem("paynow","false");
localStorage.setItem("fromCart", "home");
// console.log(JSON.parse(localStorage.getItem("cartItems")));

// Locate current page
var curPage = window.location.pathname;
var cartPage = curPage.includes("cart");
console.log("Cart page:" + cartPage);

if (cartPage) {

    // Animation for empty cart
    function emptyCart() {
        const emptyCartDisplay = document.querySelector("#emptyCart");
        const cartData = document.querySelector("#cartData");
        emptyCartDisplay.classList.add("active");
        cartData.style.display = "none";
    }
    
    // Empty the cart in localstorage
    function clearCart() {
        const warning = confirm("Are you sure you want to clear your cart? This cannot be undone!");
        if (warning) {
            emptyCart();
            localStorage.setItem("cartCount",0);
            localStorage.setItem("cartItems",JSON.stringify({}));
            localStorage.setItem("totalPrice",0);
        }
    }

    function processItems(table, row, div, title, pack, status) {
        const totalPriceValue = table.querySelector(".total-price-row .total-price-value");        

        const storeName = `${title};${pack}`;
        const cartItems = JSON.parse(localStorage.getItem("cartItems"));
        var totalPrice = JSON.parse(localStorage.getItem("totalPrice"));

        var curQuantity = cartItems[storeName][0];
        const basePrice = cartItems[storeName][1];

        if (status) {
            totalPrice += basePrice;
            curQuantity += 1;

            row.querySelector(".quantity-number").innerHTML = curQuantity;
            row.querySelector(".price").innerHTML = `$${curQuantity * basePrice}`;
            row.classList.add("add-item");
            setTimeout(() => {
                row.classList.remove("add-item");
            }, 500);

            const newArr = [curQuantity, basePrice];
            cartItems[storeName] = newArr;

            // Function to add item to local storage
        } else {
            // Function to remove items from local storage
            // and animate item removal from table

            totalPrice -= basePrice;
            curQuantity -= 1;

            if (curQuantity == 0) {
                div.style.animation = "fade-out-right 400ms forwards";
                
                delete cartItems[storeName];
                setTimeout(() => {
                    table.removeChild(row);
                    const numRows = table.querySelectorAll("tr");                
                    if (numRows.length == 2) {emptyCart();}
                }, 500);
                
            } else {
                row.querySelector(".quantity-number").innerHTML = curQuantity;
                row.querySelector(".price").innerHTML = `$${curQuantity * basePrice}`;
                row.classList.add("remove-item");
                setTimeout(() => {
                    row.classList.remove("remove-item");
                }, 500);
                const newArr = [curQuantity, basePrice];
                cartItems[storeName] = newArr;
            }
        }
        
        totalPriceValue.innerHTML = `$${totalPrice}`;
        localStorage.setItem("totalPrice",JSON.stringify(totalPrice));
        localStorage.setItem("cartItems",JSON.stringify(cartItems));
        // console.log(JSON.parse(localStorage.getItem("cartItems"))); 
    }
    
    // function addItemStorage(title, pack) {
        
    // }
    
    // function remItemStorage(table, row, div, title, pack) {
        
    //     const totalPriceValue = table.querySelector(".total-price-row .total-price-value");        

    //     const storeName = `${title};${pack}`;
    //     const cartItems = JSON.parse(localStorage.getItem("cartItems"));
    //     var totalPrice = JSON.parse(localStorage.getItem("totalPrice"));

    //     var curQuantity = cartItems[storeName][0];
    //     const basePrice = cartItems[storeName][1];

               
    // }

    // Declaring elements
    const cartTable = document.querySelector("#cartData .cart.table");
    const cartItems = JSON.parse(localStorage.getItem("cartItems"));
    
    // Variables for loop
    let count = 0;
    let totalPrice = 0;

    // Iterating through items in localstorage
    for (const [key, value] of Object.entries(cartItems)) {
        // Declare temp child elements
        const tempRow = document.createElement("tr");

        const name_td = document.createElement("td");
        const pack_td = document.createElement("td");
        const quantity_td = document.createElement("td");
        const quantityDiv = document.createElement("div");
        const quantityNumDiv = document.createElement("div");
        const remButton = document.createElement("i");
        const addButton = document.createElement("i");
        const remAddDiv = document.createElement("div");
        const remDiv = document.createElement("div");
        const addDiv = document.createElement("div");
        const price_td = document.createElement("td");
        
        count += 1

        // Declare namespaces
        const title = key.split(";")[0];
        const pack = key.split(";")[1];
        const quantity = value[0];
        const price = quantity * value[1];
        
        // Assign values to child elements
        name_td.innerHTML = title;
        pack_td.innerHTML = pack;
        quantityNumDiv.innerHTML = quantity;
        price_td.innerHTML = `$${price}`;
        totalPrice += price;

        // Assign identification/data for JS
        remDiv.classList.add("rem-div","addrem-div");
        addDiv.classList.add("add-div","addrem-div");

        remAddDiv.classList.add("button-div");

        quantityDiv.classList.add("quantity-item");
        quantityNumDiv.classList.add("quantity-number");

        remButton.classList.add("fa","fa-x","table-icon");

        addButton.classList.add("fa", "fa-plus","table-icon");

        price_td.classList.add("price");

        tempRow.classList.add("table-row");
        
        // Add click events
        remDiv.addEventListener('click',function() {
            processItems(cartTable, tempRow, quantityDiv, title, pack, false)
            // remItemStorage(cartTable, tempRow, quantityDiv, title, pack);
        });

        addDiv.addEventListener('click',function() {
            processItems(cartTable, tempRow, quantityDiv, title, pack, true)
        })

        // Append children
        remDiv.appendChild(remButton);
        addDiv.appendChild(addButton);
        remAddDiv.appendChild(addDiv);
        remAddDiv.appendChild(remDiv);
        
        quantity_td.appendChild(quantityDiv);
        quantityDiv.appendChild(quantityNumDiv);
        quantityDiv.appendChild(remAddDiv);

        tempRow.appendChild(name_td);
        tempRow.appendChild(pack_td);
        tempRow.appendChild(quantity_td);
        tempRow.appendChild(price_td);
        
        cartTable.appendChild(tempRow);
    }
    
    // Process when cart is empty
    if (count === 0) { //empty cart
        emptyCart();
    }
    // Calculates total price
    else {
        const priceRow = document.createElement("tr");
        const priceText_td = document.createElement("th");
        const empty_td = document.createElement("th");
        const empty_tdA = document.createElement("th");
        const totalPrice_td = document.createElement("th");

        priceText_td.innerHTML = "Total Price"
        totalPrice_td.innerHTML = `$${totalPrice}`;

        priceRow.classList.add("total-price-row");
        totalPrice_td.classList.add("total-price-value")

        priceRow.appendChild(priceText_td);
        priceRow.appendChild(empty_td);
        priceRow.appendChild(empty_tdA);
        priceRow.appendChild(totalPrice_td);
        cartTable.appendChild(priceRow);

        localStorage.setItem("totalPrice",JSON.stringify(totalPrice));
    }

    // Media queries
    const tableButtons = document.querySelector(".table-buttons");
    const tableButtons_inner = tableButtons.innerHTML;

    var cartButtonWindow = window.matchMedia("(max-width:175px)");
    
    if (cartButtonWindow.matches) {
        const buttontext = tableButtons.querySelectorAll(".button-text");
        buttontext.forEach((tag) => {
            tag.style.display = "none";
        });

    } else {
        tableButtons.innerHTML = tableButtons_inner;
    }

    window.addEventListener('resize', function() {

        // cart buttons
        var cartButtonWindow = window.matchMedia("(max-width:175px)");
    
        if (cartButtonWindow.matches) {
            const buttontext = tableButtons.querySelectorAll(".button-text");
            buttontext.forEach((tag) => {
                tag.style.display = "none";
            });
    
        } else {
            tableButtons.innerHTML = tableButtons_inner;
        }
    });
}

const logo = document.querySelector(".logo");
const logo_inner = logo.innerHTML;  

window.addEventListener('resize', function() {
    // logo
    var logoWindow = window.matchMedia("(max-width:275px)");

    if (logoWindow.matches) {
        logo.innerHTML = "M. Angel";
    } else {
        logo.innerHTML = logo_inner;
    }   
});

if (window.matchMedia("(max-width:275px").matches) {
    logo.innerHTML = "M. Angel";
}




