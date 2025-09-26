#!/usr/bin/env node

/**
 * Enhanced GitHub Issues Creation Script
 *
 * This script parses the EPICS_AND_STORIES.md file and creates comprehensive
 * GitHub issues for all epics, stories, and tasks defined in the documentation.
 */

import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPO = 'cbnsndwch/struktura';
const EPICS_FILE_PATH = '../docs/EPICS_AND_STORIES.md';

interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  milestone?: string;
  assignees?: string[];
}

interface Epic {
  id: string;
  title: string;
  description: string;
  duration: string;
  team: string;
  priority: string;
  stories: UserStory[];
}

interface UserStory {
  id: string;
  title: string;
  story: string;
  acceptanceCriteria: string[];
  technicalTasks: string[];
  definitionOfDone: string[];
}

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
 * Parse the EPICS_AND_STORIES.md file
 */
async function parseEpicsAndStories(): Promise<Epic[]> {
  const filePath = path.resolve(__dirname, EPICS_FILE_PATH);
  const content = await fs.readFile(filePath, 'utf-8');
  
  const epics: Epic[] = [];
  const lines = content.split('\n');
  
  let currentEpic: Partial<Epic> | null = null;
  let currentStory: Partial<UserStory> | null = null;
  let currentSection: 'description' | 'story' | 'criteria' | 'tasks' | 'done' | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Epic header detection
    if (line.match(/^## Epic \d+:/)) {
      // Save previous epic
      if (currentEpic && currentEpic.title) {
        epics.push(currentEpic as Epic);
      }
      
      currentEpic = {
        id: `epic-${epics.length + 1}`,
        title: line.replace(/^## /, ''),
        description: '',
        duration: '',
        team: '',
        priority: '',
        stories: []
      };
      currentStory = null;
      currentSection = null;
      
      // Parse epic metadata from next few lines
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const metaLine = lines[j].trim();
        if (metaLine.startsWith('**Duration**:')) {
          currentEpic.duration = metaLine.replace('**Duration**:', '').trim();
        } else if (metaLine.startsWith('**Team**:')) {
          currentEpic.team = metaLine.replace('**Team**:', '').trim();
        } else if (metaLine.startsWith('**Priority**:')) {
          currentEpic.priority = metaLine.replace('**Priority**:', '').trim();
        }
      }
    }
    
    // Epic Description
    else if (line === '### Epic Description' && currentEpic) {
      currentSection = 'description';
    }
    
    // User Story detection
    else if (line.match(/^#### \d+\.\d+/) && currentEpic) {
      // Save previous story
      if (currentStory && currentStory.title) {
        currentEpic.stories!.push(currentStory as UserStory);
      }
      
      currentStory = {
        id: `story-${currentEpic.stories!.length + 1}`,
        title: line.replace(/^#### \d+\.\d+ /, ''),
        story: '',
        acceptanceCriteria: [],
        technicalTasks: [],
        definitionOfDone: []
      };
      currentSection = null;
    }
    
    // Story content sections
    else if (line.startsWith('**Story**:') && currentStory) {
      currentStory.story = line.replace('**Story**:', '').trim();
      currentSection = 'story';
    }
    else if (line.startsWith('**Acceptance Criteria**:')) {
      currentSection = 'criteria';
    }
    else if (line.startsWith('**Technical Tasks**:')) {
      currentSection = 'tasks';
    }
    else if (line.startsWith('**Definition of Done**:')) {
      currentSection = 'done';
    }
    
    // Content parsing based on current section
    else if (currentSection === 'description' && currentEpic && line && !line.startsWith('###')) {
      currentEpic.description += line + '\n';
    }
    else if (currentSection === 'criteria' && currentStory && line.startsWith('- [ ]')) {
      currentStory.acceptanceCriteria!.push(line.replace('- [ ]', '').trim());
    }
    else if (currentSection === 'tasks' && currentStory && line.startsWith('- ')) {
      currentStory.technicalTasks!.push(line.replace('- ', '').trim());
    }
    else if (currentSection === 'done' && currentStory && line.startsWith('- [ ]')) {
      currentStory.definitionOfDone!.push(line.replace('- [ ]', '').trim());
    }
  }
  
  // Save final epic and story
  if (currentStory && currentStory.title) {
    currentEpic!.stories!.push(currentStory as UserStory);
  }
  if (currentEpic && currentEpic.title) {
    epics.push(currentEpic as Epic);
  }
  
  return epics;
}

/**
 * Convert Epic to GitHub Epic Issue
 */
function epicToGitHubIssue(epic: Epic): GitHubIssue {
  const priorityLabel = epic.priority.toLowerCase().includes('high') ? 'priority:high' : 'priority:critical';
  const epicLabel = `epic:${epic.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  
  const body = `## Epic Overview

${epic.description.trim()}

## Meta Information
- **Duration**: ${epic.duration}
- **Team**: ${epic.team}
- **Priority**: ${epic.priority}

## User Stories Included

${epic.stories.map((story, index) => `${index + 1}. ${story.title}`).join('\n')}

## Success Criteria

This epic will be considered complete when:
- [ ] All user stories are implemented and tested
- [ ] Integration tests are passing
- [ ] Documentation is updated
- [ ] Code review is completed

## Related Issues

${epic.stories.map((story, index) => `- [ ] #TBD ${story.title}`).join('\n')}

---

*This is an Epic issue that tracks the overall progress of the ${epic.title} feature.*`;

  return {
    title: `[EPIC] ${epic.title}`,
    body,
    labels: ['type:epic', priorityLabel, epicLabel],
    milestone: 'v0.1.0-mvp'
  };
}

/**
 * Convert User Story to GitHub Issue
 */
function storyToGitHubIssue(story: UserStory, epic: Epic): GitHubIssue {
  const epicLabel = `epic:${epic.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const priorityLabel = epic.priority.toLowerCase().includes('high') ? 'priority:high' : 'priority:critical';
  
  // Determine component label based on story content
  let componentLabel = 'component:backend';
  const title = story.title.toLowerCase();
  if (title.includes('ui') || title.includes('interface') || title.includes('form') || title.includes('view')) {
    componentLabel = 'component:frontend';
  } else if (title.includes('auth') || title.includes('login') || title.includes('permission')) {
    componentLabel = 'component:auth';
  } else if (title.includes('schema') || title.includes('field')) {
    componentLabel = 'component:schema';
  }

  const body = `## User Story

${story.story}

## Description

Implementation of the ${story.title} feature as part of ${epic.title}.

## Acceptance Criteria

${story.acceptanceCriteria.map(criteria => `- [ ] ${criteria}`).join('\n')}

## Technical Tasks

${story.technicalTasks.length > 0 ? story.technicalTasks.map(task => `- ${task}`).join('\n') : '- Tasks to be defined during implementation planning'}

## Definition of Done

${story.definitionOfDone.length > 0 ? story.definitionOfDone.map(item => `- [ ] ${item}`).join('\n') : '- [ ] Feature implemented according to acceptance criteria\n- [ ] Unit tests written and passing\n- [ ] Code review completed\n- [ ] Documentation updated'}

## Epic

Part of Epic: ${epic.title}

---

*This story contributes to the ${epic.title} epic and should be completed as part of the overall feature development.*`;

  return {
    title: story.title,
    body,
    labels: ['type:story', priorityLabel, epicLabel, componentLabel],
    milestone: 'v0.1.0-mvp'
  };
}

/**
 * Create GitHub issue
 */
async function createGitHubIssue(issue: GitHubIssue): Promise<boolean> {
  // Create temporary file for issue body
  const tempFile = path.join(__dirname, `temp-issue-${Date.now()}.md`);
  await fs.writeFile(tempFile, issue.body);
  
  try {
    const labelsArg = issue.labels.join(',');
    const milestoneArg = issue.milestone ? `--milestone "${issue.milestone}"` : '';
    const assigneesArg = issue.assignees?.length ? `--assignee ${issue.assignees.join(',')}` : '';
    
    const command = `gh issue create --repo "${REPO}" --title "${issue.title}" --body-file "${tempFile}" --label "${labelsArg}" ${milestoneArg} ${assigneesArg}`.trim();
    
    const result = executeGhCommand(command);
    
    if (result.success) {
      console.log(`✅ Created issue: ${issue.title}`);
      return true;
    } else {
      console.log(`❌ Failed to create issue ${issue.title}: ${result.error}`);
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
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting comprehensive GitHub issues creation...\n');
  
  // Check GitHub authentication
  console.log('🔐 Checking GitHub authentication...');
  const authResult = executeGhCommand('gh auth status');
  if (!authResult.success) {
    console.error('❌ GitHub CLI not authenticated. Run: gh auth login');
    process.exit(1);
  }
  console.log('✅ GitHub CLI authenticated\n');
  
  // Parse epics and stories
  console.log('📖 Parsing EPICS_AND_STORIES.md...');
  const epics = await parseEpicsAndStories();
  console.log(`✅ Found ${epics.length} epics with ${epics.reduce((sum, epic) => sum + epic.stories.length, 0)} stories\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  // Create epic issues
  console.log('🎯 Creating epic issues...');
  for (const epic of epics) {
    const epicIssue = epicToGitHubIssue(epic);
    const success = await createGitHubIssue(epicIssue);
    if (success) successCount++;
    else failCount++;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Create story issues
  console.log('\n📋 Creating story issues...');
  for (const epic of epics) {
    for (const story of epic.stories) {
      const storyIssue = storyToGitHubIssue(story, epic);
      const success = await createGitHubIssue(storyIssue);
      if (success) successCount++;
      else failCount++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Summary
  console.log(`\n🎉 Issue creation completed!`);
  console.log(`📊 Summary:`);
  console.log(`   • Successful: ${successCount}`);
  console.log(`   • Failed: ${failCount}`);
  console.log(`   • Total: ${successCount + failCount}`);
  console.log(`\n🔗 View issues: https://github.com/${REPO}/issues`);
}

// Execute main function
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});