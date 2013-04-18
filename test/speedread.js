// Generated by CoffeeScript 1.6.2
'use strict';
var ElementCreator, Looper, Page, SpeedReader, Splitter, SrDialog, TextSplitter, WordDisplayer, WpmConverter, speedRead, win;

Page = (function() {
  function Page(win) {
    this.win = win;
    this.doc = this.win.document;
    this.body = this.doc.body;
    this.event = this.win.event;
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

  Page.prototype.setInterval = function(callback, time) {
    return this.win.setInterval(callback, time);
  };

  Page.prototype.clearInterval = function(interval) {
    return this.win.clearInterval(interval);
  };

  return Page;

})();

Splitter = (function() {
  function Splitter() {}

  Splitter.stringReverse = function(str) {
    return str.split('').reverse().join('');
  };

  Splitter.stringNotEmpty = function(str) {
    return str !== '';
  };

  Splitter.splitIntoWords = function(text) {
    return text.split(/\s+/).filter(Splitter.stringNotEmpty);
  };

  Splitter.arrayNotEmpty = function(array) {
    return array.length > 0;
  };

  Splitter.appendEmptyElement = function(array) {
    return array.concat('');
  };

  Splitter.splitIntoSentences = function(text) {
    return this.stringReverse(text).split(/(?=[\s\n\r]+["']?[.?!]+)/).map(Splitter.stringReverse).reverse().map(Splitter.splitIntoWords).filter(Splitter.arrayNotEmpty).map(Splitter.appendEmptyElement);
  };

  return Splitter;

})();

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
    var cssProperties, key, val;

    cssProperties = (function() {
      var _results;

      _results = [];
      for (key in css) {
        val = css[key];
        if (css.hasOwnProperty(key)) {
          _results.push(key + ':' + val);
        }
      }
      return _results;
    })();
    return cssProperties.join(';');
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
    evt = evt || this.page.event;
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
    evt = evt || this.page.event;
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
  function Looper(page, callback, time) {
    this.page = page;
    this.callback = callback;
    this.time = time;
    this.interval = null;
  }

  Looper.prototype.start = function() {
    return this.interval = this.page.setInterval(this.callback, this.time);
  };

  Looper.prototype.stop = function() {
    return this.page.clearInterval(this.interval);
  };

  return Looper;

})();

SpeedReader = (function() {
  function SpeedReader(page, dialog, interval) {
    this.page = page;
    this.dialog = dialog;
    this.interval = interval;
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
    this.looper = new Looper(this.page, (function() {
      return displayer.nextWord();
    }), this.interval);
    return this.looper.start();
  };

  return SpeedReader;

})();

WpmConverter = (function() {
  function WpmConverter() {}

  WpmConverter.toInterval = function(wpm) {
    return Math.round(60000 / wpm);
  };

  return WpmConverter;

})();

speedRead = function(win, wpm) {
  var dialog, elementCreator, interval, page, sentences, sr, words;

  page = new Page(win);
  sentences = Splitter.splitIntoSentences(page.getSelectedText());
  if (sentences.length === 0) {
    return;
  }
  words = new TextSplitter(sentences);
  elementCreator = new ElementCreator(page);
  dialog = new SrDialog(page, elementCreator);
  dialog.create();
  interval = WpmConverter.toInterval(wpm);
  sr = new SpeedReader(page, dialog, interval);
  sr.handleKeyPresses();
  sr.displayWords(words);
};

win = this;

win['speedRead'] = speedRead;

speedRead(win, 350);
