import { supabaseClient, getCurrentUser, getCurrentProfile, onAuthStateChange } from './supabase-client.js';
import { renderLoginPage } from './pages/login.js';
import { renderAdminDashboard } from './pages/admin-dashboard.js';
import { renderClientDashboard } from './pages/client-dashboard.js';

let currentUser = null;
let currentProfile = null;

async function init() {
    // Check current auth state
    currentUser = await getCurrentUser();

    if (currentUser) {
        currentProfile = await getCurrentProfile();
        renderDashboard();
    } else {
        renderLoginPage(handleLoginSuccess);
    }

    // Listen to auth changes
    onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            currentProfile = await getCurrentProfile();
            renderDashboard();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            currentProfile = null;
            renderLoginPage(handleLoginSuccess);
        }
    });
}

function handleLoginSuccess() {
    init();
}

function renderDashboard() {
    if (!currentProfile) return;

    if (currentProfile.role === 'admin') {
        renderAdminDashboard(currentProfile);
    } else {
        renderClientDashboard(currentProfile);
    }
}

// Start the app
init();
