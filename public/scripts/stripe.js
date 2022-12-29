console.log("Connected Stripe.js")

const cartItems = JSON.parse(localStorage.getItem("cartItems"));

// ---------------- Checkout queries ---------------- //

var method = "";
const checkoutButton = document.querySelector("#checkout-button");
const paynow = document.querySelector("#paynow");
const credit = document.querySelector("#credit");

paynow.addEventListener('click',()=>{
    paynow.style.opacity = "1";
    credit.style.opacity = "0.3";
    method = "paynow";
    checkoutButton.classList.remove("inactive");
})

credit.addEventListener('click',()=>{
    credit.style.opacity = "1";
    paynow.style.opacity = "0.3";
    method = "credit";
    checkoutButton.classList.remove("inactive");

});

checkoutButton.addEventListener('click',function() {
    if (method == "") {
        alert("Please select a payment method.");
    } else {
        localStorage.setItem("fromCart", "cart");
        const loadingIcon = document.querySelector(".loading-icon");
        const continueIcon = document.querySelector(".continue-icon");
        loadingIcon.style.display = "block";
        continueIcon.style.display = "none";
        if (method == 'credit') {
            localStorage.setItem("paynow","false");
            toStripe();
        } else if (method == 'paynow') {
            localStorage.setItem("paynow","true");
            window.location.href = "/paynow";
        }
    }
})

// ---------------- Stripe Settings ---------------- //

function toStripe() {    
    fetch("/stripe/create-session",{
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            cart: cartItems
        })
    })
    .then(res => {
        if (res.ok){return res.json()}
        return res.json().then(json=> Promise.reject(json));
    })
    .then(data => {
        const url = data.url;
        window.location = url;
    })
    .catch((error)=>{
        alert(`${error}\n\nPlease contact us for assistance.`);
    });
}
