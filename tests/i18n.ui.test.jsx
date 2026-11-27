import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { KhataProvider } from '../src/context/KhataContext.jsx';
import MobileHeader from '../src/components/MobileHeader.jsx';
import BottomNavBar from '../src/components/BottomNavBar.jsx';
import HomeTab from '../src/components/HomeTab.jsx';
import DashboardStats from '../src/components/DashboardStats.jsx';
import CustomerList from '../src/components/CustomerList.jsx';
import ReportsView from '../src/components/ReportsView.jsx';
import SettingsView from '../src/components/SettingsView.jsx';
import PhoneConnectModal from '../src/components/PhoneConnectModal.jsx';
import DesktopHeader from '../src/components/desktop/DesktopHeader.jsx';
import DesktopSidebar from '../src/components/desktop/DesktopSidebar.jsx';
import DesktopDashboard from '../src/components/desktop/DesktopDashboard.jsx';
import DesktopTransactionsView from '../src/components/desktop/DesktopTransactionsView.jsx';

describe('Multi-Page UI Language Switching (Hinglish <-> English)', () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  it('switches all mobile & desktop pages between Hinglish and English via header toggle and Settings dropdown', () => {
    render(
      <KhataProvider>
        <MobileHeader onOpenPhoneModal={() => {}} onOpenAiAssistant={() => {}} />
        <BottomNavBar activeTab="home" setActiveTab={() => {}} onOpenVoiceSheet={() => {}} />
        <HomeTab onOpenVoice={() => {}} onGoToKhata={() => {}} onGoToReports={() => {}} onOpenAiAssistant={() => {}} />
        <DashboardStats />
        <CustomerList />
        <ReportsView />
        <SettingsView />
        <PhoneConnectModal isOpen={true} onClose={() => {}} />
        <DesktopHeader onOpenVoice={() => {}} onOpenPhoneModal={() => {}} onOpenAiAssistant={() => {}} />
        <DesktopSidebar activeTab="home" setActiveTab={() => {}} onOpenVoice={() => {}} onOpenAiAssistant={() => {}} />
        <DesktopDashboard onOpenVoice={() => {}} onGoToKhata={() => {}} onGoToReports={() => {}} onOpenAiAssistant={() => {}} />
        <DesktopTransactionsView />
      </KhataProvider>
    );

    // 1. Default is Hinglish ('hi')
    expect(screen.getAllByText('कुल बकाया उधार').length).toBeGreaterThan(0);
    expect(screen.getByText('होम')).toBeTruthy();
    expect(screen.getAllByText('खाता').length).toBeGreaterThan(0);
    expect(screen.getByText('रिपोर्ट')).toBeTruthy();
    expect(screen.getByText('सेटिंग्स')).toBeTruthy();
    expect(screen.getByText('दुकान सेटिंग्स')).toBeTruthy();
    expect(screen.getByText('लेन-देन बही (All Transactions Ledger)')).toBeTruthy();
    expect(screen.getByText('अपने फोन पर चलाएं')).toBeTruthy();

    // 2. Click header language toggle button -> switches ALL pages to English
    const langButtons = screen.getAllByRole('button', { name: 'Switch language' });
    expect(langButtons[0].textContent).toContain('HI');
    fireEvent.click(langButtons[0]);

    expect(langButtons[0].textContent).toContain('EN');
    expect(screen.getAllByText('Total Pending Udhaar').length).toBeGreaterThan(0);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Khata')).toBeTruthy();
    expect(screen.getAllByText('Reports').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Shop Settings').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Daybook & Reports').length).toBeGreaterThan(0);
    expect(screen.getByText('All Transactions Ledger')).toBeTruthy();
    expect(screen.getByText('Open on Your Phone')).toBeTruthy();

    // 3. Switch back via SettingsView language <select> -> switches ALL pages back to Hinglish
    const langSelect = screen.getByDisplayValue('English');
    fireEvent.change(langSelect, { target: { value: 'hi' } });

    expect(langButtons[0].textContent).toContain('HI');
    expect(screen.getAllByText('कुल बकाया उधार').length).toBeGreaterThan(0);
    expect(screen.getByText('दुकान सेटिंग्स')).toBeTruthy();
    expect(screen.getByText('लेन-देन बही (All Transactions Ledger)')).toBeTruthy();
  });
});
