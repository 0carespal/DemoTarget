import { TalkRecord } from './types';

export async function fetchTalksData(): Promise<TalkRecord[]> {
  try {
    // Attempt to load from data_reports/talks.json or backend endpoint
    const response = await fetch('/data_reports/talks.json');
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      // Validate schema completeness per Agents.md
      return data.filter((item: any) => 
        item && 
        typeof item.talk_title === 'string' && item.talk_title.trim() !== '' && item.talk_title !== 'N/A' &&
        typeof item.speaker_name === 'string' && item.speaker_name.trim() !== '' && item.speaker_name !== 'N/A' &&
        typeof item.conference_name === 'string' && item.conference_name.trim() !== '' && item.conference_name !== 'N/A' &&
        typeof item.topic === 'string' && item.topic.trim() !== '' && item.topic !== 'N/A'
      );
    }
    return [];
  } catch (err) {
    // Return empty array if file does not exist yet or fails to parse
    return [];
  }
}
