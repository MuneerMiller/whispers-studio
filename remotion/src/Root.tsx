import React from 'react';
import {Composition} from 'remotion';
import {WhisperReel, reelDuration} from './WhisperReel';
import {StoryReel, storyDuration} from './StoryReel';
import {MemeCarousel, memeCarouselMeta} from './MemeCarousel';
import {ChatReel, chatReelMeta} from './ChatReel';
import {TierList, tierListMeta, NotesReel, notesReelMeta, SearchReel, searchReelMeta, TwistReel, twistReelMeta, VoiceStory, voiceStoryMeta, BingoCard} from './MoreReels';
import {StoryboardReel, storyboardMeta} from './StoryboardReel';
import {TextReel, textReelMetadata} from './TextReel';
import {PromptPost, promptDuration} from './PromptPost';
import {VerdictReel, verdictDuration, BrollReel, brollDuration, BgPreview, Carousel, carouselCount} from './Formats';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhisperReel" component={WhisperReel} durationInFrames={reelDuration} fps={30} width={1080} height={1920} />
    <Composition id="StoryReel" component={StoryReel} durationInFrames={storyDuration} fps={30} width={1080} height={1920} />
    <Composition id="VerdictReel" component={VerdictReel} durationInFrames={verdictDuration} fps={30} width={1080} height={1920} />
    <Composition id="BrollReel" component={BrollReel} durationInFrames={brollDuration} fps={30} width={1080} height={1920} />
    <Composition id="BgDrop" component={BgPreview} defaultProps={{kind: 'drop' as const}} durationInFrames={360} fps={30} width={1080} height={1920} />
    <Composition id="BgSpiro" component={BgPreview} defaultProps={{kind: 'spiro' as const}} durationInFrames={360} fps={30} width={1080} height={1920} />
    <Composition id="Carousel" component={Carousel} durationInFrames={carouselCount} fps={30} width={1080} height={1350} />
    <Composition id="PromptPost" component={PromptPost} durationInFrames={promptDuration} fps={30} width={1080} height={1920}
      defaultProps={{question: 'What have you never said out loud?', sub: 'Not to anyone. Not even once.', cta: 'Say it anonymously · link in bio', seed: 0}} />
    <Composition id="TextReel" component={TextReel} calculateMetadata={textReelMetadata} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{layout: 'question' as const, bg: 'gradient' as const, title: 'What have you never said out loud?', cta: 'Say it in the comments', seconds: 9}} />
    <Composition id="MemeCarousel" component={MemeCarousel} calculateMetadata={memeCarouselMeta} durationInFrames={8} fps={30} width={1080} height={1350}
      defaultProps={{hook: 'Things everyone does but nobody admits', slides: ['Rehearsing an argument in the shower and winning'], question: 'Which one is you?'}} />
    <Composition id="ChatReel" component={ChatReel} calculateMetadata={chatReelMeta} durationInFrames={600} fps={30} width={1080} height={1920}
      defaultProps={{hook: 'She thought the screenshot was private', contact: 'Sam', messages: [{from: 'them' as const, text: 'hey'}], question: 'What would you do?'}} />
    <Composition id="TierList" component={TierList} calculateMetadata={tierListMeta} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{title: 'Breakup excuses', items: [{text: "It's not you", tier: 'D' as const}], question: 'Wrong tier?'}} />
    <Composition id="NotesReel" component={NotesReel} calculateMetadata={notesReelMeta} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{title: 'unsent', lines: ['hi'], question: 'Would you send it?'}} />
    <Composition id="SearchReel" component={SearchReel} calculateMetadata={searchReelMeta} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{hook: 'Things we search at 3am', query: 'is it normal to ', suggestions: ['miss someone you never dated'], question: 'Which one have you searched?'}} />
    <Composition id="TwistReel" component={TwistReel} calculateMetadata={twistReelMeta} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{hook: 'Guess the ending', setup: ['line'], ending: 'twist', question: 'Did you guess it?'}} />
    <Composition id="VoiceStory" component={VoiceStory} calculateMetadata={voiceStoryMeta} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{hook: 'story', words: [{w: 'hi', s: 0, e: 1}], question: 'What would you do?'}} />
    <Composition id="BingoCard" component={BingoCard} durationInFrames={1} fps={30} width={1080} height={1350}
      defaultProps={{title: 'Red flag bingo', cells: Array.from({length: 24}, (_, i) => `cell ${i + 1}`), question: 'How many did you get?'}} />
    <Composition id="StoryboardReel" component={StoryboardReel} calculateMetadata={storyboardMeta} durationInFrames={300} fps={30} width={1080} height={1920}
      defaultProps={{scenes: [{type: 'slam' as const, text: 'Say the thing.'}]}} />
  </>
);
