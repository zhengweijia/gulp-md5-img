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

        var d = calcMd5(file, size);
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

        var md5_filename = filename.split('.').map(function(item, i, arr){
            return i == arr.length-2 ? item + '_'+ d : item;
        }).join('.');


        var repaceName = md5_filename;
        if (filename.indexOf("@2x") >= 0) {
            // 二倍图
            var x = md5Data[sub_namepath+(basename.split("@2x")[0])+extname];
            if( x && x != "") {
                // var newMD5 =  calcStrMd5(x + d, size);
                repaceName = basename.split("@2x")[0]+"_"+x+"@2x"+extname;
            }
        } else if (filename.indexOf("@3x") >= 0) {
            // 三倍图
            var x = md5Data[sub_namepath+(basename.split("@3x")[0])+extname];
            if( x && x != "") {
                // var newMD5 =  calcStrMd5(x + d, size);
                repaceName = basename.split("@3x")[0]+"_"+x+"@3x"+extname;
            }
        } else {
            // 一倍图
            var x = md5Data[sub_namepath+basename+extname];
            if( x && x != "") {
                // var newMD5 =  calcStrMd5(d+x, size);
                repaceName = basename+"_"+x+extname;
            }
        }

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
    var md5 = crypto.createHash('md5');
    md5.update(str, 'utf8');
    return slice >0 ? md5.digest('hex').slice(0, slice) : md5.digest('hex');
}
