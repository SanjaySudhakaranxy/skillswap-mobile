exports.config = {
    runner: 'local',
    port: 4723,
    specs: [
        './test/specs/**/*.js'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UIAutomator2',
        // Update these depending on the Expo build/app context
        // For testing a standalone APK built via EAS:
        // 'appium:app': 'path/to/your/app.apk',
        // For Expo Go:
        // 'appium:appPackage': 'host.exp.exponent',
        // 'appium:appActivity': 'host.exp.exponent.LauncherActivity',
        'appium:noReset': true,
        'appium:fullReset': false,
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
