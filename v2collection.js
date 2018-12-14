const puppeteer = require('puppeteer');
const cookies = require('./cookie')
const sleep = require('./sleep')
const fs = require('fs')

const URL_PREFIX = 'https://www.v2ex.com'
const COLLECTION_PAGE_URL = URL_PREFIX + '/my/topics'

const LIST_ITEM_SELECTOR = '.item_title'
const NEXT_PAGE_SELECTOR = '.super.normal_page_right.button'
const NO_NEXT_PAGE_BUTTON_SELECTOR = '.super.normal_page_right.button.disable_now'

const EXPORT_FILE_NAME = 'collection_list.json'

const crawlData = () => {
  var $ = window.$
  var items = $(LIST_ITEM_SELECTOR)
  var links = []

  if (items.length >= 1) {
    items.each((index, item) => {
      let it = $(item)
      let a = it.find('a')
      let title = a.text()
      let href = URL_PREFIX + a.attr("href")
      links.push({title, href})
    })
  }

  return links
}

const clickLink = (linkText) => {
  $("a").each(function() {
    if ($(this).text().match(linkText) != null) {
      $(this).click()
    }
  });
}

const clickButton = () => {

}

;(async () => {
  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()
  await page.setCookie(...cookies)
  await page.goto(COLLECTION_PAGE_URL)
  const result = await page.evaluate(crawlData)

  let factor = null
  do {
    await page.click(NEXT_PAGE_SELECTOR)
    await sleep(2000)

    const tmp = await page.evaluate(crawlData)
    result.push(...tmp)
    console.log(result)
    factor = await page.$(NO_NEXT_PAGE_BUTTON_SELECTOR)
  } while (factor === null)

  const writerStream = fs.createWriteStream(EXPORT_FILE_NAME)
  writerStream.write(JSON.stringify(result, undefined, 2), 'UTF8')
  writerStream.end()

  await browser.close()

})()