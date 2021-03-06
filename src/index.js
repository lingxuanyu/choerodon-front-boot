import openBrowser from 'react-dev-utils/openBrowser';
import updateWebpackConfig from './config/updateWebpackConfig';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const nunjucks = require('nunjucks');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const getChoerodonConfig = require('./config/getChoerodonConfig');
const runCmd = require('./runCmd');
const context = require('./context');

const entryTemplate = fs.readFileSync(path.join(__dirname, 'entry.nunjucks.js')).toString();
const routesTemplate = fs.readFileSync(path.join(__dirname, 'routes.nunjucks.js')).toString();
const tmpDirPath = path.join(__dirname, '..', 'tmp');
mkdirp.sync(tmpDirPath);

function escapeWinPath(path) {
  return path.replace(/\\/g, '\\\\');
}

function getPackagePath(base = '.') {
  return path.join(process.cwd(), base, 'package.json');
}

function getPackageRoute(packageInfo, base = '.') {
  if (packageInfo) {
    const { main, name } = packageInfo;
    return { [name.slice(name.lastIndexOf('-') + 1)]: path.join(base, main) };
  }
}

function getRoutes(packageInfo) {
  const { choerodonConfig } = context;
  let configRoutes = choerodonConfig.routes;
  if (!configRoutes) {
    return getPackageRoute(packageInfo);
  }
  return configRoutes;
}

function getRoutesPath(configRoutes, configEntryName) {
  const routesPath = path.join(tmpDirPath, `routes.${configEntryName}.js`);
  nunjucks.configure(routesPath, {
    autoescape: false,
  });
  fs.writeFileSync(
    routesPath,
    nunjucks.renderString(routesTemplate, {
      routes: Object.keys(configRoutes).map((key) => (
        `_react2['default'].createElement(
          _reactRouterDom.Route,
          {
            path: '/${key}',
            component: _asyncRouter2['default'](() => import('${escapeWinPath(path.join(process.cwd(), configRoutes[key]))}')),
          }
        ),`
      )).join('\n'),
    }),
  );
  return routesPath;
}

function generateEntryFile(mainPackage, configEntryName, root) {
  const entryPath = path.join(tmpDirPath, `entry.${configEntryName}.js`);
  const routesPath = getRoutesPath(
    getRoutes(mainPackage),
    configEntryName,
  );
  fs.writeFileSync(
    entryPath,
    nunjucks.renderString(entryTemplate, {
      routesPath: escapeWinPath(routesPath),
      root: escapeWinPath(root),
    }),
  );
}

function getDependenciesByModules(modules) {
  const { choerodonConfig } = context;
  const dependencies = {};
  const routes = modules.reduce((obj, module) => {
    const packageInfo = require(getPackagePath(module));
    Object.assign(dependencies, packageInfo.dependencies);
    return Object.assign(obj, getPackageRoute(packageInfo, module));
  }, {});

  if (!choerodonConfig.routes) {
    choerodonConfig.routes = routes;
  }
  return dependencies;
}

function install(done) {
  runCmd(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['i'], done);
}

function run(mainPackage) {
  const { choerodonConfig } = context;
  generateEntryFile(
    mainPackage,
    choerodonConfig.entryName,
    '/',
  );

  const webpackConfig = updateWebpackConfig('start', 'development');
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  const serverOptions = {
    quiet: true,
    hot: true,
    ...choerodonConfig.devServerConfig,
    contentBase: path.join(process.cwd(), choerodonConfig.output),
    historyApiFallback: true,
    host: 'localhost',
  };
  WebpackDevServer.addDevServerEntrypoints(webpackConfig, serverOptions);

  const compiler = webpack(webpackConfig);

  const timefix = 11000;
  compiler.plugin('watch-run', (watching, callback) => {
    watching.startTime += timefix;
    callback();
  });
  compiler.plugin('done', (stats) => {
    stats.startTime -= timefix;
  });

  const server = new WebpackDevServer(compiler, serverOptions);
  server.listen(
    choerodonConfig.port, '0.0.0.0',
    () => openBrowser(`http://localhost:${choerodonConfig.port}`),
  );
}

function dist(mainPackage, env) {
  const { choerodonConfig } = context;
  generateEntryFile(
    mainPackage,
    choerodonConfig.entryName,
    choerodonConfig.root,
  );
  const webpackConfig = updateWebpackConfig('build', env);
  webpackConfig.plugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
  }));


  webpack(webpackConfig, (err, stats) => {
    if (err !== null) {
      return console.error(err);
    }

    if (stats.hasErrors()) {
      console.log(stats.toString('errors-only'));
      return;
    }
  });
};

exports.start = function start(program) {
  const configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  const choerodonConfig = getChoerodonConfig(configFile);
  context.initialize({ choerodonConfig });
  const mainPackagePath = getPackagePath();
  const mainPackage = require(mainPackagePath);
  if (program.args.length) {
    mainPackage.dependencies = Object.assign(getDependenciesByModules(program.args), mainPackage.dependencies);
    fs.writeFileSync(
      mainPackagePath,
      JSON.stringify(mainPackage),
    );
    install(() => {
      run(mainPackage);
    });
  } else {
    run(mainPackage);
  }
};


exports.build = function build(program) {
  const configFile = path.join(process.cwd(), program.config || 'choerodon.config.js');
  const env = program.env || process.env.NODE_ENV || 'production';
  const choerodonConfig = getChoerodonConfig(configFile);
  context.initialize({
    choerodonConfig,
    isBuild: true,
  });
  rimraf.sync(choerodonConfig.output);
  mkdirp.sync(choerodonConfig.output);
  const mainPackagePath = getPackagePath();
  const mainPackage = require(mainPackagePath);
  if (program.args.length) {
    mainPackage.dependencies = Object.assign(getDependenciesByModules(program.args), mainPackage.dependencies);
    fs.writeFileSync(
      mainPackagePath,
      JSON.stringify(mainPackage),
    );
    install(() => {
      dist(mainPackage, env);
    });
  } else {
    dist(mainPackage, env);
  }
};

