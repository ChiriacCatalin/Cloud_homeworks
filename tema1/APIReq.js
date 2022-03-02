const http = require('http');
const fs = require('fs');
const axios = require('axios')
const https = require('https');
const { func } = require('assert-plus');
var Stream = require('stream').Transform;
const { performance } = require('perf_hooks');

var image_adress = ""
var random_fact = ""
var startTime = performance.now()
var endTime = performance.now()

const config = require("./configFile.json")
const requestHandler = (request, resp) => {
    const url = request.url
    if( url === "/"){
        getRandomFact(resp)
    }
    if(url === "/metrics"){
        fs.readFile('./metrics.html', function (err, html) {
            if (err) {
                throw err; 
            };   
            resp.writeHeader(200, {"Content-Type": "text/html"});  
            resp.write(html);  
            resp.end(); 
    });
    }
    if(url =="/metrics/logs"){
        readMetrics().then(values =>{
            //console.log(values)
            resp.write(JSON.stringify(values));
            resp.end();
        });
        
    }
};

module.exports = {
    handler: requestHandler
};

var getDoggoImage = function(resp){
    startTime = performance.now()
    axios
        .get('https://dog.ceo/api/breeds/image/random') // request a random image
        .then(res => {
            image_adress=res.data.message
            //console.log(image_adress)
            var image_name = image_adress.toString().split("/")
            image_name = image_name[image_name.length-1]
            //console.log("getDoggoImage: "+image_name)
            data = JSON.stringify(res.data)
            endTime = performance.now()
            fs.appendFile('requests.log', 'GetRandomDogImage || https://dog.ceo/api/breeds/image/random || method: GET || ' + ` ${endTime - startTime} milliseconds  || Status ` + res.status + " || " + data + "\n",  function (err) {
                if (err) return console.log(err);
              });
            downloadImageFromURL(image_adress, image_name, resp)
        })
        .catch(error => {
            console.error(error)
        })
};

var getRandomFact = function(resp){
    startTime = performance.now()
    axios
    .get('https://catfact.ninja/fact?max_length=60') // request a random Fact
    .then(resFact => {
        random_fact = resFact.data.fact
        //console.log(random_fact)
        data = JSON.stringify(resFact.data)
        endTime = performance.now()
        fs.appendFile('requests.log', 'GetRandomFact || https://catfact.ninja/fact?max_length=60 || method: GET || ' + ` ${endTime - startTime} milliseconds  || Status ` + resFact.status + " || " + data + "\n",  function (err) {
            if (err) return console.log(err);
          });
        getDoggoImage(resp)
    })
    .catch(error => {
        console.error("Eroare la al doilea request")
    })  
}



var uploadImage = function(image_name, resp){
    startTime = performance.now()
    const request = require('request');
    const options = {
        method: 'POST',
        url: 'https://ronreiter-meme-generator.p.rapidapi.com/images',
        headers: {
          'content-type': 'multipart/form-data; boundary=---011000010111000001101001',
          'x-rapidapi-host': 'ronreiter-meme-generator.p.rapidapi.com',
          'x-rapidapi-key': config.apiKey,
          useQueryString: true
        },
        formData: {
          image: {
            value: fs.createReadStream(image_name),
            options: {filename: image_name, contentType: 'application/octet-stream'}
          }
        }
      };
      
      request(options, function (error, response, body) {
          if (error) throw new Error(error);
          console.log("From uploadImage: ")
          console.log(body);

          var meme_name = image_name.split(".")[0]
          meme_name=meme_name.replaceAll("_","-")
          console.log("Image name: " +meme_name)

          endTime = performance.now()
          fs.appendFile('requests.log', 'UploadImage || ronreiter-meme-generator.p.rapidapi.com || method: POST || ' + ` ${endTime - startTime} milliseconds  || Status ` + response.statusCode + " || " + body + "\n",  function (err) {
              if (err) return console.log(err);
            });
          
          getMeme(meme_name, resp)
      });
};

  
var downloadImageFromURL = (url, filename, resp, callback) => {
    https.request(url, function(response) {                                        
      var data = new Stream();                                                    
  
      response.on('data', function(chunk) {                                       
         data.push(chunk);                                                         
      });                                                                         
  
      response.on('end', function() {                                             
         fs.writeFileSync(filename, data.read());
         uploadImage(filename, resp);                               
      });                                                                         
   }).end();
   
};

  
var getMeme = function(image_name, resp){
    startTime = performance.now()
    const request = require('request');
    console.log("Numele pozei postate: " + image_name)
    const options = {
    method: 'GET',
    url: 'https://ronreiter-meme-generator.p.rapidapi.com/meme',
    qs: {
        top: 'Dogs are just better.',
        bottom: random_fact,
        meme: image_name, 
        font_size: '18',
        font: 'Impact'
    },
    headers: {
        'x-rapidapi-host': 'ronreiter-meme-generator.p.rapidapi.com',
        'x-rapidapi-key': config.apiKey,
        useQueryString: true
    },
    encoding: null
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var data = Buffer.from(body, 'base64');

        resp.writeHead(200, { 'Content-Type': 'image/jpg' });
        resp.end(data, 'utf-8');
        
        endTime = performance.now()
        fs.appendFile('requests.log', 'GenerateMeme || ronreiter-meme-generator.p.rapidapi.com || method: GET || ' + ` ${endTime - startTime} milliseconds  || Status ` + response.statusCode + " || {\"encoded image\"}"  + "\n",  function (err) {
            if (err) return console.log(err);
          });
    });
};

    
const readline = require('readline');

async function readMetrics() {
    const fileStream = fs.createReadStream('requests.log');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    
    var randomImageCnt = 0, randomFactCnt = 0, uploadImageCnt = 0, getMemeCnt = 0
    var randomImageTime = 0, randomFactTime = 0, uploadImageTime = 0, getMemeTime = 0
    for await (const line of rl) {
      //console.log(line);
      if(line.startsWith("GetRandomFact")){
          randomFactCnt += 1
          randomFactTime = randomFactTime + Number(line.split("||")[3].match(/\d+.\d+/)[0]);
         // console.log(randomFactCnt, randomFactTime)
      }
      else if(line.startsWith("GetRandomDogImage")){
          randomImageCnt += 1
          randomImageTime = randomImageTime + Number(line.split("||")[3].match(/\d+.\d+/)[0]);
          //console.log(randomImageCnt, randomImageTime)
      }
      else if(line.startsWith("UploadImage")){
          uploadImageCnt += 1
          uploadImageTime = uploadImageTime + Number(line.split("||")[3].match(/\d+.\d+/)[0]);
          //console.log(uploadImageCnt, uploadImageTime)
      }
      else if(line.startsWith("GenerateMeme")){
          getMemeCnt += 1
          getMemeTime = getMemeTime + Number(line.split("||")[3].match(/\d+.\d+/)[0]);
          //console.log(getMemeCnt, getMemeTime)
      }
    }
    var values = [randomFactTime/ randomFactCnt, randomImageTime/randomImageCnt, uploadImageTime/uploadImageCnt, getMemeTime/getMemeCnt]
    //console.log(values)
    return values
  }