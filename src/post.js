const axios = require('axios')
const querystring = require('querystring')
const dump = require('./data.json')
const delay = require('delay')

const { MONEYTREE_TOKEN, MONEYTREE_APIKEY } = process.env

axios.defaults.baseURL = 'https://jp-api.getmoneytree.com/v8/api'
axios.defaults.headers['X-API-KEY'] = MONEYTREE_APIKEY
axios.defaults.headers['X-API-version'] = 6
axios.defaults.headers['authorization'] = `Bearer ${MONEYTREE_TOKEN}`
;(async () => {
  const params = {
    category_id: 85,
    end_date: '06/30/2018',
    locale: 'ja_JP',
    show_spending_transactions: 'true',
    show_transactions_details: 'true',
    start_date: '06/01/2018',
    transaction: {},
    page: 0,
    per_page: 25
  }
  const { data } = await axios.get(
    `/web/presenter/transactions.json?${querystring.stringify(params)}`
  )
  const transactions = []
  let count = data.transaction_details.transactions_count
  while (count > 0) {
    params.page = params.page + 1
    var res = await axios.get(
      `/web/presenter/transactions.json?${querystring.stringify(params)}`
    )
    transactions.push(...res.data.transactions)
    count -= 25
  }
  await Object.entries(dump).map(async ([key, value]) => {
    const t = transactions.find(
      transaction => transaction.description_pretty === key
    )
    if (!t) {
      return
    }
    const { id, amount, date, category_id, claim_id, expense_type } = t
    const p = { transaction_ids: [] }
    p.transaction_ids.push(id)
    console.log(value.description_guest)
    await axios.post('/uploads/transactions.json?locale=ja_JP', p)
    await delay(1000)
    const rs = await axios.put(
      `/command/transactions/${id}.json?locale=ja_JP`,
      {
        transaction: {
          description_guest: value.description_guest,
          amount,
          date,
          category_id: 85,
          claim_id: null,
          expense_type: 1
        },
        upload_ids: []
      }
    )
    console.log(rs.data)
  })
  // console.log(JSON.stringify(transactions))
})()
