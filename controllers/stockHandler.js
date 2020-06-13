const fetch = require("node-fetch");
const MongoClient = require("mongodb");
require("dotenv").config();


let CONNECTION_STRING = process.env.DB;

function stockHandler(){
    this.getData = async (url) => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        return json;
      } catch (error) {
        console.log(error);
      };
    };
    

    this.oneStockData = (stock, like, ip, callback) => {
        MongoClient.connect(CONNECTION_STRING, { useUnifiedTopology: true },
            (err, client) => {
                if(!err){
                    let db = client.db("stocks");
                    let collection = db.collection("likes_ipAddresses");
                        if(like){
                            collection.findOne({stock : stock}, (err, result) => {
                                if (!result["ip_addresses"].includes(ip)) {
                                    collection.findOneAndUpdate(
                                    { stock: stock },
                                    { $inc: { likes: 1 }, $push: { ip_addresses: ip } }
                                    );
                                }else{
                                    //do nothing
                                }
                            });
                        }
                        
                        collection.findOne({stock: stock}, (err, doc) => {
                            callback("oneStockLikes", {
                                stockLike: doc["likes"]
                            });
                        })

                }
        })  
    };


    this.twoStockData = (firstStock, secondStock, like, ip, callback) => {
        MongoClient.connect(CONNECTION_STRING, { useUnifiedTopology: true },
            (err, client) => {
                if(!err){
                    let db = client.db("stocks");
                    let collection = db.collection("likes_ipAddresses");
                    
                    if(like){
                        let braker = 0;
                        collection.find({}).toArray().then( result => {
                            while (braker !== 2){
                                result.map(val => {
                                    if (!val["ip_addresses"].includes(ip)) {
                                        collection.findOneAndUpdate({ stock : val.stock},
                                            { $inc: { likes: 1 }, $push: { ip_addresses: ip } }
                                        );
                                    }
                                    braker++;
                                })
                            }
                        })    
                    }


                    collection.findOne({stock : firstStock}, (err, firstResult) => {
                        collection.findOne({stock : secondStock}, (err, secondResult) => {
                            callback("twoStockLikes", {
                                firstLikes : firstResult.likes,
                                secondLikes : secondResult.likes
                            });

                        })
                    });
                }
        })
    }

}

module.exports = stockHandler
