安装:

npm install --save-dev gulp-md5-img


说明：本代码大部分都来源于 [gulp-md5-plus](https://github.com/wpfpizicai/gulp-md5-plus)，我只是进行了改写。

是 gulp 的插件，本插件必须配合着 [gulp-md5-save](https://github.com/zhengweijia/gulp-md5-save) 使用。

主要作用是处理网站上的图片问题，因为网站的图片长长需要适配高清屏幕，所以就会存在两张图片 a.jpg 和 a@2x.jpg，如果按照正常的 md5 处理，两张图片的名称就会不同（例如：a-54254.jpg 和 a@2x-72331.jpg）,这种情况在使用 angular 的 ng-src='a.jpg' 时，在高分屏上就会出现bug（angular 会去加载a-54254@2x.jpg）， 通过本插件处理，图片会被处理为 a-54254.jpg 和 a-54254@2x.jpg。

将保存的 {"aa.jpg" : "3b67254a6a"}应用到具体的图片文件上，并且修改 css、html 上对应的名称

使用方法分为两步：

1、使用 [gulp-md5-save](https://github.com/zhengweijia/gulp-md5-save) 准备数据，

	var md5Save = require("gulp-md5-save");
	var data = {}; //一倍图:md5 的 map，用于存放数据
	var sourceTmp = ["../../view/img/**"];
        // 具体模块 img 里的图片 md5
    gulp.src(sourceTmp)
        .pipe(md5Save(10, data));
        

最终会把处理好的数据存放到 data 中

2、使用本插件处理文件（修改具体文件名称），以及修改对应的字符串（css 中图片的引用名称）

	var md5Img = require("gulp-md5-img");
	var md5Save = require("gulp-md5-save");
	var sourceTmp = ["img/**"];
    var targetImg = "/img";
    // 具体模块 img 里的图片 md5
    gulp.src(sourceTmp)
        .pipe(md5Img(10 ,['/css/*.css', 'index.html', '/js/*.js'], data))
        .pipe(gulp.dest(targetImg));


#Example:

Images path:

	img
	├── pc
	│   ├── a.jpg
	│   ├── a@2x.jpg
	│   ├── b.jpg
	├── mobile
	│   ├── a.jpg
	│   ├── a@2x.jpg
	└── a.jpg

css: index.css
	
	.figure {
    	background-image: -webkit-image-set(url(img/pc/a.jpg) 1x, url(img/pc/a@2x.jpg) 2x);
	}
	.title {
    	background-image: -webkit-image-set(url(img/mobile/a.png) 1x, url(	img/mobile/a@2x.jpg) 2x);
	}
	.logo {
    	background-image: url(img/a.jpg);
	}
	.logo-b {
    	background-image: url(img/pc/b.jpg);
	}


Code:

    var md5Save = require("gulp-md5-save");
    var md5Img = require("gulp-md5-img");
    var data = {}; //save md5 value
    var sourceImg = ["./img/**"];
    var targetImg = "./release/img";
    var linkFiles = ['./index.css'];
    gulp.task('save', function () {
        gulp.src(sourceImg)
            .pipe(md5Save(10, data));
    });
    gulp.task('imgEdit', ['save'], function () {
        gulp.src(sourceImg)
            .pipe(md5Img(10 ,linkFiles, data))
            .pipe(gulp.dest(targetImg));
    });
    
Result:

1、Images path

	release/img
	├── pc
	│   ├── a_b14ff9e1de.jpg
	│   ├── a_b14ff9e1de@2x.jpg
	│   ├── b_629ccc774a.jpg
	├── mobile
	│   ├── a_b14ff9e1de.jpg
	│   ├── a_b14ff9e1de@2x.jpg
	└── a_b14ff9e1de.jpg
	
2、index.css

	.figure {
    	background-image: -webkit-image-set(url(img/pc/a_b14ff9e1de.jpg) 1x, url(img/pc/a_b14ff9e1de@2x.jpg) 2x);
	}
	.title {
    	background-image: -webkit-image-set(url(img/mobile/a_b14ff9e1de.jpg) 1x, url(	img/mobile/a_b14ff9e1de@2x.jpg) 2x);
	}
	.logo {
    	background-image: url(img/a_b14ff9e1de.jpg);
	}
	.logo-b {
    	background-image: url(img/pc/b_629ccc774a.jpg);
	}


