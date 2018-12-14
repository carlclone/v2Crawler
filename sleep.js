const sleep = time=>new Promise(reslove=>{
  setTimeout(reslove,time)
})

module.exports = sleep