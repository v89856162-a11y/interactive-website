# ♠️ Spades Card Game - Interactive Website

A fully interactive, single-page Spades card game built with HTML, CSS, and vanilla JavaScript. Players can customize their gaming experience with flexible player configurations and game modes.

## Features

### Game Customization
- **Variable Player Count**: Play with 2, 3, or 4 players
- **Custom Player Names**: Personalize each player's name
- **Game Modes**:
  - Classic: 13 rounds (full game)
  - Short: 6 rounds (quick game)
  - Marathon: 20 rounds (extended play)
- **Settings**:
  - Toggle sound effects
  - Dark mode support
  - Settings persist in browser storage

### Game Mechanics
- **Bidding Phase**: Each player bids on tricks they'll win
- **Playing Phase**: Players play cards following Spades rules
- **Scoring System**:
  - Make your bid: 10 × bid + bonus tricks
  - Miss your bid: -10 × bid
- **Trick Calculation**: Spades trump, lead suit must be followed
- **Round Results**: View detailed round outcomes
- **Final Scoreboard**: Ranking at game completion

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live scoreboard and game state
- **Visual Feedback**: Hover effects, animations, and card states
- **Game Controls**: Pause, main menu, settings
- **Dark Mode**: Easy on the eyes for extended play

## How to Play

### Setup
1. Choose number of players (2-4)
2. Enter player names (or use defaults)
3. Select game mode (Classic/Short/Marathon)
4. Toggle sound and dark mode if desired
5. Click "Start Game"

### Bidding Phase
- Players bid in turn starting from Player 1
- Bid represents the number of tricks you expect to win (0-13)
- All players must bid before playing begins

### Playing Phase
- Lead player plays any card
- Other players must follow suit if possible
- If no cards of lead suit, any card can be played
- Highest card of lead suit wins, unless spades were played (spades trump)
- Spades can't be led until either broken (another spade played) or only spades remain

### Scoring
- **Made Bid**: 10 × bid amount + 1 point per extra trick
- **Missed Bid**: Lose 10 × bid amount
- Game continues for selected number of rounds
- Highest score wins!

## File Structure

```
interactive-website/
├── index.html      # HTML structure and layout
├── styles.css      # Styling and responsive design
├── game.js         # Game logic and interactivity
└── README.md       # This file
```

## Technical Details

### Technologies
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and Grid/Flexbox
- **JavaScript**: Vanilla JS (no frameworks) for game logic
- **LocalStorage**: Persists user settings

### Game Architecture
- `gameState`: Central state object tracking all game data
- `dealCards()`: Shuffles and distributes cards
- `playCard()`: Validates plays and manages trick logic
- `determineTrickWinner()`: Evaluates trick based on Spades rules
- `updateScoreboard()`: Renders live scores

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- AI opponents
- Multiplayer online support
- Sound effects and background music
- Game statistics and history
- Undo/replay last hand
- Export game results

## License
MIT
