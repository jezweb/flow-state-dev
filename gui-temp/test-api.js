/**
 * Test API functionality
 */

import { FlowStateAPI } from '../lib/api/flow-state-api.js';

async function testAPI() {
  console.log('Testing Flow State API...\n');
  
  try {
    // Create API instance
    const api = new FlowStateAPI({ silent: true });
    
    // Test version
    console.log('1. Testing getVersion()...');
    const version = await api.getVersion();
    console.log('Version:', version);
    console.log('✓ Version test passed\n');
    
    // Test initialization
    console.log('2. Testing initialize()...');
    await api.initialize();
    console.log('✓ Initialization passed\n');
    
    // Test status
    console.log('3. Testing getStatus()...');
    const status = api.getStatus();
    console.log('Status:', status);
    console.log('✓ Status test passed\n');
    
    // Test modules
    console.log('4. Testing getModules()...');
    const modules = await api.getModules();
    console.log(`Found ${modules.length} modules`);
    console.log('✓ Modules test passed\n');
    
    // Test presets
    console.log('5. Testing getPresets()...');
    const presets = await api.getPresets();
    console.log(`Found ${presets.length} presets`);
    console.log('✓ Presets test passed\n');
    
    // Test diagnostics
    console.log('6. Testing runDiagnostics()...');
    const diagnostics = await api.runDiagnostics();
    console.log('Diagnostics summary:', diagnostics.summary);
    console.log('✓ Diagnostics test passed\n');
    
    console.log('All tests passed! ✨');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAPI();