/**
 *  Created by Melnikov R.S. on 21.08.2015
 */
(function ($) {
    jQuery.fn.mrs2000box = function (options) {

        options = $.extend({
            showTitle: true,
            showNumber: true,
            showGallery: true
        }, options);

        var $spinner,
            $shadow,
            $image,
            buffer,
            $frame,
            $left,
            $right,
            $title,
            $error;

        var list = [],
            current,
            directional = 1;

        var imageWidth, imageHeight, showTitle;
        var isReady = false, isShow = false;

        var bufferWait = true, bufferCurrent;

        function create() {

            if ($('.m2b-shadow').length > 0) return;

            $shadow = $('<div class="m2b-shadow"></div>');
            $shadow.appendTo('body').click(close);

            $frame = $('<div class="m2b-frame"><div class="m2b-shadow2"></div>' +
                '<div class="m2b-spinner"><div class="m2b-double-bounce1"></div><div class="m2b-double-bounce2"></div></div>' +
                '<img class="m2b-image"><div class="m2b-error"></div><div class="m2b-left"></div><div class="m2b-right"></div>' +
                '<div class="m2b-btn-close"></div><div class="m2b-title"></div></div>');
            $frame.appendTo('body');

            $spinner = $frame.find('.m2b-spinner');

            $image = $frame.find('.m2b-image');
            $image.hide().load(function () {
                if ((options.showNumber || options.showTitle) && $title.html() != '') {
                    showTitle = true;
                    $title.show();
                }
                setImageSize();
                $spinner.hide();
            }).click(function () {
                if (list.length < 2 || !options.showGallery) {
                    close();
                }
            });

            $left = $frame.find('.m2b-left');
            $right = $frame.find('.m2b-right');
            $left.click(loadPrev);
            $right.click(loadNext);

            $title = $frame.find('.m2b-title');
            if (options.showTitle || options.showNumber) {
                $title.show();
            }

            $error = $frame.find('.m2b-error');

            $frame.find('.m2b-btn-close').click(close);

            function preloadNext() {
                if (list.length > 1) {
                    bufferWait = false;
                    bufferCurrent = directional == 1 ? getNextId() : getPrevId();
                    buffer.src = list[bufferCurrent].href;
                }
            }

            buffer = new Image;
            buffer.onload = function () {
                if (bufferWait) {
                    imageWidth = buffer.width;
                    imageHeight = buffer.height;
                    $image.attr('src', buffer.src).show();
                    isReady = true;
                    preloadNext()

                } else {
                    bufferWait = true;
                }
            };
            buffer.onerror = function () {
                if (bufferWait) {
                    $error.show();
                    $spinner.hide();
                    isReady = true;
                    preloadNext();
                }
            };

            $(window).resize(function () {
                setImageSize();
            });

            $(document).keyup(function (e) {
                if (isShow) {
                    switch (e.which) {
                        case 27:
                            close();
                            break;
                        case 37:
                            loadPrev();
                            break;
                        case 39:
                            loadNext();
                            break;
                    }
                }
            });
        }

        function setImageSize() {
            var fw = $frame.width(),
                fh = $frame.height(),
                s = imageWidth / imageHeight,
                width, height;

            if (showTitle) {
                fh -= $title.outerHeight();
            }

            if (s > 1) {
                width = imageWidth > fw ? fw : imageWidth;
                height = width / s;
            } else {
                height = imageHeight > fh ? fh : imageHeight;
                width = height * s;
            }

            var left = fw * 0.5 - width * 0.5,
                top = fh * 0.5 - height * 0.5;

            $image.css({top: top, left: left, width: width, height: height})
        }

        function load() {
            $title.html(list[current].title).hide();

            $image.hide();
            $spinner.show();
            $error.hide();
            isReady = false;
            bufferWait = true;
            bufferCurrent = current;
            buffer.src = list[current].href;
        }

        function getPrevId() {
            var n = current - 1;
            if (n == -1) n = list.length - 1;
            return n;
        }

        function getNextId() {
            var n = current + 1;
            if (n == list.length) n = 0;
            return n;
        }

        function loadPrev() {
            if (list.length > 1 && options.showGallery) {
                directional = 0;
                current = getPrevId();
                load();
            }
        }

        function loadNext() {
            if (list.length > 1 && options.showGallery) {
                directional = 1;
                current = getNextId();
                load();
            }
        }

        function getTitle(element) {
            var title = '';
            if (options.showNumber && element.rel) {
                title += '<b>Фото №' + element.rel + '</b> ';
            }

            return title + element.title;
        }

        function init($obj) {
            $obj.on('click', 'a', function (e) {
                e.preventDefault();
                if ($shadow == null) {
                    create();
                } else {
                    $shadow.show();
                    $frame.show();
                }

                list = [];

                if (options.showGallery) {
                    var item = this;
                    $obj.find('a').each(function (index, element) {
                        if (element == item) current = index;
                        list.push({
                            href: element.href,
                            title: getTitle(element)
                        });
                    });
                } else {
                    list.push({
                        href: this.href,
                        title: getTitle(this)
                    });
                }

                if (list.length > 1 && options.showGallery) {
                    $left.show();
                    $right.show();
                } else {
                    $left.hide();
                    $right.hide();
                }

                load();
                isShow = true;
            });
        }

        function close() {
            $shadow.hide();
            $frame.hide();
            isShow = false;
        }

        return $(this).each(function () {
            init($(this))
        });
    }
})(jQuery);