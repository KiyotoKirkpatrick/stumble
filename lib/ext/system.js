'use strict';

const path = require('path');

const STDLIBS = require('../stdlibs');

const load = {
  handle: 'system::load',
  exec: function load (data) {
    const ext = path.basename(data.extension, '.js');
    const status = { success: false };

    if (this.extensions.has(ext)) {
      status.message = `Extension named [ ${ext} ] already loaded. \
                        Cowardly refusing to attempt a load that will, \
                        without fail, fail. Try unloading first.`;
    } else if (STDLIBS.indexOf(ext) > -1) {
      this.use(require(`${__dirname}/${ext}`));
      status.message = `Extension [ ${ext} ] loaded!`;
      status.success = true;
    } else {
      status.message = `Extension [ ${ext} ] not in the Stumble stdlib.`;
    }

    return status;
  }
};

const unload = {
  handle: 'system::unload',
  exec: function unload (data) {
    const ext = STDLIBS.indexOf(data.extension) > - 1
                && this.extensions.get(data.extension);

    if (ext) {
      const commands = ext.commands;

      if (commands)
        commands.forEach(command => this.commands.delete(command));

      const extensions = ext.extensions;

      if (extensions)
        extensions.forEach(extension => unload.call(this, { extension }));

      if (ext.term) ext.term.call(this, this);

      this.extensions.delete(data.extension);
    }

    return !!ext;
  }
};

module.exports = {
  handle: 'system',
  extensions: [load, unload]
};