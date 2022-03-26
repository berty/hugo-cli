var cli = require('../');
var assert = require('assert');
var util = require('util');


describe('getDetails', function() {

  function verify(version, env, expectedDetails) {

    it(version + ', env=' + util.inspect(env), function() {

      // when
      var actualDetails = cli.getDetails(version, env);

      // then
      assert.deepEqual(actualDetails, expectedDetails);
    });

  }


  verify('2.364.5', { platform: 'linux', arch: 'x64' }, {
    archiveName: 'berty_linux_amd64.tar.gz',
    downloadLink: 'https://github.com/berty/berty/releases/download/v2.364.5/berty_linux_amd64.tar.gz',
    executableExtension: '',
    executableName: 'berty'
  });

  verify('2.364.5', { platform: 'darwin', arch: 'x64' }, {
    archiveName: 'berty_darwin_amd64.tar.gz',
    downloadLink: 'https://github.com/berty/berty/releases/download/v2.364.5/berty_darwin_amd64.tar.gz',
    executableExtension: '',
    executableName: 'berty'
  });

  verify('2.364.5', { platform: 'darwin', arch: 'arm64' }, {
    archiveName: 'berty_darwin_arm64.tar.gz',
    downloadLink: 'https://github.com/berty/berty/releases/download/v2.364.5/berty_darwin_arm64.tar.gz',
    executableExtension: '',
    executableName: 'berty'
  });

  verify('2.364.5', { platform: 'win32', arch: 'x64' }, {
    archiveName: 'berty_windows_amd64.zip',
    downloadLink: 'https://github.com/berty/berty/releases/download/v2.364.5/berty_windows_amd64.zip',
    executableExtension: '.exe',
    executableName: 'berty.exe'
  });

});
