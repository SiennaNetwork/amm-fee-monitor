# SiennaSwap 0.02% fee burn monitor

This is a small project that will allow users to verify the amounts of the accumulated fees in the account that receives 0.02% fees from the token swaps on SiennaSwap.

## Run locally

1. Clone this repo
```bash
git clone git@github.com:SiennaNetwork/amm-fee-monitor.git
```

2. Install dependencies
```bash
pnpm install
```

3. Add the needed `.env` variables (see [env.example](env.example))

| Variable | Required/Optional | Default |
| -------- | -------- | ------- |
| API_URL  | required      |  null   |
| BURN_ADDRESS | optional | `secret1mkc8r0q929783k36cshmatx3944c3ktq7c6ht8` |
| VIEWING_KEY | optional | `RANDOM_VK_02_03_22` |

4. Run the project
```bash
pnpm start
```