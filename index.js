var path = require('path')
, gutil = require('gulp-util')
, through = require('through2')
, crypto = require('crypto')
, fs = require('fs')
, glob = require('glob');

module.exports = function (size, ifile, md5Data) {
    size = size | 0;

// file, encoding, callback
    return through.obj(function (file, encoding, callback) {
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-debug', 'Streaming not supported'));
            return callback();
        }

        if(!file.contents){
            return callback();
        }

        var filename = path.basename(file.path);
        var extname = path.extname(file.path); // 后缀，文件格式
        var basename = path.basename(file.path, extname); //不带后缀名称

        var relativepath = path.relative(file.base+"../", file.path);
        var pathList = relativepath.replace(new RegExp(filename) , "").split(path.sep);
        // var sub_namepath = pathList[pathList.length-2]+'/';
        var sub_namepath = '';

        // var sub_namepath = relativepath.replace(new RegExp(filename) , "").split(path.sep).join('/');
        var dir;

        if(file.path[0] == '.'){
            dir = path.join(file.base, file.path);
        } else {
            dir = file.path;
        }
        dir = path.dirname(dir);

        // var md5_filename = filename.split('.').map(function(item, i, arr){
        //     return i == arr.length-2 ? item + '_'+ d : item;
        // }).join('.');

        // var repaceName = md5_filename;
        var repaceName = '';
        var splitStr = '';
        if (filename.indexOf("@2x") >= 0) {
            // 二倍图
            splitStr = '@2x';
        } else if (filename.indexOf("@3x") >= 0) {
            // 三倍图
            splitStr = '@3x';
        } 
        var fname = basename;
        if(splitStr != '') {
            fname = basename.split(splitStr)[0];
        }
        var x = md5Data[sub_namepath+fname+extname];
        
        if(!x || x == '') {
            // 进入到这个判断，则说明，没有 1 倍图
            if(filename.indexOf("@3x") >= 0) {
                // 如果是 3@x 图，先查看有没有对应的 @2x 图，如果有，就有用 @2x 图的名称
                x = md5Data[sub_namepath+fname+'@2x'+extname];

                if(!x || x == '') {
                    x = md5Data[sub_namepath+basename+extname];
                }
            } else if(filename.indexOf("@2x") >= 0){
                // 如果是 2 倍图，则用自己的 MD5 值
                x = md5Data[sub_namepath+basename+extname];
            }
        }

        if(!x || x == '') {
            x = calcMd5(file, size);
        } else if(x.indexOf(',') >= 0) {
            // 多文件组合成的 md5 值,
            // 值类似： 'aj22u2sh,suy6s6sd5,jsd7da65' 是用 逗号分隔的
            x = calcStrMd5(x, size);
        } 

        repaceName = fname+"_"+x+splitStr+extname;
        // if(basename.indexOf('3_background') >= 0 || basename.indexOf('background.jpg') >= 0){
        //     console.log('”'+sub_namepath+filename+ '“   ' +repaceName +'\n');
        // }

        if(Object.prototype.toString.call(ifile) == "[object Array]"){
            ifile.forEach(function(i_ifile){
                i_ifile && glob(i_ifile,function(err, i_files){
                    if(err) return console.log(err);
                    i_files.forEach(function(i_ilist){
                        // var result = fs.readFileSync(i_ilist,'utf8').replace(new RegExp(sub_namepath+filename,"g"), sub_namepath+repaceName);
                        // 替换文件中的字符串： 'a.jpg  或者 "a.jpg 或者 /a.jpg
                        // 为了避免 a_a.jpg 和 a.jpg 会被混乱匹配的问题
                        var result = fs.readFileSync(i_ilist,'utf8').replace(new RegExp('[\'|\"|\/]'+sub_namepath+filename,"g"),
                              function(word){
                                  return word.substring(0,1)+sub_namepath+repaceName;
                              });
                        fs.writeFileSync(i_ilist, result, 'utf8');
                    })
                })
            })
        }else{
            ifile && glob(ifile,function(err, files){
                if(err) return console.log(err);
                files.forEach(function(ilist){
                    // var result = fs.readFileSync(i_ilist,'utf8').replace(new RegExp(sub_namepath+filename,"g"), sub_namepath+repaceName);
                    // 替换文件中的字符串： 'a.jpg  或者 "a.jpg 或者 /a.jpg
                    // 为了避免 a_a.jpg 和 a.jpg 会被混乱匹配的问题
                    var result = fs.readFileSync(i_ilist,'utf8').replace(new RegExp('[\'|\"|\/]'+sub_namepath+filename,"g"),
                          function(word){
                              return word.substring(0,1)+sub_namepath+repaceName;
                          });
                    fs.writeFileSync(ilist, result, 'utf8');
                })
            })
        }

        file.path = path.join(dir, repaceName);

        this.push(file);
        callback();
    }, function (callback) {
        callback();
    });
};

function calcMd5(file, slice){
    var md5 = crypto.createHash('md5');
    md5.update(file.contents, 'utf8');
    return slice >0 ? md5.digest('hex').slice(0, slice) : md5.digest('hex');
}
function calcStrMd5(str, slice){
    var ret = '';
    var md5 = crypto.createHash('md5');
    var is = false;
    if(str.indexOf(',') >= 0) {
        is = true;
        // 是数组，需要处理一下
        var list = str.split(',');
        var strTemp = '';
        list.sort();// 递增顺序排序
        for (var i = 0; i < list.length; i++) {
            strTemp = strTemp +list[i];
        };
        str = strTemp;
    }

    md5.update(str, 'utf8');
    ret= slice >0 ? md5.digest('hex').slice(0, slice) : md5.digest('hex');
    return ret ;

}
