import { CharacterTestimonial } from './CharacterTestimonialCard';

// Beta testimonials - Real feedback from early testers
export const sampleTestimonials: CharacterTestimonial[] = [
  {
    id: '1',
    characterName: 'Beta Tester',
    characterClass: 'Game Master',
    characterLevel: 1,
    campaignName: 'Early Access Program',
    testimonialText: 'Currently in private beta - Join our early access program to be among the first to experience AI-powered adventure creation and help shape the future of tabletop gaming.',
    rating: 5,
    avatar: '',
    useCase: 'Beta Testing',
    location: 'Private Beta',
    playTime: 'Early Access'
  }
];

// Utility function to get random testimonials
export const getRandomTestimonials = (count: number = 3): CharacterTestimonial[] => {
  const shuffled = [...sampleTestimonials].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, sampleTestimonials.length));
};

// Utility function to get testimonials by use case
export const getTestimonialsByUseCase = (useCase: string): CharacterTestimonial[] => {
  return sampleTestimonials.filter(testimonial => 
    testimonial.useCase.toLowerCase().includes(useCase.toLowerCase())
  );
};