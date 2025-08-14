/**
 * Firebase Migration Verification Script
 * 
 * This script checks for any remaining Supabase references and verifies Firebase integration.
 * Run this in the browser console after loading your application.
 */

// Check for Supabase global objects
function checkForSupabase() {
    const supabaseGlobals = ['supabase', 'SupabaseClient', 'createClient'];
    const found = [];
    
    // Check window object for Supabase globals
    supabaseGlobals.forEach(globalName => {
        if (window[globalName] !== undefined) {
            found.push(`Global '${globalName}' found`);
        }
    });
    
    // Check for Supabase in script tags
    document.querySelectorAll('script[src*="supabase"]').forEach(script => {
        found.push(`Supabase script found: ${script.src}`);
    });
    
    // Check for Supabase in link tags
    document.querySelectorAll('link[href*="supabase"]').forEach(link => {
        found.push(`Supabase stylesheet found: ${link.href}`);
    });
    
    return found;
}

// Verify Firebase initialization
function verifyFirebase() {
    const results = [];
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
        results.push('❌ Firebase is not loaded');
        return results;
    }
    
    // Check Firebase services
    const requiredServices = ['auth', 'firestore', 'storage'];
    requiredServices.forEach(service => {
        if (!firebase[service]) {
            results.push(`❌ Firebase ${service} is not loaded`);
        } else {
            results.push(`✅ Firebase ${service} is loaded`);
        }
    });
    
    // Check Firebase config
    try {
        const config = firebase.app().options;
        if (!config || !config.apiKey || config.apiKey.includes('YOUR_')) {
            results.push('❌ Firebase configuration appears to be missing or using placeholder values');
        } else {
            results.push('✅ Firebase is properly configured');
        }
    } catch (e) {
        results.push(`❌ Error checking Firebase config: ${e.message}`);
    }
    
    return results;
}

// Check for Firebase services in use
function checkFirebaseUsage() {
    const results = [];
    
    // Check if auth is being used
    if (window.authService && typeof window.authService === 'object') {
        results.push('✅ authService is properly defined');
    } else {
        results.push('❌ authService is not properly defined');
    }
    
    // Check if order service is being used
    if (window.orderService && typeof window.orderService === 'object') {
        results.push('✅ orderService is properly defined');
    } else {
        results.push('❌ orderService is not properly defined');
    }
    
    // Check if admin auth service is being used (if on admin page)
    if (window.location.pathname.includes('admin')) {
        if (window.adminAuthService && typeof window.adminAuthService === 'object') {
            results.push('✅ adminAuthService is properly defined');
        } else {
            results.push('❌ adminAuthService is not properly defined');
        }
    }
    
    return results;
}

// Run all checks
function runVerification() {
    console.log('🚀 Starting Firebase Migration Verification\n');
    
    // Check for Supabase
    console.log('🔍 Checking for Supabase references...');
    const supabaseChecks = checkForSupabase();
    if (supabaseChecks.length > 0) {
        console.log('❌ Found Supabase references:');
        supabaseChecks.forEach(msg => console.log(`  - ${msg}`));
    } else {
        console.log('✅ No Supabase references found');
    }
    
    console.log('\n🔍 Verifying Firebase setup...');
    const firebaseChecks = verifyFirebase();
    firebaseChecks.forEach(msg => console.log(`  ${msg}`));
    
    console.log('\n🔍 Checking Firebase service usage...');
    const usageChecks = checkFirebaseUsage();
    usageChecks.forEach(msg => console.log(`  ${msg}`));
    
    // Additional checks based on current page
    if (window.location.pathname.includes('login')) {
        console.log('\n🔍 Login page specific checks:');
        // Check if Firebase auth methods are being used
        if (typeof handleLogin === 'function') {
            console.log('  ✅ Login handler is defined');
        } else {
            console.log('  ❌ Login handler is not properly defined');
        }
    }
    
    if (window.location.pathname.includes('admin/dashboard')) {
        console.log('\n🔍 Admin dashboard specific checks:');
        // Check if admin-specific Firebase functionality is working
        if (typeof loadAdminData === 'function') {
            console.log('  ✅ Admin data loader is defined');
        } else {
            console.log('  ❌ Admin data loader is not properly defined');
        }
    }
    
    console.log('\n✅ Verification complete!');
}

// Run verification when the page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runVerification);
} else {
    runVerification();
}
