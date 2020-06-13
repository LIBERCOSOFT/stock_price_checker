/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

let StockHandler = require('../controllers/stockHandler.js');


module.exports = function(app) {
  app.route("/api/stock-prices").get(function(req, res) {
    
    let stockInfo = new StockHandler();
    
    
   let stock = req.query.stock;
   let ip = req.connection.remoteAddress;
   let likes = req.query.like;

    if (!Array.isArray(stock)){
      function oneStock(identifier, data){
        if(identifier == "oneStockLikes"){
          stockInfo.getData(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`).then(val => {
            let stocklikes = data.stockLike;
            let latestPrice = val.latestPrice;
            let stockData = {
                stock : stock, 
                price : latestPrice,
                likes : stocklikes
              }
            res.json({stockData});
          })
          .catch((error) => {
            throw error;
          });
        }
      }

      stockInfo.oneStockData(stock, likes, ip, oneStock);

    }else {
      let firstStock = stock[0];
      let secondStock = stock[1];
      
      function twoStock(identifier, data){
        if(identifier == "twoStockLikes"){
          stockInfo.getData(
            `https://repeated-alpaca.glitch.me/v1/stock/${firstStock}/quote`
            ).then((firstStockData) => {
              stockInfo.getData(
                `https://repeated-alpaca.glitch.me/v1/stock/${secondStock}/quote`
                ).then((secondStockData) => {
                  let firstStockPrice = firstStockData.latestPrice;
                  let secondStockPrice = secondStockData.latestPrice;
                  let firstLikes = data.firstLikes;
                  let secondLikes = data.secondLikes;
                  let stockData = [
                    {
                      stock : firstStock,
                      price : firstStockPrice,
                      rel_likes : firstLikes - secondLikes
                    },
                    {
                      stock : secondStock,
                      price : secondStockPrice,
                      rel_likes : secondLikes - firstLikes
                    }
                  ];
                  res.json({stockData});
                }).catch((error) => {
                  throw error;
                });
            }).catch((error) => {
              throw error;
            });
        }
        
      }
    
      stockInfo.twoStockData(firstStock, secondStock, likes, ip, twoStock);
      

    }
    
  });
};

