exports.config = {
    runner: 'local',
    port: 4723,
    specs: [
        './test/specs/**/*.js'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        maxInstances: 1,
        platformName: 'Android',
        'appium:automationName': 'UIAutomator2',
        'appium:app': './android/app/build/outputs/apk/release/app-release.apk',
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:uiautomator2ServerInstallTimeout': 60000,
        'appium:androidInstallTimeout': 120000,
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [],
    framework: 'mocha',
    reporters: ['spec', ['junit', {
        outputDir: './reports/junit',
        outputFileFormat: function(options) {
            return `results-${options.cid}.xml`
        }
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
}
