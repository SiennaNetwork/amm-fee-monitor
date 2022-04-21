const { Pagination } = require('siennajs/dist/lib/amm');
const { CosmWasmClient } = require('secretjs');
const sienna = require('siennajs');
const { convertToken } = require('./lib/utils');
require('dotenv').config();

// env
const API_URL = process.env.API_URL;
const BURN_ADDRESS =
  process.env.BURN_ADDRESS || 'secret1mkc8r0q929783k36cshmatx3944c3ktq7c6ht8';
const VIEWING_KEY = process.env.VIEWING_KEY || 'RANDOM_VK_02_03_22';
const AMM_FACTORY_V2 =
  process.env.AMM_FACTORY_V2 || 'secret18sq0ux28kt2z7dlze2mu57d3ua0u5ayzwp6v2r';

(async () => {
  const queryClient = new CosmWasmClient(API_URL);
  console.log("Fetching AMM pairs ...");
  const pairs = await getPairs(queryClient, AMM_FACTORY_V2);
  
  console.log('Fetching tokens info ...');
  const tokens = getAllTokens(pairs);

  console.log('Fetching tokens balances ...');
  const tokenBalancesInfo = await getAllBalances(queryClient, tokens);

  console.log('Ready:');
  console.table(tokenBalancesInfo);
})();

async function getAllBalances(queryClient, tokens) {
  let balances = [];
  for (const token of tokens) {
    try {
      const snip20Token = await new sienna.snip20.Snip20Contract(
        token.contract_addr,
        undefined,
        queryClient,
      );

      const info = await snip20Token.query().get_token_info();
      const balance = await snip20Token
        .query()
        .get_balance(BURN_ADDRESS, VIEWING_KEY);

      const result = {
        ...token,
        token: info.symbol,
        balance: balance,
        balanceReadable: convertToken(balance, info.decimals).toString(),
      };
      balances.push(result);
    } catch (e) {
      console.error(e);
    }
  }

  return balances;
}

function getAllTokens(pairs) {
  let tokens = [];
  pairs.forEach((item, index, arr) => {
    tokens.push({ ...item.pair.token_0.custom_token });
    tokens.push({ ...item.pair.token_1.custom_token });
  });

  return tokens.filter((value, index, self) => {
    return (
      self.findIndex((v) => v.contract_addr === value.contract_addr) === index
    );
  });
}

async function getPairs(queryClient, factoryAddress) {
  const factory = new sienna.amm.AmmFactoryContract(
    factoryAddress,
    undefined,
    queryClient,
  );

  let pairs = [];
  let pagination = 0;
  while (true) {
    let result = await factory
      .query()
      .list_exchanges(new Pagination(pagination, 30));
    pairs.push(...result);
    if (result.length < 30) {
      break;
    }
    pagination += 30;
  }

  return pairs;
}
