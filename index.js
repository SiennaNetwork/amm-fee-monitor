const { Pagination } = require('siennajs/dist/lib/amm');
const { CosmWasmClient } = require('secretjs');
const sienna = require('siennajs');
const { convertToken, timePassedPercentage } = require('./lib/utils');
require('dotenv').config();

// env
const API_URL = process.env.API_URL;
const ADDRESS_FEE =
  process.env.ADDRESS_FEE || 'secret1mkc8r0q929783k36cshmatx3944c3ktq7c6ht8';
const VIEWING_KEY = process.env.VIEWING_KEY || 'RANDOM_VK_02_03_22';
const AMM_FACTORY_V2 =
  process.env.AMM_FACTORY_V2 || 'secret18sq0ux28kt2z7dlze2mu57d3ua0u5ayzwp6v2r';
const ADDRESS_LOCK =
  process.env.ADDRESS_LOCK || 'secret1v8sunfx66k83u9kvhqz8ly7s29gfdh8yxemj4x';

(async () => {
  const queryClient = new CosmWasmClient(API_URL);

  // // AMM FEES
  // console.log('Fetching AMM pairs ...');
  // const pairs = await getPairs(queryClient, AMM_FACTORY_V2);

  // console.log('Fetching tokens info ...');
  // const tokens = getAllTokens(pairs);

  // console.log('Fetching tokens balances ...');
  // const tokenBalancesInfo = await getAllBalances(queryClient, tokens);

  // LOCKS
  console.log('Getting fee locks ... ');
  // get schedule
  let schedule = await queryClient.queryContractSmart(ADDRESS_LOCK, {
    schedule: {},
  });

  // get launched date
  let lockConfig = await queryClient.queryContractSmart(ADDRESS_LOCK, {
    config: {},
  });

  const locks = computeLockVesting(schedule, lockConfig.launched);

  console.log('Ready:');
  console.table(locks);
  console.table(tokenBalancesInfo);
})();

function computeLockVesting(schedule, launch = 1619997424) {
  let locks = [];
  schedule.pools.forEach((pool) => {
    pool.accounts.forEach((acc) => {
      let lock = {
        ...acc,
        launch,
        progress: timePassedPercentage(launch, acc.start_at, acc.duration),
      };
      locks.push(lock);
    });
  });
  return locks;
}

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
        .get_balance(ADDRESS_FEE, VIEWING_KEY);

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
