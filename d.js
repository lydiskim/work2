var mysql = require('mysql');
//var express = require('express');
//var app = express();
var fs = require('fs');
var request = require('request');

var pw = fs.readFileSync('password','utf-8');   // In here, there is no password file
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

url = "http://www.kma.go.kr/wid/queryDFSRSS.jsp?zone=1144056500";

request(url, function(err, res, html){
    if(err){
        console.log("err");
    }
    else{
        var reg_format = new RegExp("(?![(<hour>)])[0-9]+</hour>",'g');
        var data_hour = html.match(reg_format);

        reg_format = new RegExp("(?![(<day>)])[0-9]</day>",'g');
        var data_day = html.match(reg_format);

        reg_format = new RegExp("(?![(<temp>)])[0-9.]*</temp>",'g');
        var data_temp = html.match(reg_format);

        for(var i=0;i<data_hour.length;i++){
            var d = new Date();

            if(data_day[i][0] == '0'){
                d.setDate(d.getDate()-1);
            }
            /*
            if(data_day[i][0] == '1'){
                d.setDate(d.getDate()+1);
            }
            */
            else if(data_day[i][0] == '2'){
                d.setDate(d.getDate()+1);
            }
            var currentDate = new Date(d.getTime() + 24 * 60 * 60 * 1000);
            var date = currentDate.getFullYear().toString() + '-' + (currentDate.getMonth()+1).toString() + '-' + currentDate.getDate().toString();

            reg_format = new RegExp("[0-9.]*",'g');
            var hour = data_hour[i].match(reg_format);
            var temperature = data_temp[i].match(reg_format);

            (function(date,hour,temperature){   // for문 안에서 connection.query를 다 수행하지 않고 아래로 진행. connection.query의 call 시간이 늦게 되는 거라 (test.js 참고) callback 함수를 아예 함수로 처리하게 함.
                connection.query("select * from Capstone_work2 where date='"+date+"' && hour="+hour[0],function(err,rows,fields){
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(!rows.length){
                            connection.query("insert into Capstone_work2 values('"+date+"', "+hour[0]+", "+temperature[0]+")");
                        }
                        else{
                            connection.query("update Capstone_work2 set temperature="+temperature[0]+"where date='"+date+"' && hour="+hour[0]);
                            
                        }
                    }
                });
            })(date,hour,temperature);
        }

    }
});
