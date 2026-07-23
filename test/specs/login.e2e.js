describe('SkillSwap Authentication (TC001)', () => {
    it('should login with valid credentials', async () => {
        // Find email and password input fields (Needs specific accessibility IDs or XPaths for React Native)
        // For Expo/React Native, we often use accessibilityLabel or testID
        const emailInput = await $('~Email');
        const passwordInput = await $('~Password');
        const loginBtn = await $('~LoginButton');
        
        // Wait for elements to be present
        await emailInput.waitForDisplayed({ timeout: 10000 });
        
        // Input credentials
        await emailInput.setValue('test@skillswap.com');
        await passwordInput.setValue('password123');
        
        // Tap Login
        await loginBtn.click();
        
        // Verify navigation to Dashboard by checking for a Dashboard specific element
        const dashboardHeader = await $('~DashboardHeader');
        await dashboardHeader.waitForDisplayed({ timeout: 15000 });
        
        expect(await dashboardHeader.isDisplayed()).toBe(true);
    });
});
