var express = require('express');
var mysql = require('mysql');
var app = express();
var fs = require('fs');

var pw = fs.readFileSync('password','utf-8');
pw = pw.substring(0,pw.length-1);

var connection = mysql.createConnection({
    host:'localhost',                    
    port:3306,                           
    user:'root',                         
    password:pw,                         
    database:'taeugi323'                 
});

connection.connect(function(err){
    if(err){
        console.log(err);
    }
});

app.get('/',function(req,res){
    //res.sendFile("/home/taeugi323/Capstone/work2/");

    var d = new Date();
    var currentDate = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    var date = currentDate.getFullYear().toString() + '-' + (currentDate.getMonth()+1).toString() + '-' + (currentDate.getDate()-1).toString();
    var data_str = "['Time', 'Temperature']";
    console.log(date);
    
    connection.query("select * from Capstone_work2 where date >= '"+date+"'",function(err,rows,fields){
        if(err){
            console.log(err);
        }
        for(var i=0;i<rows.length;i++){
            data_str += ",['";
            var reg_format = new RegExp("(.*)201[0-9]",'g');
            data_str += (rows[i]['date'].toString().match(reg_format))[0];
            data_str = data_str + " " + rows[i]['hour'].toString() + ":00"
            data_str += "'";

            data_str += ',';
            data_str += rows[i]['temperature'].toString();
            
            data_str += ']';
            //console.log(data_str);
        }
        fs.readFile('input.html','utf-8',function(err,data){
            var reg = new RegExp("RegularExpressionSpot",'g');
            data = data.replace(reg,data_str);
            //console.log(data_str);
            fs.writeFile('output.html',data,function(err){
                res.sendFile('/home/taeugi323/Capstone/work2/output.html');
            });
        });
    });
});

/*
app.get('/transmit',function(req,res){  // Getting informations from the query and write them on log file
    var user_data = {};
    user_data['data'] = req.query.pattern;
    user_data['browser'] = req.headers['user-agent'];
    user_data['ip'] = req.ip;
    //user_data['cookie'] = req.cookies.name;
    var dt = new Date();
    user_data['time'] = dt.toString();
    
    fs.appendFile("/home/taeugi323/Capstone/log.txt",JSON.stringify(user_data)+'\n',function(err){});
    res.redirect('/');
});

app.get('/reg',function(req,res){   // Showing logs
    res.sendFile('/home/taeugi323/Capstone/log.txt');
});

app.get('/log',function(req,res){   // Getting input as a regular expression format
    res.sendFile('/home/taeugi323/Capstone/log/log_index.html');
});

app.get('/regex',function(req,res){     // Searching the data based on the above input
    fs.readFile('/home/taeugi323/Capstone/log.txt','utf-8',function(err,data){
        if(err){
            return console.log(err);
        }
        else if(data.match(req.query.reg)){
            var reg_format = new RegExp(req.query.reg,'g'); // Changing input string to reg_ex format
                                                            // Parameter 'g' for all matching string
            var data_before = data.match(reg_format);
            var data_after = new String();

            for(var i=0;i<Object.keys(data_before).length;i++){
                data_after += (data_before[i]+'\n');
            }
            res.setHeader('Content-Type','application/json');
            res.send(data_after);
        }
        else{
            res.send("No match!");
        }
    });
});

app.use('/static', express.static('/home/taeugi323/Capstone')); // To use directory's data in web server
*/

app.listen(2323, function(){}); // Running web server in port 2323
