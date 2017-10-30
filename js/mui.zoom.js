(function($, window) {
	var CLASS_ZOOM = $.className('zoom');
	var CLASS_ZOOM_SCROLLER = $.className('zoom-scroller');

	var SELECTOR_ZOOM = '.' + CLASS_ZOOM;
	var SELECTOR_ZOOM_SCROLLER = '.' + CLASS_ZOOM_SCROLLER;

	var EVENT_PINCH_START = 'pinchstart';
	var EVENT_PINCH = 'pinch';
	var EVENT_PINCH_END = 'pinchend';
	if ('ongesturestart' in window) {
		EVENT_PINCH_START = 'gesturestart';
		EVENT_PINCH = 'gesturechange';
		EVENT_PINCH_END = 'gestureend';
	}
	$.Zoom = function(element, options) {
		var zoom = this;

		zoom.options = $.extend($.Zoom.defaults, options);

		zoom.wrapper = zoom.element = element;
		zoom.scroller = element.querySelector(SELECTOR_ZOOM_SCROLLER);
		zoom.scrollerStyle = zoom.scroller && zoom.scroller.style;

		zoom.zoomer = element.querySelector(SELECTOR_ZOOM);
		zoom.zoomerStyle = zoom.zoomer && zoom.zoomer.style;

		zoom.init = function() {
			//自动启用
			$.options.gestureConfig.pinch = true;
			$.options.gestureConfig.doubletap = true;
			zoom.initEvents();
		};

		zoom.initEvents = function(detach) {
			var action = detach ? 'removeEventListener' : 'addEventListener';
			var target = zoom.scroller;

			target[action](EVENT_PINCH_START, zoom.onPinchstart);
			target[action](EVENT_PINCH, zoom.onPinch);
			target[action](EVENT_PINCH_END, zoom.onPinchend);

			target[action]($.EVENT_START, zoom.onTouchstart);
			target[action]($.EVENT_MOVE, zoom.onTouchMove);
			target[action]($.EVENT_CANCEL, zoom.onTouchEnd);
			target[action]($.EVENT_END, zoom.onTouchEnd);

			target[action]('drag', zoom.dragEvent);
			target[action]('doubletap', zoom.doubleTapEvent);
		};
		zoom.dragEvent = function(e) {
			if (imageIsMoved || isGesturing) {
				e.stopPropagation();
			}
		};
		zoom.doubleTapEvent = function(e) {
			zoom.toggleZoom(e.detail.center);
		};
		zoom.transition = function(style, time) {
			time = time || 0;
			style['webkitTransitionDuration'] = time + 'ms';
			return zoom;
		};
		zoom.translate = function(style, x, y) {
			x = x || 0;
			y = y || 0;
			style['webkitTransform'] = 'translate3d(' + x + 'px,' + y + 'px,0px)';
			return zoom;
		};
		zoom.scale = function(style, scale) {
			scale = scale || 1;
			style['webkitTransform'] = 'translate3d(0,0,0) scale(' + scale + ')';
			return zoom;
		};
		zoom.scrollerTransition = function(time) {
			return zoom.transition(zoom.scrollerStyle, time);
		};
		zoom.scrollerTransform = function(x, y) {
			return zoom.translate(zoom.scrollerStyle, x, y);
		};
		zoom.zoomerTransition = function(time) {
			return zoom.transition(zoom.zoomerStyle, time);
		};
		zoom.zoomerTransform = function(scale) {
			return zoom.scale(zoom.zoomerStyle, scale);
		};

		// Gestures
		var scale = 1,
			currentScale = 1,
			isScaling = false,
			isGesturing = false;
		zoom.onPinchstart = function(e) {
			isGesturing = true;
		};
		zoom.onPinch = function(e) {
			if (!isScaling) {
				zoom.zoomerTransition(0);
				isScaling = true;
			}
			scale = (e.detail ? e.detail.scale : e.scale) * currentScale;
			if (scale > zoom.options.maxZoom) {
				scale = zoom.options.maxZoom - 1 + Math.pow((scale - zoom.options.maxZoom + 1), 0.5);
			}
			if (scale < zoom.options.minZoom) {
				scale = zoom.options.minZoom + 1 - Math.pow((zoom.options.minZoom - scale + 1), 0.5);
			}
			zoom.zoomerTransform(scale);
		};
		zoom.onPinchend = function(e) {
			scale = Math.max(Math.min(scale, zoom.options.maxZoom), zoom.options.minZoom);
			zoom.zoomerTransition(zoom.options.speed).zoomerTransform(scale);
			currentScale = scale;
			isScaling = false;
		};
		zoom.setZoom = function(newScale) {
			scale = currentScale = newScale;
			zoom.scrollerTransition(zoom.options.speed).scrollerTransform(0, 0);
			zoom.zoomerTransition(zoom.options.speed).zoomerTransform(scale);
		};
		zoom.toggleZoom = function(position, speed) {
			if (typeof position === 'number') {
				speed = position;
				position = undefined;
			}
			speed = typeof speed === 'undefined' ? zoom.options.speed : speed;
			if (scale && scale !== 1) {
				scale = currentScale = 1;
				zoom.scrollerTransition(speed).scrollerTransform(0, 0);
			} else {
				scale = currentScale = zoom.options.maxZoom;
				if (position) {
					var offset = $.offset(zoom.zoomer);
					var top = offset.top;
					var left = offset.left;
					var offsetX = (position.x - left) * scale;
					var offsetY = (position.y - top) * scale;
					this._cal();
					if (offsetX >= imageMaxX && offsetX <= (imageMaxX + wrapperWidth)) { //center
						offsetX = imageMaxX - offsetX + wrapperWidth / 2;
					} else if (offsetX < imageMaxX) { //left
						offsetX = imageMaxX - offsetX + wrapperWidth / 2;
					} else if (offsetX > (imageMaxX + wrapperWidth)) { //right
						offsetX = imageMaxX + wrapperWidth - offsetX - wrapperWidth / 2;
					}
					if (offsetY >= imageMaxY && offsetY <= (imageMaxY + wrapperHeight)) { //middle
						offsetY = imageMaxY - offsetY + wrapperHeight / 2;
					} else if (offsetY < imageMaxY) { //top
						offsetY = imageMaxY - offsetY + wrapperHeight / 2;
					} else if (offsetY > (imageMaxY + wrapperHeight)) { //bottom
						offsetY = imageMaxY + wrapperHeight - offsetY - wrapperHeight / 2;
					}
					offsetX = Math.min(Math.max(offsetX, imageMinX), imageMaxX);
					offsetY = Math.min(Math.max(offsetY, imageMinY), imageMaxY);
					zoom.scrollerTransition(speed).scrollerTransform(offsetX, offsetY);
				} else {
					zoom.scrollerTransition(speed).scrollerTransform(0, 0);
				}
			}
			zoom.zoomerTransition(speed).zoomerTransform(scale);
		};

		zoom._cal = function() {
			wrapperWidth = zoom.wrapper.offsetWidth;
			wrapperHeight = zoom.wrapper.offsetHeight;
			imageWidth = zoom.zoomer.offsetWidth;
			imageHeight = zoom.zoomer.offsetHeight;
			var scaledWidth = imageWidth * scale;
			var scaledHeight = imageHeight * scale;
			imageMinX = Math.min((wrapperWidth / 2 - scaledWidth / 2), 0);
			imageMaxX = -imageMinX;
			imageMinY = Math.min((wrapperHeight / 2 - scaledHeight / 2), 0);
			imageMaxY = -imageMinY;
		};

		var wrapperWidth, wrapperHeight, imageIsTouched, imageIsMoved, imageCurrentX, imageCurrentY, imageMinX, imageMinY, imageMaxX, imageMaxY, imageWidth, imageHeight, imageTouchesStart = {},
			imageTouchesCurrent = {},
			imageStartX, imageStartY, velocityPrevPositionX, velocityPrevTime, velocityX, velocityPrevPositionY, velocityY;

		zoom.onTouchstart = function(e) {
			e.preventDefault();
			imageIsTouched = true;
			imageTouchesStart.x = e.type === $.EVENT_START ? e.targetTouches[0].pageX : e.pageX;
			imageTouchesStart.y = e.type === $.EVENT_START ? e.targetTouches[0].pageY : e.pageY;
		};
		zoom.onTouchMove = function(e) {
			e.preventDefault();
			if (!imageIsTouched) return;
			if (!imageIsMoved) {
				wrapperWidth = zoom.wrapper.offsetWidth;
				wrapperHeight = zoom.wrapper.offsetHeight;
				imageWidth = zoom.zoomer.offsetWidth;
				imageHeight = zoom.zoomer.offsetHeight;
				var translate = $.parseTranslateMatrix($.getStyles(zoom.scroller, 'webkitTransform'));
				imageStartX = translate.x || 0;
				imageStartY = translate.y || 0;
				zoom.scrollerTransition(0);
			}
			var scaledWidth = imageWidth * scale;
			var scaledHeight = imageHeight * scale;

			if (scaledWidth < wrapperWidth && scaledHeight < wrapperHeight) return;

			imageMinX = Math.min((wrapperWidth / 2 - scaledWidth / 2), 0);
			imageMaxX = -imageMinX;
			imageMinY = Math.min((wrapperHeight / 2 - scaledHeight / 2), 0);
			imageMaxY = -imageMinY;

			imageTouchesCurrent.x = e.type === $.EVENT_MOVE ? e.targetTouches[0].pageX : e.pageX;
			imageTouchesCurrent.y = e.type === $.EVENT_MOVE ? e.targetTouches[0].pageY : e.pageY;

			if (!imageIsMoved && !isScaling) {
				//				if (Math.abs(imageTouchesCurrent.y - imageTouchesStart.y) < Math.abs(imageTouchesCurrent.x - imageTouchesStart.x)) {
				//TODO 此处需要优化，当遇到长图，需要上下滚动时，下列判断会导致滚动不流畅
				if (
					(Math.floor(imageMinX) === Math.floor(imageStartX) && imageTouchesCurrent.x < imageTouchesStart.x) ||
					(Math.floor(imageMaxX) === Math.floor(imageStartX) && imageTouchesCurrent.x > imageTouchesStart.x)
				) {
					imageIsTouched = false;
					return;
				}
				//				}
			}
			imageIsMoved = true;
			imageCurrentX = imageTouchesCurrent.x - imageTouchesStart.x + imageStartX;
			imageCurrentY = imageTouchesCurrent.y - imageTouchesStart.y + imageStartY;

			if (imageCurrentX < imageMinX) {
				imageCurrentX = imageMinX + 1 - Math.pow((imageMinX - imageCurrentX + 1), 0.8);
			}
			if (imageCurrentX > imageMaxX) {
				imageCurrentX = imageMaxX - 1 + Math.pow((imageCurrentX - imageMaxX + 1), 0.8);
			}

			if (imageCurrentY < imageMinY) {
				imageCurrentY = imageMinY + 1 - Math.pow((imageMinY - imageCurrentY + 1), 0.8);
			}
			if (imageCurrentY > imageMaxY) {
				imageCurrentY = imageMaxY - 1 + Math.pow((imageCurrentY - imageMaxY + 1), 0.8);
			}

			//Velocity
			if (!velocityPrevPositionX) velocityPrevPositionX = imageTouchesCurrent.x;
			if (!velocityPrevPositionY) velocityPrevPositionY = imageTouchesCurrent.y;
			if (!velocityPrevTime) velocityPrevTime = $.now();
			velocityX = (imageTouchesCurrent.x - velocityPrevPositionX) / ($.now() - velocityPrevTime) / 2;
			velocityY = (imageTouchesCurrent.y - velocityPrevPositionY) / ($.now() - velocityPrevTime) / 2;
			if (Math.abs(imageTouchesCurrent.x - velocityPrevPositionX) < 2) velocityX = 0;
			if (Math.abs(imageTouchesCurrent.y - velocityPrevPositionY) < 2) velocityY = 0;
			velocityPrevPositionX = imageTouchesCurrent.x;
			velocityPrevPositionY = imageTouchesCurrent.y;
			velocityPrevTime = $.now();

			zoom.scrollerTransform(imageCurrentX, imageCurrentY);
		};
		zoom.onTouchEnd = function(e) {
			if (!e.touches.length) {
				isGesturing = false;
			}
			if (!imageIsTouched || !imageIsMoved) {
				imageIsTouched = false;
				imageIsMoved = false;
				return;
			}
			imageIsTouched = false;
			imageIsMoved = false;
			var momentumDurationX = 300;
			var momentumDurationY = 300;
			var momentumDistanceX = velocityX * momentumDurationX;
			var newPositionX = imageCurrentX + momentumDistanceX;
			var momentumDistanceY = velocityY * momentumDurationY;
			var newPositionY = imageCurrentY + momentumDistanceY;

			if (velocityX !== 0) momentumDurationX = Math.abs((newPositionX - imageCurrentX) / velocityX);
			if (velocityY !== 0) momentumDurationY = Math.abs((newPositionY - imageCurrentY) / velocityY);
			var momentumDuration = Math.max(momentumDurationX, momentumDurationY);

			imageCurrentX = newPositionX;
			imageCurrentY = newPositionY;

			var scaledWidth = imageWidth * scale;
			var scaledHeight = imageHeight * scale;
			imageMinX = Math.min((wrapperWidth / 2 - scaledWidth / 2), 0);
			imageMaxX = -imageMinX;
			imageMinY = Math.min((wrapperHeight / 2 - scaledHeight / 2), 0);
			imageMaxY = -imageMinY;
			imageCurrentX = Math.max(Math.min(imageCurrentX, imageMaxX), imageMinX);
			imageCurrentY = Math.max(Math.min(imageCurrentY, imageMaxY), imageMinY);

			zoom.scrollerTransition(momentumDuration).scrollerTransform(imageCurrentX, imageCurrentY);
		};
		zoom.destroy = function() {
			zoom.initEvents(true); //detach
			delete $.data[zoom.wrapper.getAttribute('data-zoomer')];
			zoom.wrapper.setAttribute('data-zoomer', '');
		}
		zoom.init();
		return zoom;
	};
	$.Zoom.defaults = {
		speed: 300,
		maxZoom: 3,
		minZoom: 1,
	};
	$.fn.zoom = function(options) {
		var zoomApis = [];
		this.each(function() {
			var zoomApi = null;
			var self = this;
			var id = self.getAttribute('data-zoomer');
			if (!id) {
				id = ++$.uuid;
				$.data[id] = zoomApi = new $.Zoom(self, options);
				self.setAttribute('data-zoomer', id);
			} else {
				zoomApi = $.data[id];
			}
			zoomApis.push(zoomApi);
		});
		return zoomApis.length === 1 ? zoomApis[0] : zoomApis;
	};
})(mui, window);
										document.getElementById('headImage').addEventListener('tap', function() { 
            if (mui.os.plus) { 
                var a = [{ 
                    title: "拍照" 
                }, { 
                    title: "从手机相册选择" 
                }]; 
                plus.nativeUI.actionSheet({ 
                    title: "修改用户头像", 
                    cancel: "取消", 
                    buttons: a 
                }, function(b) { /*actionSheet 按钮点击事件*/ 
                    switch (b.index) { 
                        case 0: 
                            break; 
                        case 1: 
                            getImage(); /*拍照*/ 
                            break; 
                        case 2: 
                            galleryImg();/*打开相册*/ 
                            break; 
                        default: 
                            break; 
                    } 
                }) 
            } 
        }, false); 
        function getImage() { 
            var c = plus.camera.getCamera(); 
            c.captureImage(function(e) { 
                plus.io.resolveLocalFileSystemURL(e, function(entry) { 
                    var s = entry.toLocalURL() + "?version=" + new Date().getTime(); 
                    uploadHead(s); /*上传图片*/ 
                }, function(e) { 
                    console.log("读取拍照文件错误：" + e.message); 
                }); 
            }, function(s) { 
                console.log("error" + s);  
            }, { 
                filename: "_doc/head.png" 
            }) 
        } 
         function galleryImg() { 
            plus.gallery.pick(function(a) { 
                plus.io.resolveLocalFileSystemURL(a, function(entry) { 
                    plus.io.resolveLocalFileSystemURL("_doc/", function(root) { 
                        root.getFile("head.png", {}, function(file) { 
                            //文件已存在 
                            file.remove(function() { 
                                console.log("file remove success"); 
                                entry.copyTo(root, 'head.png', function(e) { 
                                        var e = e.fullPath + "?version=" + new Date().getTime(); 
                                        uploadHead(e); /*上传图片*/ 
                                        //变更大图预览的src 
                                        //目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现 
                                    }, 
                                    function(e) { 
                                        console.log('copy image fail:' + e.message); 
                                    }); 
                            }, function() { 
                                console.log("delete image fail:" + e.message); 
                            }); 
                        }, function() { 
                            //文件不存在 
                            entry.copyTo(root, 'head.png', function(e) { 
                                    var path = e.fullPath + "?version=" + new Date().getTime(); 
                                    uploadHead(path); /*上传图片*/ 
                                }, 
                                function(e) { 
                                    console.log('copy image fail:' + e.message); 
                                }); 
                        }); 
                    }, function(e) { 
                        console.log("get _www folder fail"); 
                    }) 
                }, function(e) { 
                    console.log("读取拍照文件错误：" + e.message); 
                }); 
            }, function(a) {}, { 
                filter: "image" 
            }) 
        }; 
          function uploadHead(imgPath) { 
            console.log("imgPath = " + imgPath); 
            mainImage.src = imgPath; 
            mainImage.style.width = "60px"; 
            mainImage.style.height = "60px"; 
 
            var image = new Image(); 
            image.src = imgPath; 
            image.onload = function() { 
                var imgData = getBase64Image(image); 
                /*在这里调用上传接口*/ 
//              mui.ajax("图片上传接口", { 
//                  data: { 
//                       
//                  }, 
//                  dataType: 'json', 
//                  type: 'post', 
//                  timeout: 10000, 
//                  success: function(data) { 
//                      console.log('上传成功'); 
//                  }, 
//                  error: function(xhr, type, errorThrown) { 
//                      mui.toast('网络异常，请稍后再试！'); 
//                  } 
//              }); 
            } 
    } 
        //将图片压缩转成base64 
        function getBase64Image(img) { 
            var canvas = document.createElement("canvas"); 
            var width = img.width; 
            var height = img.height; 
            // calculate the width and height, constraining the proportions 
            if (width > height) { 
                if (width > 100) { 
                    height = Math.round(height *= 100 / width); 
                    width = 100; 
                }    function uploadHead(imgPath) { 
            console.log("imgPath = " + imgPath); 
            mainImage.src = imgPath; 
            mainImage.style.width = "60px"; 
            mainImage.style.height = "60px"; 
 
            var image = new Image(); 
            image.src = imgPath; 
            image.onload = function() { 
                var imgData = getBase64Image(image); 
                /*在这里调用上传接口*/ 
//              mui.ajax("图片上传接口", { 
//                  data: { 
//                       
//                  }, 
//                  dataType: 'json', 
//                  type: 'post', 
//                  timeout: 10000, 
//                  success: function(data) { 
//                      console.log('上传成功'); 
//                  }, 
//                  error: function(xhr, type, errorThrown) { 
//                      mui.toast('网络异常，请稍后再试！'); 
//                  } 
//              }); 
            } 
    } 
        //将图片压缩转成base64 
        function getBase64Image(img) { 
            var canvas = document.createElement("canvas"); 
            var width = img.width; 
            var height = img.height; 
            // calculate the width and height, constraining the proportions 
            if (width > height) { 
                if (width > 100) { 
                    height = Math.round(height *= 100 / width); 
                    width = 100; 
                } 
            } else { 
                if (height > 100) { 
                    width = Math.round(width *= 100 / height); 
                    height = 100; 
                } 
            } 
            canvas.width = width;   /*设置新的图片的宽度*/ 
            canvas.height = height; /*设置新的图片的长度*/ 
            var ctx = canvas.getContext("2d"); 
            ctx.drawImage(img, 0, 0, width, height); /*绘图*/ 
            var dataURL = canvas.toDataURL("image/png", 0.8); 
            return dataURL.replace("data:image/png;base64,", ""); 
        }    
            } else { 
                if (height > 100) { 
                    width = Math.round(width *= 100 / height); 
                    height = 100; 
                } 
            } 
            canvas.width = width;   /*设置新的图片的宽度*/ 
            canvas.height = height; /*设置新的图片的长度*/ 
            var ctx = canvas.getContext("2d"); 
            ctx.drawImage(img, 0, 0, width, height); /*绘图*/ 
            var dataURL = canvas.toDataURL("image/png", 0.8); 
            return dataURL.replace("data:image/png;base64,", ""); 
        }    

//kefu
