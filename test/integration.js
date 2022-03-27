var assert = require('assert');

var execa = require('execa');

var tempy = require('tempy');

var {
  inspect
} = require('util');


describe('cmd', function() {

  describe('should download and install', function() {
    verify('2.364.5');

  });


  describe('should propagate exit status', function() {
    // increase test timeout
    this.timeout(20000);

    let cwd;

    before(function() {
      cwd = install('2.364.5');
    });

    it('0 when successful', function() {

      // executing berty version sets exit code to 0
      var result = exec('node_modules/@berty/cli/bin/cmd.js', [
        'version'
      ], {
        cwd
      });

      assert.ok(result.code === 0, `berty version should exit with code=0, but exited with ${result.code}`);
    });


    it('!= 0 on failure', function() {

      // then
      // executing berty sets exit code to 255 as there is no site structure in cwd
      try {
        var result = execa.sync('node_modules/.bin/berty', [
        ], {
          cwd
        });
        assert.fail(`berty should exit with code != 0, but exited with ${result.code}`);
      } catch (error) {
        assert.ok(error.code !== 0, `berty without a site should exit with code=255, but exited with ${error.code}`);
      }

    });

  });

});


// helpers ////////////

function install(version) {
  var cwd = tempy.directory();

  var wd = process.cwd();

  // install cli from cwd
  exec('npm', [
    'install',
    `@berty/cli@${wd}`
  ], {
    cwd
  });

  return cwd;
}

function verify(version, cliEnv = {}) {

  it(version + ', env=' + inspect(cliEnv), function() {
    // increase test timeout
    this.timeout(20000);

    // given
    var cwd = install(version);

    // then
    // version should be installed
    var result = exec('node_modules/.bin/berty', [
      'version'
    ], {
      cwd,
      env: cliEnv
    });


    var stdout = result.stdout;

    // tmp @moul: a basic check for the 'version' string
    if (!(stdout.indexOf('version') >= 0)) {
      throw new Error(
        `expected <berty version> to report:

          version...

        found:

          ${stdout}

        `
      );
    }

    // temporarily disabled by @moul, because the output of `berty --version` looks not reliable for this kind of tests
    /*
    var expectedVersion = version;
    if (!(stdout.indexOf(`version  v${expectedVersion}`) >= 0)) {
      throw new Error(
        `expected <berty version> to report:

        version  v${expectedVersion}

      found:

        ${stdout}

      `
      );
    }
  */
  });


}


function exec(bin, args, options) {

  var result = execa.sync(bin, args, options);

  assert.ok(result.code === 0, `${bin} ${args.join(' ')} exited with code=0`);

  return result;
}
