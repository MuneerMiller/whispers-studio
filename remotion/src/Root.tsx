import React from 'react';
import {Composition} from 'remotion';
import {WhisperReel, reelDuration} from './WhisperReel';
import {StoryReel, storyDuration} from './StoryReel';
import {MemeCarousel, memeCarouselMeta} from './MemeCarousel';
import {ChatReel, chatReelMeta} from './ChatReel';
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
  </>
);
