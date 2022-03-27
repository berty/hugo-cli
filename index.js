'use strict';

var path = require('path');
var fs = require('fs');
var got = require('got');
var decompress = require('decompress');
var semver = require('semver');

var cliVersion = require('./package').version;

var chalk = require('chalk');

var BERTY_BASE_URL = 'https://github.com/berty/berty/releases/download';
var BERTY_MIN_VERSION = '2.364.5';
var BERTY_DEFAULT_VERSION = process.env.BERTY_VERSION || '2.364.5';

var TARGET = {
  platform: process.platform,
  arch: process.arch
};

var PLATFORM_LOOKUP = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows'
};

function download(url, target, callback) {
  var fileStream = fs.createWriteStream(target);

  got.stream(url)
    .on('error', callback)
    .on('end', callback)
    .pipe(fileStream);
}

function extract(archivePath, destPath, installDetails) {
  var executableName = 'berty' + installDetails.executableExtension;

  return decompress(archivePath, destPath,
    {
      strip: 1,
      map: file => {

        if (path.basename(file.path) == executableName) {
          file.path = installDetails.executableName;
        }

        return file;
      }
    });
}


/**
 * Return the installation / download details for the given berty version.
 *
 * @param  {String} version
 * @return {Object}
 */
function getDetails(version, target) {

  var arch_dl = '_i386',
      platform = target.platform,
      archiveExtension = '.tar.gz',
      executableExtension = '';

  if (/x64/.test(target.arch)) {
    arch_dl = '_amd64';
  } else if (/arm/.test(target.arch)) {
    arch_dl = '_arm64';
  }

  if (/win32/.test(platform)) {
    platform = 'windows';
    executableExtension = '.exe';
    archiveExtension = '.zip';
  }

  var baseName = 'berty_${version}'.replace(/\$\{version\}/g, version);

  var executableName = 'berty${executableExtension}'.replace(/\$\{executableExtension\}/g, executableExtension);

  var archiveName =
    'berty_${platform}${arch}${archiveExtension}'
      .replace(/\$\{baseName\}/g, baseName)
      .replace(/\$\{platform\}/g, PLATFORM_LOOKUP[target.platform])
      .replace(/\$\{arch\}/g, arch_dl)
      .replace(/\$\{archiveExtension\}/g, archiveExtension);

  var downloadLink =
    '${baseUrl}/v${version}/${archiveName}'
      .replace(/\$\{baseUrl\}/g, BERTY_BASE_URL)
      .replace(/\$\{version\}/g, version)
      .replace(/\$\{archiveName\}/g, archiveName);

  return {
    archiveName: archiveName,
    executableName: executableName,
    downloadLink: downloadLink,
    executableExtension: executableExtension
  };
}


/**
 * Ensure the given version of berty is installed before
 * passing (err, executablePath) to the callback.
 *
 * @param  {Object} options
 * @param  {Function} callback
 */
function withBerty(options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = '';
  }

  var version = options.version || BERTY_DEFAULT_VERSION;
  var verbose = options.verbose;

  verbose && logDebug('target=%o, berty=%o', TARGET, { version });

  // strip of _extended prefix for semver check to work
  var extended = /^extended_|\/extended$/.test(version);
  var compatVersion = version.replace(/^extended_|\/extended$/, '');

  if (semver.lt(compatVersion, BERTY_MIN_VERSION)) {

    logError('berty-cli@%s is compatible with berty >= %s only.', cliVersion, BERTY_MIN_VERSION);
    logError('you requested berty@%s', version);

    return callback(new Error(`incompatible with berty@${version}`));
  }

  var pwd = __dirname;

  var installDetails = getDetails((extended ? 'extended_' : '') + compatVersion, TARGET);

  var installDirectory = path.join(pwd, 'tmp');

  var archivePath = path.join(installDirectory, installDetails.archiveName),
      executablePath = path.join(installDirectory, installDetails.executableName);

  verbose && logDebug('searching executable at <%s>', executablePath);

  if (fs.existsSync(executablePath)) {
    verbose && logDebug('berty found\n');

    return callback(null, executablePath);
  }

  log('berty not found. Attempting to fetch it...');

  var mkdirp = require('mkdirp');

  // ensure directory exists
  mkdirp.sync(installDirectory);

  verbose && logDebug('downloading archive from <%s>', installDetails.downloadLink);

  download(installDetails.downloadLink, archivePath, function(err) {

    var extractPath = path.dirname(archivePath);

    if (err) {
      logError('failed to download berty: ' + err);

      return callback(err);
    }

    log('fetched berty %s', version);

    log('extracting archive...');

    extract(archivePath, extractPath, installDetails).then(function() {

      verbose && logDebug('extracted archive to <%s>', extractPath);

      if (!fs.existsSync(executablePath)) {
        logError('executable <%s> not found', executablePath);
        logError('please report this as a bug');

        throw new Error('executable not found');
      }

      log('berty available, let\'s go!\n');

      callback(null, executablePath);
    }, function(err) {
      logError('failed to extract: ' + err);

      callback(err);
    });

  });

}


function logDebug(fmt, ...args) {
  console.debug(`${chalk.black.bgWhite('DEBUG')} ${fmt}`, ...args);
}

function log(fmt, ...args) {
  console.log(`${chalk.black.bgCyan('INFO')} ${fmt}`, ...args);
}

function logError(fmt, ...args) {
  console.error(`${chalk.black.bgRed('ERROR')} ${fmt}`, ...args);
}

module.exports.getDetails = getDetails;

module.exports.withBerty = withBerty;
