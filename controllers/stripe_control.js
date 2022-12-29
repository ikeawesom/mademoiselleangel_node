const Stripe = require('stripe')
const path = require('path');

function envs() {
    require('dotenv').config({path: path.resolve(__dirname,'.env')});
    const declareEnv = (name) => {return process.env[name]}
    globalThis.API_KEY_TEST = declareEnv("S_API_KEY_TEST");
    globalThis.LIVE_API_KEY=declareEnv("S_API_KEY_LIVE");
    globalThis.API_KEY = declareEnv("S_API_KEY");
    globalThis.S_PK1 = declareEnv("S_PK1");
    globalThis.S_PK2 = declareEnv("S_PK2");
    globalThis.S_PK3 = declareEnv("S_PK3");
    globalThis.S_PK4 = declareEnv("S_PK4");
    globalThis.S_PK5 = declareEnv("S_PK5");
    globalThis.S_PK6 = declareEnv("S_PK6");
    globalThis.S_PK7 = declareEnv("S_PK7");
    globalThis.S_PK8 = declareEnv("S_PK8");
    globalThis.S_PK9 = declareEnv("S_PK9");
    globalThis.DOMAIN = declareEnv("DOMAIN");
}

// Declare envs
envs()

// ---------- Stripe Setup ---------- //

var stripe = Stripe(LIVE_API_KEY);

const itemPrice = {
    "french financiers;4 pcs/pack":S_PK1,
    "french financiers;8 pcs/box":S_PK2,
    "french financiers;12 pcs/box":S_PK3,
    "chocolate cookies;3 pcs/box":S_PK4,
    "pineapple rose buds;8 pcs/can":S_PK5,
    "pineapple rose buds;12 pcs/can":S_PK6,
    "pineapple rose buds;16 pcs/can":S_PK7,
    "palet bretons;3 pcs/pack":S_PK8,
    "italian almond cake;1 whole cake":S_PK9
}

// ---------- Functions ---------- //

exports.get_StripeSession = async (req,res) => {
    var cartArr = []
    const { cart } = req.body;
    console.log(cart);
    if (!cart) {
        res.sendStatus(400)
        return
    }

    for (const [key, value] of Object.entries(cart)) {
        const keyID = key.split(" - ")[0].toLowerCase();
        const quantity = value[0];
        const tempProd = {
            price: itemPrice[keyID],
            quantity: quantity
        };
        cartArr.push(tempProd);
    }
    
    const session = await stripe.checkout.sessions.create({
        line_items: cartArr,
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: `${DOMAIN}/success`,
        cancel_url: `${DOMAIN}/cart`,
        automatic_tax: {enabled: true},
      });
    
      res.status(200).json({url:session.url});
}

