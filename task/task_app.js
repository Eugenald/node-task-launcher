console.log('[INFO] Starting task_app.js...')

const args = process.argv.slice(2)
console.log(`[INFO] Args count: ${args.length}`)
console.log(`[INFO] Args: ${args.join(', ')}`)

// === Simulate outcome (random 0, 1 or 2) ===
const result = Math.floor(Math.random() * 3)
console.log(`[INFO] Simulated outcome = ${result}`)

// === Simulate processing delay (~3 seconds) ===
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

async function main() {
    if (result === 0) {
        console.log('[INFO] Job succeeded.')
        process.exit(0)
    } else if (result === 1) {
        console.error('[ERROR] Job failed due to logical error.')
        process.exit(1)
    } else {
        console.error('[CRASH] Simulating crash...')
        // Simulate crash by throwing
        throw new Error('Simulated crash occurred')
    }
}

main().catch((err) => {
    console.error(`[EXCEPTION] ${err.message}`)
    process.exit(2)
})
