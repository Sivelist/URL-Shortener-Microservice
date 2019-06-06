'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
var  bodyParser = require("body-parser");
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
var Schema = mongoose.Schema;
var urlSchema = new Schema({
  url: String,
  short: Number,
  type: String
});
var Url = mongoose.model('Url', urlSchema)




app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var urlBodyParser = bodyParser.urlencoded({ extended: true });




app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.post("/api/shorturl/new", urlBodyParser, function(req,res){
  // res.json({test: "test"});
  console.log(req.body.url);
  // console.log(req.body.url.substring(0,8));
  
  if (req.body.url.substring(0,8) == "https://") {
    var tempHost = req.body.url.substring(8,req.body.url.length)
    console.log(tempHost);
    
  }else if (req.body.url.substring(0,7) == "http://"){
    var tempHost = req.body.url.substring(7,req.body.url.length)
    console.log(tempHost)
  }else{
    return res.json({error: "Invalid URL"});
  }
  
  dns.lookup(tempHost, function(err, datatemp){
    if (err){
      return res.json({error: "Invalid URL"});
      
    }else{
      
    Url.find({url: req.body.url}, function(err,data){
    if (err){
      console.log("1");
      res.json({error: "error"});
    }else if (data.length == 0){
      console.log("2");
      Url.findOne({type: "url"}).sort("-short").exec(function (err3,number){
        // console.log(number);
        
        if(number == null){
            var newUrl = new Url({
            url: req.body.url,
            short: 1,
            type: "url"
          });
        }else{
            var newUrl = new Url({
            url: req.body.url,
            short: number.short + 1,
            type: "url"
          });
        }
        
        newUrl.save(function(err2,data2){
        if (err2){
          console.log("error2")
        }else{
          res.json({original_url: req.body.url, short_url: data2.short});
        }
      });
        
        
      });
      
    }else{
      console.log(data);
      res.json({original_url: req.body.url, short_url: data[0].short});
    }
  });
      
  }});

});

app.get("/api/shorturl/:number", function(req,res){
  Url.find({short: req.params.number}, function(err,data){
    if(err){
      console.log("error");
    }else if(data.length == 0){
      res.json({error: "Url does not exist."})
    }else{
     console.log(data);
     res.redirect(data[0].url);
     }
  });
  
});



app.listen(port, function () {
  console.log('Node.js listening ...');
});