#!/usr/bin/env node

/**
 * GitHub Issue Hierarchy Setup Script
 *
 * This script establishes parent-child relationships between Epic issues and their User Stories
 * in both GitHub Issues and GitHub Projects.
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPO = 'cbnsndwch/struktura';
const PROJECT_NUMBER = '3';
const OWNER = 'cbnsndwch';

// Epic and Story mapping based on our created issues
const EPIC_STORY_MAPPING = {
  // Epic 1: Core Platform Foundation (#8)
  8: [15, 16], // User Registration & Authentication, Workspace Management
  
  // Epic 2: Schema Management System (#9)
  9: [17, 18], // Visual Collection Builder, Dynamic Field Types System
  
  // Epic 3: Data Management Interface (#10)
  10: [19, 20], // Grid View for Data Management, Record Detail Forms
  
  // Epic 4: Multiple Views & Visualization (#11)
  11: [21, 22], // Calendar View, Kanban Board View
  
  // Epic 5: Real-Time Collaboration (#12)
  12: [23, 24], // Live Editing & Synchronization, Comments & Discussions
  
  // Epic 6: Integration & API Platform (#13)
  13: [25, 26], // REST API & GraphQL Endpoints, Third-Party Integrations
  
  // Epic 7: Enterprise Features (#14)
  14: [27, 28, 29] // Advanced Authentication & SSO, Advanced Permissions & Governance, Performance & Scalability
};

// Epic information for project field updates
const EPIC_INFO: Record<number, string> = {
  8: "Epic 1: Core Platform Foundation",
  9: "Epic 2: Schema Management", 
  10: "Epic 3: Data Management Interface",
  11: "Epic 4: Views & Visualization",
  12: "Epic 5: Real-Time Collaboration",
  13: "Epic 6: Integration & API",
  14: "Epic 7: Enterprise Features"
};

/**
 * Execute GitHub CLI command with error handling
 */
function executeGhCommand(command: string): { success: boolean; output?: string; error?: string } {
  try {
    console.log(`🔄 Executing: ${command}`);
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: output.trim() };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout?.toString() || ''
    };
  }
}

/**
 * Update an Epic issue to include child issue references in a task list
 */
async function updateEpicWithChildReferences(epicNumber: number, childNumbers: number[]): Promise<boolean> {
  try {
    // Get current epic issue body
    const getIssueResult = executeGhCommand(`gh issue view ${epicNumber} --repo "${REPO}" --json body`);
    if (!getIssueResult.success) {
      console.log(`❌ Failed to get epic #${epicNumber}: ${getIssueResult.error}`);
      return false;
    }

    const issueData = JSON.parse(getIssueResult.output || '{}');
    let currentBody = issueData.body || '';

    // Create task list for child issues
    const childTaskList = childNumbers.map(num => `- [ ] #${num}`).join('\n');
    
    // Look for existing "Related Issues" section and replace it, or add it
    const relatedIssuesRegex = /## Related Issues[\s\S]*?(?=\n##|\n---|\n\*|$)/;
    const newRelatedIssuesSection = `## Related Issues

${childTaskList}`;

    if (relatedIssuesRegex.test(currentBody)) {
      // Replace existing section
      currentBody = currentBody.replace(relatedIssuesRegex, newRelatedIssuesSection);
    } else {
      // Add new section before the footer
      const footerRegex = /\n---\n\*This is an Epic issue/;
      if (footerRegex.test(currentBody)) {
        currentBody = currentBody.replace(footerRegex, `\n${newRelatedIssuesSection}\n\n---\n*This is an Epic issue`);
      } else {
        currentBody += `\n\n${newRelatedIssuesSection}`;
      }
    }

    // Create temporary file for the updated body
    const tempFile = path.join(__dirname, `temp-epic-${epicNumber}-${Date.now()}.md`);
    const fs = await import('node:fs/promises');
    await fs.writeFile(tempFile, currentBody);

    try {
      // Update the issue
      const updateResult = executeGhCommand(`gh issue edit ${epicNumber} --repo "${REPO}" --body-file "${tempFile}"`);
      
      if (updateResult.success) {
        console.log(`✅ Updated Epic #${epicNumber} with child references`);
        return true;
      } else {
        console.log(`❌ Failed to update Epic #${epicNumber}: ${updateResult.error}`);
        return false;
      }
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.log(`❌ Error updating Epic #${epicNumber}: ${error}`);
    return false;
  }
}

/**
 * Update a Story issue to reference its parent Epic
 */
async function updateStoryWithParentReference(storyNumber: number, epicNumber: number): Promise<boolean> {
  try {
    // Get current story issue body
    const getIssueResult = executeGhCommand(`gh issue view ${storyNumber} --repo "${REPO}" --json body`);
    if (!getIssueResult.success) {
      console.log(`❌ Failed to get story #${storyNumber}: ${getIssueResult.error}`);
      return false;
    }

    const issueData = JSON.parse(getIssueResult.output || '{}');
    let currentBody = issueData.body || '';

    // Update the Epic section to reference the parent
    const epicSectionRegex = /## Epic[\s\S]*?(?=\n##|\n---|\n\*|$)/;
    const newEpicSection = `## Epic

Part of Epic #${epicNumber}: ${EPIC_INFO[epicNumber]}`;

    if (epicSectionRegex.test(currentBody)) {
      // Replace existing section
      currentBody = currentBody.replace(epicSectionRegex, newEpicSection);
    } else {
      // Add new section before the footer
      const footerRegex = /\n---\n\*This story contributes/;
      if (footerRegex.test(currentBody)) {
        currentBody = currentBody.replace(footerRegex, `\n${newEpicSection}\n\n---\n*This story contributes`);
      } else {
        currentBody += `\n\n${newEpicSection}`;
      }
    }

    // Create temporary file for the updated body
    const tempFile = path.join(__dirname, `temp-story-${storyNumber}-${Date.now()}.md`);
    const fs = await import('node:fs/promises');
    await fs.writeFile(tempFile, currentBody);

    try {
      // Update the issue
      const updateResult = executeGhCommand(`gh issue edit ${storyNumber} --repo "${REPO}" --body-file "${tempFile}"`);
      
      if (updateResult.success) {
        console.log(`✅ Updated Story #${storyNumber} with parent reference to Epic #${epicNumber}`);
        return true;
      } else {
        console.log(`❌ Failed to update Story #${storyNumber}: ${updateResult.error}`);
        return false;
      }
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.log(`❌ Error updating Story #${storyNumber}: ${error}`);
    return false;
  }
}

/**
 * Set up GitHub Project hierarchy using parent-child relationships
 */
async function setupProjectHierarchy(): Promise<void> {
  console.log('🏗️ Setting up GitHub Project hierarchy...');
  
  for (const [epicNumber, childNumbers] of Object.entries(EPIC_STORY_MAPPING)) {
    const epicNum = parseInt(epicNumber);
    
    // Set Epic field for the epic itself
    const setEpicFieldResult = executeGhCommand(
      `gh project item-edit --project-id ${PROJECT_NUMBER} --owner ${OWNER} --id $(gh project item-list ${PROJECT_NUMBER} --owner ${OWNER} --format json | jq -r '.items[] | select(.content.number == ${epicNum}) | .id') --field-id $(gh project field-list ${PROJECT_NUMBER} --owner ${OWNER} --format json | jq -r '.fields[] | select(.name == "Epic") | .id') --single-select-option-id $(gh project field-list ${PROJECT_NUMBER} --owner ${OWNER} --format json | jq -r '.fields[] | select(.name == "Epic") | .options[] | select(.name == "${EPIC_INFO[epicNum]}") | .id')`
    );

    // Set parent-child relationships for each story
    for (const childNumber of childNumbers) {
      // Get project item IDs
      const getItemsResult = executeGhCommand(`gh project item-list ${PROJECT_NUMBER} --owner ${OWNER} --format json`);
      if (!getItemsResult.success) continue;

      const items = JSON.parse(getItemsResult.output || '{}').items || [];
      const epicItem = items.find((item: any) => item.content?.number === epicNum);
      const storyItem = items.find((item: any) => item.content?.number === childNumber);

      if (!epicItem || !storyItem) {
        console.log(`❌ Could not find project items for Epic #${epicNum} or Story #${childNumber}`);
        continue;
      }

      // Get field IDs
      const getFieldsResult = executeGhCommand(`gh project field-list ${PROJECT_NUMBER} --owner ${OWNER} --format json`);
      if (!getFieldsResult.success) continue;

      const fields = JSON.parse(getFieldsResult.output || '{}').fields || [];
      const parentField = fields.find((field: any) => field.name === 'Parent issue');
      const epicField = fields.find((field: any) => field.name === 'Epic');

      if (parentField && epicField) {
        // Set parent issue for the story
        const setParentResult = executeGhCommand(
          `gh project item-edit --project-id ${PROJECT_NUMBER} --owner ${OWNER} --id ${storyItem.id} --field-id ${parentField.id} --text "#${epicNum}"`
        );

        // Set Epic field for the story
        const epicOption = epicField.options?.find((opt: any) => opt.name === EPIC_INFO[epicNum]);
        if (epicOption) {
          const setStoryEpicResult = executeGhCommand(
            `gh project item-edit --project-id ${PROJECT_NUMBER} --owner ${OWNER} --id ${storyItem.id} --field-id ${epicField.id} --single-select-option-id ${epicOption.id}`
          );
        }

        if (setParentResult.success) {
          console.log(`✅ Set Story #${childNumber} parent to Epic #${epicNum} in project`);
        } else {
          console.log(`❌ Failed to set Story #${childNumber} parent: ${setParentResult.error}`);
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('🚀 Setting up GitHub Issue and Project hierarchies...\n');

  // Check GitHub authentication
  console.log('🔐 Checking GitHub authentication...');
  const authResult = executeGhCommand('gh auth status');
  if (!authResult.success) {
    console.error('❌ GitHub CLI not authenticated. Run: gh auth login');
    process.exit(1);
  }
  console.log('✅ GitHub CLI authenticated\n');

  let issueSuccessCount = 0;
  let issueFailCount = 0;

  // Update Epic issues with child references
  console.log('📋 Updating Epic issues with child story references...');
  for (const [epicNumber, childNumbers] of Object.entries(EPIC_STORY_MAPPING)) {
    const epicNum = parseInt(epicNumber);
    const success = await updateEpicWithChildReferences(epicNum, childNumbers);
    if (success) issueSuccessCount++;
    else issueFailCount++;

    // Small delay between updates
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Update Story issues with parent references  
  console.log('\n📖 Updating Story issues with parent Epic references...');
  for (const [epicNumber, childNumbers] of Object.entries(EPIC_STORY_MAPPING)) {
    const epicNum = parseInt(epicNumber);
    for (const childNumber of childNumbers) {
      const success = await updateStoryWithParentReference(childNumber, epicNum);
      if (success) issueSuccessCount++;
      else issueFailCount++;

      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Set up Project hierarchy
  console.log('\n🏗️ Setting up GitHub Project hierarchical relationships...');
  await setupProjectHierarchy();

  // Summary
  console.log(`\n🎉 Hierarchy setup completed!`);
  console.log(`📊 Issue Updates Summary:`);
  console.log(`   • Successful: ${issueSuccessCount}`);
  console.log(`   • Failed: ${issueFailCount}`);
  console.log(`   • Total: ${issueSuccessCount + issueFailCount}`);
  
  console.log(`\n🔗 Access Links:`);
  console.log(`   • Issues: https://github.com/${REPO}/issues`);
  console.log(`   • Project Board: https://github.com/users/${OWNER}/projects/${PROJECT_NUMBER}`);
}

// Execute main function
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});