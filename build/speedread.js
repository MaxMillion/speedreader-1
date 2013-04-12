// Generated by CoffeeScript 1.6.2
(function() {
  'use strict';
  var ElementCreator, Looper, Page, SpeedReader, SrDialog, TextSplitter, WordDisplayer, appendEmptyElement, arrayNotEmpty, speedRead, splitIntoSentences, splitIntoWords, stringNotEmpty, stringReverse;

  Page = (function() {
    function Page(win, doc) {
      this.win = win;
      this.doc = doc;
      this.body = this.doc.body;
    }

    Page.prototype.createElement = function(type) {
      return this.doc.createElement(type);
    };

    Page.prototype.appendChild = function(child) {
      return this.body.appendChild(child);
    };

    Page.prototype.removeChild = function(child) {
      return this.body.removeChild(child);
    };

    Page.prototype.getSelectedText = function() {
      if (this.win.getSelection) {
        return this.win.getSelection().toString();
      }
      if (this.doc.getSelection) {
        return this.doc.getSelection();
      }
      if (this.doc.selection) {
        return this.doc.selection.createRange().text;
      }
      return '';
    };

    return Page;

  })();

  stringReverse = function(str) {
    return str.split('').reverse().join('');
  };

  stringNotEmpty = function(str) {
    return str !== '';
  };

  splitIntoWords = function(text) {
    return text.split(/\s+/).filter(stringNotEmpty);
  };

  arrayNotEmpty = function(array) {
    return array.length > 0;
  };

  appendEmptyElement = function(array) {
    return array.concat('');
  };

  splitIntoSentences = function(text) {
    return stringReverse(text).split(/(?=[\s\n\r]+["']?[.?!]+)/).map(stringReverse).reverse().map(splitIntoWords).filter(arrayNotEmpty).map(appendEmptyElement);
  };

  TextSplitter = (function() {
    function TextSplitter(sentences) {
      this.sentences = sentences;
      this.sentence = 0;
      this.word = 0;
    }

    TextSplitter.prototype.hasNext = function() {
      return this.sentence < this.sentences.length;
    };

    TextSplitter.prototype.nextWord = function() {
      var nextWord;

      nextWord = this.sentences[this.sentence][this.word];
      this.word += 1;
      if (this.word === this.sentences[this.sentence].length) {
        this.word = 0;
        this.sentence += 1;
      }
      return nextWord;
    };

    return TextSplitter;

  })();

  ElementCreator = (function() {
    var createCssText;

    function ElementCreator(page) {
      this.page = page;
    }

    createCssText = function(css) {
      var cssText, key, val;

      cssText = '';
      for (key in css) {
        val = css[key];
        if (css.hasOwnProperty(key)) {
          cssText += key + ': ' + val + ';';
        }
      }
      return cssText;
    };

    ElementCreator.prototype.create = function(type, id, css) {
      var elem;

      elem = this.page.createElement(type);
      elem.id = id;
      elem.style.cssText = createCssText(css);
      return elem;
    };

    ElementCreator.prototype.createDiv = function(id, css) {
      return this.create('div', id, css);
    };

    ElementCreator.prototype.createPara = function(id, css) {
      return this.create('p', id, css);
    };

    return ElementCreator;

  })();

  SrDialog = (function() {
    function SrDialog(page, elementCreator) {
      this.page = page;
      this.elementCreator = elementCreator;
      this.dialog = null;
      this.p = null;
      this.keyEvents = {};
    }

    SrDialog.prototype.create = function() {
      this.dialog = this.elementCreator.createDiv('srDialog', {
        'background-color': 'white',
        'opacity': '.95',
        'filter': 'alpha(opacity=95)',
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'width': '100%',
        'height': '100%',
        'z-index': '1000'
      });
      this.dialog.tabIndex = 0;
      this.p = this.elementCreator.createPara('srWord', {
        'text-align': 'center',
        'background-color': 'white',
        'color': 'black',
        'font-size': '40px',
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'width': '400px',
        'margin-left': '-200px',
        'height': '100px',
        'margin-top': '-50px'
      });
      this.p.innerHTML = '';
      this.dialog.appendChild(this.p);
      this.page.appendChild(this.dialog);
      return this.dialog.focus();
    };

    SrDialog.prototype.remove = function() {
      if (this.dialog !== null) {
        return this.page.removeChild(this.dialog);
      }
    };

    SrDialog.prototype.onKeyDown = function(evt) {
      evt = evt || window.event;
      if (this.keyEvents.hasOwnProperty(evt.keyCode)) {
        this.keyEvents[evt.keyCode]();
        if (evt.preventDefault) {
          return evt.preventDefault();
        } else {
          return event.returnValue = false;
        }
      }
    };

    SrDialog.prototype.onKeyPress = function(evt) {
      evt = evt || window.event;
      return !this.keyEvents.hasOwnProperty(evt.keyCode);
    };

    SrDialog.prototype.addKeyEvent = function(key, action) {
      var _this = this;

      if (this.dialog.onkeydown === null) {
        this.dialog.onkeydown = function(evt) {
          return _this.onKeyDown(evt);
        };
        this.dialog.onkeypress = function(evt) {
          return _this.onKeyPress(evt);
        };
      }
      return this.keyEvents[key] = action;
    };

    SrDialog.prototype.clearKeyEvents = function() {
      return this.keyEvents.length = 0;
    };

    SrDialog.prototype.showWord = function(word) {
      return this.p.innerHTML = word;
    };

    return SrDialog;

  })();

  WordDisplayer = (function() {
    function WordDisplayer(words, srDialog, finished) {
      this.words = words;
      this.srDialog = srDialog;
      this.finished = finished;
    }

    WordDisplayer.prototype.nextWord = function() {
      if (this.words.hasNext()) {
        return this.srDialog.showWord(this.words.nextWord());
      } else {
        return this.finished();
      }
    };

    return WordDisplayer;

  })();

  Looper = (function() {
    function Looper(callback, time) {
      this.callback = callback;
      this.time = time;
      this.interval = null;
    }

    Looper.prototype.start = function() {
      return this.interval = setInterval(this.callback, this.time);
    };

    Looper.prototype.stop = function() {
      return clearInterval(this.interval);
    };

    return Looper;

  })();

  SpeedReader = (function() {
    function SpeedReader(dialog) {
      this.dialog = dialog;
      this.looper = null;
      this.playing = true;
      this.ESCAPE_KEY_CODE = 27;
      this.SPACE_KEY_CODE = 32;
    }

    SpeedReader.prototype.finish = function() {
      this.looper.stop();
      return this.dialog.remove();
    };

    SpeedReader.prototype.pauseResume = function() {
      if (this.playing) {
        this.looper.stop();
      } else {
        this.looper.start();
      }
      return this.playing = !this.playing;
    };

    SpeedReader.prototype.handleKeyPresses = function() {
      var _this = this;

      this.dialog.addKeyEvent(this.ESCAPE_KEY_CODE, function() {
        return _this.finish();
      });
      return this.dialog.addKeyEvent(this.SPACE_KEY_CODE, function() {
        return _this.pauseResume();
      });
    };

    SpeedReader.prototype.displayWords = function(words) {
      var displayer,
        _this = this;

      displayer = new WordDisplayer(words, this.dialog, function() {
        return _this.finish();
      });
      this.looper = new Looper((function() {
        return displayer.nextWord();
      }), 255);
      return this.looper.start();
    };

    return SpeedReader;

  })();

  speedRead = function(win, doc) {
    var dialog, elementCreator, page, sentences, sr, words;

    page = new Page(win, doc);
    sentences = splitIntoSentences(page.getSelectedText());
    if (sentences.length === 0) {
      return;
    }
    words = new TextSplitter(sentences);
    elementCreator = new ElementCreator(page);
    dialog = new SrDialog(page, elementCreator);
    dialog.create();
    sr = new SpeedReader(dialog);
    sr.handleKeyPresses();
    sr.displayWords(words);
  };

  window['speedRead'] = speedRead;

  speedRead(window, document);

}).call(this);
