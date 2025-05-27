const PRICE_DB = {
    "potato": 1.2,
    "carrot": 1.1,
    "onion": 0.9,
    "tomato": 2.5,
    "cucumber": 1.8,
    "broccoli": 3.0,
    "pepper": 2.9,
    "garlic": 4.0,
    "chicken": 5.5,
    "beef": 10.0,
    "pork": 7.5,
    "lamb": 12.0,
    "duck": 9.0,
    "turkey": 6.8,
    "rice": 1.5,
    "buckwheat": 2.0,
    "oats": 1.3,
    "lentils": 2.2,
    "barley": 1.4,
    "quinoa": 3.5,
    "beer": 2.5,
    "wine": 10.0,
    "vodka": 12.0,
    "whiskey": 20.0,
    "rum": 18.0,
    "gin": 15.0,
    "milk": 1.3,
    "cheese": 8.0,
    "butter": 6.0,
    "yogurt": 2.5,
    "kefir": 2.0,
    "sour cream": 3.2,
    "cottage cheese": 4.5,
    "cream": 3.8,
    "apple": 2.0,
    "banana": 1.8,
    "orange": 2.2,
    "grape": 3.0,
    "lemon": 2.6,
    "watermelon": 1.0,
    "peach": 2.4,
    "pear": 2.3,
    "juice": 2.8,
    "soda": 1.5,
    "mineral water": 1.2,
    "coffee": 4.5,
    "tea": 3.0,
    "water": 1.0,
    "egg": 0.3,
    "bread": 2.0
}

function parseArgs() {
    try {
        const jsonArg = process.argv[2]
        if (!jsonArg) throw new Error('Missing JSON argument')
        return JSON.parse(jsonArg)
    } catch (err) {
        console.error('[ERROR] Invalid JSON input:', err.message)
        process.exit(1)
    }
}

function estimateCost(purchaseList) {
    let total = 0
    const items = []

    for (const item of purchaseList) {
        const name = item.name.toLowerCase()
        const qty = item.quantity

        const unitPrice = PRICE_DB[name]
        if (unitPrice === undefined) {
            items.push({ name, quantity: qty, price: null, total: null, note: 'Unknown item' })
            continue
        }

        const itemTotal = Math.round(qty * unitPrice * 100) / 100
        total += itemTotal
        items.push({ name, quantity: qty, price: unitPrice, total: itemTotal })
    }

    return {
        total: Math.round(total * 100) / 100,
        items
    }
}

function main() {
    const input = parseArgs()

    if (!input.userId || !Array.isArray(input.products)) {
        console.error('[ERROR] Input must include userId and products[]')
        process.exit(1)
    }

    const result = estimateCost(input.products)

    console.log(JSON.stringify({ userId: input.userId, ...result }, null, 2))
}

main()
