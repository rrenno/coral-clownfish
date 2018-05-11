import RandomSuggester from './suggesters/random';
import RyanSuggester from './suggesters/ryan';

// Reference your suggester class here using an import statment like above.

// Add a new instance of your suggester here. It will then show up in game.
export default [ new RyanSuggester('Ryan\'s randomizer'), new RandomSuggester('Scott\'s randomizer') ];
