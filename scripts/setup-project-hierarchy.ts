#!/usr/bin/env node

/**
 * Simple GitHub Project Hierarchy Setup
 * Sets parent-child relationships using GitHub's native project hierarchy
 */

import { execSync } from 'node:child_process';

// Configuration
const PROJECT_NUMBER = '3';
const OWNER = 'cbnsndwch';

// Epic to Story mapping (Epic Issue # -> [Story Issue #s])
const HIERARCHY = {
  8: [15, 16],   // Epic 1: Core Platform Foundation
  9: [17, 18],   // Epic 2: Schema Management System
  10: [19, 20],  // Epic 3: Data Management Interface
  11: [21, 22],  // Epic 4: Multiple Views & Visualization
  12: [23, 24],  // Epic 5: Real-Time Collaboration
  13: [25, 26],  // Epic 6: Integration & API Platform
  14: [27, 28, 29] // Epic 7: Enterprise Features
};

function executeCommand(command: string): boolean {
  try {
    console.log(`🔄 ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.log(`❌ Command failed: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🔗 Setting up GitHub Project parent-child relationships...\n');

  let successCount = 0;
  let failCount = 0;

  for (const [epicNumber, storyNumbers] of Object.entries(HIERARCHY)) {
    console.log(`\n📋 Setting up Epic #${epicNumber} with stories: ${storyNumbers.join(', ')}`);
    
    for (const storyNumber of storyNumbers) {
      // Get the project item IDs for both epic and story
      const getItemsCmd = `gh project item-list ${PROJECT_NUMBER} --owner ${OWNER} --format json`;
      let items;
      
      try {
        const output = execSync(getItemsCmd, { encoding: 'utf8' });
        items = JSON.parse(output).items;
      } catch (error) {
        console.log(`❌ Failed to get project items`);
        failCount++;
        continue;
      }

      const epicItem = items.find((item: any) => item.content?.number === parseInt(epicNumber));
      const storyItem = items.find((item: any) => item.content?.number === storyNumber);

      if (!epicItem || !storyItem) {
        console.log(`❌ Could not find items for Epic #${epicNumber} or Story #${storyNumber}`);
        failCount++;
        continue;
      }

      // Set the parent issue using the project item edit command
      const setParentCmd = `gh project item-edit ${PROJECT_NUMBER} --owner ${OWNER} --id ${storyItem.id} --field-id PVTF_lAHOAH7boM4BEIukzg12e9s --text "#${epicNumber}"`;
      
      if (executeCommand(setParentCmd)) {
        console.log(`✅ Set Story #${storyNumber} parent to Epic #${epicNumber}`);
        successCount++;
      } else {
        failCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n🎉 Hierarchy setup completed!`);
  console.log(`📊 Summary: ${successCount} successful, ${failCount} failed`);
  console.log(`🔗 View project: https://github.com/users/${OWNER}/projects/${PROJECT_NUMBER}`);
}

main().catch(console.error);