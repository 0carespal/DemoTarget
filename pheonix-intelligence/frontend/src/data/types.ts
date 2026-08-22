export interface TalkRecord {
  talk_title: string;
  speaker_name: string;
  conference_name: string;
  topic: string;
}

export interface TopicStat {
  name: string;
  talkCount: number;
  percentage: number;
}

export interface ConferenceGroup {
  name: string;
  talksCount: number;
  talks: TalkRecord[];
}
