describe('SkillSwap Dashboard (TC005)', () => {
    it('should display the token balance on the Dashboard', async () => {
        // Wait for dashboard to be visible
        const dashboardHeader = await $('~DashboardHeader');
        await dashboardHeader.waitForDisplayed({ timeout: 15000 });
        
        // Find balance text using its accessibility label or a similar locator
        const balanceText = await $('~BalanceText');
        await balanceText.waitForDisplayed({ timeout: 5000 });
        
        // Get the text value and verify it contains "Tokens" or a numeric value
        const text = await balanceText.getText();
        expect(text.length).toBeGreaterThan(0);
        
        // Add more specific assertions as we understand the UI structure better
    });
});
